const db = require("../../../infrastructure/database/knex");
const helper = require("../../helpers/helper");
const winston = require("../../helpers/winston.logger");
const model = require("./purchaseOrder.model");
const moment = require("moment");
moment.locale("id");

var result = {};
var uniqueCode;

exports.table = async (req, res) => {
    try {
          
        uniqueCode = req.requestId

        // log debug
        winston.logger.debug(`${uniqueCode} getting purchase order...`);
        
        const params = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            keyword: req.query.keyword || "",
        }
        // check data login
        let getUsers = await model.table(db, params)
        
        // log debug
        winston.logger.debug(`${uniqueCode} result purchase order : ${JSON.stringify(getUsers)}`);

        result = {
            code: "00",
            message: "Success.",
            data: getUsers,
        }; 

        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE get purchase order : ${JSON.stringify(result)}`
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
        winston.logger.debug(`${uniqueCode} getting purchase order...`);

        // check data login
        let projectList = await model.list(db)
   
        // log debug
        winston.logger.debug(`${uniqueCode} result purchase order : ${JSON.stringify(projectList)}`);

        result = {
            code: "00",
            message: "Success.",
            data: projectList,
        }; 

        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE get purchase order : ${JSON.stringify(result)}`
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

        await db.transaction(async trx => {

            let code = await model.generateCode(trx, moment(body.d_project_date).format("YYMMDD"))

            body = {...req.body, ...{
                c_po_number: code
            }}

            // const projectManager = await model.getProejctManager(trx, body.c_project_manager_code)
            result = {
                code: "01",
                message: "Failed.",
                data: code,
            };

            // log info
            winston.logger.warn(
                `${uniqueCode} RESPONSE create purchase order : ${JSON.stringify(result)}`
            );

            return res.status(200).send(result);
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
                    `${uniqueCode} RESPONSE create purchase order : ${JSON.stringify(result)}`
                );

                return res.status(200).send(result);
            }else{

                await model.createLog(trx, 'AC011', create.c_po_number, 'SUCCESSFULLY', create)

            }
            
            result = {
                code: "00",
                message: "Success",
                data: {
                    c_po_number: create.c_po_number
                },
            };

            // log warn
            winston.logger.info(
                `${uniqueCode} RESPONSE purchase order : ${JSON.stringify(result)}`
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
