import Joi from 'joi';
import baseDto from '../../../common/dto/base.dto.js';

class RegisterDto extends baseDto{
    static schema = Joi.object({
        name: Joi.string().trim().min(2).max(50).required(),
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(8).required().max(50),
        role: Joi.string().valid("customer", "seller").default("customer"),

    })
}

export default RegisterDto
