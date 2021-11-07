var mongoose = require('mongoose');
var userModel = mongoose.model('users',{
    _id: {type: String, required: true},
    id: {type: Number, required: false},
    apid: {type: String, required: true},
    username: {type: String, required: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    groups: {type: String,  required: true}
});
module.exports = userModel;