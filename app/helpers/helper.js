const CryptoJS = require("crypto-js");
const {v4} = require('uuid');
const crypto = require("crypto")
// ENCRYPT TEXT
const encryptText = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, process.env.SECRET_KEY).toString();
  } catch (error) {
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
  pagination.from = offset+1;
  pagination.to = offset + rows.length;
  pagination.rows = rows;

  return pagination;
}

module.exports = {
  encryptText,
  decryptText,
  getUniqueCode,
  getRandomStrig,
  getDomainName,
  generatePaginate
};
