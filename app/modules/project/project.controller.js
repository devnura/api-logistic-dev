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

const fs = require('fs')
const {
    promisify
} = require('util')

const unlinkAsync = promisify(fs.unlink)

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

                body('d_project_date').notEmpty().withMessage('d_project_date is required!')
                .isISO8601().withMessage('invalid d_project_start format YYYY-MM-DD !').escape().trim(),

                body('d_project_start').notEmpty().withMessage('d_project_start is required!')
                .isISO8601().withMessage('invalid d_project_start format YYYY-MM-DD !').escape().trim(),

                body('d_project_end').notEmpty().withMessage('d_project_end is required!')
                .isISO8601().withMessage('invalid d_project_end format YYYY-MM-DD !').escape().trim(),
            ]

        case "update":
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

                body('d_project_date').notEmpty().withMessage('d_project_date is required!')
                .isISO8601().withMessage('invalid d_project_start format YYYY-MM-DD !').escape().trim(),

                body('d_project_start').notEmpty().withMessage('d_project_start is required!')
                .isISO8601().withMessage('invalid d_project_start format YYYY-MM-DD !').escape().trim(),

                body('d_project_end').notEmpty().withMessage('d_project_end is required!')
                .isISO8601().withMessage('invalid d_project_end format YYYY-MM-DD !').escape().trim(),
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

        let {
            body
        } = req

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST create project  : ${JSON.stringify(req.body)}`
        );

        if (!req.file) {
            result = {
                code: "02",
                message: "Please Upload a PDF !",
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
            )

            return res.status(200).send(result)

        }

        // check validator
        const err = validationResult(req, res);
        if (!err.isEmpty()) {
            await unlinkAsync(req.file.path)
            result = {
                code: "99",
                message: err.errors[0].msg,
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);
        }

        if (moment(body.d_project_start).isSameOrAfter(body.d_project_end)) {
            await unlinkAsync(req.file.path)
            result = {
                code: "03",
                message: "d_project_start must before d_project_end",
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);
        }

        await db.transaction(async trx => {

            let code = await model.generateProjectCode(trx, moment(body.d_project_date).format("YYMMDD"))
            let file_url = await helper.getDomainName(req) + '/' + process.env.STATIC_PATH_PDF + "" + req.file.filename;

            body = {...req.body, ...{
                c_doc_project_url: file_url,
                c_project_number: code
            }}

            const create = await model.create(trx, body, payload)
            if (!create) {
                await trx.rollback()
                result = {
                    code: "01",
                    message: "Failed.",
                    data: {},
                };

                // log info
                winston.logger.warn(
                    `${uniqueCode} RESPONSE delete user : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result);
            }

            result = {
                code: "00",
                message: "Success",
                data: create? create : {},
            };

            // log warn
            winston.logger.info(
                `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
            );
            
            return res.status(200).send(result)

        })

    } catch (error) {
        // create log
        await unlinkAsync(req.file.path)

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

exports.update = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        let {
            body
        } = req

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST update project  : ${JSON.stringify(req.body)}`
        );

        // check validator
        const err = validationResult(req, res);
        if (!err.isEmpty()) {
            result = {
                code: "99",
                message: err.errors[0].msg,
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE update user : ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }

        let oldData = await model.find(db, req.params.code)
        if(!oldData){
            if(req.file) await unlinkAsync(req.file.path)
            result = {
                code: "02",
                message: "Project undefined ! ",
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);
        }

        if (moment(body.d_project_start).isSameOrAfter(body.d_project_end)) {
        
            if(req.file) await unlinkAsync(req.file.path)
            result = {
                code: "03",
                message: "d_project_start must before d_project_end",
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }

        if (req.file) {
            // remove old file
            let oldFile = oldData.c_doc_project_url.split("/").splice(-4).join("/")
            await unlinkAsync(`${process.cwd()}/${oldFile}`)

            // new file
            let file_url = await helper.getDomainName(req) + '/' + process.env.STATIC_PATH_PDF + "" + req.file.filename;
            body = {...req.body, ...{
                c_doc_project_url: file_url
            }}

        }
        
        await db.transaction(async trx => {

            const update = await model.update(trx, body, payload, req.params.code)
            if(!update){
                await trx.rollback()
                result = {
                    code: "01",
                    message: "Failed.",
                    data: {},
                };

                // log info
                winston.logger.warn(
                    `${uniqueCode} RESPONSE delete user : ${JSON.stringify(result)}`
                );

                return res.status(200).json(result);
            }

            result = {
                code: "00",
                message: "Success",
                data: create ? create : {},
            };
    
            // log warn
            winston.logger.info(
                `${uniqueCode} RESPONSE create project : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);

        })

    } catch (error) {

        if(req.file) await unlinkAsync(req.file.path)
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

exports.delete = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST delete project : ${JSON.stringify(req.body)}`
        );

        // check validator
        const err = validationResult(req, res);
        if (!err.isEmpty()) {
            result = {
                code: "99",
                message: err.errors[0].msg,
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE delete project : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);
        }

        await db.transaction(async trx => {

            // check if project have a transaction
            const purchaseOrder = await model.getPurchaseOrder(trx, req.params.code)
            if(purchaseOrder){
                result = {
                    code: "02",
                    message: "Can not peform this operation, there is already active transaction in this project",
                    data: {},
                };

                // log warn
                winston.logger.warn(
                    `${uniqueCode} RESPONSE delete project : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result);
            }

            const deleteProject = await model.deleteProject(trx, req.params.code, payload)
            console.log("ABC : ",deleteProject)
            if (!deleteProject) {
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
                data: deleteProject,
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