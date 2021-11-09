import twilio from "twilio";

import { User, userModel } from "../models/users";
import { funcs } from "../funcs";
import { Assignment, assModel } from "../models/assignments";
import { groupModel } from "../models/groups";

import mongoose from "mongoose";
import express from "express";
import {
    APIFunctionContext,
    apiFunctionWrap,
    resolveSessionID,
    safeGetAssignment,
    safeGetGroup,
} from "./util/api_util";
import { globalFuncs } from "./util/globals";
const router = express.Router();

/*
 * Create an assignment for a group
 * Takes in sid, groupId, due-date (date [as an int in unix timestamp]), title and description,
 * Returns result of trying to add assignments to group
 */
router.post(
    "/create",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        let body = ctx.req.body;

        let resUser = await resolveSessionID(ctx, body.sid);

        let group = await safeGetGroup(ctx, body.groupId);
        let members: string[] = group.members;
        if (!members.includes(resUser._id)) {
            ctx.replyWithError("You are not in this group!");
        }

        // User is in the group
        // Validate post data
        let asId = globalFuncs.generateTextId(6);
        let repeats = await assModel.findOne({ id: asId });

        while (repeats) {
            asId = globalFuncs.generateTextId(6);
            repeats = await assModel.findOne({ id: asId });
        }

        let assignment: Assignment = {
            _id: new mongoose.Types.ObjectId().toString(),
            title: body.title,
            description: body.description,
            date: body.date,
            completedBy: [],
            groupId: group._id,
        };

        // Validate the assignment object
        let errs = await funcs.validateAssignment(assignment);

        if (errs.length) {
            ctx.replyWithError(errs[0]);
        }

        await assModel.create(assignment);

        await groupModel.findByIdAndUpdate(group._id, {
            assignments: group.assignments.concat(assignment._id),
        });

        return true;
    })
);

/*
 * Get list of all assignments in a group
 * Requires sid and groupId
 * Returns list of assignment objects
 */
router.post(
    "/get",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        let body = ctx.req.body;

        let resUser = await resolveSessionID(ctx, body.sid);

        if (!funcs.validateGroup(body.groupId)) {
            ctx.replyWithError("Group not found");
        }
        let groupFind = (await groupModel.findOne({ id: body.groupId }))!;
        let members = groupFind.members;
        if (!members.includes(resUser._id)) {
            ctx.replyWithError("You are not in this group!");
        } else {
            //
        }
    })
);

/*
 * Delete assignment
 * Takes in sid and assignmentId
 * Returns the try to delete the assignment
 */
router.post(
    "/delete",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        let body = ctx.req.body;
        let user = await resolveSessionID(ctx, body.sid);

        let assn = await safeGetAssignment(ctx, body.assignmentId);
        let group = await safeGetGroup(ctx, assn.groupId);

        await assModel.deleteOne({ id: body.assignmentId });
        await groupModel.findByIdAndUpdate(group._id, {
            assignments: group.assignments.filter((id) => id !== assn._id),
        });

        return true;
    })
);

/*
 * Mark assignment as done
 * Takes in sid and assignmentId
 * Returns the try to update the completed for the assignment
 */
router.post(
    "/mark/done",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        let body = ctx.req.body;
        let user = await resolveSessionID(ctx, body.sid);

        let assn = await safeGetAssignment(ctx, body.assignmentId);
        let group = await safeGetGroup(ctx, assn.groupId);

        let completed = assn.completedBy;
        if (completed.includes(user._id)) {
            ctx.replyWithError("Already filled");
        }

        // Complete assignment

        assModel.findByIdAndUpdate(assn._id, { completedBy: completed.concat(user._id) });

        // Send text message
        const accountSid = process.env.ACCOUNT_SID; // Your Account SID from www.twilio.com/console
        const authToken = process.env.AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

        const client = twilio(accountSid, authToken);

        let groupMemberIDs = group.members;
        let phones = groupMemberIDs.map(async (id) => {
            let member = await userModel.findById(id);
            return member!.firstname;
        });

        let content = user.username + " has just completed " + assn.title + ". You can do it too!";

        for (let _phone of phones) {
            let phone = await _phone;
            console.log(phone);
            await client.messages.create({
                body: content,
                to: "+1" + phone, // Text this number
                from: "+16416306193", // From a valid Twilio number
            });
        }

        return true;
    })
);

export function assignments_getRouter() {
    return router;
}
