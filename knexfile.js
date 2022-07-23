require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: process.env.DB_URL,
    migrations: {
      directory: "./infrastructure/database/migrations",
    },
    seeds: { directory: "./infrastructure/database/seeds" },
  },

  testing: {
    client: "pg",
    connection: process.env.DB_URL,
    migrations: {
      directory: "./infrastructure/database/migrations",
    },
    seeds: { directory: "./infrastructure/database/seeds" },
  },

  production: {
    client: "pg",
    connection: {
      host : '10.1.201.95',
      database: "postgres",
      user: "cms",
      password: "Cm5kc1#2021",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./infrastructure/database/migrations",
    },
  },
};
