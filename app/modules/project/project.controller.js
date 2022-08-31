const {
    body,
    validationResult,
    check
} = require('express-validator')

const db = require("../../../infrastructure/database/knex");

const helper = require("../../helpers/helper");
const winston = require("../../helpers/winston.logger");
const model = require("./project.model");
const moment = require("moment");
moment.locale("id");

var result = {};
var uniqueCode;

// VALIDATION
exports.validate = (method) => {
    switch (method) {
        case "create":
            return [
                body('c_project_name').notEmpty().withMessage('c_project_name is required!')
                .isLength({
                    max: 64
                }).withMessage('c_project_name is out of length!'),

                body('c_project_manager_code').notEmpty().withMessage('c_project_manager_code is required!')
                .isLength({
                    max: 32
                }).withMessage('c_project_manager_code is out of length!'),

                body('c_project_manager_name').notEmpty().withMessage('c_project_manager_name is required!')
                .isLength({
                    max: 32
                }).withMessage('c_project_manager_name is out of length!'),

                body('c_note').exists().withMessage('c_note is required!')
                .isLength({
                    max: 32
                }).withMessage('c_note is out of length!'),

                body('d_porject_start').notEmpty().withMessage('d_porject_start is required!')
                .isLength({
                    max: 32
                }).withMessage('d_porject_start is out of length!')
                .isISO8601().withMessage('invalid d_porject_start format YYYY-MM-DD !').escape().trim(),

                body('d_project_end').notEmpty().withMessage('d_project_end is required!')
                .isLength({
                    max: 32
                }).withMessage('d_project_end is out of length!')
                .isISO8601().withMessage('invalid d_project_end format YYYY-MM-DD !').escape().trim(),
            ]

        case "update":
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
    
        default:
            break;
    }
};

exports.getAll = async (req, res) => {
    try {
          
        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST get projects : ${JSON.stringify(req.body)}`
        );
        // log debug
        winston.logger.debug(`${uniqueCode} getting users...`);

        // check data login
        let getUsers = await model.findAll(db)

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

        return res.status(200).send(result);

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

exports.find = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()
        let {
            code
        } = req.params
        // log debug
        winston.logger.debug(`${uniqueCode} getting user : ${code}`);

        // check data login
        let data = await model.find(db, code)
        if(!data){
            result = {
                code: "01",
                message: "Data not found !",
                data: {},
            };
    
            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
            );
    
            return res.status(200).send(result);
        }

        // log debug
        winston.logger.debug(`${uniqueCode} result user : ${JSON.stringify(data)}`);

        result = {
            code: "00",
            message: "Success.",
            data: data ? data : {},
        };

        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
        );

        return res.status(200).send(result);

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

exports.create = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST create project  : ${JSON.stringify(req.body)}`
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
                `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
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

        result = {
            code: "400",
            message: "Success",
            data: req.body,
        };

        // log warn
        winston.logger.warn(
            `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
        );

        return res.status(200).send(result);

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

                return res.status(200).send(result);
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

                return res.status(200).send(result);
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

        return res.status(200).send(result);

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

            return res.status(200).send(result);
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

                return res.status(200).send(result);
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

        return res.status(200).send(result);

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

            return res.status(200).send(result);
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

                return res.status(200).send(result);
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

        return res.status(200).send(result);

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