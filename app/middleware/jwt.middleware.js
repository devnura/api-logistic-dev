const jwt = require("jsonwebtoken");
const helper = require("../helpers/helper");

const generateRefreshToken = (req) => {
  let expiresIn = process.env.JWT_REFRESH_EXPIRATION ? process.env.JWT_REFRESH_EXPIRATION : "7d";
  let signOptions = {
    issuer: 'LOGISTIC APP BY YOSANGGI',
    expiresIn: expiresIn,
  }
  return jwt.sign(req, process.env.REFRESH_TOKEN_SECRET, signOptions);
};

const authenticateRefreshToken = (req, res, next) => {
  
  let verifyOptions = {
    issuer: 'LOGISTIC APP BY YOSANGGI',
  }

  jwt.verify(req.header("refresh_token"), process.env.REFRESH_TOKEN_SECRET, verifyOptions, (err, data) => {
    if (err) {
      return res.json({
        code: "400",
        message: "Refresh Token is invalid. Please login!",
        data: {},
      });
    }

    next();
  });
};

const generateAccessToken = (req) => {
  let expiresIn = process.env.JWT_EXPIRATION ? process.env.JWT_EXPIRATION : "1h";
  let signOptions = {
    issuer: 'LOGISTIC APP BY YOSANGGI',
    expiresIn: expiresIn,
  }
  return jwt.sign(req, process.env.TOKEN_SECRET, signOptions);
};

const authenticateToken = (req, res, next) => {
  let authHeader = req.headers["authorization"];

  if (authHeader) {
    let token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.json({
        code: "401",
        message: "Token is required",
        data: {},
      });
    }

    let verifyOptions = {
      issuer: 'LOGISTIC APP BY YOSANGGI',
    }

    jwt.verify(token, process.env.TOKEN_SECRET, verifyOptions, (err, data) => {
      if (err) {
        return res.json({
          code: "402",
          message: "Invalid Token.",
          data: {},
        });
      }

      req.user_code = helper.decryptText(data.user_code);
      req.user_group = helper.decryptText(data.user_group);
      req.user_name = helper.decryptText(data.user_name);

      next();
    });
  } else {
    return res.json({
      code: "400",
      message: "Header not found",
      data: {},
    });
  }
};

module.exports = {
  generateRefreshToken,
  authenticateRefreshToken,
  generateAccessToken,
  authenticateToken,
};
