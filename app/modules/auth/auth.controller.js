const {body, validationResult } = require("express-validator");
const jwt = require("../../middleware/jwt.middleware");
const bcrypt = require("bcrypt");
const helper = require("../../helpers/helper");
const winston = require("../../helpers/winston.logger");
const model = require("./auth.model");
const moment = require("moment");
moment.locale("id");

var result = {};
var uniqueCode;

// LOGIN USER
const loginUser = async (req, res) => {
  try {

    // generate unique code
    uniqueCode = req.requestId;

    let {
      email,
      password
    } = req.body;

    let refreshToken = ""
    let accessToken = ""

    // log debug
    winston.logger.debug(`${uniqueCode} checking data login...`);

    // check data login
    let checkUser = await model.checkUser(email);
    if (!checkUser) {

      result = helper.createResponse(403, "UNAUTHORIZED", ["Invalid email or password"], []);

      // log warn
      winston.logger.info(
        `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
      );

      return res.status(401).json(result);
    }

    // log debug
    winston.logger.debug(`${uniqueCode} checking password...`);
    // check password
    let checkPassword = await bcrypt.compare(
      password,
      checkUser.e_password
    );

    if (!checkPassword) {

      result = helper.createResponse(403, "UNAUTHORIZED", "Invalid email or password", []);

      // log warn
      winston.logger.info(
        `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
      );

      return res.status(401).json(result);
    }

    // cek apakah user sudah melakukan login atau belum
    let checkUserLogin = await model.checUserLogin(checkUser.c_code)
    if (!checkUserLogin) {
      // log debug
      winston.logger.debug(`${req.requestId} ${req.requestUrl} generating access token...`);

      // generate access token
      accessToken = jwt.generateAccessToken({
        code: helper.encryptText(checkUser.c_code),
        group: helper.encryptText(checkUser.c_group_code),
        name: helper.encryptText(`${checkUser.c_first_name} ${checkUser.c_last_name ? checkUser.c_last_name : ""}`),
      });

      // log debug
      winston.logger.debug(`${req.requestId} ${req.requestUrl} generating refresh token...`);

      // generate refresh token
      refreshToken = jwt.generateRefreshToken({
        code: helper.encryptText(checkUser.c_code)
      });

      // log debug
      winston.logger.debug(`${req.requestId} ${req.requestUrl} inserting refresh token...`);

      // insert refresh token
      await model.insertRefreshToken(checkUser.c_code, refreshToken);

    } else {
      // log debug
      winston.logger.debug(`${req.requestId} ${req.requestUrl} use existing access token...`);

      // generate access token
      accessToken = jwt.generateAccessToken({
        code: helper.encryptText(checkUser.c_code),
        group: helper.encryptText(checkUser.c_group_code),
        name: helper.encryptText(`${checkUser.c_first_name} ${checkUser.c_last_name ? checkUser.c_last_name : ""}`),
      });

      refreshToken = checkUserLogin.c_refresh_token

    }
    let data = {
      first_name: checkUser.c_first_name,
      last_name: checkUser?.c_last_name || "",
      email: checkUser.c_email,
      group_code: checkUser.c_group_code,
      group_name: checkUser.c_group_name,
      access_token: accessToken,
      refresh_token: refreshToken,
    }

    result = helper.createResponse(200, "OK", [], data);
   
    // log info
    winston.logger.info(
      `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
    );

    return res.status(200).json(result);
  } catch (error) {
    // create log
    result = helper.createResponse(500, "Internal Server Error", error.message, []);

    winston.logger.error(
      `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
    );

    return res.status(500).json(result);
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res) => {
  try {

    // generate unique code
    uniqueCode = req.requestId;

    const code = req.code;

    let { refresh_token } = req.body;

    // log debug
    winston.logger.debug(`${uniqueCode} ${req.requestUrl} authenticating refresh token...`);

    // verify
    jwt.authenticateRefreshToken;

    // log debug
    winston.logger.debug(`${uniqueCode} ${req.requestUrl} checking refresh token...`);

    let checkRefreshToken = await model.checkRefreshToken(
      code,
      refresh_token
    );

    if (!checkRefreshToken) {
      result = helper.createResponse(401, "Unauthorized", "Refresh Token is invalid.", []);

      // log warn
      winston.logger.warn(
        `${uniqueCode} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
      );

      return res.status(401).json(result);
    }

    // log debug
    winston.logger.debug(`${uniqueCode} ${req.requestUrl} generating access token...`);

    let accessToken;
    let refreshToken;

    // check data login
    let checkDataLoginUser = await model.checUserLogin(
      code
    );
    if (!checkDataLoginUser) {
      result = helper.createResponse(402, "Unauthorized", "Refresh Token is invalid.", []);

      // log warn
      winston.logger.warn(
        `${uniqueCode} ${req.requestUrl}RESPONSE : ${JSON.stringify(result)}`
      );

      return res.status(401).json(result);
    }

    // generate new access token
    accessToken = jwt.generateAccessToken({
      code: helper.encryptText(checkDataLoginUser.c_code),
      group: helper.encryptText(checkDataLoginUser.c_group_code),
      name: helper.encryptText(`${checkDataLoginUser.c_first_name} ${checkDataLoginUser.c_last_name ? checkDataLoginUser.c_last_name : ""}`),
    });

    // log debug
    winston.logger.debug(`${uniqueCode} ${req.requestUrl} generating refresh token...`);
    console.log("ini : ", checkDataLoginUser.c_code)
    // generate new refresh token
    refreshToken = jwt.generateRefreshToken({
      code: helper.encryptText(checkDataLoginUser.c_code)
    });

    // log debug
    winston.logger.debug(`${uniqueCode} ${req.requestUrl} updating refresh token...`);

    // update insert refresh token
    await model.updateRefreshToken(code, refresh_token, refreshToken);
    const data = {
      access_token: accessToken,
      refresh_token: refreshToken,
    }

    result = helper.createResponse(200, "OK", [], data);

    // log info
    winston.logger.info(
      `${uniqueCode} ${req.requestUrl} RESPONSE refresh token: ${JSON.stringify(result)}`
    );

    return res.status(200).json(result);
  } catch (error) {
    // create log
    result = helper.createResponse(500, "Internal Server Error", error.message, []);

    winston.logger.error(
      `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
    );
    
    return res.status(500).json(result);
  }
};

// LOGOUT
const logoutUser = async (req, res) => {
  try {
    // generate unique code
    uniqueCode = helper.getUniqueCode()

    const code = req.code;

    const deleteRefreshToken = await model.deleteRefreshToken(code)

    if (deleteRefreshToken < 1) {
      result = {
        code: "400",
        message: "Invalid session !",
        data: {},
      };

      // log warn
      winston.logger.info(
        `${uniqueCode} RESPONSE : ${JSON.stringify(result)}`
      );

      return res.status(200).json(result);

    }

    result = {
      code: "00",
      message: "Success Logout.",
      data: {},
    };

    winston.logger.info(
      `${uniqueCode} RESPONSE refresh token: ${JSON.stringify(result)}`
    );

    return res.status(200).json(result);

  } catch (error) {
    // create log
    winston.logger.error(
      `500 internal server error - backend server | ${error.message}`
    );

    return res.status(200).json({
      code: "500",
      message: process.env.NODE_ENV != "production" ?
        error.message :
        "500 internal server error - backend server.",
      data: {},
    });
  }
}

module.exports = {
  loginUser,
  refreshToken,
  logoutUser
};