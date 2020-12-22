// ROUTE PATH = "/campgrounds~"
const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const Campground = require('../models/campground');

// const app = express();
// router.use('/:id/comments', require('./commentRoutes'));

//INDEX - show all campgrounds
router.get("/", function(req, res){
    //get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds){ //allCampgrounds is the data coming back from Campground collection //{} is all of the data
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds}); //req.user will contain the username and the ID of the currently logged in user.
        }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: desc, author: author}
    //Create a new campground and save to a database
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds"); //redirect back to campgrounds array
        }
    });
    
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) { //routes with :id should be mentioned last
    //find the campground with provided id //So we're finding the correct campground item, and then we're channeling this populate comments which will actually populate the comments to look up all those object IDs find the correct data(comments) and then stick it in the comments array and then we run exec to actually start the query.
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){ //foundCampground is the data coming back from Campground collection //findById(id, callback)// findById is a mongoose function to find a document by its _id
        if(err || !foundCampground){
            console.log(err);
            return res.status(400).send("Item not found");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//OLD edit campground route
// app.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
//     Campground.findById(req.params.id, function(err, foundCampground) {
//         if (!foundCampground) {
//             return res.status(400).send("Item not found.")
//         }
//         res.render("campgrounds/edit", {campground: foundCampground});
//     });
// });
//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
  //render edit template with that campground
  res.render("campgrounds/edit", {campground: req.campground});
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground //findByIdAndUpdate is a mongoose function and takes a few arguments. First is what id are we looking for and the second is the data that we want to update
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            //redirect somewhere (show page)
            res.redirect("/campgrounds/" + req.params.id); //We can also write updatedCamground._id in place of req.params.id
        }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;