const helper = require('../../helpers/helper')

const table = async (trx, params) => {
  
  let per_page = params.limit || 10;
  let page = params.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * params.limit;

  let data = await trx('trx.t_d_project AS tdp').count('i_project AS count')
  .whereRaw("1+1 = 2")
  .where((qb) => {
    if (params.keyword) {
      qb.orWhere("c_project_number", "ilike", `%${params.keyword}%`)
      qb.orWhere("c_project_name", "ilike", `%${params.keyword}%`)
      qb.orWhere("c_project_manager_code", "ilike", `%${params.keyword}%`)
      qb.orWhere("c_project_manager_name", "ilike", `%${params.keyword}%`)
      qb.orWhere("c_doc_project_number", "ilike", `%${params.keyword}%`)
      qb.orWhere("c_doc_contract_number", "ilike", `%${params.keyword}%`)
      qb.orWhere("c_doc_spdb_number", "ilike", `%${params.keyword}%`)
    }
  }).first()

  let rows = await trx
    .select(
      "tdp.c_project_number",
      "tdp.c_project_name",
      "tdp.c_project_manager_code",
      "tdp.c_project_manager_name",
      trx.raw("TO_CHAR(tdp.d_project_start, 'YYYY-MM-DD') AS d_project_start"),
      trx.raw("TO_CHAR(tdp.d_project_end, 'YYYY-MM-DD') AS d_project_end"),
      "tdp.c_doc_project_number",
      "tdp.c_doc_project_url",
      "tdp.c_doc_contract_number",
      "tdp.c_doc_spdb_number",
      "tdp.c_note",
      "tdp.c_status",
      "tdp.c_status_name",
    )
    .from('trx.t_d_project AS tdp')
    .whereRaw("1+1 = 2")
    .where((qb) => {
      if (params.keyword) {
        qb.orWhere("c_project_number", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_project_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_project_manager_code", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_project_manager_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_doc_project_number", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_doc_contract_number", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_doc_spdb_number", "ilike", `%${params.keyword}%`)
      }

    })
    .orderBy("c_project_number", "DESC")
    .offset(offset).limit(per_page)

    return helper.generatePaginate(data.count, rows, page, params.limit, offset);

  };

const list = async (trx) => {
  // let searchCriteria = {}
    let result = await trx
      .select(
        "tdp.c_project_number",
        "tdp.c_project_name",
      )
      .from('trx.t_d_project AS tdp')

    return result;
  };

const find = async (trx, code) => {
    let result = await trx
      .select(
        "tdp.c_project_number",
        trx.raw("TO_CHAR(tdp.d_project_date, 'YYYY-MM-DD') AS d_project_date"),
        "tdp.c_project_name",
        "tdp.c_project_manager_code",
        "tdp.c_project_manager_name",
        trx.raw("TO_CHAR(tdp.d_project_start, 'YYYY-MM-DD') AS d_project_start"),
        trx.raw("TO_CHAR(tdp.d_project_end, 'YYYY-MM-DD') AS d_project_end"),
        "tdp.c_doc_project_number",
        "tdp.c_doc_project_url",
        "tdp.c_doc_contract_number",
        "tdp.c_doc_spdb_number",
        "tdp.c_note",
        "tdp.c_status",
        "tdp.c_status_name",
        "tdp.c_created_by",
        "tdp.n_created_by",
        trx.raw("TO_CHAR(tdp.d_created_at, 'YYYY-MM-DD HH:mm:SS') AS d_created_at"),
        "tdp.c_updated_by",
        "tdp.n_updated_by",
        trx.raw("TO_CHAR(tdp.d_updated_at, 'YYYY-MM-DD HH:mm:SS') AS d_updated_at"),
        "tdp.c_deleted_by",
        "tdp.n_deleted_by",
        trx.raw("TO_CHAR(tdp.d_deleted_at, 'YYYY-MM-DD HH:mm:SS') AS d_deleted_at"),
      )
      .from('trx.t_d_project AS tdp')
      .where('c_project_number' , code)
      .first()
  
    return result;
};

const create = async (trx, body, payload) => {
  const result =  await trx("trx.t_d_project").insert({
      "c_project_name": body.c_project_name,
      "d_project_date": body.d_project_date,
      "c_project_number": body.c_project_number,
      "c_project_manager_code": body.c_project_manager_code,
      "c_project_manager_name": body.c_project_manager_name,
      "d_project_start": body.d_project_start,
      "d_project_end": body.d_project_end,
      "c_doc_project_number": body.c_doc_project_number,
      "c_doc_contract_number": body.c_doc_contract_number,
      "c_doc_spdb_number": body.c_doc_spdb_number,
      "c_doc_project_url": body.c_doc_project_url,
      "c_note": body.c_note,
      "c_created_by" : payload.user_code ,
      "n_created_by" : payload.user_name ,
  },["*"])

  return result[0]
} 

