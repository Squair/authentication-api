import userSchema, { IUser } from '../schema/userSchema';
import { Response } from 'express';
import bcrypt from 'bcrypt';

//Insert one document into collection
const insertUser = async (user: IUser, res: Response) => {
    user.save((err) => {
        if (err) return res.status(400).send(err);
        res.status(201).send({ message: "Successfully created user." });
    });
}

const getUsers = async (): Promise<IUser[]> => {
    //Return all users
    return await userSchema.find({});
}

//Check to see if user already exists
const getExistingUser = async (username: string, usersToSearch: IUser[] = null) => {
    if (usersToSearch === null) {
        usersToSearch = await getUsers();
    }
    return usersToSearch.find(users => users.username === username);
}

const createNewUser = async (username: string, password: string, res: Response) => {
    const hashPass = await bcrypt.hash(password, 10);
    //Create new document using Model
    let newUser: IUser = new userSchema({ username: username, password: hashPass });
    return await insertUser(newUser, res);
}

//Filter the users in users.json and rewrite new file
const deleteUser = async (username: string, res: Response) => {
    userSchema.findOneAndDelete({ username: `${username}` }, null, (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send("User was successfully deleted.");
    });
}

export default {
    insertUser,
    getUsers,
    getExistingUser,
    createNewUser,
    deleteUser
}