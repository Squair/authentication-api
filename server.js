const express = require('express')
const app = express()
//Used for hashing passwords
const bcrypt = require('bcrypt')
//File system with promises
const fs = require('fs').promises
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

//GET /users reads users from file and returns them in json
app.get('/users', async (req, res) => {
    json = await getUsers()
    res.json(json)
})

//GET /register returns the register html page
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html')
})

//POST /register will try to register a new user and add them to users.json
app.post('/register', async (req, res) => {
    try {
        //Get users
        let users = await getUsers()

        //Check if username already exists, otherwise create user
        if (!getExistingUser(users, req.body.name)) {
            await createNewUser(users, req.body.name, req.body.password)
            res.send("user created")
            return res.status(201).send()
        } else {
            return res.status(500).send("User already exists")
        }
    } catch {
        res.status(500).send("Something went wrong registering new user")
    }
})

//GET /delete returns the delete html page
app.get('/delete', (req, res) => {
    res.sendFile(__dirname + '/delete.html')
})

//POST /delete will try to delete a user, checking they exist to be deleted first
app.post('/delete', async (req, res) => {
    try {
        let users = await getUsers()
        //If they exist delete otherwise return error response
        if (getExistingUser(users, req.body.name)) {
            deleteUser(users, req.body.name)
            res.status(200).send("Deleted user")
        } else {
            res.status(500).send("Failed to delete user, they dont exist")
        }
    } catch {
        res.status(500).send("Failed to delete user")
    }
})

//GET /login returns the login html page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html')
})

app.post('/login', async (req, res) => {
    try {
        //Get users
        let users = await getUsers()

        //Get user details from file
        foundUser = getExistingUser(users, req.body.name)
        if (!foundUser) {
            return res.status(404).send('Cannot find user')
        }

        //Compare hashed passwords, if match login, otherwise reject
        if (await bcrypt.compare(req.body.password, foundUser.password)) {
            res.send("Success");
        } else {
            res.send("Passwords do not match")
        }
    } catch {
        res.status(500).send("Error logging in")
    }
})

app.listen(3000)

//Read users.json and return file, if empty return empty array
async function getUsers() {
    let json = await fs.readFile('./users.json', 'utf8', (err, data) => {
                if (err) {
                    return res.status(500).send(err)
                } else {
                    res.status(200).send("Read succesfully")
                    return data
                }
            })
    return json.length > 0 ? JSON.parse(json) : []
}

//Check to see if user already exists
function getExistingUser(users, username) {
    return users.find(users => users.name === username)
}

//Map data to json object, hash password and push into users array before rewriting to file
async function createNewUser(users, user, password) {
    const hashPass = await bcrypt.hash(password, 10)
    const newUser =
    {
        id: users.length + 1,
        name: user,
        password: hashPass
    }
    users.push(newUser)
    return await fs.writeFile('users.json', JSON.stringify(users, null, 4))
}

//Filter the users in users.json and rewrite new file
async function deleteUser(users, username) {
    let newUsers = users.filter(x => x.name !== username)
    return await fs.writeFile('users.json', JSON.stringify(newUsers, null, 4))
}