# 🏠 Família Segura — Backend

API REST para gerenciamento de abrigos e famílias afetadas por enchentes.  
Desenvolvida como projeto fullstack acadêmico no curso **Dev Fullstack da Vai Na Web**.

---

## 🎯 Sobre o projeto

O **Família Segura** nasceu como resposta a um problema real: durante enchentes, a falta de informação organizada dificulta que famílias desabrigadas encontrem abrigos disponíveis e que gestores coordenem o atendimento emergencial.

O sistema permite:
- Mapear abrigos com localização real e status em tempo real
- Cadastrar e acompanhar famílias afetadas
- **Buscar familiares pelo nome — sem precisar de login**
- Visualizar dashboard com dados consolidados
- Encontrar abrigos mais próximos por geolocalização
- Gerenciar usuários com painel administrativo

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
│   │   └── db.js                 # Conexão com o PostgreSQL via Pool
│   ├── controllers/
│   │   ├── authController.js     # Login e cadastro (verifica status pendente/ativo)
│   │   ├── abrigoController.js   # CRUD + dashboard + geolocalização (Haversine)
│   │   ├── familiaController.js  # CRUD + busca pública por membros
│   │   └── adminController.js    # Gerenciamento de usuários (só admin)
│   ├── middlewares/
│   │   ├── autenticar.js         # Verifica token JWT (bloqueia rotas privadas)
│   │   └── validar.js            # Helper de validação Joi
│   ├── routes/
│   │   ├── authRoutes.js         # POST /login
│   │   ├── usuarioRoutes.js      # POST /usuarios
│   │   ├── abrigoRoutes.js       # CRUD /abrigos
│   │   ├── familiaRoutes.js      # GET público + POST/PATCH privado
│   │   └── adminRoutes.js        # GET/PATCH/DELETE /admin/usuarios
│   ├── schemas/
│   │   └── schemas.js            # Schemas de validação Joi
│   ├── app.js                    # Configuração Express + registro de rotas
│   └── swagger.js                # Configuração da documentação
├── seed.js                       # 15 abrigos reais do Rio de Janeiro
├── server.js                     # Ponto de entrada
├── .env.example                  # Modelo de variáveis de ambiente
└── package.json
```

---

## 🔐 Controle de acesso — onde as permissões são definidas

O controle de acesso é feito em **dois lugares**:

### 1. `src/routes/*.js` — define quais rotas exigem token
```js
// PÚBLICA — qualquer pessoa acessa
router.get("/familias", listarFamilias);

// PRIVADA — exige token JWT válido
router.post("/familias", autenticar, validar(schemas.familia), criarFamilia);
```

### 2. `src/middlewares/autenticar.js` — verifica o token
```js
// Se não tiver token ou for inválido → retorna 401
// Se o token for válido → chama next() e segue para o controller
```

### Tabela de permissões

| Rota | Método | Acesso |
|---|---|---|
| `/abrigos` | GET | ✅ Público |
| `/abrigos/:id` | GET | ✅ Público |
| `/abrigos/proximos` | GET | ✅ Público |
| `/abrigos` | POST | 🔒 Autenticado |
| `/abrigos/:id` | PATCH | 🔒 Autenticado |
| `/familias` | GET | ✅ Público (busca por membros) |
| `/familias/:id` | GET | ✅ Público |
| `/familias` | POST | 🔒 Autenticado |
| `/familias/:id/abrigo` | PATCH | 🔒 Autenticado |
| `/abrigos/dashboard` | GET | 🔒 Autenticado |
| `/admin/usuarios` | GET/PATCH/DELETE | 🔒 Admin |
| `/login` | POST | ✅ Público |
| `/usuarios` | POST | ✅ Público |

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js v18+
- PostgreSQL ou conta no Supabase

### Instalação

```bash
git clone https://github.com/thiagosimaswebdev/familia-segura.git
cd familia-segura/backend
npm install
```

### Variáveis de ambiente

Crie `.env` na pasta `backend`:

```env
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.seu_projeto_id
DB_PASSWORD=sua_senha
DB_NAME=postgres
JWT_SECRET=uma_string_secreta_longa
PORT=3001
```

### Banco de dados

```sql
CREATE TABLE usuarios (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  usuario   VARCHAR(50)  NOT NULL UNIQUE,
  senha     VARCHAR(255) NOT NULL,
  status    VARCHAR(20)  DEFAULT 'pendente',
  role      VARCHAR(20)  DEFAULT 'operador',
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE abrigos (
  id                SERIAL PRIMARY KEY,
  nome              VARCHAR(255)  NOT NULL,
  endereco          VARCHAR(255)  NOT NULL,
  bairro            VARCHAR(100)  NOT NULL,
  cidade            VARCHAR(100)  NOT NULL DEFAULT 'Rio de Janeiro',
  latitude          DECIMAL(10,8) NOT NULL,
  longitude         DECIMAL(11,8) NOT NULL,
  capacidade_total  INT           NOT NULL,
  vagas_disponiveis INT           NOT NULL,
  status            VARCHAR(20)   DEFAULT 'disponivel',
  telefone          VARCHAR(20),
  responsavel       VARCHAR(100),
  criado_em         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE familias (
  id               SERIAL PRIMARY KEY,
  nome_responsavel VARCHAR(100) NOT NULL,
  cpf              VARCHAR(14)  NOT NULL UNIQUE,
  telefone         VARCHAR(20)  NOT NULL,
  num_membros      INT          NOT NULL,
  abrigo_id        INT,
  latitude         DECIMAL(10,8),
  longitude        DECIMAL(11,8),
  status           VARCHAR(20)  DEFAULT 'desabrigada',
  membros          TEXT,
  criado_em        TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_abrigo FOREIGN KEY (abrigo_id)
    REFERENCES abrigos(id) ON DELETE SET NULL
);
```

### Rodar

```bash
npm run dev      # desenvolvimento (nodemon)
node seed.js     # popula 15 abrigos reais do Rio de Janeiro
npm start        # produção
```

---

## 🔍 Busca pública de familiares

Qualquer pessoa pode localizar um familiar abrigado:

```
GET /familias?busca=João Souza
```

A busca percorre:
- `nome_responsavel` — nome do responsável pela família
- `membros` — lista de nomes dos membros (ex: "Maria Souza, João Souza, Ana Souza")

Retorna a família com dados do abrigo vinculado.

---

## 👤 Sistema de usuários

| Status | Descrição |
|---|---|
| `pendente` | Recém cadastrado — aguarda aprovação do admin |
| `ativo` | Aprovado — pode fazer login normalmente |
| `inativo` | Desativado pelo admin |

| Role | Permissões |
|---|---|
| `operador` | Cadastra e edita abrigos e famílias |
| `admin` | Tudo + gerencia usuários via `/admin` |

---

## 🌱 Seed

```bash
node seed.js
```

Popula o banco com **15 abrigos reais** do Rio de Janeiro — ginásios, escolas municipais e centros comunitários com coordenadas reais, distribuídos pela cidade.

---

## 🌐 Deploy

- **Backend:** [Render](https://render.com) — Web Service Node.js
- **Banco:** [Supabase](https://supabase.com) — PostgreSQL gerenciado
- **Docs:** `https://sua-api.onrender.com/docs`

---

## 👨‍💻 Autor

**Thiago Simas**
[![GitHub](https://img.shields.io/badge/GitHub-thiagosimaswebdev-181717?style=flat&logo=github)](https://github.com/thiagosimaswebdev)