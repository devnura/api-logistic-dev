const knex = require("../../../infrastructure/database/knex");

// CHECK REFRESH TOKEN IN DATABASE
const checkRefreshToken = (code, refreshToken) => {
  let result = knex("t_m_refresh_token")
    .where("c_refresh_token", refreshToken)
    .where("c_user_code", code)
    .first();
  return result;
};

// INSERT REFRESH TOKEN
const insertRefreshToken = (code, refreshToken) => {
  let result = knex("t_m_refresh_token").insert({
    c_user_code: code,
    c_refresh_token: refreshToken,
  });
  return result;
};

// DELETE REFRESH TOKEN
const deleteRefreshToken = (code) => {

  let result = knex("t_m_refresh_token").where({
    c_user_code: code,
  })
  .delete();

  return result;
}

// UPDATE REFRESH TOKEN
const updateRefreshToken = (code, oldRefreshToken, newRefreshToken) => {
  let result = knex("t_m_refresh_token")
    .where("c_user_code", code)
    .where("c_refresh_token", oldRefreshToken)
    .update({
      c_refresh_token: newRefreshToken,
    });
  return result;
};

// CHECK LOGIN USER
const checkUser = (email) => {
  let result = knex("t_m_user as tmu")
    .where("tmu.c_status", "!=", "X")
    .where("c_email", email)
    .first();
  return result;
};

const checUserLogin = (code) => {
  let result = knex("t_m_refresh_token")
    .where("c_user_code", code)
    .first()
  return result;
}

module.exports = {
  checkRefreshToken,
  insertRefreshToken,
  updateRefreshToken,
  deleteRefreshToken,
  checkUser,
  checUserLogin
};
