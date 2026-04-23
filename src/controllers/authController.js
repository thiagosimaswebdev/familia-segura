const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "familia_segura_secret";
const JWT_EXPIRES_IN = "8h";
const SALT_ROUNDS = 10;

// Cadastra um novo usuário com senha criptografada
async function cadastrar(req, res) {
  try {
    const { nome, usuario, senha } = req.body;

    // Verifica se o usuário já existe no banco
    const usuarioExiste = await pool.query(
      `SELECT id FROM usuarios WHERE usuario = $1`,
      [usuario]
    );

    if (usuarioExiste.rows.length > 0) {
      return res.status(409).json({ erro: "Usuário já cadastrado" });
    }

    // Criptografa a senha antes de salvar — nunca salva senha em texto puro
    const senhaCriptografada = await bcrypt.hash(senha, SALT_ROUNDS);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, usuario, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, usuario, criado_em`,
      [nome, usuario, senhaCriptografada]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[POST /usuarios]", erro);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
}

// Autentica o usuário e retorna um token JWT
async function login(req, res) {
  try {
    const { usuario, senha } = req.body;

    // Busca o usuário no banco pelo nome de usuário
    const resultado = await pool.query(
      `SELECT * FROM usuarios WHERE usuario = $1`,
      [usuario]
    );

    // Retorna a mesma mensagem para usuário não encontrado E senha errada
    // Isso evita que alguém descubra se um usuário existe
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const usuarioEncontrado = resultado.rows[0];

    // Compara a senha digitada com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    // Gera o token JWT com os dados do usuário — expira em 8h
    const token = jwt.sign(
      { id: usuarioEncontrado.id, usuario: usuarioEncontrado.usuario },
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