const update = async (trx, body, payload, code) => {
  let dataUpdate = {
      "c_project_name": body.c_project_name,
      "c_project_manager_code": body.c_project_manager_code,
      "c_project_manager_name": body.c_project_manager_name,
      "d_porject_start": body.d_porject_start,
      "d_project_end": body.d_project_end,
      "c_doc_project_number": body.c_doc_project_number,
      "c_doc_contract_number": body.c_doc_contract_number,
      "c_doc_spdb_number": body.c_doc_spdb_number,
      "c_note": body.c_note,
      "c_updated_by" : payload.user_code,
      "n_updated_by" : payload.user_name,
      "d_updated_at" : trx.raw('NOW()'),
  }
  
  if(body.c_doc_project_url) dataUpdate = {...dataUpdate, ...{
    "c_doc_project_url": body.c_doc_project_url
  }}

  const result =  await trx("trx.t_d_project").update(dataUpdate,["*"])
  .where("c_project_number", code)

  return result[0]
} 

const deleteProject = async (trx, params, payload) => {
  let rows = await trx('trx.t_d_project').update({
    "c_status": "X",
    "c_status_name" : "DELETED",
    "c_deleted_by" : payload.user_code,
    "n_deleted_by" : payload.user_name,
    "d_deleted_at": trx.raw('NOW()')
  }, ['*'])
  .where({
    "c_project_number": params
  })
  .whereNot("c_status", 'X')
  return rows[0]
}

const setOnProgress = async (trx, params, payload) => {
  let rows = await trx('trx.t_d_project').update({
    "c_status": "P",
    "c_status_name" : "ON PROGRESS",
    "c_updated_by" : payload.user_code,
    "n_updated_by" : payload.user_name,
    "d_updated_at" : trx.raw('NOW()'),
  }, ['*'])
  .where({
    "c_project_number": params
  })
  .whereNot("c_status", 'X')
  return rows[0]
}

const setComlplete = async (trx, params, payload) => {
  let rows = await trx('trx.t_d_project').update({
    "c_status": "C",
    "c_status_name" : "COMPLETE",
    "c_updated_by" : payload.user_code,
    "n_updated_by" : payload.user_name,
    "d_updated_at" : trx.raw('NOW()'),
    "c_completed_by" : payload.user_code,
    "n_completed_by" : payload.user_name,
    "d_completed_at" : trx.raw('NOW()'),
  }, ['*'])
  .where({
    "c_project_number": params
  })
  .whereNot("c_status", 'X')
  return rows[0]
}

const generateProjectCode = async (trx, projectDate) => {
  let code = ""
  let prefix = `PROJ${projectDate}`

  let result =await  trx.select([trx.raw(`substring(c_project_number, 11, 3) AS code`)])
                .from("trx.t_d_project")
                .whereRaw(`substring(c_project_number, 1, 10) = '${prefix}'`)
                // .where("d_project_date", projectDate)
                .orderBy('c_project_number', 'DESC')
                .first()

  if(result){
    let counter = parseInt(result.code)+1
    counter = String(counter).padStart(3, '0');
    code = `${prefix}${counter}`

  }else{
    code = `${prefix}001`
  }

  return code

}

const getPurchaseOrder = async (trx, code) => {
  const result = await trx("trx.t_d_purchase_order").select(["c_po_number"]).where("c_project_number", code).whereNot('c_status', 'X').first()
  return result
}

const getListProjectManager = async (trx) => {
  let result = await trx
    .select(
      "tmu.c_code",
      trx.raw("COALESCE(tmu.c_first_name, '') || ' ' ||COALESCE(tmu.c_last_name, '') AS c_project_manager_name"),
    )
    .from('public.t_m_user as tmu')
    .where("c_group_code", 'G11')
    .whereNot("c_status", 'X')
    .orderBy("tmu.c_code", "DESC")

  return result;
};


const createLog = async (trx, activityCode, code, note, newData, oldData) => {
    const log = await trx('log.t_log_activity').insert({
      "c_activity_code" : activityCode,
      "d_log" : trx.raw('NOW()'),
      "c_source" : "WEB",
      "c_code" : code,
      "j_new_data" : JSON.stringify(newData),
      "j_old_data" : oldData ? JSON.stringify(oldData) : trx.raw("NULL"),
      "c_note" : note,
      "d_created_at" : trx.raw('NOW()'),
      "c_created_by" : newData.c_created_by,
      "n_created_by" : newData.n_created_by,
    }, ['i_log_activity'])
    
    return log
}

module.exports = {
    table,
    list,
    find,
    create,
    update,
    generateProjectCode,
    getPurchaseOrder,
    deleteProject,
    setOnProgress,
    setComlplete,
    createLog,
    getListProjectManager
};