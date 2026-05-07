const express = require("express");
const router = express.Router();

const autenticar = require("../middlewares/autenticar");
const { cadastrar } = require("../controllers/authController");

const {
  listarUsuarios,
  atualizarStatus
} = require("../controllers/usuarioController");

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastrar novo usuário
 *     description: Cria um usuário com status pendente aguardando aprovação do admin
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - usuario
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               usuario:
 *                 type: string
 *                 example: joao
 *               senha:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       409:
 *         description: Usuário já existe
 */
router.post("/", cadastrar);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuários
 *     description: Apenas administradores podem acessar
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       403:
 *         description: Acesso negado
 */
router.get("/", autenticar, listarUsuarios);

/**
 * @swagger
 * /usuarios/{id}/status:
 *   patch:
 *     summary: Aprovar usuário
 *     description: Apenas administradores podem aprovar usuários
 *     tags: [Usuários]
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
 *         description: Usuário aprovado
 *       403:
 *         description: Acesso negado
 */
router.patch("/:id/status", autenticar, atualizarStatus);

module.exports = router;