import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { 
        type: String, 
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address.'], 
        required: [true, 'Email is required.'] 
    },
    password: { 
        type: String, 
        match: [/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/, 'Password must contain at least one number, one lowercase and one uppercase letter and be at least six characters.'], 
        required: [true, 'Password is required.'] 
    }
});

const user = mongoose.model('users', userSchema);

export default user;
