const pool = require("../config/db");

// Lista todos os usuários — pendentes primeiro
async function listarUsuarios(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT id, nome, usuario, status, role, criado_em
      FROM usuarios
      ORDER BY
        CASE status
          WHEN 'pendente' THEN 1
          WHEN 'ativo'    THEN 2
          ELSE 3
        END,
        criado_em DESC
    `);
    res.json(resultado.rows);
  } catch (erro) {
    console.error("[GET /admin/usuarios]", erro);
    res.status(500).json({ erro: "Erro ao listar usuários" });
  }
}

// Atualiza status e/ou role de um usuário
async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    // Não pode alterar a si mesmo
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ erro: "Você não pode alterar seu próprio usuário" });
    }

    const existe = await pool.query(`SELECT id FROM usuarios WHERE id = $1`, [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const campos = [];
    const params = [];

    if (status) {
      const statusValidos = ["pendente", "ativo", "inativo"];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ erro: "Status inválido. Use: pendente, ativo ou inativo" });
      }
      params.push(status);
      campos.push(`status = $${params.length}`);
    }

    if (role) {
      const rolesValidas = ["operador", "admin"];
      if (!rolesValidas.includes(role)) {
        return res.status(400).json({ erro: "Role inválida. Use: operador ou admin" });
      }
      params.push(role);
      campos.push(`role = $${params.length}`);
    }

    if (campos.length === 0) {
      return res.status(400).json({ erro: "Informe ao menos status ou role" });
    }

    params.push(id);
    const resultado = await pool.query(
      `UPDATE usuarios SET ${campos.join(", ")} WHERE id = $${params.length} RETURNING id, nome, usuario, status, role`,
      params
    );

    res.json({ mensagem: "Usuário atualizado com sucesso", usuario: resultado.rows[0] });
  } catch (erro) {
    console.error("[PATCH /admin/usuarios/:id]", erro);
    res.status(500).json({ erro: "Erro ao atualizar usuário" });
  }
}

// Exclui um usuário — não pode excluir a si mesmo nem o último admin
async function excluirUsuario(req, res) {
  try {
    const { id } = req.params;

    // Não pode excluir a si mesmo
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ erro: "Você não pode excluir seu próprio usuário" });
    }

    const existe = await pool.query(
      `SELECT id, role FROM usuarios WHERE id = $1`, [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Protege o último admin — sistema não pode ficar sem admin
    if (existe.rows[0].role === "admin") {
      const totalAdmins = await pool.query(
        `SELECT COUNT(*) FROM usuarios WHERE role = 'admin' AND status = 'ativo'`
      );
      if (parseInt(totalAdmins.rows[0].count) <= 1) {
        return res.status(400).json({ erro: "Não é possível excluir o único administrador do sistema" });
      }
    }

    await pool.query(`DELETE FROM usuarios WHERE id = $1`, [id]);

    res.json({ mensagem: "Usuário excluído com sucesso" });
  } catch (erro) {
    console.error("[DELETE /admin/usuarios/:id]", erro);
    res.status(500).json({ erro: "Erro ao excluir usuário" });
  }
}

module.exports = { listarUsuarios, atualizarUsuario, excluirUsuario };