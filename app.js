require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session(
        {secret: 'my secret',
         resave: false,
         saveUninitialized: false
        })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/UsersDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home", {});
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated())
        res.render("secrets", {});
    else
        res.redirect("/login");
});

app.get("/register", function(req, res){
    res.render("register", {});
});

app.post("/register", function(req, res){
    User.register({username: req.body.username, active: false}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })
});

app.get("/login", function(req, res){
    res.render("login", {});
});

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/login");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.get("/logout", function (req, res){
    req.logout(function (err){
        if(err)
            console.log(err);
        res.redirect("/");
    });   
});

app.get("/submit", function(req, res){
    res.render("submit", {});
});

app.listen(3000 || process.env.PORT_NO, function (){
    console.log("Server started on port 3000.");
});