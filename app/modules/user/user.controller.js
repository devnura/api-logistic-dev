const db = require("../../../infrastructure/database/knex");

const bcrypt = require("bcrypt");
const helper = require("../../helpers/helper");
const winston = require("../../helpers/winston.logger");
const model = require("./user.model");
const moment = require("moment");
moment.locale("id");

var result = {};
var uniqueCode;

exports.getUsersTable = async (req, res) => {
    try {
          
        uniqueCode = req.requestId

        // log debug
        winston.logger.debug(`${uniqueCode} getting users...`);

        const params = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            keyword: req.query.keyword || "",
        }

        // check data login
        let getUsers = await model.getTableUsers(db, params)
        
        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} result users : ${JSON.stringify(getUsers)}`);

        result = helper.createResponse(200, "OK", [], getUsers);

        // log info
        winston.logger.info(
            `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
        );

        return res.status(200).send(result);

    } catch (error) {
        // create log
        result = helper.createResponse(500, "Internal Server Error", error.message, []);

        winston.logger.error(
        `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
        );

        return res.status(500).json(result);
    }
};

exports.getUsersList = async (req, res) => {
    try {
          
        uniqueCode = req.requestId

        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} getting users...`);

        // check data login
        let getUsers = await model.getListUsers(db)

        if(!getUsers.length){
            result = helper.createResponse(404, "Not Found", "User not found", getUsers);
            // log info
            winston.logger.info(
                `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
            );
            
            return res.status(404).send(result);

        }

        result = helper.createResponse(200, "OK", [], []);

        // log info
        winston.logger.info(
            `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
        );

        return res.status(200).send(result);

    } catch (error) {
         // create log
         result = helper.createResponse(500, "Internal Server Error", error.message, []);

         winston.logger.error(
         `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
         );
 
         return res.status(500).json(result);
     }
};

exports.getUser = async (req, res) => {
    try {

        uniqueCode = req.requestId

        let {
            code
        } = req.params
        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} getting user : ${code}`);

        // check data login
        let getUser = await model.getUser(code, db)
        if(!getUser){
            result = helper.createResponse(404, "Not Found", "User not found", []);
            // log info
            winston.logger.info(
                `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
            );
            
            return res.status(404).send(result);

        }
        // log debug
        winston.logger.debug(`${req.requestId} ${req.requestUrl} result user : ${JSON.stringify(getUser)}`);

        result = helper.createResponse(200, "OK", [], getUser);

        // log info
        winston.logger.info(
            `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
        );

        return res.status(200).send(result);

    } catch (error) {
         // create log
         result = helper.createResponse(500, "Internal Server Error", error.message, []);

         winston.logger.error(
         `${req.requestId} ${req.requestUrl} RESPONSE : ${JSON.stringify(result)}`
         );
 
         return res.status(500).json(result);
    }
}

exports.insertUser = async (req, res) => {
    try {

        uniqueCode = req.requestId

        let {
            body
        } = req

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

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

                return res.status(200).send(result);
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

                return res.status(200).send(result);
            }else {

                await model.createLog(trx, 'AC001', insertUser.c_code, 'SUCCESSFULLY', insertUser)
                
            }

            result = {
                code: "00",
                message: "Success.",
                data: {
                    c_code: insertUser.c_code
                },
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE create user : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);

        })


    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        return res.status(200).send({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.updateUser = async (req, res) => {
    try {

        uniqueCode = req.requestId

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST update user  : ${JSON.stringify(req.body)}`
        );

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

                return res.status(200).send(result);
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
            }else {

                await model.createLog(trx, 'AC002', updateUser.c_code, 'SUCCESSFULLY', updateUser, before)
                
            }
            result = {
                code: "00",
                message: "Success.",
                data: {
                    c_code: updateUser.c_code
                },
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE create user : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);

        })


    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        return res.status(200).send({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.deleteUser = async (req, res) => {
    try {

        uniqueCode = req.requestId

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
                    `${uniqueCode} RESPONSE delete user : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result);
            }

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
            }else {

                await model.createLog(trx, 'AC003', deleteUser.c_code, 'SUCCESSFULLY', deleteUser, before)
                
            }

            result = {
                code: "00",
                message: "Success.",
                data: {
                    c_code : deleteUser.c_code
                },
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE delete user : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);

        })


    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        return res.status(200).send({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.resetPassword = async (req, res) => {
    try {

        uniqueCode = req.requestId

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

            let before = await model.getUser(req.params.code, trx)
            if (!before) {

                result = {
                    code: "01",
                    message: "user not found.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE reset password : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result);
            }

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
            }else {

                await model.createLog(trx, 'AC004', resetPassword.c_code, 'SUCCESSFULLY', resetPassword, before)
                
            }

            result = {
                code: "00",
                message: "Success.",
                data: {
                    c_code : resetPassword.c_code
                },
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE reset password : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);

        })


    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        return res.status(200).send({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}