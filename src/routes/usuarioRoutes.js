const express = require("express");
const router = express.Router();
const { cadastrar } = require("../controllers/authController");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastrar usuário
 *     description: Cria um novo usuário com senha criptografada via bcrypt.
 *     tags: [Auth]
 *     security: []
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
 *                 example: Administrador
 *               usuario:
 *                 type: string
 *                 example: admin
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       409:
 *         description: Usuário já cadastrado
 */
router.post("/", validar(schemas.cadastro), cadastrar);

module.exports = router;