import Joi from "joi";
import baseDto from "../../../common/dto/base.dto.js";

class PreferencesDto extends baseDto {
  static schema = Joi.object({
    genres: Joi.array()
      .items(Joi.string().trim().min(1).max(80))
      .min(1)
      .max(10)
      .required(),
  });
}

export default PreferencesDto;
