const express = require("express");
const router = express.Router();
const {
  listarFamilias,
  buscarFamilia,
  criarFamilia,
  vincularAbrigo,
} = require("../controllers/familiaController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

/**
 * @swagger
 * /familias:
 *   get:
 *     summary: Listar todas as famílias
 *     tags: [Famílias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [desabrigada, em_abrigo, reassentada]
 *       - in: query
 *         name: abrigo_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de famílias
 *   post:
 *     summary: Cadastrar família
 *     tags: [Famílias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome_responsavel
 *               - cpf
 *               - telefone
 *               - num_membros
 *             properties:
 *               nome_responsavel:
 *                 type: string
 *                 example: Maria Silva
 *               cpf:
 *                 type: string
 *                 example: "123.456.789-00"
 *               telefone:
 *                 type: string
 *                 example: "21999999999"
 *               num_membros:
 *                 type: integer
 *                 example: 4
 *               abrigo_id:
 *                 type: integer
 *                 example: 1
 *               latitude:
 *                 type: number
 *                 example: -22.9068
 *               longitude:
 *                 type: number
 *                 example: -43.1729
 *               status:
 *                 type: string
 *                 example: desabrigada
 *               observacoes:
 *                 type: string
 *                 example: Família com 2 crianças e 1 idoso
 *     responses:
 *       201:
 *         description: Família cadastrada com sucesso
 *       409:
 *         description: CPF já cadastrado
 *
 * /familias/{id}:
 *   get:
 *     summary: Buscar família por ID
 *     tags: [Famílias]
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
 *         description: Família encontrada
 *       404:
 *         description: Família não encontrada
 *
 * /familias/{id}/abrigo:
 *   patch:
 *     summary: Vincular família a um abrigo
 *     tags: [Famílias]
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
 *             required:
 *               - abrigo_id
 *             properties:
 *               abrigo_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Família vinculada ao abrigo com sucesso
 *       400:
 *         description: Abrigo lotado ou fechado
 *       404:
 *         description: Família ou abrigo não encontrado
 */

router.get("/", autenticar, listarFamilias);
router.get("/:id", autenticar, buscarFamilia);
router.post("/", autenticar, validar(schemas.familia), criarFamilia);
router.patch("/:id/abrigo", autenticar, vincularAbrigo);

module.exports = router;