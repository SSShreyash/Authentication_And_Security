require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb://127.0.0.1:27017/UsersDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("home", {});
});

app.get("/register", function(req, res){
    res.render("register", {});
});

app.post("/register", function(req, res){
    const userName = req.body.username;
    const pass = req.body.password;

    const newUser = {
        email: userName,
        password: pass
    };

    User.create(newUser).then(function(){
        res.render("secrets", {});
    }).catch(function(err){
        res.send(err);
    });
});

app.get("/login", function(req, res){
    res.render("login", {});
});

app.post("/login", function(req, res){
    const userName = req.body.username;
    const pass = req.body.password;
    
    User.findOne({email: userName}).then(function(foundUser){
        if(foundUser){
            if(pass===foundUser.password)
                res.render("secrets", {});
            else
                console.log("Wrong Credentials!");
        }
        else
            res.send("User Not Found! Click on Register to get Signed Up.");
    }).catch(function(err){
       res.send(err);
    });
});

app.get("/submit", function(req, res){
    res.render("submit", {});
});

app.listen(3000 || process.env.PORT_NO, function (){
    console.log("Server started on port 3000.");
});