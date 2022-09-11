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

exports.table = async (req, res) => {
    try {
          
        uniqueCode = req.requestId

        // log debug
        winston.logger.debug(`${uniqueCode} getting projects...`);
        
        const params = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            keyword: req.query.keyword || "",
        }
        // check data login
        let getUsers = await model.table(db, params)
        
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

exports.list = async (req, res) => {
    try {
          
        uniqueCode = req.requestId

        // log debug
        winston.logger.debug(`${uniqueCode} getting projects...`);

        // check data login
        let projectList = await model.list(db)
   
        // log debug
        winston.logger.debug(`${uniqueCode} result projects : ${JSON.stringify(projectList)}`);

        result = {
            code: "00",
            message: "Success.",
            data: projectList,
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

            const projectManager = await model.getProejctManager(trx, body.c_project_manager_code)

            const create = await model.create(trx, body, payload, projectManager)

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
            }else{

                await model.createLog(trx, 'AC005', create.c_project_number, 'SUCCESSFULLY', create)

            }
            
            result = {
                code: "00",
                message: "Success",
                data: {
                    c_project_number: create.c_project_number
                },
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
                `${uniqueCode} RESPONSE update project : ${JSON.stringify(result)}`
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
            let dir = `${process.cwd()}/${oldFile}`

            if (fs.existsSync(dir)) await unlinkAsync(`${process.cwd()}/${oldFile}`)

            // new file
            let file_url = await helper.getDomainName(req) + '/' + process.env.STATIC_PATH_PDF + "" + req.file.filename;
            body = {...req.body, ...{
                c_doc_project_url: file_url
            }}

        }
        
        await db.transaction(async trx => {
            const projectManager = await model.getProejctManager(trx, body.c_project_manager_code)
            
            const update = await model.update(trx, body, payload, req.params.code, projectManager)
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
            }else {

                await model.createLog(trx, 'AC006', update.c_project_number, 'SUCCESSFULLY', update, oldData)
                
            }

            result = {
                code: "00",
                message: "Success",
                data: {
                    c_project_number: update.c_project_number
                },
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

        let oldData = await model.find(db, req.params.code)
        if(!oldData){
            result = {
                code: "02",
                message: "Project undefined ! ",
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
            }else {

                await model.createLog(trx, 'AC010', deleteProject.c_project_number, 'SUCCESSFULLY', deleteProject, oldData)
                
            }

            result = {
                code: "00",
                message: "Success.",
                data: {
                    c_project_number: deleteProject.c_project_number
                }
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

        let oldData = await model.find(db, req.params.code)
        if(!oldData){
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
            }else {

                await model.createLog(trx, 'AC007', progress.c_project_number, 'SUCCESSFULLY', progress, oldData)
                
            }

            result = {
                code: "00",
                message: "Success.",
                data: {
                    c_project_number: progress.c_project_number
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

        let oldData = await model.find(db, req.params.code)
        if(!oldData){
            result = {
                code: "02",
                message: "Project undefined ! ",
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE complete project : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);
        }

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
            }else {

                await model.createLog(trx, 'AC008', complete.c_project_number, 'SUCCESSFULLY', complete, oldData)
                
            }

            result = {
                code: "00",
                message: "Success.",
                data: {
                    c_project_number: complete.c_project_number
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

        let oldData = await model.find(db, req.params.code)
        if(!oldData){
            result = {
                code: "02",
                message: "Project undefined ! ",
                data: {},
            };

            // log warn
            winston.logger.warn(
                `${uniqueCode} RESPONSE void to progress project : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);
        }

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
            }else {

                await model.createLog(trx, 'AC009', complete.c_project_number, 'SUCCESSFULLY', complete, oldData)
                
            }

            result = {
                code: "00",
                message: "Success.",
                data: {
                    c_project_number : complete.c_project_number
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

        return res.status(200).json({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.getProejctManager = async (req, res) => {
    try {
          
        uniqueCode = req.requestId

        // log debug
        winston.logger.debug(`${uniqueCode} getting project manager...`);

        // check data login
        let projectList = await model.getListProjectManager(db)
   
        // log debug
        winston.logger.debug(`${uniqueCode} result project manager : ${JSON.stringify(projectList)}`);

        result = {
            code: "00",
            message: "Success.",
            data: projectList,
        }; 

        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE get project manager: ${JSON.stringify(result)}`
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