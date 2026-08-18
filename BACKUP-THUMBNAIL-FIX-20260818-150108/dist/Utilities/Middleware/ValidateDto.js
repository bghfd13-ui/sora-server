import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import Resp from "../Libraries/Resp.js";
function ValidateDto(dtoClass) {
    return async (req, res, next) => {
        const instance = plainToInstance(dtoClass, req.body);
        const errors = await validate(instance);
        if (errors.length > 0) {
            return Resp(res, 400, "", false, { errors });
        }
        req.body = instance;
        next();
    };
}
export default ValidateDto;
