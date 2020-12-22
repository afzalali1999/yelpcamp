// ROUTE PATH = "/campgrounds/:id/comments~"

const express = require('express');
const router = express.Router({ mergeParams: true });
const middleware = require('../middleware');
const Campground = require('../models/campground');
const Comment = require('../models/comment');

// Create comment route
router.post("/", middleware.isLoggedIn, function(req, res){ //This route actually adds the comment in. So we have to include isLoggedIn here in order to prevent anyone from making a comment. If you only add it to the get route, you are only hiding the form from the user. And theoretically, someone can still send a post request. So by adding isLoggedIn, that will just prevent anyone from adding a comment unless they're logged in. And if they're not logged in, it will just redirect back to "/login"
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            //create new comment //req.body.comment is a premade object that has everything we need to make a new comment. It has value like this {text: "bfkjsf", author: "befjkf"}
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Sorry! Something went wrong!");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id // THE REASON WHY we use req.user._id instead of User._id is because req.user has the data of the CURRENT USER that's logged in. User has many object items of users and express won't know which User._id to get //req.user contains the data of the current user that's logged in. If User[0] is currently logged in, the only way you can access, find, and use User[0] object item is by req.user //For ex: console.log(req.user) = { _id: 5b92a68949e0f26ecefd4a8f, username: 'afzal', __v: 0 }
                    comment.author.username = req.user.username
                    //save comment
                    comment.save();
                    //connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //redirect campground showpage
                    req.flash("success", "Successfully added a comment!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});


//New route
router.get("/new", middleware.isLoggedIn, function(req, res){ //So when a user makes a request to the page with the form, "comments/new", it will run isLoggedIn first. And that will check if the user is logged in. If the user is logged in, it calls next which will just call the function(req, res) callback, which will end up with us seeing the comments form. If the user is not logged in, then we redirect to "/login"
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

//Comment Edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    res.render("comments/edit", {campground_id: req.params.id, comment: req.comment}); // We don't need to find the entire correct Campground object item with all the associated data. All we need is the id and we're gona pass it thorugh campground_id. The correct campground id is already in campgrounds/:id so you can retreive it by req.params.id
});

//COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;