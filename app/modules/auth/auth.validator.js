const {
    check,
    validationResult
} = require('express-validator')

const login_rules = () => {
    return [
        check('email').notEmpty().withMessage('email harus terisi!').isEmail().withMessage("Invalid Email format"),
        check('password').notEmpty().withMessage('Password harus terisi')
    ]
}

const validate = async (req, res, next) => {
    const errors = await validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: '98',
            message: "Bad Request",
            data: errors.array()
        });
    }
    console.log("[validator] Validation : ok")
    req = req.body
    next()
}

module.exports = {
    login_rules,
    validate
}