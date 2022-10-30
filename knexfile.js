require("dotenv").config();

module.exports = {
  // development: {
  //   client: "pg",
  //   connection: process.env.DB_URL,
  //   migrations: {
  //     directory: "./infrastructure/database/migrations",
  //   },
  //   seeds: { directory: "./infrastructure/database/seeds" },
  // },
  development: {
    client: "pg",
    connection: {
      host : '192.168.62.102',
      database: "DB_LOGISTIK",
      user: "logistic",
      password: "dev4logistic",
    },
    // connection: process.env.DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./infrastructure/database/migrations",
    },
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
      host : '192.168.62.102',
      database: "DB_LOGISTIK",
      user: "logistic",
      password: "dev4logistic",
    },
    // connection: process.env.DB_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./infrastructure/database/migrations",
    },
  },
};
