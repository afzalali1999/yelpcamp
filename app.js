var express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    flash         = require("connect-flash"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User          = require("./models/user"),
    keys          = require('./config')();
    
mongoose.connect(
    `mongodb+srv://${keys.mongodbUsername}:${keys.mongodbPassword}@cluster0.tvoxc.mongodb.net/${keys.dbName}?retryWrites=true&w=majority`, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false
    }
);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // tell express to render ejs
app.use(express.static(__dirname + "/public")); //serve everything in public directory, which is just a single folder stylesheets and single file main.css, to use custom css //dirname refers to the directory that this script is running. If you console.log(__dirname), it will return the directory name, the whole path: /home/ubuntu/workspace/v5. By adding __dirname, we're just being safer. It's just conventional in nodejs
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); //User.authenticate() is not one that we wrote. It's one that comes with passportLocalMongoose. If we didn't have this package you would have to write that method ourself.
passport.serializeUser(User.serializeUser()); // User.serializeuser() & User.deserializeuser() also comes with passportLocalMongoose
passport.deserializeUser(User.deserializeUser());

//so we're using an app.use() which will call the function on every single route and we didn't have to go and write res.render("/campground", {currentUser = req.user}); on every single wroute
//So what we want to do is pass current user through every single route. And there's an easy way of doing that where we don't have to manually add it to every single route. We'll create our own middleware here. Whatever function we provide to it will be called on every route.
app.use(function(req, res, next){
    res.locals.currentUser = req.user //And what we want to do is pass that request at user to every single template and there's an easy way of doing that. You write this line: res.locals.currentUser = req.user; Whatever we put in rest.locals is what's available inside of our template //req.user contains the data of the current user that's logged in. If User[0] is currently logged in, the only way you can access, find, and use User[0] object item is by req.user. For ex: console.log(req.user) = { _id: 5b92a68949e0f26ecefd4a8f, username: 'afzal', __v: 0 }
    res.locals.error = req.flash("error"); //And just where we have the same code where we're doing currentUser where we passed currentUser to every single template we can do the same thing here with res.locals.message
    res.locals.success = req.flash("success");
    next(); //And then the other really important thing is you need to move on to the actual next code because this is a middleware that will run for every single route. If we don't have this next() it will just stop. Nothing will happen next so we need to have the next in order to move on to that next middleware which will actually be the route handler in most cases.
});

app.use('/', require('./routes/indexRoutes'));
app.use('/campgrounds', require('./routes/campgroundRoutes'));
app.use('/campgrounds/:id/comments', require('./routes/commentRoutes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
    console.log("Server is listening on port", PORT);
});