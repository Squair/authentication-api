import userModel from '../schema/userSchema.js';
import bcrypt from 'bcrypt';

//Insert one document into collection
const insertUser = async (data, res) => {
    //Create new document using Model
    let document = new userModel(data);
    document.save((err) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({message: "Successfully created user."});
    });
}

const getUsers = async () => {
    //Return all users
    return await userModel.find({}); 
}

//Check to see if user already exists
const getExistingUser = async (username, res, usersToSearch = null) => {
    if (usersToSearch === null){
        usersToSearch = await getUsers();
    }
    return await usersToSearch.find(users => users.username === username);
}

const createNewUser = async (username, password, res) => {
    const hashPass = await bcrypt.hash(password, 10);
    const newUser =
    {
        username: username,
        password: hashPass
    }
    return await insertUser(newUser, res);
}

//Filter the users in users.json and rewrite new file
const deleteUser = async (username, res) => {
    userModel.findOneAndDelete({username: `${username}`}, (err) => {
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