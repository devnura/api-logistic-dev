const {
    body,
    validationResult,
    check
} = require('express-validator')

const db = require("../../../infrastructure/database/knex");

const helper = require("../../helpers/helper");
const winston = require("../../helpers/winston.logger");
const model = require("./group.model");
const moment = require("moment");
moment.locale("id");

var result = {};
var uniqueCode;

// VALIDATION
exports.validate = (method) => {
    switch (method) {
    
        default:
            break;
    }
};

exports.getGroupList = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST get group : ${JSON.stringify(req.body)}`
        );
        // log debug
        winston.logger.debug(`${uniqueCode} getting group...`);

        // check data login
        let groupList = await model.getGroupList(db)

        // log debug
        winston.logger.debug(`${uniqueCode} result group : ${JSON.stringify(groupList)}`);

        result = {
            code: "00",
            message: "Success.",
            data: groupList,
        };

        // log info
        winston.logger.info(
            `${uniqueCode} RESPONSE get group : ${JSON.stringify(result)}`
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
