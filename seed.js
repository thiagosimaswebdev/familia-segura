require("dotenv").config();
const pool = require("./src/config/db");

// Script de seed — popula o banco com abrigos reais do Rio de Janeiro
// Execute com: node seed.js

const abrigos = [
  {
    nome: "Ginásio Experimental Olímpico",
    endereco: "Rua Érico Coelho, 271",
    bairro: "Realengo",
    latitude: -22.8721,
    longitude: -43.4196,
    capacidade_total: 500,
    vagas_disponiveis: 320,
    status: "disponivel",
    telefone: "21-3395-0400",
    responsavel: "Coordenadoria Regional de Realengo",
  },
  {
    nome: "Escola Municipal Compositor Luís Peixoto",
    endereco: "Rua Conselheiro Galvão, 200",
    bairro: "Bangu",
    latitude: -22.8814,
    longitude: -43.4647,
    capacidade_total: 300,
    vagas_disponiveis: 180,
    status: "disponivel",
    telefone: "21-3395-1200",
    responsavel: "Coordenadoria Regional de Bangu",
  },
  {
    nome: "Centro Esportivo Miécimo da Silva",
    endereco: "Rua Carolina Machado, 840",
    bairro: "Bangu",
    latitude: -22.8874,
    longitude: -43.4712,
    capacidade_total: 800,
    vagas_disponiveis: 0,
    status: "lotado",
    telefone: "21-3395-1500",
    responsavel: "Secretaria Municipal de Esportes",
  },
  {
    nome: "Escola Municipal Presidente Campos Salles",
    endereco: "Rua Pereira de Almeida, 40",
    bairro: "Praça da Bandeira",
    latitude: -22.9145,
    longitude: -43.2012,
    capacidade_total: 250,
    vagas_disponiveis: 120,
    status: "disponivel",
    telefone: "21-3878-3200",
    responsavel: "Coordenadoria Regional da Tijuca",
  },
  {
    nome: "Ginásio do Clube de Regatas Vasco da Gama",
    endereco: "Rua General Almério de Moura, 131",
    bairro: "São Cristóvão",
    latitude: -22.8997,
    longitude: -43.2215,
    capacidade_total: 600,
    vagas_disponiveis: 400,
    status: "disponivel",
    telefone: "21-2578-5600",
    responsavel: "Clube de Regatas Vasco da Gama",
  },
  {
    nome: "Escola Municipal Pinto de Aguiar",
    endereco: "Rua Arquias Cordeiro, 370",
    bairro: "Méier",
    latitude: -22.8981,
    longitude: -43.2741,
    capacidade_total: 200,
    vagas_disponiveis: 80,
    status: "disponivel",
    telefone: "21-3878-4100",
    responsavel: "Coordenadoria Regional do Méier",
  },
  {
    nome: "Centro Municipal de Referência da Assistência Social",
    endereco: "Av. Brasil, 14671",
    bairro: "Bonsucesso",
    latitude: -22.8695,
    longitude: -43.2543,
    capacidade_total: 150,
    vagas_disponiveis: 0,
    status: "lotado",
    telefone: "21-3868-5100",
    responsavel: "Secretaria Municipal de Assistência Social",
  },
  {
    nome: "Escola Municipal Professor Romão Júnior",
    endereco: "Estrada dos Bandeirantes, 3124",
    bairro: "Jacarepaguá",
    latitude: -22.9612,
    longitude: -43.3745,
    capacidade_total: 280,
    vagas_disponiveis: 200,
    status: "disponivel",
    telefone: "21-3395-4500",
    responsavel: "Coordenadoria Regional de Jacarepaguá",
  },
  {
    nome: "Ginásio Gilberto Cardoso — Maracanãzinho",
    endereco: "Av. Édison Passos, s/n",
    bairro: "Maracanã",
    latitude: -22.9124,
    longitude: -43.2302,
    capacidade_total: 1000,
    vagas_disponiveis: 700,
    status: "disponivel",
    telefone: "21-2568-9962",
    responsavel: "Governo do Estado do Rio de Janeiro",
  },
  {
    nome: "Escola Municipal Antônio Houaiss",
    endereco: "Rua Carolina Machado, 500",
    bairro: "Madureira",
    latitude: -22.8724,
    longitude: -43.3312,
    capacidade_total: 300,
    vagas_disponiveis: 150,
    status: "disponivel",
    telefone: "21-3395-2200",
    responsavel: "Coordenadoria Regional de Madureira",
  },
  {
    nome: "Centro Municipal de Guaratiba",
    endereco: "Estrada do Guaratiba, 350",
    bairro: "Guaratiba",
    latitude: -23.0415,
    longitude: -43.5721,
    capacidade_total: 200,
    vagas_disponiveis: 200,
    status: "disponivel",
    telefone: "21-3395-8900",
    responsavel: "Coordenadoria Regional de Guaratiba",
  },
  {
    nome: "Escola Municipal General Humberto Castelo Branco",
    endereco: "Rua Piraquara, 30",
    bairro: "Vigário Geral",
    latitude: -22.8412,
    longitude: -43.2987,
    capacidade_total: 250,
    vagas_disponiveis: 100,
    status: "disponivel",
    telefone: "21-3868-2100",
    responsavel: "Coordenadoria Regional de Vigário Geral",
  },
  {
    nome: "Sociedade Esportiva Recreativa Caxias",
    endereco: "Rua Ferreira Pontes, 100",
    bairro: "Caxias",
    latitude: -22.7983,
    longitude: -43.3015,
    capacidade_total: 400,
    vagas_disponiveis: 0,
    status: "fechado",
    telefone: "21-3668-1200",
    responsavel: "Em manutenção",
  },
  {
    nome: "Escola Municipal Compositor Chico Buarque",
    endereco: "Rua Mariz e Barros, 100",
    bairro: "Tijuca",
    latitude: -22.9214,
    longitude: -43.2401,
    capacidade_total: 220,
    vagas_disponiveis: 90,
    status: "disponivel",
    telefone: "21-3878-3900",
    responsavel: "Coordenadoria Regional da Tijuca",
  },
  {
    nome: "Centro Esportivo Radium",
    endereco: "Rua Figueiredo Magalhães, 240",
    bairro: "Copacabana",
    latitude: -22.9714,
    longitude: -43.1892,
    capacidade_total: 180,
    vagas_disponiveis: 60,
    status: "disponivel",
    telefone: "21-2548-1200",
    responsavel: "Coordenadoria Regional de Copacabana",
  },
];

