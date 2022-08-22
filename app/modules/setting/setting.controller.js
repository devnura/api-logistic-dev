const {
    body,
    validationResult,
    check
} = require('express-validator')

const db = require("../../../infrastructure/database/knex");

const bcrypt = require("bcrypt");
const helper = require("../../helpers/helper");
const winston = require("../../helpers/winston.logger");
const model = require("./user.model");
const moment = require("moment");
moment.locale("id");

var result = {};
var uniqueCode;

// VALIDATION
exports.validate = (method) => {
    switch (method) {
        case "createUser":
            return [
                body('c_first_name').notEmpty().withMessage('c_first_name harus terisi!')
                .isLength({
                    max: 32
                }).withMessage('c_firstname is out of length!'),
                body('c_last_name').exists().withMessage('c_last_name is required!')
                .isLength({
                    max: 32
                }).withMessage('c_lastname is out of length!'),
                body('c_group_code').notEmpty().withMessage('c_group_code harus terisi!')
                .isLength({
                    max: 8
                }).withMessage('c_group_code is out of length!'),
                body('c_email').notEmpty().withMessage('c_email harus terisi!').isEmail().withMessage("Invalid Email format")
                .isLength({
                    max: 64
                }).withMessage('c_email is out of length!')
            ]

        case "updateUser":
            return [
                check("code").notEmpty().withMessage('code harus terisi!'),
                body('c_first_name').notEmpty().withMessage('c_first_name harus terisi!')
                .isLength({
                    max: 32
                }).withMessage('c_firstname is out of length!'),
                body('c_last_name').notEmpty().withMessage('c_last_name is required!')
                .isLength({
                    max: 32
                }).withMessage('c_lastname is out of length!'),
                body('c_group_code').notEmpty().withMessage('c_group_code harus terisi!')
                .isLength({
                    max: 8
                }).withMessage('c_group_code is out of length!'),
                body('c_email').notEmpty().withMessage('c_email harus terisi!').isEmail().withMessage("Invalid Email format")
                .isLength({
                    max: 64
                }).withMessage('c_email is out of length!')
            ]

        case "resetPassword":
            return [
                check("code").notEmpty().withMessage('code harus terisi!'),
                body('c_password').exists().withMessage('c_password harus terisi!')
                .isLength({
                    max: 32
                }).withMessage('c_password is out of length!'),
                body('reset').notEmpty()
                .isBoolean().withMessage('reset is out of length!'),
            ]
    
        default:
            break;
    }
};

exports.getUsers = async (req, res) => {
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
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
};

