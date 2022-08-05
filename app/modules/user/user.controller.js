const jwt = require("../../middleware/jwt.middleware");
const bcrypt = require("bcrypt");
const helper = require("../../helpers/helper");
const winston = require("../../helpers/winston.logger");
const model = require("./user.model");
const moment = require("moment");
moment.locale("id");

var result = {};
var uniqueCode;

const getUsers = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()
        
        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST get users : ${JSON.stringify(req.body)}`
        );
        // log debug
        winston.logger.debug(`${uniqueCode} getting users...`);

        // check data login
        let getUsers = await model.getUsers()

        // log debug
        winston.logger.debug(`${uniqueCode} result users : ${JSON.stringify(getUsers)}`);

        result = {
            code: "00",
            message: "Success.",
            data: getUsers,
        };

        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE get users : ${JSON.stringify(result)}`
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
};

const getUser = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()
        let { code } = req.params
        // log debug
        winston.logger.debug(`${uniqueCode} getting user : ${code}`);

        // check data login
        let getUser = await model.getUser(code)

        // log debug
        winston.logger.debug(`${uniqueCode} result user : ${JSON.stringify(getUser)}`);

        result = {
            code: "00",
            message: "Success.",
            data: getUser ? getUser : {} ,
        };

        // result 
        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
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

const insertUser = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        let {
            body
        } = req

        const payload = {
            user_code : req.user_code,
            user_name : req.user_name
        }
        // check data login
        let checkDuplicate = await model.checkDuplicatedInsert(body)

        if (checkDuplicate) {

            result = {
                code: "01",
                message: "email or phone number already registered.",
                data: {},
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }

        // log debug
        winston.logger.debug(`${uniqueCode} encrypting password...`);

        // encrypt password
        const saltRounds = 10;
        let salt = bcrypt.genSaltSync(saltRounds);
        let passwordHash = bcrypt.hashSync(body.c_password, salt) 

        const userCode = await model.generateUserCode(body.c_group_code)

        body = {...body, ...{
            passwordHash : passwordHash,
            c_code : userCode
        }} 
        
        // log debug
        winston.logger.debug(`${uniqueCode} insert user...`);

        const insertUser = await model.insertUser(body, payload)
        if(!insertUser){
            result = {
                code: "01",
                message: "Fled.",
                data: {},
            };
    
            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
            );
    
            return res.status(200).json(result);
        }

        result = {
            code: "00",
            message: "Success.",
            data: insertUser,
        };

        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
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
    getUsers,
    getUser,
    insertUser

};