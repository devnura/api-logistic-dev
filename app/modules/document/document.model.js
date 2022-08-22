const findAllDocument = async (trx) => {
  let result = await trx
    .select(
      "tdd.c_document_code",
      "tdd.c_document_name",
      "tdd.c_document_path",
      trx.raw("tdd.q_document_item::varchar"),
      trx.raw(`(SELECT
          COUNT(tddd.c_file_code)
        FROM
          doc.t_d_document_detail tddd
        WHERE
          tddd.i_document_excel = tdd.i_document_excel
          AND tddd.c_status = 'U') AS q_uploaded_document`),
      "tdd.c_desc",
      "tdd.c_status",
      "tdd.c_status_name",
      "tdd.c_created_by",
      "tdd.n_created_by",
      trx.raw("TO_CHAR(tdd.d_created_at, 'YYYY-MM-DD HH:mm:SS') AS d_created_at"),
      "tdd.c_updated_by",
      "tdd.n_updated_by",
      trx.raw("TO_CHAR(tdd.d_updated_at, 'YYYY-MM-DD HH:mm:SS') AS d_updated_at"),
      "tdd.c_deleted_by",
      "tdd.n_deleted_by",
      trx.raw("TO_CHAR(tdd.d_deleted_at, 'YYYY-MM-DD HH:mm:SS') AS d_deleted_at"),
    )
    .from('doc.t_d_document as tdd')
    .orderBy(["c_document_code"], "DESC")

  return result;
}

const findDocument = async (params, trx) => {
  let detail = []

  let result = await trx
    .select(
      "tdd.i_document_excel",
      "tdd.c_document_code",
      "tdd.c_document_name",
      "tdd.c_document_path",
      "tdd.q_document_item",
      trx.raw(`(SELECT
        COUNT(tddd.c_file_code)
      FROM
        doc.t_d_document_detail tddd
      WHERE
        tddd.i_document_excel = tdd.i_document_excel
        AND tddd.c_status = 'U') AS q_uploaded_document`),
      "tdd.c_desc",
      "tdd.c_status",
      "tdd.c_status_name",
      "tdd.c_created_by",
      "tdd.n_created_by",
      trx.raw("TO_CHAR(tdd.d_created_at, 'YYYY-MM-DD HH:mm:SS') AS d_created_at"),
      "tdd.c_updated_by",
      "tdd.n_updated_by",
      trx.raw("TO_CHAR(tdd.d_updated_at, 'YYYY-MM-DD HH:mm:SS') AS d_updated_at"),
      "tdd.c_deleted_by",
      "tdd.n_deleted_by",
      trx.raw("TO_CHAR(tdd.d_deleted_at, 'YYYY-MM-DD HH:mm:SS') AS d_deleted_at"),
    )
    .from('doc.t_d_document as tdd')
    .where("c_document_code", params)
    .first();
    
    if(result){
      detail = await trx
      .select(
        "tddd.i_document_excel",
        "tddd.c_file_code",
        "tddd.c_file_name",
        "tddd.c_file_url",
        "tddd.c_category",
        "tddd.c_status",
        "tddd.c_status_name",
      )
      .from('doc.t_d_document_detail as tddd')
      .where("tddd.i_document_excel", result.i_document_excel)
      result = {...result, ...{detail : detail}}
      
      return result

    }
    return result
}

const insertDocument = async (data, payload, trx) => {

  let result = await trx("doc.t_d_document")
    .insert({
      "c_document_code" : data.c_document_code,
      "c_document_name" : data.c_document_name,
      "c_document_path" : data.c_document_path,
      "q_document_item" : data.detail.length,
      "c_desc" : data.c_desc,
      "c_created_by" : payload.user_code,
      "n_created_by" : payload.user_name,
      "d_created_at" : trx.raw("NOW()") 
    }, ['i_document_excel', 'c_document_code'])
    
  return result[0];

}

const insertDocumentDetail = async (data, trx) => {

  let result = await trx("doc.t_d_document_detail")
    .insert(data, ['c_file_code'])

  return result;

}

const uploadPdf = async (params, file_url, payload, trx) => {

  let result = await trx("doc.t_d_document_detail")
    .update({
      "c_file_url": file_url,
      "c_status" : "U",
      "c_status_name" : "UPLOADED",
      "c_upload_by" : payload.user_code,
      "n_upload_by" : payload.user_name,
      "d_upload_at" : trx.raw("now()"),

    }, ["c_file_url"])
    // .where("c_document_code", params.folder)
    .where("c_file_code", params.file)
    .whereNotIn("c_status", ["X"])

  return result[0];
}

const deleteDocument = async (params, payload, trx) => {

  let rows = await trx('doc.t_d_document').update({
      "c_status": "X",
      "c_status_name" : "DELETED",
      "c_deleted_by" : payload.user_code,
      "n_deleted_by" : payload.user_name,
      "d_deleted_at": trx.raw('NOW()')
    }, ['c_document_code'])
    .where({
      "c_document_code": params,
      "c_status": "A"
    })

  return rows

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

const generateCode = async (trx) => {
  let result = await trx.raw("SELECT 'DXLS'||to_char(NOW(), 'YYMMDD')||LPAD((COUNT(i_document_excel)+1)::text, 5, '0') AS code FROM doc.t_d_document tdd WHERE substring(c_document_code, 1,10) = 'DXLS'||to_char(now(), 'YYMMDD')")

  return result.rows[0].code
}

const generateCodePdf = async (trx) => {
  let result = await trx.raw("SELECT 'DPDF'||to_char(NOW(), 'YYMMDD')||LPAD((COUNT(i_document_excel)+1)::text, 5, '0') AS code FROM doc.t_d_document_detail tdd WHERE substring(c_file_code, 1,10) = 'DPDF'||to_char(now(), 'YYMMDD')")

  return result.rows[0].code
}

const checkUpdate = async (params, data, before, trx) => {

  const result = await trx("t_m_user")
    .select(['c_email'])
    .where({
      'c_email': data.c_email,
      "c_phone_number" : data.c_phone_number
    })
    .whereNot({
      "c_email" : before.c_email,
      "c_phone_number" : before.c_phone_number
    })
    .where('c_status', "A")
    .whereNot("c_code", params)
    .first()

  return result

}

module.exports = {
  findAllDocument,
  findDocument,
  insertDocument,
  insertDocumentDetail,
  generateCodePdf,
  uploadPdf,

  deleteDocument,
  checkDuplicatedInsert,
  generateCode,
  checkUpdate
};
