const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const authRoutes    = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const abrigoRoutes  = require("./routes/abrigoRoutes");
const familiaRoutes = require("./routes/familiaRoutes");
const adminRoutes   = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    projeto: "Família Segura API",
    versao: "1.0.0",
    documentacao: "/docs",
  });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/login",    authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/abrigos",  abrigoRoutes);
app.use("/familias", familiaRoutes);
app.use("/admin",    adminRoutes);

module.exports = app;