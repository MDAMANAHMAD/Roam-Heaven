const joi = require('joi');

module.exports.reviewschema = joi.object({
    reviews : joi.object({
        rating : joi.number.required().min(1).max(5),
        comment:joi.string.required()
    
    }).required()
       
}) 