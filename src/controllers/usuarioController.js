const pool = require("../config/db");

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuários (ADMIN)
 *     description: Retorna todos os usuários cadastrados no sistema. Apenas administradores podem acessar.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       403:
 *         description: Acesso negado
 */
async function listarUsuarios(req, res) {
  try {
    // 🔐 Só admin pode acessar
    if (req.usuario.role !== "admin") {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    const result = await pool.query(
      "SELECT id, nome, usuario, status, role, criado_em FROM usuarios ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {
    console.error("[GET /usuarios]", error);
    res.status(500).json({ erro: "Erro ao listar usuários" });
  }
}

/**
 * @swagger
 * /usuarios/{id}/status:
 *   patch:
 *     summary: Aprovar usuário (ADMIN)
 *     description: Atualiza o status do usuário para 'ativo'.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário aprovado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
async function atualizarStatus(req, res) {
  try {
    // 🔐 Só admin pode acessar
    if (req.usuario.role !== "admin") {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    const { id } = req.params;

    // 🔍 Verifica se o usuário existe
    const usuario = await pool.query(
      "SELECT id, status FROM usuarios WHERE id = $1",
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // 🔄 Atualiza status
    const atualizado = await pool.query(
      "UPDATE usuarios SET status = 'ativo' WHERE id = $1 RETURNING id, nome, usuario, status, role",
      [id]
    );

    res.json({
      mensagem: "Usuário aprovado com sucesso",
      usuario: atualizado.rows[0],
    });

  } catch (error) {
    console.error("[PATCH /usuarios/:id/status]", error);
    res.status(500).json({ erro: "Erro ao atualizar status" });
  }
}

module.exports = {
  listarUsuarios,
  atualizarStatus,
};