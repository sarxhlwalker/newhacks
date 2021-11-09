import { Group, groupModel } from "../models/groups";
import { User, userModel } from "../models/users";

import mongoose from "mongoose";
import express from "express";
import { groupsFuncs } from "./util/groups";
import {
    APIFunctionContext,
    apiFunctionWrap,
    resolveSessionID,
    safeGetGroup,
} from "./util/api_util";
import { globalFuncs } from "./util/globals";

const router = express.Router();

/*
 * Get route
 * Sends back the list of groups the user is enrolled in
 * Takes in the user sid
 */
router.post(
    "/get",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        // Find a user with the given sid
        let user = await resolveSessionID(ctx, ctx.req.body.sid);

        // Generate the groups list data to be sent
        let groupIds = user.groups;
        let groups = [];
        for (let id of groupIds) {
            groups.push(await safeGetGroup(ctx, id));
        }

        return { groups: groups };
    })
);

/*
 * Create a new group with the user as the leader (Takes in group name, and user sid, returns the result of trying to
 * save the group to the model
 */
router.post(
    "/create",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        let body = ctx.req.body;

        // Find a user with the given sid
        let user = await resolveSessionID(ctx, body.sid);

        // Create a group with user as leader [ Group | null returned based on user]
        let group: Group = {
            _id: new mongoose.Types.ObjectId().toString(),
            groupCode: await groupsFuncs.generateUniqueGroupCode(),
            name: body.name,
            leaderId: user._id,
            members: [user._id],
            assignments: [],
        };

        // Validate the group [ [] if groups is not null and groups.name is not null | errs[] ]
        if (!group.name) {
            ctx.replyWithError("Group name cannot be empty");
        }

        // Generate the group
        await groupModel.create(group);
        // Get the current groups for the new group leader
        let currGroups: string[] = user.groups;
        // Add this new group to the existing list of groups; update database
        await userModel.findByIdAndUpdate(user._id, { groups: currGroups.concat(group._id) });

        return null; // send ok:true with no data
    })
);

/*
 * Join a group, takes in the user sid and group id (5 alpha-num), returns the result of trying to update
 * the user's model group data
 */
router.post(
    "/join",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        let body = ctx.req.body;
        let user = await resolveSessionID(ctx, body.sid);
        let groupToJoin = await safeGetGroup(ctx, body.groupId);

        let members = groupToJoin.members;
        let currentGroups = user.groups;
        if (members.includes(user._id) || currentGroups.includes(groupToJoin._id)) {
            ctx.replyWithError("You are already in this group");
        }

        let res1 = await groupModel.findByIdAndUpdate(groupToJoin._id, {
            members: members.concat(user._id),
        });
        let res2 = await userModel.findByIdAndUpdate(user._id, {
            groups: currentGroups.concat(groupToJoin._id),
        });

        return { updateGroup: res1, updateUser: res2 };
    })
);

/*
 * Leave a group
 * Takes in sid and groupId
 */
router.post(
    "/leave",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        let body = ctx.req.body;
        let resUser = await resolveSessionID(ctx, body.sid);

        let groupFind = await safeGetGroup(ctx, body.groupId);
        let groupMembers: string[] = groupFind.members;

        if (!groupMembers.includes(resUser._id)) {
            ctx.replyWithError("You are not in this group");
        }
        let userGroups: string[] = resUser.groups;

        let gm = groupMembers.filter(function (value) {
            return value !== resUser!._id;
        });
        let ug = userGroups.filter((value) => value !== groupFind!._id);
        let res1;
        if (gm.length > 0) {
            res1 = await groupModel.findByIdAndUpdate(groupFind._id, {
                members: gm,
            });
        } else {
            res1 = await groupModel.deleteOne({ id: groupFind._id });
        }
        let res2 = await userModel.updateOne({ id: resUser._id }, { groups: ug });

        return { res1: res1, res2: res2 };
    })
);

/*
 * Removes members from a group if the user requesting to do so is the leader
 * Takes in sid, groupId and user id to kick
 */
router.post("/kick", async function (req, res) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });
    if (!resUser) {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: { sid: sid },
        });
    } else {
        let groupFind = await groupModel.findOne({ id: req.body.groupId });
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
                let groupMembers: string[] = groupFind.members;
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
                    groupMembers = groupMembers.filter(function (value) {
                        return value !== userToKick!.id;
                    });
                    let currGroups: string[] = resUser.groups;
                    currGroups = currGroups.filter((value) => value !== groupFind!.id);

                    let res1 = await groupModel.updateOne(
                        { id: groupFind.id },
                        { members: groupMembers }
                    );
                    let res2 = await userModel.updateOne(
                        { id: userToKick.id },
                        { groups: currGroups }
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
router.post("/delete", async function (req, res) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });
    if (!resUser) {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: { sid: sid },
        });
    } else {
        let groupFind = await groupModel.findOne({ id: req.body.groupId });
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
