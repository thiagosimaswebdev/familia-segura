const pool = require("../config/db");

// Lista todos os abrigos com filtros opcionais e paginação
async function listarAbrigos(req, res) {
  try {
    const { status, bairro, page, limit } = req.query;

    // Paginação — page e limit com valores padrão
    const pagina = Math.max(1, parseInt(page) || 1);
    const limite = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const offset = (pagina - 1) * limite;

    // Monta os filtros dinamicamente
    const condicoes = [];
    const params = [];

    if (status) {
      params.push(status);
      condicoes.push(`status = $${params.length}`);
    }

    if (bairro) {
      params.push(`%${bairro}%`);
      condicoes.push(`bairro ILIKE $${params.length}`);
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";

    // Conta o total para montar a paginação
    const totalResult = await pool.query(
      `SELECT COUNT(*) AS total FROM abrigos ${where}`,
      params
    );

    const total = parseInt(totalResult.rows[0].total);
    const totalPaginas = Math.ceil(total / limite);

    // Busca os abrigos com limite e offset
    const resultado = await pool.query(
      `SELECT * FROM abrigos ${where}
       ORDER BY vagas_disponiveis DESC, id DESC
       LIMIT ${limite} OFFSET ${offset}`,
      params
    );

    res.json({
      pagina,
      limite,
      total,
      total_paginas: totalPaginas,
      abrigos: resultado.rows,
    });
  } catch (erro) {
    console.error("[GET /abrigos]", erro);
    res.status(500).json({ erro: "Erro ao buscar abrigos" });
  }
}

// Busca um abrigo específico pelo ID
async function buscarAbrigo(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const resultado = await pool.query(
      `SELECT * FROM abrigos WHERE id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Abrigo não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error("[GET /abrigos/:id]", erro);
    res.status(500).json({ erro: "Erro ao buscar abrigo" });
  }
}

// Cria um novo abrigo
async function criarAbrigo(req, res) {
  try {
    const {
      nome, endereco, bairro, cidade, latitude, longitude,
      capacidade_total, vagas_disponiveis, status, telefone, responsavel,
    } = req.body;

    const resultado = await pool.query(
      `INSERT INTO abrigos
        (nome, endereco, bairro, cidade, latitude, longitude,
         capacidade_total, vagas_disponiveis, status, telefone, responsavel)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [nome, endereco, bairro, cidade, latitude, longitude,
       capacidade_total, vagas_disponiveis, status, telefone, responsavel]
    );

    res.status(201).json({
      mensagem: "Abrigo criado com sucesso",
      abrigo: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[POST /abrigos]", erro);
    res.status(500).json({ erro: "Erro ao criar abrigo" });
  }
}

// Atualiza vagas e/ou status de um abrigo
async function atualizarAbrigo(req, res) {
  try {
    const { id } = req.params;
    const { vagas_disponiveis, status } = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    // Verifica se o abrigo existe
    const abrigoExiste = await pool.query(
      `SELECT id, capacidade_total FROM abrigos WHERE id = $1`,
      [id]
    );

    if (abrigoExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Abrigo não encontrado" });
    }

    // Verifica se as vagas não excedem a capacidade total
    if (vagas_disponiveis !== undefined) {
      const capacidade = abrigoExiste.rows[0].capacidade_total;
      if (vagas_disponiveis > capacidade) {
        return res.status(400).json({
          erro: `Vagas disponíveis não pode ser maior que a capacidade total (${capacidade})`,
        });
      }
    }

    // Monta a query dinamicamente com os campos informados
    const campos = [];
    const params = [];

    if (vagas_disponiveis !== undefined) {
      params.push(vagas_disponiveis);
      campos.push(`vagas_disponiveis = $${params.length}`);
    }

    if (status) {
      params.push(status);
      campos.push(`status = $${params.length}`);
    }

    params.push(id);

    const resultado = await pool.query(
      `UPDATE abrigos SET ${campos.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params
    );

    res.json({
      mensagem: "Abrigo atualizado com sucesso",
      abrigo: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[PATCH /abrigos/:id]", erro);
    res.status(500).json({ erro: "Erro ao atualizar abrigo" });
  }
}

// Busca os abrigos mais próximos de uma coordenada usando fórmula de Haversine
// Haversine calcula a distância em km entre dois pontos geográficos
async function abrigosProximos(req, res) {
  try {
    const { lat, lng, raio } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ erro: "Latitude e longitude são obrigatórias" });
    }

    const raioKm = parseFloat(raio) || 10; // raio padrão de 10km

    // Fórmula de Haversine em SQL para calcular distância entre dois pontos
    const resultado = await pool.query(
      `SELECT *,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) AS distancia_km
       FROM abrigos
       WHERE status != 'fechado'
       HAVING (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) <= $3
       ORDER BY distancia_km ASC
       LIMIT 10`,
      [lat, lng, raioKm]
    );

    res.json({
      total: resultado.rows.length,
      raio_km: raioKm,
      abrigos: resultado.rows,
    });
  } catch (erro) {
    console.error("[GET /abrigos/proximos]", erro);
    res.status(500).json({ erro: "Erro ao buscar abrigos próximos" });
  }
}

// Retorna um resumo geral para o dashboard
async function dashboard(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        COUNT(*)                                          AS total_abrigos,
        SUM(capacidade_total)                             AS capacidade_total,
        SUM(vagas_disponiveis)                            AS vagas_disponiveis,
        COUNT(*) FILTER (WHERE status = 'disponivel')    AS abrigos_disponiveis,
        COUNT(*) FILTER (WHERE status = 'lotado')        AS abrigos_lotados,
        COUNT(*) FILTER (WHERE status = 'fechado')       AS abrigos_fechados
      FROM abrigos
    `);

    const familias = await pool.query(`
      SELECT
        COUNT(*)                                             AS total_familias,
        SUM(num_membros)                                     AS total_pessoas,
        COUNT(*) FILTER (WHERE status = 'desabrigada')      AS familias_desabrigadas,
        COUNT(*) FILTER (WHERE status = 'em_abrigo')        AS familias_em_abrigo,
        COUNT(*) FILTER (WHERE status = 'reassentada')      AS familias_reassentadas
      FROM familias
    `);

    res.json({
      abrigos: resultado.rows[0],
      familias: familias.rows[0],
    });
  } catch (erro) {
    console.error("[GET /abrigos/dashboard]", erro);
    res.status(500).json({ erro: "Erro ao buscar dados do dashboard" });
  }
}

module.exports = {
  listarAbrigos,
  buscarAbrigo,
  criarAbrigo,
  atualizarAbrigo,
  abrigosProximos,
  dashboard,
};