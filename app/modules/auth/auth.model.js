const knex = require("../../../infrastructure/database/knex");

// CHECK REFRESH TOKEN IN DATABASE
const checkRefreshToken = (email, refreshToken) => {
  let result = knex("t_m_refresh_token")
    .where("c_refresh_token", refreshToken)
    .where("c_email", email)
    .first();
  return result;
};

// INSERT REFRESH TOKEN
const insertRefreshToken = (email, refreshToken) => {
  let result = knex("t_m_refresh_token").insert({
    c_email: email,
    c_refresh_token: refreshToken,
  });
  return result;
};

// UPDATE REFRESH TOKEN
const updateRefreshToken = (email, oldRefreshToken, newRefreshToken) => {
  let result = knex("t_m_refresh_token")
    .where("c_email", email)
    .where("c_refresh_token", oldRefreshToken)
    .update({
      c_refresh_token: newRefreshToken,
    });
  return result;
};

// CHECK LOGIN USER
const checkUser = (email) => {
  let result = knex("t_m_user")
    .where("c_status", "!=", "X")
    .where("c_email", email)
    .first();
  return result;
};

const checUserLogin = (email) => {
  let result = knex("t_m_refresh_token")
    .where("c_email", email)
    .first()
  return result;
}

module.exports = {
  checkRefreshToken,
  insertRefreshToken,
  updateRefreshToken,
  checkUser,
  checUserLogin
};
