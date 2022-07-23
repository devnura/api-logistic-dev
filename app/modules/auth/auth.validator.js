const {
    check,
    header,
    validationResult
} = require('express-validator')

const winston = require("../../helpers/winston.logger")

const login_rules = () => {
    return [
        check('email').notEmpty().withMessage('email harus terisi!').isEmail().withMessage("Invalid Email format"),
        check('password').notEmpty().withMessage('Password harus terisi')
    ]
}

const refres_token_rules = () => {
    return [
        header("refresh_token").notEmpty().withMessage('refresh_token harus terisi!')
    ]
}

const validate =  (req, res, next) => {
        // log info
    winston.logger.info(
        `${req.uniqueCode} REQUEST : ${JSON.stringify(req.body)}`
    );
      
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let result = {
            status: '98',
            message: "Bad Request",
            data: errors.array()
        }

        winston.logger.info(
            `${req.uniqueCode} RESPONSE : ${JSON.stringify(result)}`
        );

        return res.status(400).json(result);
    }

    req = req.body
    next()
}

module.exports = {
    login_rules,
    refres_token_rules,
    validate
}