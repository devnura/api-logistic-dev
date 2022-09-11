const {
    body,
    validationResult,
    check
} = require('express-validator')
const winston = require("../../helpers/winston.logger")
const helper = require('../../helpers/helper')

exports.rules = (method) => {
    switch (method) {
        case "create":
            return [
                body('c_po_name').notEmpty().withMessage('c_po_name is required!')
                .isLength({
                    max: 64
                }).withMessage('c_po_name is out of length!').escape().trim().toUpperCase(),

                body('c_project_number').notEmpty().withMessage('c_project_number is required!')
                .isLength({
                    max: 32
                }).withMessage('c_project_number is out of length!').escape().trim().toUpperCase(),

                body('c_po_number').notEmpty().withMessage('c_po_number is required!')
                .isLength({
                    max: 64
                }).withMessage('c_po_number is out of length!').escape().trim().toUpperCase(),

                body('c_vendor_code').notEmpty().withMessage('c_vendor_code is required!')
                .isLength({
                    max: 16
                }).withMessage('c_vendor_code is out of length!').escape().trim().toUpperCase(),

                body('c_doc_spbj_number').notEmpty().withMessage('c_doc_spbj_number is required!')
                .isLength({
                    max: 64
                }).withMessage('c_doc_spbj_number is out of length!').escape().trim().toUpperCase(),

                body('c_vendor_pic_name').notEmpty().withMessage('c_vendor_pic_name is required!')
                .isLength({
                    max: 64
                }).withMessage('c_vendor_pic_name is out of length!').escape().trim().toUpperCase(),

                body('c_note').exists().withMessage('c_note is required!')
                .isLength({
                    max: 32
                }).withMessage('c_note is out of length!').escape().trim().toUpperCase(),

                body('d_po_date').notEmpty().withMessage('d_po_date is required!')
                .isISO8601().withMessage('invalid d_po_date format YYYY-MM-DD !').escape().trim(),

                body('data').isArray().notEmpty().withMessage('data is require'),
                body('data.*.c_device_code').notEmpty().withMessage('c_device_code is require!').escape().trim(),
                body('data.*.i_quantity').notEmpty().withMessage('i_quantity is require!').escape().trim(),
                body('data.*.i_unit_price').notEmpty().withMessage('i_unit_price is require!').escape().trim(),
                body('data.*.i_cond_value').notEmpty().withMessage('i_cond_value is require!').escape().trim(),
                body('data.*.i_cost_center').notEmpty().withMessage('i_cost_center is require!').escape().trim(),
                body('data.*.c_note').notEmpty().withMessage('c_note is require!').escape().trim(),

            ]
            
        case "update":
            return [
                body('c_po_name').notEmpty().withMessage('c_po_name is required!')
                .isLength({
                    max: 64
                }).withMessage('c_po_name is out of length!').escape().trim().toUpperCase(),

                body('c_project_number').notEmpty().withMessage('c_project_number is required!')
                .isLength({
                    max: 32
                }).withMessage('c_project_number is out of length!').escape().trim().toUpperCase(),

                body('c_po_number').notEmpty().withMessage('c_po_number is required!')
                .isLength({
                    max: 64
                }).withMessage('c_po_number is out of length!').escape().trim().toUpperCase(),

                body('c_vendor_code').notEmpty().withMessage('c_vendor_code is required!')
                .isLength({
                    max: 16
                }).withMessage('c_vendor_code is out of length!').escape().trim().toUpperCase(),

                body('c_doc_spbj_number').notEmpty().withMessage('c_doc_spbj_number is required!')
                .isLength({
                    max: 64
                }).withMessage('c_doc_spbj_number is out of length!').escape().trim().toUpperCase(),

                body('c_vendor_pic_name').notEmpty().withMessage('c_vendor_pic_name is required!')
                .isLength({
                    max: 64
                }).withMessage('c_vendor_pic_name is out of length!').escape().trim().toUpperCase(),

                body('c_note').exists().withMessage('c_note is required!')
                .isLength({
                    max: 32
                }).withMessage('c_note is out of length!').escape().trim().toUpperCase(),

                body('d_po_date').notEmpty().withMessage('d_po_date is required!')
                .isISO8601().withMessage('invalid d_po_date format YYYY-MM-DD !').escape().trim(),

                body('data').isArray().notEmpty().withMessage('data is require'),
                body('data.*.c_device_code').notEmpty().withMessage('c_device_code is require!').escape().trim(),
                body('data.*.i_quantity').notEmpty().withMessage('i_quantity is require!').escape().trim(),
                body('data.*.i_unit_price').notEmpty().withMessage('i_unit_price is require!').escape().trim(),
                body('data.*.i_cond_value').notEmpty().withMessage('i_cond_value is require!').escape().trim(),
                body('data.*.i_cost_center').notEmpty().withMessage('i_cost_center is require!').escape().trim(),
                body('data.*.c_note').notEmpty().withMessage('c_note is require!').escape().trim(),

            ]
        
        case "table":

                return [
                    check('page').exists().withMessage('page is required!')
                    .isNumeric().withMessage('page must number')
                    .isLength({
                        max: 8
                    }).withMessage('limit is out of length!').escape().trim().toInt(),
                    check('limit').exists().withMessage('limit is required!')
                    .isNumeric().withMessage('limit must number')
                    .isLength({
                        max: 8
                    }).withMessage('limit is out of length!').escape().trim().toInt(),
                ]
                
        default: 
            return []
        break;
    }
}
exports.validate = async (req, res, next) => {

    const requestId = helper.getUniqueCode()
    // log info
    winston.logger.info(
        `${requestId} REQUEST : ${JSON.stringify(req.body)}`
    );
    
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        result = {
            code: "99",
            message: 'Invalid Value',
            data: errors.array(),
        };

        // log warn
        winston.logger.warn(
            `${requestId} RESPONSE : ${JSON.stringify(result)}`
        );
        
        return res.status(200).json(result);
    }

    req.requestId = requestId

    next()
}