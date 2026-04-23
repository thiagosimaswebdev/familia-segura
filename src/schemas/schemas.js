const Joi = require("joi");

const schemas = {
  // Schema para cadastro de usuário
  cadastro: Joi.object({
    nome: Joi.string().min(2).max(100).required().messages({
      "string.min": "Nome deve ter pelo menos 2 caracteres",
      "any.required": "Nome é obrigatório",
    }),
    usuario: Joi.string().min(3).max(50).required().messages({
      "string.min": "Usuário deve ter pelo menos 3 caracteres",
      "any.required": "Usuário é obrigatório",
    }),
    senha: Joi.string().min(6).required().messages({
      "string.min": "Senha deve ter pelo menos 6 caracteres",
      "any.required": "Senha é obrigatória",
    }),
  }),

  // Schema para login
  login: Joi.object({
    usuario: Joi.string().min(3).max(50).required().messages({
      "any.required": "Usuário é obrigatório",
    }),
    senha: Joi.string().min(6).required().messages({
      "any.required": "Senha é obrigatória",
    }),
  }),

  // Schema para cadastro de abrigo
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
    cidade: Joi.string().max(100).default("Rio de Janeiro"),
    latitude: Joi.number().min(-90).max(90).required().messages({
      "any.required": "Latitude é obrigatória",
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
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
    telefone: Joi.string().max(20).allow("", null),
    responsavel: Joi.string().max(100).allow("", null),
  }),

  // Schema para atualizar status e vagas do abrigo
  atualizarAbrigo: Joi.object({
    vagas_disponiveis: Joi.number().integer().min(0).messages({
      "number.min": "Vagas disponíveis não pode ser negativo",
    }),
    status: Joi.string()
      .valid("disponivel", "lotado", "fechado")
      .messages({
        "any.only": "Status inválido. Use: disponivel, lotado ou fechado",
      }),
  }).or("vagas_disponiveis", "status").messages({
    "object.missing": "Informe ao menos vagas_disponiveis ou status",
  }),

  // Schema para cadastro de família
  familia: Joi.object({
    nome_responsavel: Joi.string().min(2).max(100).required().messages({
      "any.required": "Nome do responsável é obrigatório",
    }),
    cpf: Joi.string()
      .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
      .required()
      .messages({
        "string.pattern.base": "CPF deve estar no formato 000.000.000-00",
        "any.required": "CPF é obrigatório",
      }),
    telefone: Joi.string()
      .pattern(/^\d{10,11}$/)
      .required()
      .messages({
        "string.pattern.base": "Telefone deve ter 10 ou 11 dígitos",
        "any.required": "Telefone é obrigatório",
      }),
    num_membros: Joi.number().integer().min(1).required().messages({
      "number.min": "Número de membros deve ser pelo menos 1",
      "any.required": "Número de membros é obrigatório",
    }),
    abrigo_id: Joi.number().integer().positive().allow(null),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null),
    status: Joi.string()
      .valid("desabrigada", "em_abrigo", "reassentada")
      .default("desabrigada")
      .messages({
        "any.only": "Status inválido. Use: desabrigada, em_abrigo ou reassentada",
      }),
    observacoes: Joi.string().max(500).allow("", null),
  }),
};

module.exports = schemas;