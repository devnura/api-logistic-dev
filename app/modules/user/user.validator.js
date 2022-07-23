const {
    check,
    validationResult
} = require('express-validator')

const winston = require("../../helpers/winston.logger")

const login_rules = () => {
    return [
        check('email').notEmpty().withMessage('email harus terisi!').isEmail().withMessage("Invalid Email format"),
        check('password').notEmpty().withMessage('Password harus terisi')
    ]
}

const validate = async (req, res, next) => {
        // log info
    winston.logger.info(
        `${req.uniqueCode} REQUEST login: ${JSON.stringify(req.body)}`
    );
      
    const errors = await validationResult(req)
    if (!errors.isEmpty()) {
        let result = {
            status: '98',
            message: "Bad Request",
            data: errors.array()
        }

        winston.logger.info(
            `${req.uniqueCode} RESPONSE login: ${JSON.stringify(result)}`
        );

        return res.status(400).json(result);
    }

    req = req.body
    next()
}

module.exports = {
    login_rules,
    validate
}