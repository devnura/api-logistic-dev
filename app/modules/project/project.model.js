const findAll = async (trx) => {
    let result = await trx
      .select(
        "tdp.c_project_number",
        "tdp.c_project_name",
        "tdp.c_project_manager_code",
        "tdp.c_project_manager_name",
        trx.raw("TO_CHAR(tdp.d_porject_start, 'YYYY-MM-DD') AS d_project_start"),
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
        "tdp.c_project_name",
        "tdp.c_project_manager_code",
        "tdp.c_project_manager_name",
        trx.raw("TO_CHAR(tdp.d_porject_start, 'YYYY-MM-DD') AS d_project_start"),
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

module.exports = {
    findAll,
    find
};