const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

// Importa todas as rotas
const authRoutes    = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const abrigoRoutes  = require("./routes/abrigoRoutes");
const familiaRoutes = require("./routes/familiaRoutes");

const app = express();

// Permite requisições de qualquer origem (necessário para o frontend)
app.use(cors());

// Permite receber JSON no body das requisições
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    projeto: "Família Segura API",
    versao: "1.0.0",
    descricao: "API para gerenciamento de abrigos e famílias em situação de enchente",
    documentacao: "/docs",
  });
});

// Documentação Swagger — acessível em /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Registro das rotas
app.use("/login",    authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/abrigos",  abrigoRoutes);
app.use("/familias", familiaRoutes);

module.exports = app;