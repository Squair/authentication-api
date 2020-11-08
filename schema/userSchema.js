import mongoose from 'mongoose';
import Email from 'mongoose-type-email';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: Email, required: true },
    password: { type: String, required: true },
});

const user = mongoose.model('users', userSchema);

export default user;
