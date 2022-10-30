const {
    body,
    validationResult
} = require('express-validator')

const winston = require("../../helpers/winston.logger")
const helper = require('../../helpers/helper')

exports.rules = (method) => {
    switch (method) {
        case "login":
            return [
                body('email').notEmpty().withMessage('email is required!').isEmail().withMessage("Invalid email format").isLength({ max: 64 }).escape().trim(),
                body('password').notEmpty().withMessage('password is required').isLength({ max: 64 }).escape().trim()
            ]
            
        case "refreshToken":
            return [
                body("refresh_token").notEmpty().withMessage('refresh_token is required!')
            ]
                
        default: 
            return []
        break;
    }
}
exports.validate = async (req, res, next) => {

    const requestId = helper.getUniqueCode()
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    // log info
    winston.logger.info(
        `${requestId} REQUEST  : ${JSON.stringify(req.body)}`
    );
    
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        result = {
            code: "400",
            status: "BAD_REQUEST",
            errors: errors.array(),
            data: [],
          };

        // log warn
        winston.logger.warn(
            `${requestId} RESPONSE : ${JSON.stringify(result)}`
        );
        
        return res.status(400).json(result);
    }

    req.requestId = requestId
    req.requestUrl = requestUrl

    next()
}