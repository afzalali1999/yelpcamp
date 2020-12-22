var mongoose = require("mongoose");

//Schema setup
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: String,
    author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
    comments: [ //comments is an array not of entire comments but objectIds. We then need to populate the comments array with the actual comments instead of including the ObjectId
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment" //name of the model
        }
    ]
});

module.exports = mongoose.model("Campground", campgroundSchema); //defines model and makes Campground collection/Array // module.exports allows you to require this file in app.js