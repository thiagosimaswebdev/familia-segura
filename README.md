# 🏠 Família Segura — Backend

API REST para gerenciamento de abrigos e famílias afetadas por enchentes. Desenvolvida como projeto fullstack acadêmico no curso **Dev Fullstack da Vai Na Web**.

---

## 🎯 Sobre o projeto

O **Família Segura** foi idealizado a partir de um cenário real: em períodos de enchentes e desastres urbanos, a falta de informação centralizada dificulta o encaminhamento de famílias desabrigadas e a gestão da capacidade dos abrigos disponíveis.

A proposta da API é servir como núcleo de dados da plataforma, permitindo que aplicações web ou mobile consumam informações em tempo real para apoio operacional.

O sistema possibilita:

- Mapear abrigos reais com localização e status atualizado
- Controlar capacidade total e vagas disponíveis
- Cadastrar famílias afetadas e vinculá-las a abrigos
- Consultar indicadores consolidados via dashboard
- Buscar abrigos próximos por geolocalização
- Proteger operações sensíveis com autenticação JWT

📌 **Importante:** os locais cadastrados no banco utilizam referências reais do Rio de Janeiro, porém o uso do sistema neste projeto é acadêmico e demonstrativo.

---

📁 Estrutura do projeto
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Conexão com o PostgreSQL
│   ├── controllers/
│   │   ├── authController.js     # Login e cadastro de usuários
│   │   ├── abrigoController.js   # CRUD de abrigos + dashboard + geolocalização
│   │   └── familiaController.js  # CRUD de famílias
│   ├── middlewares/
│   │   ├── autenticar.js         # Verificação do token JWT
│   │   └── validar.js            # Helper de validação Joi
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── abrigoRoutes.js
│   │   └── familiaRoutes.js
│   ├── schemas/
│   │   └── schemas.js            # Schemas de validação Joi
│   ├── app.js                    # Configuração do Express
│   └── swagger.js                # Configuração da documentação
├── seed.js                       # Script para popular o banco com dados reais
├── server.js                     # Ponto de entrada da aplicação
├── .env.example                  # Modelo de variáveis de ambiente
└── package.json
---

## 🚀 Tecnologias

| Tecnologia | Uso |
|---|---|
| Node.js + Express | Servidor HTTP e rotas REST |
| PostgreSQL (Supabase) | Banco de dados relacional |
| JWT (jsonwebtoken) | Autenticação com token |
| bcrypt | Criptografia de senhas |
| Joi | Validação de dados de entrada |
| Swagger UI | Documentação interativa da API |
| CORS | Permissão de requisições cross-origin |
| dotenv | Variáveis de ambiente |

---

## 📁 Estrutura do projeto

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Conexão com o PostgreSQL
│   ├── controllers/
│   │   ├── authController.js     # Login e cadastro de usuários
│   │   ├── abrigoController.js   # CRUD de abrigos + dashboard + geolocalização
│   │   └── familiaController.js  # CRUD de famílias
│   ├── middlewares/
│   │   ├── autenticar.js         # Verificação do token JWT
│   │   └── validar.js            # Helper de validação Joi
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── abrigoRoutes.js
│   │   └── familiaRoutes.js
│   ├── schemas/
│   │   └── schemas.js            # Schemas de validação Joi
│   ├── app.js                    # Configuração do Express
│   └── swagger.js                # Configuração da documentação
├── seed.js                       # Script para popular o banco com dados reais
├── server.js                     # Ponto de entrada da aplicação
├── .env.example                  # Modelo de variáveis de ambiente
└── package.json
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js v18+
- PostgreSQL ou conta no Supabase
- npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/thiagosimaswebdev/familia-segura.git
cd familia-segura/backend

# Instale as dependências
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` com:

```env
DB_HOST=seu_host_do_supabase
DB_PORT=6543
DB_USER=postgres.seu_projeto_id
DB_PASSWORD=sua_senha
DB_NAME=postgres
JWT_SECRET=uma_string_secreta_longa
PORT=3000
```

### Banco de dados

Execute no SQL Editor do Supabase ou no seu PostgreSQL:

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE abrigos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  endereco VARCHAR(255) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL DEFAULT 'Rio de Janeiro',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  capacidade_total INT NOT NULL,
  vagas_disponiveis INT NOT NULL,
  status VARCHAR(20) DEFAULT 'disponivel',
  telefone VARCHAR(20),
  responsavel VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE familias (
  id SERIAL PRIMARY KEY,
  nome_responsavel VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  num_membros INT NOT NULL,
  abrigo_id INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(20) DEFAULT 'desabrigada',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_abrigo FOREIGN KEY (abrigo_id)
    REFERENCES abrigos(id) ON DELETE SET NULL
);
```

### Rodar o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Popular o banco com 15 abrigos reais do Rio de Janeiro
node seed.js

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`
A documentação Swagger em `http://localhost:3000/docs`

---

## 📋 Rotas da API

### Auth (públicas — sem token)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/usuarios` | Cadastrar novo usuário |
| POST | `/login` | Fazer login e obter token JWT |

### Abrigos

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/abrigos` | Não | Listar abrigos (com filtros e paginação) |
| GET | `/abrigos/:id` | Não | Buscar abrigo por ID |
| GET | `/abrigos/proximos?lat=&lng=&raio=` | Não | Abrigos mais próximos por coordenada |
| GET | `/abrigos/dashboard` | Sim | Resumo geral para o dashboard |
| POST | `/abrigos` | Sim | Criar novo abrigo |
| PATCH | `/abrigos/:id` | Sim | Atualizar vagas e/ou status |

### Famílias

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/familias` | Sim | Listar famílias (com filtros e paginação) |
| GET | `/familias/:id` | Sim | Buscar família por ID |
| POST | `/familias` | Sim | Cadastrar família |
| PATCH | `/familias/:id/abrigo` | Sim | Vincular família a um abrigo |

### Filtros disponíveis

```
GET /abrigos?status=disponivel&bairro=Tijuca&page=1&limit=9
GET /familias?status=desabrigada&page=1&limit=10
GET /abrigos/proximos?lat=-22.9068&lng=-43.1729&raio=10
```

---

## 🔐 Como usar a autenticação

**1. Cadastre um usuário:**
```json
POST /usuarios
{
  "nome": "João Silva",
  "usuario": "joao",
  "senha": "123456"
}
```

**2. Faça login:**
```json
POST /login
{
  "usuario": "joao",
  "senha": "123456"
}
```

**3. Use o token nas requisições protegidas:**
```
Authorization: Bearer eyJhbGci...
```

---

## 🌱 Seed — dados reais

O arquivo `seed.js` popula o banco com **15 abrigos reais do Rio de Janeiro** com coordenadas reais — ginásios, escolas municipais e centros comunitários distribuídos pela cidade.

```bash
node seed.js
```

---

## 🌐 Deploy

- **Backend:** [Render](https://familia-segura-whp2.onrender.com/) — Web Service Node.js
- **Banco:** [Supabase](https://supabase.com) — PostgreSQL gerenciado/Privado
- **Documentação:** [Swagger](https://familia-segura-whp2.onrender.com/) — Documentação Swagge

---

## 👨‍💻 Autor

**Thiago Simas**
[![GitHub](https://img.shields.io/badge/GitHub-thiagosimaswebdev-181717?style=flat&logo=github)](https://github.com/thiagosimaswebdev)
