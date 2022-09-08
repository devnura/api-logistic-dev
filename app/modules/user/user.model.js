const helper = require('../../helpers/helper')

// GET USERS
const getTableUsers = async (trx, params) => {

  let per_page = params.limit || 10;
  let page = params.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * params.limit;

  let data = await trx('t_m_user AS tmu').count('tmu.i_id AS count')
    .leftJoin('public.t_m_group as tmg', function () {
      this.on('tmg.c_group_code', '=', 'tmu.c_group_code')
    })
    .whereRaw("1+1 = 2")
    .where((qb) => {
      if (params.keyword) {
        qb.orWhere("tmu.c_code", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmu.c_group_code", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmg.c_group_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmu.c_first_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmu.c_last_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmu.c_phone_number", "ilike", `%${params.keyword}%`)
      }
    }).first()

  let rows = await trx
    .select(
      "tmu.c_code",
      "tmu.c_group_code",
      "tmg.c_group_name",
      "tmu.c_email",
      "tmu.c_knowing_password",
      "tmu.c_first_name",
      "tmu.c_last_name",
      "tmu.c_phone_number",
      "tmu.c_status",
      "tmu.c_status_name",
    )
    .from('public.t_m_user as tmu')
    .leftJoin('public.t_m_group as tmg', function () {
      this.on('tmg.c_group_code', '=', 'tmu.c_group_code')
    })
    .whereRaw("1+1 = 2")
    .where((qb) => {
      if (params.keyword) {
        qb.orWhere("tmu.c_code", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmu.c_group_code", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmg.c_group_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmu.c_first_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmu.c_last_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("tmu.c_phone_number", "ilike", `%${params.keyword}%`)
      }

    })
    .offset(offset).limit(per_page)
    .orderBy("tmu.c_code", "DESC")

  return helper.generatePaginate(data.count, rows, page, params.limit, offset);

};

const getListUsers = async (trx) => {
  let result = await trx
    .select(
      "tmu.c_code",
      trx.raw("COALESCE(tmu.c_first_name, '') || ' ' ||COALESCE(tmu.c_last_name, '') AS c_project_manager_name"),
    )
    .from('public.t_m_user as tmu')
    .whereNot("c_status", 'X')
    .orderBy("tmu.c_code", "DESC")

  return result;
};

// GET USERS
const getUsers = async (trx) => {
  let result = await trx
    .select(
      "tmu.c_code",
      "tmu.c_group_code",
      "tmg.c_group_name",
      "tmu.c_email",
      "tmu.c_knowing_password",
      "tmu.c_first_name",
      "tmu.c_last_name",
      "tmu.c_phone_number",
      "tmu.c_status",
      "tmu.c_status_name",
      "tmu.c_created_by",
      "tmu.n_created_by",
      trx.raw("TO_CHAR(tmu.d_created_at, 'YYYY-MM-DD HH:mm:SS') AS d_created_at"),
      "tmu.c_updated_by",
      "tmu.n_updated_by",
      trx.raw("TO_CHAR(tmu.d_updated_at, 'YYYY-MM-DD HH:mm:SS') AS d_updated_at"),
      "tmu.c_deleted_by",
      "tmu.n_deleted_by",
      trx.raw("TO_CHAR(tmu.d_deleted_at, 'YYYY-MM-DD HH:mm:SS') AS d_deleted_at"),
    )
    .from('public.t_m_user as tmu')
    .leftJoin('public.t_m_group as tmg', function () {
      this.on('tmg.c_group_code', '=', 'tmu.c_group_code')
    })
    .orderBy("tmu.c_code", "DESC")

  return result;
};

// GET RESERVATION
const getUser = async (params, trx) => {
  let result = await trx
    .select([
      "tmu.c_code",
      "tmu.c_group_code",
      "tmg.c_group_name",
      "tmu.c_email",
      "tmu.c_knowing_password",
      "tmu.c_first_name",
      "tmu.c_last_name",
      "tmu.c_phone_number",
      "tmu.c_status",
      "tmu.c_status_name",
      "tmu.c_created_by",
      "tmu.n_created_by",
      trx.raw("TO_CHAR(tmu.d_created_at, 'YYYY-MM-DD HH:mm:SS') AS d_created_at"),
      "tmu.c_updated_by",
      "tmu.n_updated_by",
      trx.raw("TO_CHAR(tmu.d_updated_at, 'YYYY-MM-DD HH:mm:SS') AS d_updated_at"),
      "tmu.c_deleted_by",
      "tmu.n_deleted_by",
      trx.raw("TO_CHAR(tmu.d_deleted_at, 'YYYY-MM-DD HH:mm:SS') AS d_deleted_at"),
    ])
    .from('public.t_m_user as tmu')
    .leftJoin('public.t_m_group as tmg', function () {
      this.on('tmg.c_group_code', '=', 'tmu.c_group_code')
    })
    .where("tmu.c_code", params)
    .first();

  return result;
};

const insertUser = async (data, payload, trx) => {

  let result = await trx("t_m_user")
    .insert({
      "c_code": data.c_code,
      "c_group_code": data.c_group_code,
      "c_email": data.c_email,
      "e_password": data.passwordHash,
      "c_knowing_password": data.knowingPassword,
      "c_first_name": data.c_first_name,
      "c_last_name": data.c_last_name ? data.c_last_name : null,
      "c_phone_number": data.c_phone_number,
      "c_created_by": payload.user_code,
      "n_created_by": payload.user_name,
      "d_created_at": trx.raw("NOW()"),
    }, ['*'])

  return result[0];

};

const updateUser = async (params, data, payload, trx) => {
  let result = await trx("t_m_user")
    .update({
      "c_group_code": data.c_group_code,
      "c_group_name": data.c_group_name,
      "c_email": data.c_email,
      "c_first_name": data.c_first_name,
      "c_last_name": data.c_last_name,
      "c_phone_number": data.c_phone_number,
      "c_updated_by": payload.user_code,
      "n_updated_by": payload.user_name,
      "d_updated_at": trx.raw("now()"),
    }, ["*"])
    .where("c_code", params)
    .where("c_status", "A")

  return result[0];
};

// UPDATE PASSWORD
const resetPassword = async (params, data, payload, trx) => {

  let rows = await trx("public.t_m_user").update({
      "e_password": data.passwordHash,
      "c_knowing_password": data.knowingPassword,
      "c_updated_by": payload.user_code,
      "n_updated_by": payload.user_name,
      "d_updated_at": trx.raw('NOW()')
    }, ["*"])
    .where({
      "c_code": params,
      "c_status": "A"
    })

  return rows[0]
}

// DELETE USER
const deleteUser = async (params, payload, trx) => {

  let rows = await trx('public.t_m_user').update({
      "c_status": "X",
      "c_status_name": "DELETED",
      "c_deleted_by": payload.user_code,
      "n_deleted_by": payload.user_name,
      "d_deleted_at": trx.raw('NOW()')
    }, ['*'])
    .where({
      "c_code": params,
      "c_status": "A"
    })

  return rows[0]

}

const checkDuplicatedInsert = async (data, trx) => {

  const result = await trx("t_m_user")
    .select('i_id')
    .where('c_email', data.c_email)
    .where('c_phone_number', data.c_phone_number)
    .where('c_status', "A")
    .first()

  return result
}

const generateUserCode = async (trx) => {

  let code = ''
  const prefix = 'U'
  let result = await trx.raw("SELECT substring(tmu.c_code, 2, 3)::INT AS code FROM public.t_m_user tmu ORDER BY substring(tmu.c_code, 2, 3)::INT DESC LIMIT 1")
  // console.log(result.rows)
  if (result.rows.length > 0) {
    code = prefix + "" + String(parseInt(result.rows[0].code) + 1).padStart(3, '0')
  } else {
    code = prefix + "" + String(1).padStart(3, '0')
  }

  return code
}

const checkUpdate = async (params, data, before, trx) => {

  const result = await trx("t_m_user")
    .select(['c_email'])
    .where({
      'c_email': data.c_email,
      "c_phone_number": data.c_phone_number
    })
    .whereNot({
      "c_email": before.c_email,
      "c_phone_number": before.c_phone_number
    })
    .where('c_status', "A")
    .whereNot("c_code", params)
    .first()

  return result

}

const createLog = async (trx, activityCode, code, note, newData, oldData) => {
  const log = await trx('log.t_log_activity').insert({
    "c_activity_code": activityCode,
    "d_log": trx.raw('NOW()'),
    "c_source": "WEB",
    "c_code": code,
    "j_new_data": JSON.stringify(newData),
    "j_old_data": oldData ? JSON.stringify(oldData) : trx.raw("NULL"),
    "c_note": note,
    "d_created_at": trx.raw('NOW()'),
    "c_created_by": newData.c_created_by,
    "n_created_by": newData.n_created_by,
  }, ['i_log_activity'])

  return log
}

module.exports = {
  getTableUsers,
  getUsers,
  getUser,
  insertUser,
  updateUser,
  deleteUser,
  getUsers,
  resetPassword,
  checkDuplicatedInsert,
  generateUserCode,
  checkUpdate,
  getListUsers,
  createLog
};