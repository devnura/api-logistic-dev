const knex = require("knex");
const { attachPaginate } = require('knex-paginate');

const knexfile = require("../../knexfile");

const env = process.env.NODE_ENV || "production";
const configOptions = knexfile[env];

attachPaginate();
module.exports = knex(configOptions);
