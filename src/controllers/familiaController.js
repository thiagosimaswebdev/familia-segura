const pool = require("../config/db");

// Lista todas as famílias com filtros opcionais
async function listarFamilias(req, res) {
  try {
    const { status, abrigo_id, page, limit } = req.query;

    const pagina = Math.max(1, parseInt(page) || 1);
    const limite = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const offset = (pagina - 1) * limite;

    const condicoes = [];
    const params = [];

    if (status) {
      params.push(status);
      condicoes.push(`f.status = $${params.length}`);
    }

    if (abrigo_id) {
      params.push(abrigo_id);
      condicoes.push(`f.abrigo_id = $${params.length}`);
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";

    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total FROM familias f ${where}`,
      params
    );

    const total = parseInt(totalResult.rows[0].total);
    const totalPaginas = Math.ceil(total / limite);

    // JOIN com abrigos para mostrar o nome do abrigo vinculado
    const resultado = await pool.query(
      `SELECT
        f.*,
        a.nome AS abrigo_nome,
        a.bairro AS abrigo_bairro
       FROM familias f
       LEFT JOIN abrigos a ON f.abrigo_id = a.id
       ${where}
       ORDER BY f.id DESC
       LIMIT ${limite} OFFSET ${offset}`,
      params
    );

    res.json({
      pagina,
      limite,
      total,
      total_paginas: totalPaginas,
      familias: resultado.rows,
    });
  } catch (erro) {
    console.error("[GET /familias]", erro);
    res.status(500).json({ erro: "Erro ao buscar famílias" });
  }
}

// Busca uma família específica pelo ID
async function buscarFamilia(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const resultado = await pool.query(
      `SELECT
        f.*,
        a.nome AS abrigo_nome,
        a.endereco AS abrigo_endereco,
        a.bairro AS abrigo_bairro,
        a.telefone AS abrigo_telefone
       FROM familias f
       LEFT JOIN abrigos a ON f.abrigo_id = a.id
       WHERE f.id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Família não encontrada" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error("[GET /familias/:id]", erro);
    res.status(500).json({ erro: "Erro ao buscar família" });
  }
}

// Cadastra uma nova família
async function criarFamilia(req, res) {
  try {
    const {
      nome_responsavel, cpf, telefone, num_membros,
      abrigo_id, latitude, longitude, status, observacoes,
    } = req.body;

    // Verifica se o CPF já está cadastrado
    const cpfExiste = await pool.query(
      `SELECT id FROM familias WHERE cpf = $1`,
      [cpf]
    );

    if (cpfExiste.rows.length > 0) {
      return res.status(409).json({ erro: "CPF já cadastrado" });
    }

    // Se informou abrigo_id, verifica se o abrigo existe e tem vagas
    if (abrigo_id) {
      const abrigo = await pool.query(
        `SELECT id, vagas_disponiveis, status FROM abrigos WHERE id = $1`,
        [abrigo_id]
      );

      if (abrigo.rows.length === 0) {
        return res.status(404).json({ erro: "Abrigo não encontrado" });
      }

      if (abrigo.rows[0].status === "fechado") {
        return res.status(400).json({ erro: "Abrigo está fechado" });
      }

      if (abrigo.rows[0].vagas_disponiveis === 0) {
        return res.status(400).json({ erro: "Abrigo não possui vagas disponíveis" });
      }

      // Usa transação para garantir que família e vagas sejam atualizados juntos
      await pool.query("BEGIN");

      const resultado = await pool.query(
        `INSERT INTO familias
          (nome_responsavel, cpf, telefone, num_membros,
           abrigo_id, latitude, longitude, status, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [nome_responsavel, cpf, telefone, num_membros,
         abrigo_id, latitude, longitude, "em_abrigo", observacoes]
      );

      // Decrementa as vagas do abrigo
      await pool.query(
        `UPDATE abrigos
         SET vagas_disponiveis = vagas_disponiveis - 1,
             status = CASE WHEN vagas_disponiveis - 1 = 0 THEN 'lotado' ELSE status END
         WHERE id = $1`,
        [abrigo_id]
      );

      await pool.query("COMMIT");

      return res.status(201).json({
        mensagem: "Família cadastrada e vinculada ao abrigo com sucesso",
        familia: resultado.rows[0],
      });
    }

    // Sem abrigo_id — cadastra família como desabrigada
    const resultado = await pool.query(
      `INSERT INTO familias
        (nome_responsavel, cpf, telefone, num_membros,
         abrigo_id, latitude, longitude, status, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nome_responsavel, cpf, telefone, num_membros,
       null, latitude, longitude, status || "desabrigada", observacoes]
    );

    res.status(201).json({
      mensagem: "Família cadastrada com sucesso",
      familia: resultado.rows[0],
    });
  } catch (erro) {
    await pool.query("ROLLBACK");
    console.error("[POST /familias]", erro);
    res.status(500).json({ erro: "Erro ao cadastrar família" });
  }
}

// Vincula uma família a um abrigo
async function vincularAbrigo(req, res) {
  try {
    const { id } = req.params;
    const { abrigo_id } = req.body;

    // Verifica se a família existe
    const familia = await pool.query(
      `SELECT id, abrigo_id FROM familias WHERE id = $1`,
      [id]
    );

    if (familia.rows.length === 0) {
      return res.status(404).json({ erro: "Família não encontrada" });
    }

    if (familia.rows[0].abrigo_id) {
      return res.status(400).json({ erro: "Família já está vinculada a um abrigo" });
    }

    // Verifica se o abrigo existe e tem vagas
    const abrigo = await pool.query(
      `SELECT id, vagas_disponiveis, status FROM abrigos WHERE id = $1`,
      [abrigo_id]
    );

    if (abrigo.rows.length === 0) {
      return res.status(404).json({ erro: "Abrigo não encontrado" });
    }

    if (abrigo.rows[0].status === "fechado") {
      return res.status(400).json({ erro: "Abrigo está fechado" });
    }

    if (abrigo.rows[0].vagas_disponiveis === 0) {
      return res.status(400).json({ erro: "Abrigo não possui vagas disponíveis" });
    }

    // Transação: atualiza família e decrementa vagas do abrigo
    await pool.query("BEGIN");

    const resultado = await pool.query(
      `UPDATE familias
       SET abrigo_id = $1, status = 'em_abrigo'
       WHERE id = $2
       RETURNING *`,
      [abrigo_id, id]
    );

    await pool.query(
      `UPDATE abrigos
       SET vagas_disponiveis = vagas_disponiveis - 1,
           status = CASE WHEN vagas_disponiveis - 1 = 0 THEN 'lotado' ELSE status END
       WHERE id = $1`,
      [abrigo_id]
    );

    await pool.query("COMMIT");

    res.json({
      mensagem: "Família vinculada ao abrigo com sucesso",
      familia: resultado.rows[0],
    });
  } catch (erro) {
    await pool.query("ROLLBACK");
    console.error("[PATCH /familias/:id/abrigo]", erro);
    res.status(500).json({ erro: "Erro ao vincular família ao abrigo" });
  }
}

module.exports = {
  listarFamilias,
  buscarFamilia,
  criarFamilia,
  vincularAbrigo,
};