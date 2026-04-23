const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Fazer login
 *     description: Autentica o usuário e retorna um token JWT válido por 8 horas.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - senha
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: admin
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Usuário ou senha inválidos
 */
router.post("/", validar(schemas.login), login);

module.exports = router;