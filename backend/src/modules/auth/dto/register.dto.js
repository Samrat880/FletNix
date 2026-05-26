import Joi from 'joi';
import baseDto from '../../../common/dto/base.dto.js';

class RegisterDto extends baseDto{
    static schema = Joi.object({
        name: Joi.string().trim().min(2).max(50).optional(),
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(8).required().max(50),
        age: Joi.number().integer().min(1).max(120).required(),
    })
}

export default RegisterDto
