const express = require("express");
const router  = express.Router();
const {
  listarFamilias,
  buscarFamilia,
  criarFamilia,
  vincularAbrigo,
} = require("../controllers/familiaController");

const autenticar = require("../middlewares/autenticar");
const validar    = require("../middlewares/validar");
const schemas    = require("../schemas/schemas");

// ══════════════════════════════════════════════════════════════
// CONTROLE DE ACESSO — onde as permissões são definidas
//
// ✅ SEM autenticar → rota PÚBLICA (qualquer pessoa acessa)
// 🔒 COM autenticar → rota PRIVADA (exige token JWT válido)
//
// O middleware autenticar() intercepta a requisição,
// verifica o token JWT no header Authorization e:
//   → token válido:   chama next() e continua para o controller
//   → token inválido: retorna 401 e bloqueia o acesso
// ══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /familias:
 *   get:
 *     summary: Listar e buscar famílias (público)
 *     description: Qualquer pessoa pode buscar familiares pelo nome. Não requer autenticação.
 *     tags: [Famílias]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Nome do membro ou responsável
 *         example: João Souza
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [desabrigada, em_abrigo, reassentada]
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
 *     summary: Cadastrar família (privado)
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
 *                 example: Maria Souza
 *               cpf:
 *                 type: string
 *                 example: "123.456.789-00"
 *               telefone:
 *                 type: string
 *                 example: "21999999999"
 *               num_membros:
 *                 type: integer
 *                 example: 3
 *               membros:
 *                 type: string
 *                 example: "Maria Souza, João Souza, Ana Souza"
 *               abrigo_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Família cadastrada com sucesso
 *       401:
 *         description: Token não informado ou inválido
 *       409:
 *         description: CPF já cadastrado
 *
 * /familias/{id}:
 *   get:
 *     summary: Buscar família por ID (público)
 *     tags: [Famílias]
 *     security: []
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
 *     summary: Vincular família a um abrigo (privado)
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
 *         description: Família vinculada
 *       401:
 *         description: Token não informado ou inválido
 */

// ── ROTAS PÚBLICAS ────────────────────────────────────────────
router.get("/",    listarFamilias); // busca pública por membros
router.get("/:id", buscarFamilia);  // detalhe público

// ── ROTAS PRIVADAS ────────────────────────────────────────────
router.post("/",            autenticar, validar(schemas.familia), criarFamilia);
router.patch("/:id/abrigo", autenticar, vincularAbrigo);

module.exports = router;