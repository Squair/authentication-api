import mongoose, { ConnectionOptions } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri: string = `mongodb://${process.env.IP}:${process.env.MONGO_PORT}/${process.env.MONGO_COLLECTION}`;
const reconnectTimeout: number = 5000;

const connect = async() => {
    let options: ConnectionOptions = { useNewUrlParser: true, useUnifiedTopology: true };
    mongoose.connect(uri, options).catch(err => console.log(err.reason));
}

mongoose.connection.on('connected', () => {
    console.log("Connected to mongodb using mongoose");
});

//On disconnection event
mongoose.connection.on('disconnected', async () => {
    console.log("Disconnected from mongodb");
    setTimeout(async () => await connect(), reconnectTimeout);
});

export default { connect };