exports.getUser = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()
        let {
            code
        } = req.params
        // log debug
        winston.logger.debug(`${uniqueCode} getting user : ${code}`);

        // check data login
        let getUser = await model.getUser(code)

        // log debug
        winston.logger.debug(`${uniqueCode} result user : ${JSON.stringify(getUser)}`);

        result = {
            code: "00",
            message: "Success.",
            data: getUser ? getUser : {},
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
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.insertUser = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST create user  : ${JSON.stringify(req.body)}`
        );

        // check validator
        const err = validationResult(req, res);
        if (!err.isEmpty()) {
            result = {
                code: "400",
                message: err.errors[0].msg,
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE create user : ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }

        let {
            body
        } = req

        const payload = {
            user_code: req.code,
            user_name: req.name
        }
        console.log(payload)
        await db.transaction(async trx => {
            // check data login
            let checkDuplicate = await model.checkDuplicatedInsert(body, trx)

            if (checkDuplicate) {

                result = {
                    code: "01",
                    message: "email or phone number already registered.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE create user : ${JSON.stringify(result)}`
                );

                return res.status(200).json(result);
            }

            // log debug
            winston.logger.debug(`${uniqueCode} encrypting password...`);

            let knowingPassword = helper.getRandomStrig()

            // encrypt password
            const saltRounds = 10;
            let salt = bcrypt.genSaltSync(saltRounds);
            let passwordHash = bcrypt.hashSync(knowingPassword, salt)

            const userCode = await model.generateUserCode(trx)

            body = {
                ...body,
                ...{
                    knowingPassword : knowingPassword,
                    passwordHash: passwordHash,
                    c_code: userCode
                }
            }

            // log debug
            winston.logger.debug(`${uniqueCode} insert user...`);

            const insertUser = await model.insertUser(body, payload, trx)
            if (!insertUser) {
                result = {
                    code: "01",
                    message: "Fled.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE create user : ${JSON.stringify(result)}`
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
                `${uniqueCode} RESPONSE create user : ${JSON.stringify(result)}`
            );
        })

        return res.status(200).json(result);

    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        return res.status(200).json({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.updateUser = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST update user  : ${JSON.stringify(req.body)}`
        );

        // check validator
        const err = validationResult(req, res);
        if (!err.isEmpty()) {
            result = {
                code: "400",
                message: err.errors[0].msg,
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE update user : ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }

        let {
            body
        } = req

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        await db.transaction(async trx => {

            let before = await model.getUser(req.params.code, trx)
            if (!before) {

                result = {
                    code: "01",
                    message: "user not found.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE update user : ${JSON.stringify(result)}`
                );

                return res.status(200).json(result);
            }

            // check
            let checkDuplicate = await model.checkUpdate(req.params.code, body, before, trx)
            if (checkDuplicate) {

                result = {
                    code: "01",
                    message: "email or phone number already registered.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE update user : ${JSON.stringify(result)}`
                );

                return res.status(200).json(result);
            }

            // log debug
            winston.logger.debug(`${uniqueCode} encrypting password...`);

            // log debug
            winston.logger.debug(`${uniqueCode} update user...`);
            
            const updateUser = await model.updateUser(req.params.code, body, payload, trx)
            if (!updateUser) {
                result = {
                    code: "01",
                    message: "Fled.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE create user : ${JSON.stringify(result)}`
                );

                return res.status(200).json(result);
            }

            result = {
                code: "00",
                message: "Success.",
                data: updateUser,
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE create user : ${JSON.stringify(result)}`
            );

        })

        return res.status(200).json(result);

    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        return res.status(200).json({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.deleteUser = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST delete user  : ${JSON.stringify(req.body)}`
        );

        // check validator
        const err = validationResult(req, res);
        if (!err.isEmpty()) {
            result = {
                code: "400",
                message: err.errors[0].msg,
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE delete user: ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }

        const payload = {
            user_code: req.code,
            user_name: req.name
        }


        await db.transaction(async trx => { 

            const deleteUser = await model.deleteUser(req.params.code, payload, trx)
            if (!deleteUser) {
                result = {
                    code: "01",
                    message: "Failed.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE delete user : ${JSON.stringify(result)}`
                );

                return res.status(200).json(result);
            }

            result = {
                code: "00",
                message: "Success.",
                data: deleteUser,
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE delete user : ${JSON.stringify(result)}`
            );

        })

        return res.status(200).json(result);

    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        return res.status(200).json({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.resetPassword = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST reset password  : ${JSON.stringify(req.body)}`
        );

        // check validator
        const err = validationResult(req, res);
        if (!err.isEmpty()) {
            result = {
                code: "400",
                message: err.errors[0].msg,
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE reset password : ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }

        let {
            body
        } = req

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        let knowingPassword = ""

        if(body.reset){
            knowingPassword = helper.getRandomStrig()
        }else {
            knowingPassword = body.c_password
        }
         
        // encrypt password
        const saltRounds = 10;
        let salt = bcrypt.genSaltSync(saltRounds);
        let passwordHash = bcrypt.hashSync(knowingPassword, salt)

        body = {
            ...body,
            ...{
                knowingPassword : body.reset ? knowingPassword : null,
                passwordHash: passwordHash,
            }
        }

        await db.transaction(async trx => { 

            const resetPassword = await model.resetPassword(req.params.code, body, payload, trx)
            if (!resetPassword) {
                result = {
                    code: "01",
                    message: "Failed.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE reset password : ${JSON.stringify(result)}`
                );

                return res.status(200).json(result);
            }

            result = {
                code: "00",
                message: "Success.",
                data: resetPassword,
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE reset password : ${JSON.stringify(result)}`
            );

        })

        return res.status(200).json(result);

    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        return res.status(200).json({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}