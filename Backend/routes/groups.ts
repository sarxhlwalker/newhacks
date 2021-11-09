import { funcs } from "../funcs";
import { groupModel } from "../models/groups";
import { User, userModel } from "../models/users";

import mongoose from "mongoose";
import express from "express";
import {globalFuncs} from "./funcs/globals";
const router = express.Router();

/*
 * Get a logged in user's groups: takes in user sid returns a list of groups (objects) the user is enrolled in
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
        let groups = JSON.parse(resUser.groups);
        let obj_groups = [];
        for (let group of groups) {
            let x_group = await groupModel.findOne({ groupId: group });
            obj_groups.push(x_group);
        }
        res.send({
            ok: true,
            error: null,
            data: { groups: obj_groups },
        });
    }
});

/*
 * Create a new group with the user as the leader (Takes in group name, and user sid, returns the result of trying to
 * save the group to the model
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
        let myGid = globalFuncs.generateTextId(5);
        let repeats = await groupModel.findOne({ groupId: myGid });
        while (repeats) {
            myGid = globalFuncs.generateTextId(5);
            let repeats = await groupModel.find({ groupId: myGid });
        }
        let group = {
            _id: new mongoose.Types.ObjectId().toString(),
            groupId: myGid,
            name: req.body.name,
            leaderId: resUser.id,
            leaderName: resUser.username,
            members: JSON.stringify([resUser.id]),
            assignments: JSON.stringify([]),
        };

        let errs = await funcs.validateGroup(group);
        if (errs.length > 0) {
            res.send({
                ok: false,
                error: errs,
                data: null,
            });
        } else {
            let result = await groupModel.create(group);
            let curr_groups = JSON.parse(resUser.groups);
            let res2 = await userModel.updateOne(
                { id: resUser.id },
                { groups: JSON.stringify(curr_groups.concat(group.groupId)) }
            );
            res.send({
                ok: true,
                errors: null,
                data: result,
            });
        }
    }
});

/*
 * Join a group, takes in the user sid and group id (5 alphanum), returns the result of trying to update
 * the user's model group data
 */
router.post("/join", async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });
    if (!resUser) {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: { sid: sid },
        });
    } else {
        let groupFind = await groupModel.findOne({ groupId: req.body.groupId });
        if (!groupFind) {
            res.send({
                ok: false,
                error: "Group not found",
                data: null,
            });
        } else {
            let curr_members = JSON.parse(groupFind.members);
            let curr_groups = JSON.parse(resUser.groups);
            if (curr_members.includes(resUser.id) || curr_groups.includes(groupFind.groupId)) {
                res.send({
                    ok: false,
                    error: "Already in group",
                    data: null,
                });
            } else {
                let res1 = await groupModel.updateOne(
                    { groupId: groupFind.groupId },
                    { members: JSON.stringify(curr_members.concat(resUser.id)) }
                );
                let res2 = await userModel.updateOne(
                    { id: resUser.id },
                    { groups: JSON.stringify(curr_groups.concat(groupFind.groupId)) }
                );
                res.send({
                    ok: true,
                    error: null,
                    data: { updateGroup: res1, updateUser: res2 },
                });
            }
        }
    }
});

/*
 * Leave a group
 * Takes in sid and groupId
 */
router.post("/leave", async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });

    if (!resUser) {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: { sid: sid },
        });
    } else {
        // Check if user is in the specified group
        let groupFind = await groupModel.findOne({ groupId: req.body.groupId });

        if (!groupFind) {
            res.send({
                ok: false,
                error: "Group not found",
                data: null,
            });
        } else {
            let groupMembers: string[] = JSON.parse(groupFind.members);

            if (!groupMembers.includes(resUser.id)) {
                res.send({
                    ok: false,
                    error: "Not in group",
                    data: null,
                });
            } else {
                let userGroups: string[] = JSON.parse(resUser.groups);

                let gm = groupMembers.filter(function (value, index, arr) {
                    return value !== resUser!.id;
                });
                let ug = userGroups.filter(function (value, index, arr) {
                    return value !== groupFind!.groupId;
                });
                let res1;
                if (gm.length > 0) {
                    res1 = await groupModel.updateOne(
                        { groupId: groupFind.groupId },
                        { members: JSON.stringify(gm) }
                    );
                } else {
                    res1 = await groupModel.deleteOne({ groupId: groupFind.groupId });
                }
                let res2 = await userModel.updateOne(
                    { id: resUser.id },
                    { groups: JSON.stringify(ug) }
                );
                res.send({
                    ok: true,
                    error: null,
                    data: { res1: res1, res2: res2 },
                });
            }
        }
    }
});

/*
 * Removes members from a group if the user requesting to do so is the leader
 * Takes in sid, groupId and user id to kick
 */
router.post("/kick", async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });
    if (!resUser) {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: { sid: sid },
        });
    } else {
        let groupFind = await groupModel.findOne({ groupId: req.body.groupId });
        if (!groupFind) {
            res.send({
                ok: false,
                error: "Group not found",
                data: null,
            });
        } else {
            // Confirm that the user trying to delete the group is the leader
            if (!groupFind.leaderId === resUser.id) {
                res.send({
                    ok: false,
                    error: "Not Group Leader",
                    data: null,
                });
            } else {
                // Check to see whether username exists in group
                let groupMembers: string[] = JSON.parse(groupFind.members);
                let userToKick = await userModel.findOne({ id: req.body.userId });

                if (!userToKick) {
                    res.send({
                        ok: false,
                        error: "User does not exist",
                        data: null,
                    });

                    return;
                }

                let userFound = groupMembers.includes(userToKick.id);

                if (!userFound) {
                    res.send({
                        ok: false,
                        error: "User not in group",
                        data: null,
                    });
                } else {
                    // User found in the group to delete
                    groupMembers = groupMembers.filter(function (value, index, arr) {
                        return value !== userToKick!.id;
                    });
                    let currGroups: string[] = JSON.parse(resUser.groups);
                    currGroups = currGroups.filter(function (value, index, arr) {
                        return value !== groupFind!.groupId;
                    });

                    let res1 = await groupModel.updateOne(
                        { groupId: groupFind.groupId },
                        { members: JSON.stringify(groupMembers) }
                    );
                    let res2 = await userModel.updateOne(
                        { id: userToKick.id },
                        { groups: JSON.stringify(currGroups) }
                    );
                    res.send({
                        ok: true,
                        error: null,
                        data: { res1: res1, res2: res2 },
                    });
                }
            }
        }
    }
});

/*
 * Delete a group: takes in the groupId and sid and returns the result of trying to delete the group.
 * It then removes the groupId from every single member
 */
router.post("/delete", async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });
    if (!resUser) {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: { sid: sid },
        });
    } else {
        let groupFind = await groupModel.findOne({ groupId: req.body.groupId });
        if (!groupFind) {
            res.send({
                ok: false,
                error: "Group not found",
                data: null,
            });
        } else {
            // Confirm that the user trying to delete the group is the leader
            if (!groupFind.leaderId === resUser.id) {
                res.send({
                    ok: false,
                    error: "Not Group Leader",
                    data: null,
                });
            } else {
                /*
                 * First kick members from the group
                 * Then delete the group itself
                 */
            }
        }
    }
});

export function groups_getRouter() {
    return router;
}
