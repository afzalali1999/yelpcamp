const router = require('express').Router();
const User = require("../models/user");
const passport = require("passport");

//landing page route
router.get("/", function(req, res){
    res.render("landing");
});

//show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handle signup logic
router.post("/register", function(req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user){ //User.register() is also provided by the passportLocalMongoose package //User.register is going to create a new User object item
        if(err){
            req.flash("error", err.message); //try console.log(err) // This will return { name: 'UserExistsError', message: 'A user with the given username is already registered' }
            res.redirect("/register"); // return is just a nice way to short circuit and get out of this entire callback if we return.
        } else {//This is the same passport.authenticate() that we're using inside of register as we're using inside of login. The difference is that inside of register we're doing other things before we run passport.authenticate(). We're actually registering the user making a new user. And then if that works then we're logging the user in versus on "/login" the user is presumed to exist already. So all we do is passport.authenticate() which will log them in.
            passport.authenticate("local")(req, res, function(){ //So once the user has signed up then we're going to log them in, authenticate them and then we're going to redirect them to "/campgrounds"
                req.flash("success", "Welcome to YelpCamp " + user.username);
                res.redirect("/campgrounds");
            });
        }
    });
});

//show login form
router.get("/login", function(req, res) {
    res.render("login");
});

//handling logic route
router.post("/login", passport.authenticate("local", //middleware will call the authenticate method: passport.use(new LocalStrategy(User.authenticate())); So when we call passport.authenticate() on a local strategy, it will use the method that we didn't have to write. It was given to us for free by using the passport-local-mongoose package. But it's going to call .authenticate which will then take request.body.password and request.body.username and then it will authenticate that password with what we have stored in the database for that user. And it takes care of all the complex logic that we don't have to worry about.
    {
        successRedirect: "/campgrounds", //and then if it works, redirect to "/campgrounds"
        failureRedirect: "/login-failure", //if it doesn't work, redirect to "/login"
    }), function(req, res){ //and then we have this callback that doesn't do anything. We can get rid of that if we wanted to.
    
});

router.get('/login-failure', (req, res) => {
    req.flash("error", "Invalid username or password!");
    res.redirect('/login');
})

//logout route
router.get("/logout", function(req, res) {
    req.logout(); //This comes from the packages we have installed. So we didn't have to run this ourselves.
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

module.exports = router;