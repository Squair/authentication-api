import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

//Mongodb
import mongoose from 'mongoose';

//Allow CORS requests
import cors from 'cors';

import accountController from './controllers/accountController';
import accountValidation from './validation/accountValidation';

//TODO: Implement https

//const key = fs.readFileSync(__dirname + '/../certs/selfsigned.key', 'utf8');
//const cert = fs.readFileSync(__dirname + '/../certs/selfsigned.crt', 'utf8');
//const credentials = {
//  key: key,
//  cert: cert
//};

const app = express();

const uri = `mongodb://${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_COLLECTION}`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("Connected to mongodb using mongoose")).catch(err => console.log(err.reason));

app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//GET /users reads users from file and returns them in json
app.get('/users', accountController.GetUsers);

//POST /register will try to register a new user and add them to users.json
app.post('/register', accountController.Register);

//POST /delete will try to delete a user, checking they exist to be deleted first
app.post('/delete', accountController.Delete);

app.post('/login', accountValidation.LoginRequestValid, accountController.Login);

app.post('/validateToken', accountValidation.ValidateTokenRequestValid, accountController.ValidateToken);

//const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

//httpServer.listen(process.env.PORT);
//httpsServer.listen(process.env.PORT);

app.listen(process.env.HTTP_PORT);

export default app;
