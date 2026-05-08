const express = require("express");
const router = express.Router();
const { listarUsuarios, atualizarUsuario, excluirUsuario } = require("../controllers/adminController");
const autenticar = require("../middlewares/autenticar");

// Middleware que bloqueia qualquer um que não seja admin
function apenasAdmin(req, res, next) {
  if (req.usuario?.role !== "admin") {
    return res.status(403).json({ erro: "Acesso restrito a administradores" });
  }
  next();
}

/**
 * @swagger
 * /admin/usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       403:
 *         description: Acesso restrito a administradores
 *
 * /admin/usuarios/{id}:
 *   patch:
 *     summary: Atualizar status e/ou role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, ativo, inativo]
 *               role:
 *                 type: string
 *                 enum: [operador, admin]
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 *   delete:
 *     summary: Excluir usuário
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       400:
 *         description: Não pode excluir o último admin ou a si mesmo
 *       404:
 *         description: Usuário não encontrado
 */

router.get("/usuarios",         autenticar, apenasAdmin, listarUsuarios);
router.patch("/usuarios/:id",   autenticar, apenasAdmin, atualizarUsuario);
router.delete("/usuarios/:id",  autenticar, apenasAdmin, excluirUsuario);

module.exports = router;