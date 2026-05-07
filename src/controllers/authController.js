const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "familia_segura_secret";
const JWT_EXPIRES_IN = "8h";
const SALT_ROUNDS = 10;

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastrar usuário
 *     description: Cria um novo usuário. O acesso só será liberado após aprovação do administrador.
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
 *                 example: Thiago
 *               usuario:
 *                 type: string
 *                 example: thiago123
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuário cadastrado (pendente de aprovação)
 *       409:
 *         description: Usuário já existe
 */
async function cadastrar(req, res) {
  try {
    const { nome, usuario, senha } = req.body;

    const usuarioExiste = await pool.query(
      `SELECT id FROM usuarios WHERE usuario = $1`,
      [usuario]
    );

    if (usuarioExiste.rows.length > 0) {
      return res.status(409).json({ erro: "Usuário já cadastrado" });
    }

    const senhaCriptografada = await bcrypt.hash(senha, SALT_ROUNDS);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, usuario, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, usuario, status, role, criado_em`,
      [nome, usuario, senhaCriptografada]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado. Aguarde aprovação do administrador.",
      usuario: resultado.rows[0],
    });

  } catch (erro) {
    console.error("[POST /usuarios]", erro);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
}

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticar usuário
 *     description: Realiza login e retorna um token JWT. Usuários pendentes não podem acessar.
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
 *                 example: thiago123
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Usuário ou senha inválidos
 *       403:
 *         description: Usuário aguardando aprovação
 */
async function login(req, res) {
  try {
    const { usuario, senha } = req.body;

    const resultado = await pool.query(
      `SELECT * FROM usuarios WHERE usuario = $1`,
      [usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const usuarioEncontrado = resultado.rows[0];

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuarioEncontrado.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    // 🔥 BLOQUEIO POR STATUS
    if (usuarioEncontrado.status !== "ativo") {
      return res.status(403).json({
        erro: "Conta aguardando aprovação do administrador",
      });
    }

    const token = jwt.sign(
      {
        id: usuarioEncontrado.id,
        usuario: usuarioEncontrado.usuario,
        role: usuarioEncontrado.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      mensagem: "Login realizado com sucesso",
      token,
      expira_em: JWT_EXPIRES_IN,
    });

  } catch (erro) {
    console.error("[POST /login]", erro);
    res.status(500).json({ erro: "Erro ao realizar login" });
  }
}

module.exports = { cadastrar, login };