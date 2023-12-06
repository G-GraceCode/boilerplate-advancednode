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

// changing the server to http, set the environment for socket.io
const http = require("http").createServer(app);
const io = require("socket.io")(http);

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

app.use(passport.initialize());
app.use(passport.session());

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

  let currentUsers = 0;
  io.on("connection", (socket) => {
    currentUsers = +1; // increasing the amount of users
    io.emit("user count", currentUsers);
    console.log("A user has connected");

    // Handle a Disconnect, when a user log out
    socket.on("disconnect", () => {
      currentUsers = -1; // discreasing the amount of users
      io.emit("user count", currentUsers);
      console.log("A user has disconnected");
    });
  });

  /* Communicate by Emitting
Emit is the most common way of communicating you will use. When you emit something from the server to 'io', you send an event's name and data to all the connected sockets, now the client can list in the client.js*/
}).catch((e) => {
  // Set up the engine Template and Template power
  app.route("/").get((req, res) => {
    res.render("index", { title: e, message: "Unable to connect to database" });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
