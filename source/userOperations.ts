import { IUser, UserModel } from 'mongoose-user-schema';
import { Response } from 'express';
import bcrypt from 'bcrypt';

//Insert one document into collection
const insertUser = async (user: IUser, res: Response): Promise<Response> => {
    await user.save();
    return res.status(201).send({ message: "Successfully created user." });
}

const getUsers = async (): Promise<IUser[]> => {
    //Return all users
    return await UserModel.find({});
}

//Check to see if user already exists
const getExistingUser = async (username: string, usersToSearch: IUser[] = null): Promise<IUser> => {
    if (usersToSearch === null) {
        usersToSearch = await getUsers();
    }
    return usersToSearch.find(users => users.username === username);
}

const createNewUser = async (username: string, password: string, res: Response): Promise<Response> => {
    const hashPass = await bcrypt.hash(password, 10);
    //Create new document using Model
    let newUser: IUser = new UserModel({ username: username, password: hashPass });
    return await insertUser(newUser, res);
}

//Filter the users in users.json and rewrite new file
const deleteUser = async (username: string, res: Response): Promise<Response> => {
    await UserModel.findOneAndDelete({ username: `${username}` });
    return res.status(200).send({ message: "User was successfully deleted." });
}

export default {
    insertUser,
    getUsers,
    getExistingUser,
    createNewUser,
    deleteUser
}