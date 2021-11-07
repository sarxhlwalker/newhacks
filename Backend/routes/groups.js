const express = require('express');
const router = express.Router();

const userModel = require('../models/users');
const groupModel = require('../models/groups');

const funcs = require("../funcs.js");

const mongoose = require("mongoose");

/*
 * Get a logged in user's groups: takes in user sid returns a list of groups (objects) the user is enrolled in
 */
router.post('/get', async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({sid: sid});
    if (!resUser) {
        res.send({
            ok: false,
            error: 'Invalid sid',
            data: {sid: sid}
        });
    } else {
        let groups = JSON.parse(resUser.groups);
        res.send({
            ok: true,
            error: null,
            data: {groups: groups}
        });
    }
});

/*
 * Create a new group with the user as the leader (Takes in group name, and user sid, returns the result of trying to
 * save the group to the model
 */
router.post('/create', async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({sid: sid});
    if (!resUser) {
        res.send({
            ok: false,
            error: 'Invalid sid',
            data: {sid: sid}
        });
    } else {
        let myGid = funcs.generateTextId(5);
        let repeats = await groupModel.findOne({groupId: myGid});
        while (repeats) {
            myGid = funcs.generateTextId(5);
            repeats = await groupModel.find({groupId: myGid});
        }
        let group = {
            _id: new mongoose.Types.ObjectId(),
            groupId: myGid,
            name: req.body.name,
            leaderId: resUser.id,
            leaderName: resUser.username,
            members: JSON.stringify([resUser.id]),
            assignments: JSON.stringify([])
        }
        let errs = await funcs.validateGroup(group)
        if (errs.length > 0) {
            res.send({
                ok: false,
                error: errs,
                data: null
            })
        } else {
            let result = await groupModel.create(group);
            let curr_groups = JSON.parse(resUser.groups);
            let res2 = await userModel.updateOne({id: resUser.id}, {groups: JSON.stringify(curr_groups.concat(group.groupId))})
            res.send({
                ok: true,
                errors: null,
                data: result
            })
        }
    }
});

/*
 * Join a group, takes in the user sid and group id (5 alphanum), returns the result of trying to update
 * the user's model group data
 */
router.post('/join', async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({sid: sid});
    if (!resUser) {
        res.send({
            ok: false,
            error: 'Invalid sid',
            data: {sid: sid}
        });
    } else {
        let groupFind = await groupModel.findOne({groupId: req.body.groupId});
        if (!groupFind) {
            res.send({
                ok: false,
                error: 'Group not found',
                data: null
            });
        } else {
            let curr_members = JSON.parse(groupFind.members);
            let curr_groups = JSON.parse(resUser.groups);
            if (resUser.id in curr_members || groupFind.groupId in curr_groups) {
                res.send({
                    ok: false,
                    error: 'Already in group',
                    data: null
                })
            } else {
                let res1 = await groupModel.updateOne({groupId: groupFind.groupId}, {members: JSON.stringify(curr_members.concat(resUser.id))});
                let res2 = await userModel.updateOne({id: resUser.id}, {groups: JSON.stringify(curr_groups.concat(groupFind.groupId))});
                res.send({
                    ok: true,
                    error: null,
                    data: {updateGroup: res1, updateUser: res2}
                });
            }
        }
    }
});

/*
 * Delete a group: takes in the groupId and sid and returns the result of trying to delete the group.
 * It then removes the groupId from every single member
 */
router.post('/delete', async function(req,res,next){
    let sid = req.body.sid;
    let resUser = await userModel.findOne({sid: sid});
    if (!resUser) {
        res.send({
            ok: false,
            error: 'Invalid sid',
            data: {sid: sid}
        });
    } else{
        let groupFind = await groupModel.findOne({groupId: req.body.groupId});
        if (!groupFind) {
            res.send({
                ok: false,
                error: 'Group not found',
                data: null
            });
        } else{
            // Confirm that the user trying to delete the group is the leader
            if(!groupFind.leaderId === resUser.id){
                res.send({
                    ok: false,
                    error: 'Not Group Leader',
                    data: null
                });
            }else{
                /*
                 * First kick members from the group
                 */
            }
        }
    }
});


module.exports = router