async function seed() {
  console.log("Iniciando seed de abrigos...");

  try {
    // Verifica se já existem abrigos no banco
    const existentes = await pool.query("SELECT COUNT(*) FROM abrigos");

    if (parseInt(existentes.rows[0].count) > 0) {
      console.log(`Já existem ${existentes.rows[0].count} abrigos no banco. Seed ignorado.`);
      process.exit(0);
    }

    // Insere cada abrigo no banco
    for (const abrigo of abrigos) {
      await pool.query(
        `INSERT INTO abrigos
          (nome, endereco, bairro, cidade, latitude, longitude,
           capacidade_total, vagas_disponiveis, status, telefone, responsavel)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          abrigo.nome,
          abrigo.endereco,
          abrigo.bairro,
          "Rio de Janeiro",
          abrigo.latitude,
          abrigo.longitude,
          abrigo.capacidade_total,
          abrigo.vagas_disponiveis,
          abrigo.status,
          abrigo.telefone,
          abrigo.responsavel,
        ]
      );
      console.log(`✓ ${abrigo.nome} — ${abrigo.bairro}`);
    }

    console.log(`\nSeed concluído! ${abrigos.length} abrigos inseridos com sucesso.`);
  } catch (erro) {
    console.error("Erro no seed:", erro);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();