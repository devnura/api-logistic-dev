const {
    check,
    validationResult
} = require('express-validator')

const winston = require("../../helpers/winston.logger")

const create_rules = () => {
    return [
        check('c_first_name').notEmpty().withMessage('c_first_name harus terisi!')
            .isLength({max: 32}).withMessage('c_firstname is out of length!'),
        check('c_last_name').exists().withMessage('c_last_name is required!')
            .isLength({max: 32}).withMessage('c_lastname is out of length!'),
        check('c_group_code').notEmpty().withMessage('c_group_code harus terisi!')
            .isLength({max: 8}).withMessage('c_group_code is out of length!'),
        check('c_email').notEmpty().withMessage('c_email harus terisi!').isEmail().withMessage("Invalid Email format")
            .isLength({max: 64}).withMessage('c_email is out of length!'),
        check('c_password').notEmpty().withMessage('c_password harus terisi')
            .isLength({max: 64}).withMessage('c_password is out of length!'),
    ]
}

const update_rules = () => {
    return [
        check('code').notEmpty().withMessage('code is required!')
            .isLength({max: 8}).withMessage('code is out of length!'),
        check('firstname').notEmpty().withMessage('firstname harus terisi!')
            .isLength({max: 32}).withMessage('firstname is out of length!'),
        check('lastname').exists().withMessage('lastname is required!')
            .isLength({max: 32}).withMessage('lastname is out of length!'),
        check('group').notEmpty().withMessage('group harus terisi!')
            .isLength({max: 8}).withMessage('group is out of length!'),
        check('email').notEmpty().withMessage('email harus terisi!').isEmail().withMessage("Invalid Email format")
            .isLength({max: 64}).withMessage('email is out of length!')
    ]
}

const change_password_rules = () => {
    return [
        check('code').notEmpty().withMessage('code is required!')
            .isLength({max: 8}).withMessage('code is out of length!'),
        check('password').notEmpty().withMessage('Password harus terisi')
            .isLength({max: 64}).withMessage('email is out of length!'),
    ]
}

const validate = async (req, res, next) => {
      
    const errors = await validationResult(req)
    if (!errors.isEmpty()) {
        let result = {
            status: '98',
            message: "Bad Request",
            data: errors.array()
        }
        return res.status(400).json(result);
    }

    req = req.body
    next()
}

module.exports = {
    create_rules,
    update_rules,
    change_password_rules,
    validate
}