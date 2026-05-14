const Joi = require("joi");

// ══════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDAÇÃO — Joi
//
// O Joi valida o body de cada requisição ANTES do controller
// ser chamado. Se os dados forem inválidos, retorna 400
// com mensagens de erro detalhadas em português.
//
// Fluxo: requisição → validar(schema) → controller → banco
// ══════════════════════════════════════════════════════════════

const schemas = {

  // ── CADASTRO DE USUÁRIO ──────────────────────────────────────
  // POST /usuarios — rota pública
  // Novos usuários ficam com status "pendente" até o admin aprovar
  cadastro: Joi.object({
    nome: Joi.string().min(2).max(100).required().messages({
      "string.min":  "Nome deve ter pelo menos 2 caracteres",
      "any.required":"Nome é obrigatório",
    }),
    usuario: Joi.string().min(3).max(50).required().messages({
      "string.min":  "Usuário deve ter pelo menos 3 caracteres",
      "any.required":"Usuário é obrigatório",
    }),
    senha: Joi.string().min(6).required().messages({
      "string.min":  "Senha deve ter pelo menos 6 caracteres",
      "any.required":"Senha é obrigatória",
    }),
  }),

  // ── LOGIN ────────────────────────────────────────────────────
  // POST /login — rota pública
  login: Joi.object({
    usuario: Joi.string().min(3).max(50).required().messages({
      "any.required": "Usuário é obrigatório",
    }),
    senha: Joi.string().min(6).required().messages({
      "any.required": "Senha é obrigatória",
    }),
  }),

  // ── ABRIGO ──────────────────────────────────────────────────
  // POST /abrigos — rota privada (requer autenticação)
  abrigo: Joi.object({
    nome: Joi.string().min(2).max(255).required().messages({
      "any.required": "Nome do abrigo é obrigatório",
    }),
    endereco: Joi.string().min(5).max(255).required().messages({
      "any.required": "Endereço é obrigatório",
    }),
    bairro: Joi.string().min(2).max(100).required().messages({
      "any.required": "Bairro é obrigatório",
    }),
    cidade:           Joi.string().max(100).default("Rio de Janeiro"),
    latitude:         Joi.number().min(-90).max(90).required().messages({
      "any.required": "Latitude é obrigatória",
    }),
    longitude:        Joi.number().min(-180).max(180).required().messages({
      "any.required": "Longitude é obrigatória",
    }),
    capacidade_total: Joi.number().integer().min(1).required().messages({
      "any.required": "Capacidade total é obrigatória",
    }),
    vagas_disponiveis: Joi.number().integer().min(0).required().messages({
      "any.required": "Vagas disponíveis é obrigatório",
    }),
    status: Joi.string()
      .valid("disponivel", "lotado", "fechado")
      .default("disponivel")
      .messages({
        "any.only": "Status inválido. Use: disponivel, lotado ou fechado",
      }),
    telefone:    Joi.string().max(20).allow("", null),
    responsavel: Joi.string().max(100).allow("", null),
  }),

  // ── ATUALIZAR STATUS DO ABRIGO ───────────────────────────────
  // PATCH /abrigos/:id — rota privada
  atualizarAbrigo: Joi.object({
    vagas_disponiveis: Joi.number().integer().min(0),
    status: Joi.string()
      .valid("disponivel", "lotado", "fechado")
      .messages({
        "any.only": "Status inválido. Use: disponivel, lotado ou fechado",
      }),
  }).or("vagas_disponiveis", "status").messages({
    "object.missing": "Informe ao menos vagas_disponiveis ou status",
  }),

  // ── FAMÍLIA ──────────────────────────────────────────────────
  // POST /familias — rota privada (requer autenticação)
  //
  // NOVA REGRA: campo "membros" substitui "observacoes"
  // Armazena os nomes completos dos membros separados por vírgula
  // Ex: "Maria Souza, João Souza, Ana Souza"
  // A busca pública usa esse campo para localizar familiares
  familia: Joi.object({
    nome_responsavel: Joi.string().min(2).max(100).required().messages({
      "any.required": "Nome do responsável é obrigatório",
    }),
    cpf: Joi.string()
      .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
      .required()
      .messages({
        "string.pattern.base": "CPF deve estar no formato 000.000.000-00",
        "any.required":        "CPF é obrigatório",
      }),
    telefone: Joi.string()
      .pattern(/^\d{10,11}$/)
      .required()
      .messages({
        "string.pattern.base": "Telefone deve ter 10 ou 11 dígitos",
        "any.required":        "Telefone é obrigatório",
      }),
    num_membros: Joi.number().integer().min(1).required().messages({
      "number.min":   "Número de membros deve ser pelo menos 1",
      "any.required": "Número de membros é obrigatório",
    }),
    abrigo_id:  Joi.number().integer().positive().allow(null),
    latitude:   Joi.number().min(-90).max(90).allow(null),
    longitude:  Joi.number().min(-180).max(180).allow(null),
    status: Joi.string()
      .valid("desabrigada", "em_abrigo", "reassentada")
      .default("desabrigada")
      .messages({
        "any.only": "Status inválido. Use: desabrigada, em_abrigo ou reassentada",
      }),
    // Campo "membros" — nomes completos dos membros da família
    // Permite busca pública por qualquer membro
    observacoes: Joi.string().max(1000).allow("", null).messages({
      "string.max": "Lista de membros muito longa (máximo 1000 caracteres)",
    }),
  }),
};

module.exports = schemas;