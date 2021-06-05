
import { IValidationError } from '../../interfaces/validationError';
import userOperations from '../userOperations';
import { IUser, UserModel } from 'mongoose-user-schema';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const GetUsers = async (req: Request, res: Response): Promise<Response> => {
    let json: IUser[] = await userOperations.getUsers();
    return res.status(200).json(json);
}

const Register = async (req: Request, res: Response): Promise<Response> => {
    let errorMessages: IValidationError[] = [];
    try {
        //Check if username already exists, otherwise create user

        if (await userOperations.getExistingUser(req.body.username)) {
            errorMessages = [...errorMessages, { field: "username", message: "A user with that username already exists." }];
            return res.status(409).send(errorMessages);
        }
        //Check fields are schema valid.
        let document: IUser = new UserModel({ username: req.body.username, password: req.body.password });

        await document.validate();

        return await userOperations.createNewUser(req.body.username, req.body.password, res);

    } catch (err) {
        if (err.errors) {
            let fieldErrors: { errors: [{ path: string; message: string; }]; } = err;
            for (let fieldError in fieldErrors.errors) {
                let error: IValidationError = { field: fieldErrors.errors[fieldError].path, message: fieldErrors.errors[fieldError].message };
                errorMessages = [...errorMessages, error];
            }
            return res.status(400).send(errorMessages);
        }

        errorMessages = [...errorMessages, { field: "Unknown", message: err.message }];
        return res.status(500).send(errorMessages);
    }
};

const Delete = async (req: Request, res: Response): Promise<Response> => {
    try {
        //If they exist delete otherwise return error response
        if (await userOperations.getExistingUser(req.body.username)) {
            return await userOperations.deleteUser(req.body.username, res);
        } else {
            return res.status(404).send({ message: `Could not delete user ${req.body.username} as they don't exist.` });
        }
    } catch {
        return res.status(500).send({ message: "Failed to delete user" });
    }
}

const Login = async (req: Request, res: Response): Promise<Response> => {
    let errorMessages: IValidationError[] = [];
    try {
        let foundUser = await userOperations.getExistingUser(req.body.username);
        if (!foundUser) {
            errorMessages = [...errorMessages, { field: 'username', message: `Could not find a user with the username: ${req.body.username}.` }];
            return res.status(404).send(errorMessages);
        }

        //Compare hashed passwords, if match login, otherwise return forbidden
        if (!await bcrypt.compare(req.body.password, foundUser.password)) {
            errorMessages = [...errorMessages, { field: 'password', message: 'The password you entered is incorrect.' }];
            return res.status(403).send(errorMessages);
        }

        //Check fields are currently schema valid.
        //let document: IUser = new UserModel({ username: req.body.username, password: req.body.password });
        //TODO: if this throws, guide user to changing their personal details to match schema.
        //await document.validate();

        //Uses HMAC SHA256 as encryption method by default, sign using secret token from .env file
        const accessToken: string = jwt.sign({ _id: foundUser._id, username: foundUser.username }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        });

        return res.status(200).send({ accessToken: accessToken });
    } catch (err) {
        if (err.errors) {
            let fieldErrors: { errors: [{ path: string, message: string }] } = err;

            //Filter out fields that already have existing errors
            let jsonArr = Object.keys(fieldErrors.errors);
            let fieldsWithoutExistingErrors = jsonArr.filter((schemaErr) => errorMessages[schemaErr] == undefined || errorMessages[schemaErr] == '');

            for (let validationError of fieldsWithoutExistingErrors) {
                let error: IValidationError = { field: fieldErrors.errors[validationError].path, message: fieldErrors.errors[validationError].message };
                errorMessages = [...errorMessages, error];
            }
            return res.status(400).send(errorMessages);
        }

        return res.status(500).send({ message: `Something went wrong while trying to login: ${err}` });
    }
}

const ValidateToken = async (req: Request, res: Response): Promise<Response> => {
    try {
        let accessToken: string = req.body.accessToken;

        //Verify the token using secret key from .env file and return user if valid
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded: { _id: string, username: string }) => {
            if (err) {
                return res.status(403).send({ message: "Token is not valid." });
            } else {
                return res.status(200).send(decoded);
            }
        });
    } catch (e) {
        return res.status(500).send({ message: `Something went wrong while trying to validate access token. ${e}` });
    }
}

export default { GetUsers, Register, Delete, Login, ValidateToken }