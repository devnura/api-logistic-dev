const {
    validationResult
} = require('express-validator')

const winston = require("../helpers/winston.logger")
const helper = require('../helpers/helper')

exports.validate = async (req, res, next) => {

    const requestId = helper.getUniqueCode()
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    // log info
    winston.logger.info(
        `${requestId} ${requestUrl} REQUEST : ${JSON.stringify(req.body)}`
    );
    
    const errors = validationResult(req)

    if (!errors.isEmpty()) {

        result = helper.createResponse(400, "BAD_REQUEST", errors.array(), []);

        // log warn
        winston.logger.warn(
            `${requestId} ${requestUrl} RESPONSE : ${JSON.stringify(result)}`
        );
        
        return res.status(400).json(result);
    }

    req.requestId = requestId
    req.requestUrl = requestUrl

    next()
}