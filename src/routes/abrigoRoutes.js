const express = require("express");
const router = express.Router();
const {
  listarAbrigos,
  buscarAbrigo,
  criarAbrigo,
  atualizarAbrigo,
  abrigosProximos,
  dashboard,
} = require("../controllers/abrigoController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

/**
 * @swagger
 * /abrigos/dashboard:
 *   get:
 *     summary: Resumo geral para o dashboard
 *     tags: [Abrigos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *
 * /abrigos/proximos:
 *   get:
 *     summary: Buscar abrigos próximos por coordenada
 *     tags: [Abrigos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         example: -22.9068
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         example: -43.1729
 *       - in: query
 *         name: raio
 *         schema:
 *           type: number
 *         description: Raio em km (padrão 10)
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de abrigos próximos ordenados por distância
 *
 * /abrigos:
 *   get:
 *     summary: Listar todos os abrigos
 *     tags: [Abrigos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [disponivel, lotado, fechado]
 *       - in: query
 *         name: bairro
 *         schema:
 *           type: string
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
 *         description: Lista de abrigos
 *   post:
 *     summary: Criar abrigo
 *     tags: [Abrigos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - endereco
 *               - bairro
 *               - latitude
 *               - longitude
 *               - capacidade_total
 *               - vagas_disponiveis
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Escola Municipal Santos Dumont
 *               endereco:
 *                 type: string
 *                 example: Rua Santos Dumont, 100
 *               bairro:
 *                 type: string
 *                 example: Centro
 *               cidade:
 *                 type: string
 *                 example: Rio de Janeiro
 *               latitude:
 *                 type: number
 *                 example: -22.9068
 *               longitude:
 *                 type: number
 *                 example: -43.1729
 *               capacidade_total:
 *                 type: integer
 *                 example: 200
 *               vagas_disponiveis:
 *                 type: integer
 *                 example: 150
 *               status:
 *                 type: string
 *                 example: disponivel
 *               telefone:
 *                 type: string
 *                 example: "21999999999"
 *               responsavel:
 *                 type: string
 *                 example: João Silva
 *     responses:
 *       201:
 *         description: Abrigo criado com sucesso
 *
 * /abrigos/{id}:
 *   get:
 *     summary: Buscar abrigo por ID
 *     tags: [Abrigos]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Abrigo encontrado
 *       404:
 *         description: Abrigo não encontrado
 *   patch:
 *     summary: Atualizar vagas e/ou status do abrigo
 *     tags: [Abrigos]
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
 *               vagas_disponiveis:
 *                 type: integer
 *                 example: 100
 *               status:
 *                 type: string
 *                 enum: [disponivel, lotado, fechado]
 *     responses:
 *       200:
 *         description: Abrigo atualizado com sucesso
 */

// Rotas públicas — não precisam de token
router.get("/dashboard", autenticar, dashboard);
router.get("/proximos", abrigosProximos);
router.get("/", listarAbrigos);
router.get("/:id", buscarAbrigo);

// Rotas protegidas — precisam de token
router.post("/", autenticar, validar(schemas.abrigo), criarAbrigo);
router.patch("/:id", autenticar, validar(schemas.atualizarAbrigo), atualizarAbrigo);

module.exports = router;