const findAll = async (trx) => {
    let result = await trx
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
      .orderBy("tdp.c_project_number", "DESC")
  
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
  },["c_project_number"])
  return result
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

  const result =  await trx("trx.t_d_project").update(dataUpdate,["c_project_number"])
  .where("c_project_number", code)

  return result
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

module.exports = {
    findAll,
    find,
    create,
    update,
    generateProjectCode
};