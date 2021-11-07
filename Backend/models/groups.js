var mongoose = require('mongoose');
var userModel = mongoose.model('users',{
    _id: {type: String, required: true},
    groupId: {type: Number, required: false},
    name: {type: Number, required: true},
    leaderId: {type: Number, required: true},
    leaderName: {type: String, required: true},
    members: {type: String, required: true},
    assignments: {type: String, required: true}
});
module.exports = userModel;