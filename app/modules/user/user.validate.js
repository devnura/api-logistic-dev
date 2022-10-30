const {
    body,
    validationResult,
    check
} = require('express-validator')
const winston = require("../../helpers/winston.logger")
const helper = require('../../helpers/helper')

exports.rules = (method) => {
    switch (method) {
        case "createUser":
            return [
                body('c_first_name').notEmpty().withMessage('c_first_name harus terisi!')
                .isLength({
                    max: 32
                }).withMessage('c_firstname is out of length!'),
                body('c_last_name').exists().withMessage('c_last_name is required!')
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

        case "updateUser":
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

        case "resetPassword":
            return [
                check("code").notEmpty().withMessage('code harus terisi!'),
                body('c_password').exists().withMessage('c_password harus terisi!')
                .isLength({
                    max: 32
                }).withMessage('c_password is out of length!'),
                body('reset').notEmpty()
                .isBoolean().withMessage('reset is out of length!'),
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
            break;
    }
}