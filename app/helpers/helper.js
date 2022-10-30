const {v4} = require('uuid');
const crypto = require("crypto")
const CryptoJS = require("crypto-js");
// ENCRYPT TEXT
const encryptText = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, process.env.SECRET_KEY).toString();
  } catch (error) {
    console.log(error.message)
    return error.message;
  }
};

// DECRYPT TEXT
const decryptText = (cipherText) => {
  try {
    return CryptoJS.AES.decrypt(cipherText, process.env.SECRET_KEY).toString(
      CryptoJS.enc.Utf8
    );
  } catch (error) {
    console.log(error.message)
    return error.message;
  }
};

// RANDOM UNIQUE CODE
function getUniqueCode() {
  return v4();
}

// DECRYPT TEXT
const getRandomStrig = () => {
  try {
    return crypto.randomBytes(4).toString('hex');
  } catch (error) {
    return error.message;
  }
};

const getDomainName = async (req) => {
  var result = ""

  if(req.headers["x-forwarded-host"]){                                                                                                        // server
      result = await 'https' + '://' + req.headers["x-forwarded-host"].split(',')[0]
  }else{                                                                                                                                      // local
      result = await req.protocol + '://' + req.headers.host
  }

  return result
}

const generatePaginate = (count, rows, page, limit, offset) => {
  const pagination = {}

  pagination.total = parseInt(count);
  pagination.perPage = parseInt(limit);
  pagination.lastPage = Math.ceil(parseInt(count) / parseInt(limit));
  pagination.currentPage = parseInt(page);
  pagination.from = offset + rows.length < 1? offset : offset+1;
  pagination.to = offset + rows.length;
  pagination.rows = rows;

  return pagination;
}

const createResponse = (code, status, errors, data) => {
  let error
  if(process.env.NODE_ENV == "production") {
    if (code >= 500) {
      error = [{msg : "Internal server error"}]
    }else {
      error = Array.isArray(errors) ? errors : [{msg : errors}]
    }
  }else {
    error = Array.isArray(errors) ? errors : [{msg : errors}]
  }

  return {
    code: parseInt(code),
    status: status,
    errors: error,
    data: Array.isArray(data) ? data : [data],
  }
}
module.exports = {
  encryptText,
  decryptText,
  // encrypt,
  // decrypt,
  getUniqueCode,
  getRandomStrig,
  getDomainName,
  generatePaginate,
  createResponse
};
