import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

//Mongodb
import mongooseConnection from './source/dbConnection.js'
import userModel from './source/userModel.js';

//Used for hashing passwords
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';

//JWT
import jwt from 'jsonwebtoken';

//Allow CORS requests
import cors from 'cors';

//TODO: Implement https

//const key = fs.readFileSync(__dirname + '/../certs/selfsigned.key', 'utf8');
//const cert = fs.readFileSync(__dirname + '/../certs/selfsigned.crt', 'utf8');
//const credentials = {
//  key: key,
//  cert: cert
//};

const app = express();

mongooseConnection.connect();

app.use(cors({origin: '*'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//GET /users reads users from file and returns them in json
app.get('/users', async (req, res) => {
    let json = await userModel.getUsers();
    res.status(200).json(json);
});

//POST /register will try to register a new user and add them to users.json
app.post('/register', async (req, res) => {
    try {
        //Check if username already exists, otherwise create user
        if (!await userModel.getExistingUser(req.body.username, res)) {
            await userModel.createNewUser(req.body.username, req.body.password, res);
        } else {
            res.status(409).send("A user with that username already exists.");
        }
    } catch {
        res.status(500).send("Something went wrong when trying to register a new user.");
    }
});

//POST /delete will try to delete a user, checking they exist to be deleted first
app.post('/delete', async (req, res) => {
    try {
        //If they exist delete otherwise return error response
        if (await userModel.getExistingUser(req.body.username)) {
            await userModel.deleteUser(req.body.username, res);
        } else {
            res.status(404).send(`Could not delete user ${req.body.username} as they don't exist.`);
        }
    } catch {
        res.status(500).send("Failed to delete user")
    }
});

app.post('/login', async (req, res) => {
    try {
        let foundUser = await userModel.getExistingUser(req.body.username, res);
        if (!foundUser) {
            return res.status(404).send({ message: `Could not find a user with the username: ${req.body.username}.` });
        }

        //Compare hashed passwords, if match login, otherwise reject
        if (await bcrypt.compare(req.body.password, foundUser.password)) {
            //Uses HMAC SHA256 as encryption method by default, sign using secret token from .env file
            const accessToken = jwt.sign(foundUser, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "5m"
            });
            return res.status(200).send({ accessToken: accessToken });
        } else {
            return res.status(403).send({ message: "The password you entered is incorrect." });
        }
    } catch {
        return res.status(500).send({ message: "Something went wrong while trying to login." });
    }
});

app.post('/validateToken', async (req, res) => {
    try {
        let accessToken = req.body.accessToken;

        if (accessToken == null) {
            return res.sendStatus(400).send({ message: "accessToken was null." });
        }

        //Verify the token using secret key from .env file and return user if valid
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(403).send({ message: "Token is not valid." });
            } else {
                return res.status(200).send(user);
            }
        });
    } catch {
        return res.status(500).send({ message: "Something went wrong while trying to validate access token." });
    }
});

//const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

//httpServer.listen(process.env.PORT);
//httpsServer.listen(process.env.PORT);

app.listen(process.env.HTTP_PORT);

export default app;