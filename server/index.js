
const express = require('express');
const path = require('path');

const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');


const { response } = require('express');
const saltRound = 10

const jwt = require('jsonwebtoken')


const app = express()
app.use(express.json());

app.use(cors({
    origin: ("http://54.251.93.15:3000"),
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    key: "userId",
    secret: "welcome",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
    }
}))

const db = mysql.createConnection({
    user: "keerthana",
    host: "localhost",
    password: "Keerthu@0805",
    database: "shoppingsystem"

})


app.post("/list", (req, res) => {

    const title = req.body.title
    const price = req.body.price
    const image = req.body.image


    db.query("INSERT INTO productlist(title,price,image)VALUES(?,?,?)", [title, price, image], (err, result) => {
        console.log(err)
    })
})


app.post("/sellerpage", (req, res) => {
    const id = req.body.id
    const title = req.body.title
    const price = req.body.price
    const image = req.body.image

    db.query("INSERT INTO addproduct(id,title,price,image)VALUES(?,?,?,?)", [id, title, price, image], (err, result) => {
        console.log(err)
    })
})


app.get('/product', (req, res) => {
    const id = req.body.id
    const title = req.body.title
    const price = req.body.price
    const image = req.body.image

    db.query("SELECT * FROM addproduct", (err, result, fields) => {
        if (err) {
            console.log(err);
        } res.json(result)
    })
})







app.post("/register", (req, res) => {

    const username = req.body.username
    const password = req.body.password

    bcrypt.hash(password, saltRound, (err, hash) => {
        if (err) {
            console.log(err)
        }
        db.query("INSERT INTO register(username,password)VALUES(?,?)", [username, hash], (err, result) => {
            console.log(err)
        })
    })

})
const verifyJWT=(req,res,next)=>{
    const token=req.headers("x-access-token")

    if(!token){
        res.send('need token')
    }else{
        jwt.verify(token,"jwtSecret",(err,decoded)=>{
            if(err){
                res.json({auth:false, message:"failed to authenticate"})
            }else{
                req.userUsername=decoded.username;
                next();
            }
        });
    }
};


app.get('/isUserAuth',verifyJWT,(req,res)=>{
    res.send("authenticated")
})




app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user })
    } else {
        res.send({ loggedIn: false })
    }
})


app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query("SELECT * FROM register WHERE username=?", username, (err, result) => {
        if (err) {
            res.send({ err: err })
        }
        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (err, response) => {
                if (response) {
                    const username=result[0].username
                    const token=jwt.sign({username},"jwtSecret",{
                        expiresIn:300,
                    })
                    req.session.user = result;

                  res.json({auth: true, token:token, result:result})  
                    
                } else {
                    res.json({ auth:false, message: "wrong username password combination" })
                }
            })
        } else {
            res.json({ auth:false, message: "no user exist" })
        }
    });


});

app.post('/admin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    db.query("SELECT * FROM admin WHERE username=? AND password=?", [username, password], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            if (result) {

            }
        }
    }
    )
})


app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(5000, () => {
    console.log("server running")
})
