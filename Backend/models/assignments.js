var mongoose = require('mongoose');
var assModel = mongoose.model('assignments',{
    _id: {type: String, required: true},
    assignmentId: {type: String, required: false},
    title: {type: String, required: true},
    description: {type: String, required: false},
    date: {type: Number, required: true},
    completed: {type: String, required: true},
    groupId: {type: String, required: true}
});
module.exports = assModel;