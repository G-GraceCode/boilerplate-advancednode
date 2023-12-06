const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = function (app, myDataBase) {
  // 1, 2, Set up the engine template and template Power

  //change the response to render the Pug template
  app.route("/").get((req, res) => {
    res.render("index", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true,
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

  // middleware for missing pages
  // app.use((req, res, next) => {
  //   res.status(404).type("text").send("Not Found");
  // });

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

  // Implementation of Social Authentication

  app.route("/auth/github").get(passport.authenticate("github"));
  app
    .route("/auth/github/callback")
    .get(
      passport.authenticate("github", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/profile");
      },
    );

  // login a user route /logout
  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });
  
};

// 8. Create New Middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
