const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Família Segura API",
      version: "1.0.0",
      description:
        "API REST para gerenciamento de abrigos e famílias afetadas por enchentes. Desenvolvida com Node.js, Express, PostgreSQL, JWT e Joi.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
      {
        url: process.env.API_URL || "https://api-familia-segura.onrender.com",
        description: "Servidor de produção",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT obtido no login",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // lê os comentários @swagger das rotas
};

module.exports = swaggerJsdoc(options);