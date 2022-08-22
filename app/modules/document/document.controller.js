require("dotenv").config()

const {
    body,
    validationResult,
    check
} = require('express-validator')
const db = require("../../../infrastructure/database/knex");

const readXlsxFile = require("read-excel-file/node");
const helper = require("../../helpers/helper");
const winston = require("../../helpers/winston.logger");
const model = require("./document.model");
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
        case "createDocument":
            return [
                body('c_document_name').notEmpty().withMessage('c_document_name harus terisi!')
                .isLength({
                    max: 64
                }).withMessage('c_firstname is out of length!').escape().trim(),
                body('c_desc').exists().withMessage('c_desc required!')
                .isLength({
                    max: 128
                }).withMessage('c_desc is out of length!').escape().trim(),
                check('detail').isArray().notEmpty().withMessage('detail is require'),
                check('detail.*.file_name').notEmpty().withMessage('file_name is require!').escape().trim(),
                check('detail.*.category').notEmpty().withMessage('category is require!').escape().trim(),
            ]

        case "updateDocument":
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

exports.findAll = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST get document list : ${JSON.stringify(req.body)}`
        );
        // log debug
        winston.logger.debug(`${uniqueCode} getting document...`);

        // check data login
        let documentList = await model.findAllDocument(db)

        // log debug
        winston.logger.debug(`${uniqueCode} result users : ${JSON.stringify(documentList)}`);

        result = {
            code: "00",
            message: "Success.",
            data: documentList,
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
}

exports.find = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()
        let {
            code
        } = req.params
        // log debug
        winston.logger.debug(`${uniqueCode} getting document : ${code}`);

        // check data login
        let document = await model.findDocument(code, db)
        if(!document) {
            result = {
                code: "01",
                message: "Not found.",
                data: document ? document : {},
            };
    
            // result 
            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
            );
    
            return res.status(200).json(result);
        }
        // log debug
        winston.logger.debug(`${uniqueCode} result document : ${JSON.stringify(document)}`);

        result = {
            code: "00",
            message: "Success.",
            data: document ? document : {},
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

exports.create = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST create document  : ${JSON.stringify(req.body)}`
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
                `${uniqueCode} RESPONSE create document : ${JSON.stringify(result)}`
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

            // log debug
            winston.logger.debug(`${uniqueCode} insert document...`);

            const documentCode = await model.generateCode(trx)

            let dir = `/${process.env.PATH_PDF}`;

            body = {
                ...body,
                ...{
                    c_document_code: documentCode,
                    c_document_path: dir
                }
            }

            const document = await model.insertDocument(body, payload, trx)

            if (!document) {

                await trx.rollback;

                result = {
                    code: "01",
                    message: "Failed.",
                    data: {},
                };

                // log info
                winston.logger.warn(
                    `${uniqueCode} RESPONSE create user : ${JSON.stringify(document)}`
                );

                return res.status(200).json(result);
            }

            if (!fs.existsSync(`${process.cwd()}${dir}`)) {
                fs.mkdirSync(`${process.cwd()}${dir}`, {
                    recursive: true
                  });
            }

            for (const item of body.detail) {
                let code = await model.generateCodePdf(trx)
                let data = {
                    "i_document_excel": document.i_document_excel,
                    "c_file_code": code,
                    "c_file_name": item.file_name.toLowerCase(),
                    "c_category": item.category,
                    "c_document_code": document.c_document_code
                }
                await model.insertDocumentDetail(data, trx)
            }

            // insert detail

            result = {
                code: "00",
                message: "Success.",
                data: {
                    document
                },
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

exports.uploadExcel = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST upload excel : ${JSON.stringify(req.body)}`
        );


        if (req.file == undefined) {
            result = {
                code: "01",
                message: "Please upload an excel file!",
                data: {},
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE delete user : ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }

        let path = process.cwd() + '/' + process.env.PATH_EXCEL + req.file.filename;
        // let path = await helper.getDomainName(req) + "/public/uploads/excel/" + req.file.filename;
        const rows = await readXlsxFile(path)
        // skip header
        rows.shift();

        let cellValues = [];

        rows.forEach((row) => {
            if (row[0] && row[1]) cellValues.push({
                file_name: row[0].toLowerCase(),
                category: row[1],
            })
        })

        result = {
            code: "00",
            message: "Success.",
            data: cellValues ? cellValues : {},
        };

        winston.logger.info(
            `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
        );


        // Delete the file like normal
        await unlinkAsync(req.file.path)

        return res.status(200).json(result);

    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        // Delete the file like normal
        await unlinkAsync(req.file.path)

        return res.status(200).json({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.uploadPdf = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        const params = {
            folder: req.params.folder,
            file: req.params.code,
        }

        const payload = {
            user_code: req.code,
            user_name: req.name
        }

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST upload pdf : ${JSON.stringify(req.body)}`
        );

        if (req.file == undefined) {
            result = {
                code: "01",
                message: "Please upload an pdf file!",
                data: {},
            };

            // log info
            winston.logger.info(
                `${uniqueCode} RESPONSE delete user : ${JSON.stringify(result)}`
            );

            return res.status(200).json(result);
        }
        //  ini diganti menjadi nama domain
        let file_url = await helper.getDomainName(req) + '/' + process.env.PATH_PDF + "" + req.file.filename;

        let update = await model.uploadPdf(params, file_url, payload, db)

        if (!update) {

            await unlinkAsync(req.file.path)
            result = {
                code: "00",
                message: "Failed.",
                data: {
                    params, file_url, payload
                },
            };

            return res.status(200).json(result);

        }

        result = {
            code: "00",
            message: "Success.",
            data: update ? update : {},
        };

        winston.logger.info(
            `${uniqueCode} RESPONSE user : ${JSON.stringify(result)}`
        );

        return res.status(200).json(result);

    } catch (error) {
        // create log
        winston.logger.error(
            `500 internal server error - backend server | ${error.message}`
        );

        // Delete the file like normal
        await unlinkAsync(req.file.path)

        return res.status(200).json({
            code: "500",
            message: process.env.NODE_ENV != "production" ?
                error.message : "500 internal server error - backend server.",
            data: {},
        });
    }
}

exports.deleteDocument = async (req, res) => {
    try {

        uniqueCode = helper.getUniqueCode()

        // log info
        winston.logger.info(
            `${uniqueCode} REQUEST delete document  : ${JSON.stringify(req.body)}`
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

            const deleteDocument = await model.deleteDocument(req.params.code, payload, trx)
            if (!deleteDocument) {
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
                data: deleteDocument,
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