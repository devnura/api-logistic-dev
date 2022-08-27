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
      host : '',
      database: "postgres",
      user: "",
      password: "",
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
