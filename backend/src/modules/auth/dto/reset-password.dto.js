import Joi from "joi"
import baseDto from "../../../common/dto/base.dto.js"

class ResetPasswordDto extends baseDto {
    static schema = Joi.object({
        password: Joi.string().min(8).max(50).pattern(/(?=.*[A-Z])(?=.*\d)/).message("Password must conatin at least one uppercase letter and one digit").required(),
        passwordConfirm: Joi.string().valid(Joi.ref("password")).required(),
    })
}

export default ResetPasswordDto;
