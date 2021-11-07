var mongoose = require('mongoose');
var groupModel = mongoose.model('groups',{
    _id: {type: String, required: true},
    groupId: {type: String, required: false},
    name: {type: String, required: true},
    leaderId: {type: String, required: true},
    leaderName: {type: String, required: true},
    members: {type: String, required: true},
    assignments: {type: String, required: true}
});
module.exports = groupModel;