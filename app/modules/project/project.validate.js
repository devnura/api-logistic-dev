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
                body('c_project_name').notEmpty().withMessage('c_project_name is required!')
                .isLength({
                    max: 64
                }).withMessage('c_project_name is out of length!').escape().trim().toUpperCase(),

                body('c_project_manager_code').notEmpty().withMessage('c_project_manager_code is required!')
                .isLength({
                    max: 32
                }).withMessage('c_project_manager_code is out of length!').escape().trim().toUpperCase(),

                body('c_project_manager_name').notEmpty().withMessage('c_project_manager_name is required!')
                .isLength({
                    max: 32
                }).withMessage('c_project_manager_name is out of length!').escape().trim().toUpperCase(),

                body('c_note').exists().withMessage('c_note is required!')
                .isLength({
                    max: 32
                }).withMessage('c_note is out of length!').escape().trim().toUpperCase(),

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
                }).withMessage('c_project_name is out of length!').escape().trim().toUpperCase(),

                body('c_project_manager_code').notEmpty().withMessage('c_project_manager_code is required!')
                .isLength({
                    max: 32
                }).withMessage('c_project_manager_code is out of length!').escape().trim().toUpperCase(),

                body('c_project_manager_name').notEmpty().withMessage('c_project_manager_name is required!')
                .isLength({
                    max: 32
                }).withMessage('c_project_manager_name is out of length!').escape().trim().toUpperCase(),

                body('c_note').exists().withMessage('c_note is required!')
                .isLength({
                    max: 32
                }).withMessage('c_note is out of length!').escape().trim().toUpperCase(),

                body('d_project_date').notEmpty().withMessage('d_project_date is required!')
                .isISO8601().withMessage('invalid d_project_start format YYYY-MM-DD !').escape().trim(),

                body('d_project_start').notEmpty().withMessage('d_project_start is required!')
                .isISO8601().withMessage('invalid d_project_start format YYYY-MM-DD !').escape().trim(),

                body('d_project_end').notEmpty().withMessage('d_project_end is required!')
                .isISO8601().withMessage('invalid d_project_end format YYYY-MM-DD !').escape().trim(),
            ]
        
        case "createe":

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

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        result = {
            code: "99",
            message: 'Invalid Value',
            data: errors.array(),
        };

        // log warn
        winston.logger.warn(
            `${requestId} RESPONSE create project : ${JSON.stringify(result)}`
        );
        
        return res.status(200).json(result);
    }

    req.requestId = requestId

    next()
}