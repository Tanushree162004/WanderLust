if(process.env.NODE_ENV!= "production"){
  require('dotenv').config();
}




const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const passport = require("passport");   // authentication and authorization packages
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const session = require("express-session");     // session package require
const MongoStore = require("connect-mongo");
const flash =require("connect-flash");            // flash

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine( 'ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

//mongo store
const store = MongoStore.create({
mongoUrl: dbUrl,
crypto: {
  secret: process.env.SECRET,
},
touchAfter: 24 * 3600,
});

store.on("error", () => {
console.log("ERROR in MONGO SESSION STORE", err) ;
});

// session
const sessionOptions = {
store,
secret: process.env.SECRET,
resave: false,
saveUninitialized: true,
cookie:{
  expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
},

};



app.get("/", (req, res) => {
  res.redirect("/listings");
});


app.use(session(sessionOptions));
app.use(flash());    // before routes we have to use flash

// authorization and authentication local strategy (define after session)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//  flash code
app.use((req, res , next)=>{        
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;  // we cant use req.user directly in ejs 
  next();
});

//demo user
// app.get ("/demouser", async (req, res) => {
// let fakeUser = new User({
// email: "student@gmail.com",
// username: "delta-student",
// });

// let registeredUser = await User.register(fakeUser, "helloworld");
// res.send(registeredUser) ;
// });

// listing and reviews and user
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// error handler 

app.all("{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

// middleware- our customized error // expresserror
app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Something went wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{message});
});


// app.listen(8080, () => {
//   console.log("server is listening to port 8080");
// });
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
