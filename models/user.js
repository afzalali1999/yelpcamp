var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose); // passportLocalMongoose basically takes the wheel and it starts to add in some methods to our User model.

module.exports = mongoose.model("User", userSchema); //User is singular, and the Schema is to construct the User from