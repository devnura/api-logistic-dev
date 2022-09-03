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

exports.getAll = async (req, res) => {
    try {
          
        uniqueCode = req.requestId

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST get projects : ${JSON.stringify(req.body)}`
        );
        // log debug
        winston.logger.debug(`${uniqueCode} getting projects...`);
        
        const params = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            keyword: req.query.keyword || "",
        }
        // check data login
        let getUsers = await model.findAll(db, params)
        let data = {
            "totalItems": 0,
            "rows": [],
            "totalPages": 1,
            "currentPage": 1
        }
        
        // log debug
        winston.logger.debug(`${uniqueCode} result projects : ${JSON.stringify(getUsers)}`);

        result = {
            code: "00",
            message: "Success.",
            data: getUsers,
        }; 

        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE get projects : ${JSON.stringify(result)}`
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

        uniqueCode = req.requestId

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

        uniqueCode = req.requestId

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

        uniqueCode = req.requestId

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
                data: update ? update : {},
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

        uniqueCode = uniqueCode = req.requestId

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST delete project : ${JSON.stringify(req.body)}`
        );

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

exports.onProgres = async (req, res) => {
    try {

        uniqueCode = req.requestId

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST on progress project : ${JSON.stringify(req.body)}`
        );

        await db.transaction(async trx => {

            const progress  = await model.setOnProgress(trx, req.params.code, payload)
            if (!progress) {
                result = {
                    code: "01",
                    message: "Failed.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE on progress user : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result);
            }

            result = {
                code: "00",
                message: "Success.",
                data: progress,
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

exports.complete = async (req, res) => {
    try {

        uniqueCode = req.requestId

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST complete project : ${JSON.stringify(req.body)}`
        );

        await db.transaction(async trx => {

            const complete  = await model.setComlplete(trx, req.params.code, payload)
            if (!complete) {
                result = {
                    code: "01",
                    message: "Failed.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE complete project : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result);
            }

            result = {
                code: "00",
                message: "Success.",
                data: complete,
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

exports.voidToOnProgress = async (req, res) => {
    try {

        uniqueCode = req.requestId

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST void to on progress project : ${JSON.stringify(req.body)}`
        );

        await db.transaction(async trx => {

            const complete  = await model.setOnProgress(trx, req.params.code, payload)
            if (!complete) {
                result = {
                    code: "01",
                    message: "Failed.",
                    data: {},
                };

                // log info
                winston.logger.info(
                    `${uniqueCode} RESPONSE void to on progress user : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result);
            }

            result = {
                code: "00",
                message: "Success.",
                data: complete,
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