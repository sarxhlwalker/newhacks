import { Group, groupModel } from "../models/groups";
import { User, userModel } from "../models/users";

import mongoose from "mongoose";
import express from "express";
import { groupsFuncs } from "./funcs/groups";
import { APIFunctionContext, apiFunctionWrap, resolveSessionID, safeGetGroup } from "./util";
import { globalFuncs } from "./funcs/globals";

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
        let groupIds = JSON.parse(user.groups) as string[];
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
            groupId: globalFuncs.generateTextId(5),
            name: body.name,
            leaderId: user.id,
            leaderName: user.username,
            members: JSON.stringify([user.id]),
            assignments: JSON.stringify([]),
        };

        // Validate the group [ [] if groups is not null and groups.name is not null | errs[] ]
        if (!group.name) {
            ctx.replyWithError("Group name cannot be empty");
        }

        // Generate the group
        await groupModel.create(group);
        // Get the current groups for the new group leader
        let currGroups: string[] = JSON.parse(user.groups);
        // Add this new group to the existing list of groups; update database
        await userModel.updateOne(
            { id: user.id },
            { groups: JSON.stringify(currGroups.concat(group.groupId)) }
        );

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
        let resUser = await resolveSessionID(ctx, body.sid);

        let groupFind = await safeGetGroup(ctx, body.groupId);

        let members = JSON.parse(groupFind.members);
        let currentGroups = JSON.parse(resUser.groups);
        if (members.includes(resUser.id) || currentGroups.includes(groupFind.groupId)) {
            ctx.replyWithError("You are already in this group");
        }

        let res1 = await groupModel.updateOne(
            { groupId: groupFind.groupId },
            { members: JSON.stringify(members.concat(resUser.id)) }
        );
        let res2 = await userModel.updateOne(
            { id: resUser.id },
            { groups: JSON.stringify(currentGroups.concat(groupFind.groupId)) }
        );

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
        let groupMembers: string[] = JSON.parse(groupFind.members);

        if (!groupMembers.includes(resUser.id)) {
            ctx.replyWithError("You are not in this group");
        }
        let userGroups: string[] = JSON.parse(resUser.groups);

        let gm = groupMembers.filter(function (value) {
            return value !== resUser!.id;
        });
        let ug = userGroups.filter(function (value) {
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
        let res2 = await userModel.updateOne({ id: resUser.id }, { groups: JSON.stringify(ug) });

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
                    groupMembers = groupMembers.filter(function (value) {
                        return value !== userToKick!.id;
                    });
                    let currGroups: string[] = JSON.parse(resUser.groups);
                    currGroups = currGroups.filter(function (value) {
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
