const helper = require('../../helpers/helper')

const table = async (trx, params) => {
  
  let per_page = params.limit || 10;
  let page = params.page || 1;
  if (page < 1) page = 1;
  let offset = (page - 1) * params.limit;

  let data = await trx('trx.t_d_purchase_order AS tdp').count('i_purchase_order AS count')
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
        "c_project_number",
        "c_po_number",
        "c_doc_po_number",
        "c_po_name",
        trx.raw("TO_CHAR(d_po_date, 'YYYY-MM-DD') AS d_po_date"),
        "c_vendor_code",
        "c_vendor_name",
        "c_vendor_addres",
        "c_doc_spbj_number",
        "c_vendor_pic_name",
        "c_note",
        "c_status",
        "c_status_name",
    )
    .from('trx.t_d_purchase_order AS tdp')
    .whereRaw("1+1 = 2")
    .where((qb) => {
      if (params.keyword) {
        qb.orWhere("c_project_number", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_po_number", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_doc_po_number", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_po_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_vendor_code", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_vendor_name", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_doc_spbj_number", "ilike", `%${params.keyword}%`)
        qb.orWhere("c_vendor_pic_name", "ilike", `%${params.keyword}%`)
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
            "c_po_number",
            "c_po_name",
            "c_vendor_code",
            "c_vendor_name",
        )
        .from('trx.t_d_purchase_order')
        .whereNot("c_status", "X")
  
      return result;
    };

const create = async (trx, body, payload, projectManager) => {
    const result =  await trx("trx.t_d_project").insert({
        "c_project_number" : body.c_project_number, 
        "c_po_number" : body.c_po_number, 
        "c_doc_po_number" : body.c_doc_po_number, 
        "c_po_name" : body.c_po_name, 
        "d_po_date" : body.d_po_date, 
        "c_vendor_code" : body.c_vendor_code, 
        "c_vendor_name" : body.c_vendor_name, 
        "c_vendor_addres" : body.c_vendor_addres, 
        "c_doc_spbj_number" : body.c_doc_spbj_number, 
        "c_vendor_pic_name" : body.c_vendor_pic_name, 
        "c_note": body.c_note,
        "c_created_by" : payload.user_code ,
        "n_created_by" : payload.user_name ,
    },["*"])
  
    return result[0]
  }
  
  const generateCode = async (trx, projectDate) => {
    let code = ""
    let prefix = `PO${projectDate}`
  
    let result =await  trx.select([trx.raw(`substring(c_po_number, 9, 3) AS code`)])
                  .from("trx.t_d_purchase_order")
                  .whereRaw(`substring(c_po_number, 1, 8) = '${prefix}'`)
                  // .where("d_project_date", projectDate)
                  .orderBy('c_po_number', 'DESC')
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
    table,
    list,
    generateCode
}