const express = require("express");
const router = express.Router();

const userModel = require("../models/users");
const groupModel = require("../models/groups");
const assModel = require("../models/assignments");

const funcs = require("../funcs.js");

const mongoose = require("mongoose");
const { presets } = require("../../App/babel.config");

/*
 * Create an assignment for a group
 * Takes in sid, groupId, due-date (date [as an int in unix timestamp]), title and description,
 * Returns result of trying to add assignments to group
 */
router.post("/create", async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });
    if (!resUser) {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: { sid: sid },
        });
    } else {
        // User is valid
        // Ensure group is valid
        if (!funcs.validateGroup(req.body.groupId)) {
            res.send({
                ok: false,
                error: "Invalid group id",
                data: null,
            });
        } else {
            // Group is now valid
            let groupFind = await groupModel.findOne({ groupId: req.body.groupId });
            let members = JSON.parse(groupFind.members);
            if (!members.includes(resUser.id)) {
                res.send({
                    ok: false,
                    error: "Not in group",
                    data: null,
                });
            } else {
                // User is in the group
                // Validate post data
                let asId = funcs.generateTextId(6);
                let repeats = await assModel.findOne({ assignmentId: asId });

                while (repeats) {
                    asId = funcs.generateTextId(6);
                    repeats = await assModel.findOne({ assignmentId: asId });
                }

                let assignment = {
                    _id: new mongoose.Types.ObjectId(),
                    assignmentId: asId,
                    title: req.body.title,
                    description: req.body.description,
                    date: req.body.date,
                    completed: JSON.stringify([]),
                    groupId: groupFind.groupId,
                };

                // Validate the assignment object
                let errs = await funcs.validateAssignment(assignment);

                if (errs.length > 0) {
                    res.send({
                        ok: false,
                        error: errs,
                        data: null,
                    });
                } else {
                    let result = await assModel.create(assignment);
                    let curr_ass = JSON.parse(groupFind.assignments);
                    curr_ass.push(assignment);

                    let res2 = await groupModel.updateOne(
                        { groupId: groupFind.groupId },
                        { assignments: JSON.stringify(curr_ass) }
                    );
                    res.send({
                        ok: true,
                        error: null,
                        data: { result, res2 },
                    });
                }
            }
        }
    }
});

/*
 * Get list of all assignments in a group
 * Requires sid and groupId
 * Returns list of assignment objects
 */
router.post("/get", async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });
    if (!resUser) {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: { sid: sid },
        });
    } else {
        if (!funcs.validateGroup(req.body.groupId)) {
            res.send({
                ok: false,
                error: "Group not found",
                data: null,
            });
        } else {
            let groupFind = await groupModel.findOne({ groupId: req.body.groupId });
            let members = JSON.parse(groupFind.members);
            if (!members.includes(resUser.id)) {
                res.send({
                    ok: false,
                    error: "Not in group",
                    data: null,
                });
            } else {
                //
            }
        }
    }
});

module.exports = router;