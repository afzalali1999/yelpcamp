// all the middleware goes here
var Campground = require("../models/campground"),
    Comment    = require("../models/comment");

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next){ //next is the function that is going to be called after middleware
    if(req.isAuthenticated()){ //we'll check if a request is authenticated. If that's the case then we'll just move on to the next thing which in our case would be moving on to rendering the new campground or the new comment form or otherwise redirect to log in.
        return next();
    }
    req.flash("error", "You need to be logged in to do that!"); // the first parameter of req.flash() is the key and the second parameter of req.flash() is the value. We write this line BEFORE we redirect. Flash isn't going to flash itself immediately. It only works or shows up until the next page. So you actually do it before you redirect. // When you refresh the page, Flash is going to go away.
    res.redirect("/login");
}

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    // is user logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err || !foundCampground){
                console.log(err);
                req.flash("error", "Sorry, that campground does not exist!");
                res.redirect('/campgrounds');
            } else if(foundCampground.author.id.equals(req.user._id)){ // does user own the campground //foundCampground.author.id and req.user._id look like they're identical, but behind the scenes theyr'e actually not the same. So req.user._id is a String. And foundCampground.author.id is a mongoose object. So when we compare them with triple equals or double equals: if(foundCampground.author.id === req.user._id), it won't work. What we can do instead is use a method that mongoose gives us for this purpose. We use .equals: if(foundCampground.author.id.equals(req.user._id))
                req.campground = foundCampground;
                next(); //Rather than res.render("campgrounds/edit", {campground: foundCampground}); We don't always want this middleware to render edit. What we want it to do is move on to the rest of the code in delete or move on to the code update or an edit. So that's where we do next()
            } else {
                req.flash("error", "You don't have permission to do that!");
                res.redirect("back");
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back"); //We can do res.redirect("back") and that will take the user back to where they came from, the previous page that they were on.
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    // is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment){
                console.log(err);
                req.flash("error", "Sorry, that comment does not exist!");
                res.redirect('/campgrounds');
            // does user own the campground //foundCampground.author.id and req.user._id look like they're identical, but behind the scenes theyr'e actually not the same. So req.user._id is a String. And foundCampground.author.id is a mongoose object. So when we compare them with triple equals or double equals: if(foundCampground.author.id === req.user._id), it won't work. What we can do instead is use a method that mongoose gives us for this purpose. We use .equals: if(foundCampground.author.id.equals(req.user._id))
            } else if(foundComment.author.id.equals(req.user._id)){
                    req.comment = foundComment;
                    next(); //Rather than res.render("campgrounds/edit", {campground: foundCampground}); We don't always want this middleware to render edit. What we want it to do is move on to the rest of the code in delete or move on to the code update or an edit. So that's where we do next()
            } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back"); //We can do res.redirect("back") and that will take the user back to where they came from, the previous page that they were on.
    }
}

module.exports = middlewareObj;