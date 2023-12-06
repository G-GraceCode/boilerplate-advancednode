"use strict";
require("dotenv").config();
const routes = require("./routes.js");
const auth = require("./auth.js");
const express = require("express");
const myDB = require("./connection");
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

/* 4)  Serialization of a User Object: Serialization and deserialization are important concepts in regards to authentication.  serial convert content into small key that can then be deserialized into the original object */
// see in the Implement part

app.set("view engine", "pug");
app.set("views", "./views/pug");

/* 5) Implement the serialization of a Pasport User*/
myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");

  routes(app, myDataBase);
  auth(app, myDataBase);
}).catch((e) => {
  // Set up the engine Template and Template power
  app.route("/").get((req, res) => {
    res.render("index", { title: e, message: "Unable to connect to database" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
