const express = require("express");
const zod = require("zod");
const { Account, User } = require("../db");
const jwt= require("jsonwebtoken");
const JWT_SECRET = require("../config");
const authMiddleware = require("../middleware");

const userRouter = express.Router();

// signup

const signupSchema = zod.object({
    username: zod.string().email(),
    firstname: zod.string(),
    lastname: zod.string(),
    password: zod.string()
});

userRouter.post("/signup", async (req, res) => {    
    const body = req.body;
    const { success } = signupSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            msg: "Incorrect inputs, enter correct details (username=email)"
        });
    }
    // vaildation of strings passed now see if the username is already used
    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "username already taken"
        });
    }
    // user not exists create user
    const user = await User.create({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password
    });
    // get id of user created to create account and jwt token
    const userId = user._id;
    // create account for user
    Account.create({
        userId,
        balance: 1 + Math.random()*1000
    })
    // create jwt token
    const token = jwt.sign({
        userId
    }, JWT_SECRET);
    
    return res.json({
        message: "User is created",
        token: token, 
        name: user.firstname,        
    });    
})


//signin
const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

userRouter.post("/signin", async (req, res) => {
    const body = req.body;
    const { success } = signinSchema.safeParse(req.body);
    if (!success) {
        return res.json({
            message: "You need to enter valid credentials"
        });
    }

    const existingUser = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if (existingUser) {
        if (req.body.password === existingUser.password) {
            // create token using id
            const userId = existingUser._id;
            const token = jwt.sign({
                userId
            }, JWT_SECRET);
            
            return res.json({
                message: "you are authenticated",
                token: token, 
                name: existingUser.firstname,                
            });

        } else {
            return res.status(401).json({
                message: "Entered wrong password"
            })
        }
    }
})

// update exisiting user information

const updateSchema = zod.object({
    password: zod.string(),
    firstname: zod.string(),
    lastname: zod.string()
});

    

userRouter.put("/update", authMiddleware, async (req, res) => {
    const { success } = updateSchema.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        _id: req.userId
    })

    return res.json({
        message: "Updated successfully"
    })
})

// get the list of users using filter query no auth
userRouter.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstname: {
                "$regex": filter
            }
        }, {
            lastname: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})


    


module.exports = userRouter;