"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const { ObjectID } = require("mongodb");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const bcrypt = require("bcrypt");

const LocalStrategy = require("passport-local");

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
  // 1, 2, Set up the engine template and template Power

  //change the response to render the Pug template
  app.route("/").get((req, res) => {
    res.render("index", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true,
      showRegistration: true,
    });
  });

  // Serialization and deserialization are now here...
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });

  // How to Use Passport Strategies, to login a user
  app
    .route("/login")
    .post(
      passport.authenticate("local", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/profile");
      },
    );

  // user profile route /profile
  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    res.render("profile", { username: req.user.username });
  });

  // login a user route /logout
  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  // middleware for missing pages
  app.use((req, res, next) => {
    res.status(404).type("text").send("Not Found");
  });

  /* Resgistration of new new users logic
  1. resgister the user
  2. Authenticate the new user
  3. Redirect to /profile

  Then we are going to hash the pasword before saving to our database
  */
  // Route /resgister
  app.route("/register").post(
    (req, res, next) => {
      myDataBase.findOne({ username: req.body.username }, (user, err) => {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          const hash = bcrypt.hashSync(req.body.password, 12);
          myDataBase.insertOne(
            {
              username: req.body.username,
              password: hash,
            },
            (err, doc) => {
              if (err) {
                res.redirect("/");
              } else {
                // The inserted document is held within
                // the ops property of the doc
                next(null, doc.ops[0]);
              }
            },
          );
        }
      });
    },
    passport.authenticate(
      "local",
      { failureRedirect: "/" },
      (req, res, next) => {
        res.redirect("/profile");
      },
    ),
  );

  /*6) authentication Strategies, coparing the hash password*/
  passport.use(
    new LocalStrategy((username, password, done) => {
      myDataBase.findOne({ username: username }, (err, user) => {
        console.log(`User ${username} attempted to log in.`);
        if (err) return done(err);
        if (!user) return done(null, false);
        if (!bcrypt.compareSync(password, user.password))
          return done(null, false);
        return done(null, user);
      });
    }),
  );
}).catch((e) => {
  // 1, 2, Set up the engine template and template Power
  app.route("/").get((req, res) => {
    res.render("index", { title: e, message: "Unable to connect to database" });
  });
});

// 8) Create New Middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
