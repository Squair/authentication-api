import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

//Mongodb
import dbConnection from 'mongoose-db-connection';

import userModel from './userModel';
import userSchema, { IUser } from '../schema/userSchema';

//Used for hashing passwords
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';

//JWT
import jwt from 'jsonwebtoken';

//Allow CORS requests
import cors from 'cors';

import { IValidationError } from '../interfaces/validationError';

//TODO: Implement https

//const key = fs.readFileSync(__dirname + '/../certs/selfsigned.key', 'utf8');
//const cert = fs.readFileSync(__dirname + '/../certs/selfsigned.crt', 'utf8');
//const credentials = {
//  key: key,
//  cert: cert
//};

const app = express();

dbConnection.connect(`mongodb://${process.env.IP}:${process.env.MONGO_PORT}/${process.env.MONGO_COLLECTION}`);

app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//GET /users reads users from file and returns them in json
app.get('/users', async (req, res) => {
    let json: IUser[] = await userModel.getUsers();
    res.status(200).json(json);
});

//POST /register will try to register a new user and add them to users.json
app.post('/register', async (req, res) => {
    let errorMessages: IValidationError[] = []
    try {
        //Check if username already exists, otherwise create user
        if (!await userModel.getExistingUser(req.body.username)) {
            //Check fields are schema valid.
            let document: IUser = new userSchema({ username: req.body.username, password: req.body.password });
            document.validate(async (validateErrors: any) => {
                if (validateErrors) {
                    let fieldErrors: { errors: [{ path: string, message: string }] } = validateErrors;
                    for (let fieldError in fieldErrors.errors) {
                        let error: IValidationError = { field: fieldErrors.errors[fieldError].path, message: fieldErrors.errors[fieldError].message };
                        errorMessages = [...errorMessages, error];
                    }
                    return res.status(400).send(errorMessages);
                } else {
                    return await userModel.createNewUser(req.body.username, req.body.password, res);
                }
            });
        } else {
            errorMessages = [...errorMessages, { field: "username", message: "A user with that username already exists." }];
            return res.status(409).send(errorMessages);
        }
    } catch (err) {
        errorMessages = [...errorMessages, { field: "Unknown", message: err }];
        return res.status(500).send(errorMessages);
    }
});

//POST /delete will try to delete a user, checking they exist to be deleted first
app.post('/delete', async (req, res) => {
    try {
        //If they exist delete otherwise return error response
        if (await userModel.getExistingUser(req.body.username)) {
            return await userModel.deleteUser(req.body.username, res);
        } else {
            return res.status(404).send({ message: `Could not delete user ${req.body.username} as they don't exist.` });
        }
    } catch {
        return res.status(500).send({ message: "Failed to delete user" });
    }
});

app.post('/login', async (req, res) => {
    let errorMessages: IValidationError[] = [];
    try {
        let fields = ['username', 'password'];
        for (let field of fields) {
            if (req.body[field] == undefined || req.body[field] == '') {
                errorMessages = [...errorMessages, { field: field, message: `${field[0].toUpperCase() + field.slice(1)} is required.` }];
            }
        }

        //If both fields are empty, stop execution here.
        if (errorMessages.length == fields.length) return res.status(400).send(errorMessages);

        //Check fields are schema valid.
        let document: IUser = new userSchema({ username: req.body.username, password: req.body.password });
        document.validate(async (validateErrors: any) => {
            if (validateErrors) {
                let fieldErrors: { errors: [{ path: string, message: string }] } = validateErrors;
                
                //Filter out fields that already have existing errors
                let jsonArr = Object.keys(fieldErrors.errors);
                let fieldsWithoutExistingErrors = jsonArr.filter((schemaErr) => errorMessages[schemaErr] == undefined || errorMessages[schemaErr] == '');

                for (let validationError of fieldsWithoutExistingErrors) {
                    let error: IValidationError = { field: fieldErrors.errors[validationError].path, message: fieldErrors.errors[validationError].message };
                    errorMessages = [...errorMessages, error];
                }
                return res.status(400).send(errorMessages);
            } else {
                //Check user exists
                let foundUser = await userModel.getExistingUser(req.body.username);
                if (!foundUser) {
                    errorMessages = [...errorMessages, { field: 'username', message: `Could not find a user with the username: ${req.body.username}.` }];
                    return res.status(404).send(errorMessages);
                }

                //Compare hashed passwords, if match login, otherwise return forbidden
                if (await bcrypt.compare(req.body.password, foundUser.password)) {
                    //Uses HMAC SHA256 as encryption method by default, sign using secret token from .env file
                    const accessToken: string = jwt.sign(foundUser, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '1h'
                    });
                    return res.status(200).send({ accessToken: accessToken });
                } else {
                    errorMessages = [...errorMessages, { field: 'password', message: 'The password you entered is incorrect.' }];
                    return res.status(403).send(errorMessages);
                }
            }
        });
    } catch (err) {
        return res.status(500).send({ message: `Something went wrong while trying to login: ${err}` });
    }
});

app.post('/validateToken', async (req, res) => {
    try {
        let accessToken: string = req.body.accessToken;

        if (accessToken == null) {
            return res.sendStatus(400).send({ message: "parameter: accessToken cannot be null." });
        }

        //Verify the token using secret key from .env file and return user if valid
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded: IUser) => {
            if (err) {
                return res.status(403).send({ message: "Token is not valid." });
            } else {
                return res.status(200).send(decoded.username);
            }
        });
    } catch (e) {
        return res.status(500).send({ message: `Something went wrong while trying to validate access token. ${e}` });
    }
});

//const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

//httpServer.listen(process.env.PORT);
//httpsServer.listen(process.env.PORT);

app.listen(process.env.HTTP_PORT);

