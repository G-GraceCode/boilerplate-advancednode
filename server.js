"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const { ObjectID } = require("mongodb");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

// setting up passport
const session = require("express-session");
const passport = require("passport");

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setting up the middleware of passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

passport.initialize();
passport.session();

// passport setting end,

/*4)  Serialization of a User Object: Serialization and deserialization are important concepts in regards to authentication.  serial convert content into small key that can then be deserialized into the original object*/

// Serialization of a User Object
// passport.serializeUser((user, done) => {
//   done(null, user._id);
// });

// passport.deserializeUser((id, done) => {
//   myDataBase.findOne({ _id: new objectID(id) }, (err, doc) => {
//     done(null, doc);
//   });
// });

app.set("view engine", "pug");
app.set("views", "./views/pug");

/*Implement the serialization of a Pasport User*/
myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");
  // 1, 2, Set up the engine template and template Power
  //change the response to render the Pug template
  app.route("/").get((req, res) => {
    res.render("index", {
      title: "Connected to Database",
      message: "Please login",
    });
  });

  // Serialization and deserialization are now here...
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new objectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });
}).catch((e) => {
  // 1, 2, Set up the engine template and template Power
  app.route("/").get((req, res) => {
    res.render("index", { title: e, message: "Unable to connect to database" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
