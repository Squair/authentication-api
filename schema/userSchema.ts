import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string;
}

const userSchema:Schema = new Schema({
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

export default mongoose.model<IUser>('users', userSchema);