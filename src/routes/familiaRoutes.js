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
 *     summary: Listar famílias (PROTEGIDO)
 *     description: Retorna famílias cadastradas com filtros e paginação. Requer autenticação.
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
 *       401:
 *         description: Não autenticado
 */
router.get("/", autenticar, listarFamilias);

/**
 * @swagger
 * /familias/{id}:
 *   get:
 *     summary: Buscar família por ID (PROTEGIDO)
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
 *       401:
 *         description: Não autenticado
 */
router.get("/:id", autenticar, buscarFamilia);

/**
 * @swagger
 * /familias:
 *   post:
 *     summary: Cadastrar família (PROTEGIDO)
 *     description: Cria uma nova família afetada e opcionalmente vincula a um abrigo.
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
 *               longitude:
 *                 type: number
 *               status:
 *                 type: string
 *                 example: desabrigada
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Família cadastrada com sucesso
 *       409:
 *         description: CPF já cadastrado
 *       401:
 *         description: Não autenticado
 */
router.post("/", autenticar, validar(schemas.familia), criarFamilia);

/**
 * @swagger
 * /familias/{id}/abrigo:
 *   patch:
 *     summary: Vincular família a um abrigo (PROTEGIDO)
 *     description: Associa uma família a um abrigo disponível.
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
 *         description: Abrigo lotado ou inválido
 *       404:
 *         description: Família ou abrigo não encontrado
 *       401:
 *         description: Não autenticado
 */
router.patch("/:id/abrigo", autenticar, vincularAbrigo);

module.exports = router;