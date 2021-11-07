var mongoose = require('mongoose');
var userModel = mongoose.model('users', {
    _id: {type: String, required: true},
    id: {type: String, required: false},
    sid: {type: String, required: true},
    username: {type: String, required: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: true},
    groups: {type: String, required: true}
});
module.exports = userModel;