const knex = require("../../../infrastructure/database/knex");

// GET USERS
const getUsers = async () => {
  let result = await knex
    .select(
      "tmu.i_id",
      "tmu.c_code",
      "tmu.c_group_code",
      "tmg.c_group_name",
      "tmu.c_email",
      "tmu.c_first_name",
      "tmu.c_last_name",
      "tmu.c_phone_number",
      "tmu.c_status",
      "tmu.c_status_name",
      "tmu.c_created_by",
      "tmu.n_created_by",
      "tmu.d_created_at",
      knex.raw("TO_CHAR(tmu.d_created_at, 'YYYY-MM-DD HH:mm:SS') AS d_created_at"),
      "tmu.c_updated_by",
      "tmu.n_updated_by",
      "tmu.d_updated_at",
      "tmu.c_deleted_by",
      "tmu.n_deleted_by",
      "tmu.d_deleted_at",
    )
    .from('public.t_m_user as tmu')
    .leftJoin('public.t_m_group as tmg', function () {
      this.on('tmg.c_group_code', '=', 'tmu.c_group_code')
    })
    .where("tmu.c_status", "A")

  return result;
};

// GET RESERVATION
const getUser = async (params) => {
  let result = await knex("t_m_user")
    .select([
      "i_id",
      "c_code",
      "c_group_code",
      "c_email",
      "c_first_name",
      "c_last_name",
      "c_phone_number",
      "c_status",
      "c_status_name",
      "c_created_by",
      "n_created_by",
      "d_created_at",
      "c_updated_by",
      "n_updated_by",
      "d_updated_at",
      "c_deleted_by",
      "n_deleted_by",
      "d_deleted_at",
    ])
    .where("c_code", params)
    .where("c_status", "A")
    .first();

  return result;
};

// GET USER
const insertUser = async (data, payload) => {

  let result = await knex("t_m_user")
    .insert({
      "c_code" : data.c_code,
      "c_group_code" : data.c_group_code,
      "c_email" : data.c_email,
      "e_password" : data.passwordHash,
      "c_first_name" : data.c_first_name,
      "c_last_name" : data.c_last_name,
      "c_phone_number" : data.c_phone_number,
      "c_created_by" : payload.user_code ,
      "n_created_by" : payload.user_name ,
      "d_created_at" : knex.raw("NOW()") ,
    }, ['c_code'])
    
  return result[0];

};

// GET ISSUER FEE
const updateUser = async (params, data, payload) => {
  let result = await knex("t_m_user")
    .update({
      "c_group_code": data.c_group_code,
      "c_email": data.c_email,
      "c_first_name": data.c_first_name,
      "c_last_name": data.c_last_name,
      "c_phone_number": data.c_phone_number,
      "c_status": data.c_status,
      "c_status_name": data.c_status_name,
      "c_updated_by": payload.user_code,
      "n_updated_by": payload.user_name,
      "d_updated_at": knex.raw("now()"),
    }, ["code"])
    .where("c_code", params)
    .where("c_status", "A")

  return result;
};

// UPDATE PASSWORD
const updatePassword = async (params, e_password, payload) => {
  
  let rows = await knex("public.t_m_user").update({
    e_password: e_password,
    i_updated_by: payload.user_code,
    n_updated_by: payload.user_name,
    d_updated_at: knex.raw('NOW()')
  }, ["c_code"])
  .where({
    "c_code" : params,
    "c_status" : "A"
  })

return rows
}

// DELETE USER
const deleteUser = async (params, payload) => {

  let rows = await knex('public.t_m_user').update({
      "c_status": "X",
      "c_status_name" : "DELETED",
      "i_deleted_by" : payload.user_code,
      "n_deleted_by" : payload.user_name,
      "d_deleted_at": knex.raw('NOW()')
    }, ['c_code'])
    .where({
      "c_code": params,
      "c_status": "A"
    })

  return rows

}

const checkDuplicatedInsert = async (data) => {

  const result = await knex("t_m_user")
    .select('i_id')
    .where('c_email', data.c_email)
    .where('c_phone_number', data.c_phone_number)
    .where('c_status', "A")
    .first()

  return result
}

const generateUserCode = async (group_code) => {
  let result = await knex.select(knex.raw(`'${group_code}'||to_char(now(), 'YYMMDD')||LPAD(count(i_id)::text, 3, '0') AS user_code`)).from('t_m_user').first()
  return result.user_code
}

module.exports = {
  getUsers,
  getUser,
  insertUser,
  updateUser,
  deleteUser,
  getUsers,
  updatePassword,
  checkDuplicatedInsert,
  generateUserCode
};
