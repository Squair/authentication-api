import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const LoginRequestValid = async (req: Request, res: Response, next: NextFunction) => {
    body(['username', 'password']).not().isEmpty().withMessage((value) => {
        return {
            field: value,
            message: `${value.toUpperCase() + value.slice(1)} is required.`
        }
    });

    let errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).send(errors);
    }

    return next();
}

const ValidateTokenRequestValid = async (req: Request, res: Response, next: NextFunction) => {
    body('accessToken').not().isEmpty().withMessage((value) => {
        return {
            message: `${value.toUpperCase() + value.slice(1)} is required.`
        }
    });

    let errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).send(errors);
    }

    return next();
}

export default { LoginRequestValid, ValidateTokenRequestValid }