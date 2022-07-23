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
    uniqueCode = req.uniqueCode

    let { email, password } = req.body;

    let refreshToken = ""
    let accessToken = ""

    // log debug
    winston.logger.debug(`${uniqueCode} checking data login...`);

    // check data login
    let checkUser = await model.checkUser(email);
    // console.log(checkDataLoginUser)
    if (!checkUser) {
      result = {
        code: "403",
        message: "User doesn't exists.",
        data: {},
      };

      // log warn
      winston.logger.warn(
        `${uniqueCode} RESPONSE login: ${JSON.stringify(result)}`
      );

      return res.status(200).json(result);
    }

    // log debug
    winston.logger.debug(`${uniqueCode} checking password...`);
    // check password
    let checkPassword = await bcrypt.compare(
      password,
      checkUser.e_password
    );

    if (!checkPassword) {
      result = {
        code: "403",
        message: "Password is wrong.",
        data: {},
      };

      // log warn
      winston.logger.warn(
        `${uniqueCode} RESPONSE login: ${JSON.stringify(result)}`
      );

      return res.status(200).json(result);
    }

    // cek apakah user sudah melakukan login atau belum
    let checkUserLogin = await model.checUserLogin(checkUser.c_code)
    if (!checkUserLogin) {
      // log debug
      winston.logger.debug(`${uniqueCode} generating access token...`);

      // generate access token
      accessToken = jwt.generateAccessToken({
        user_code: helper.encryptText(checkUser.c_code),
        user_group: helper.encryptText(checkUser.c_group_code),
        user_name: helper.encryptText(`${checkUser.c_first_name} ${checkUser.c_last_name}`),
      });

      // log debug
      winston.logger.debug(`${uniqueCode} generating refresh token...`);

      // generate refresh token
      refreshToken = jwt.generateRefreshToken({
        user_code: helper.encryptText(checkUser.c_code)
      });

      // log debug
      winston.logger.debug(`${uniqueCode} inserting refresh token...`);

      // insert refresh token
      await model.insertRefreshToken(checkUser.c_code, refreshToken);

    }else {
      // log debug
      winston.logger.debug(`${uniqueCode} generating access token...`);

      // generate access token
      accessToken = jwt.generateAccessToken({
        user_code: helper.encryptText(checkUser.c_code),
        user_group: helper.encryptText(checkUser.c_group_code),
        user_name: helper.encryptText(`${checkUser.c_first_name} ${checkUser.c_last_name}`),
      });

      refreshToken = checkUserLogin.c_refresh_token

    }

    result = {
      code: "00",
      message: "Login Success.",
      data: {
        first_name : checkUser.c_first_name,
        last_name : checkUser.c_last_name,
        email : checkUser.c_email,
        group : checkUser.c_group_code,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };

    // log info
    winston.logger.info(
      `${uniqueCode} RESPONSE login: ${JSON.stringify(result)}`
    );

    return res.status(200).json(result);
  } catch (error) {
    // create log
    winston.logger.error(
      `500 internal server error - backend server | ${error.message}`
    );

    return res.status(200).json({
      code: "500",
      message:
        process.env.NODE_ENV != "production"
          ? error.message
          : "500 internal server error - backend server.",
      data: {},
    });
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res) => {
  try {
    // generate unique code
    uniqueCode = req.uniqueCode

    const code = req.user_code;

    const refresh_token = req.header("refresh_token");

    // log debug
    winston.logger.debug(`${uniqueCode} authenticating refresh token...`);

    // verify
    jwt.authenticateRefreshToken;

    // log debug
    winston.logger.debug(`${uniqueCode} checking refresh token...`);

    let checkRefreshToken = await model.checkRefreshToken(
      code,
      refresh_token
    );

    if (!checkRefreshToken) {
      result = {
        code: "400",
        message: "Refresh Token is invalid.",
        data: {},
      };

      // log warn
      winston.logger.warn(
        `${uniqueCode} RESPONSE refresh token: ${JSON.stringify(result)}`
      );

      return res.status(200).json(result);
    }

    // log debug
    winston.logger.debug(`${uniqueCode} generating access token...`);

    let accessToken;
    let refreshToken;

    // check data login
    let checkDataLoginUser = await model.checUserLogin(
      code
    );
    if (!checkDataLoginUser) {
      result = {
        code: "403",
        message: "User doesn't exists.",
        data: {},
      };

      // log warn
      winston.logger.warn(
        `${uniqueCode} RESPONSE login: ${JSON.stringify(result)}`
      );

      return res.status(200).json(result);
    }

    // generate new access token
    accessToken = jwt.generateAccessToken({
      user_code: helper.encryptText(checkDataLoginUser.c_code),
      user_group: helper.encryptText(checkDataLoginUser.c_group_code),
      user_name: helper.encryptText(`${checkDataLoginUser.c_first_name} ${checkDataLoginUser.c_last_name}`),
    });

    // log debug
    winston.logger.debug(`${uniqueCode} generating refresh token...`);

    // generate new refresh token
    refreshToken = jwt.generateRefreshToken({
      user_code: helper.encryptText(checkDataLoginUser.c_code)
    });

    // log debug
    winston.logger.debug(`${uniqueCode} updating refresh token...`);

    // update insert refresh token
    await model.updateRefreshToken(code, refresh_token, refreshToken);

    result = {
      code: "00",
      message: "New Token has been generated.",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };

    // log info
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
      message:
        process.env.NODE_ENV != "production"
          ? error.message
          : "500 internal server error - backend server.",
      data: {},
    });
  }
};


module.exports = {
  loginUser,
  refreshToken,
};
