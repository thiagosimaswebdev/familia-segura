// Helper que transforma um schema Joi em middleware do Express
// Recebe um schema e retorna uma função que valida o body da requisição
function validar(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // retorna TODOS os erros de uma vez
    });

    if (error) {
      // Mapeia os erros para uma lista de mensagens legíveis
      const erros = error.details.map((d) => d.message);
      return res.status(400).json({ erro: "Dados inválidos", detalhes: erros });
    }

    req.body = value; // substitui o body pelo valor sanitizado pelo Joi
    next();
  };
}

module.exports = validar;