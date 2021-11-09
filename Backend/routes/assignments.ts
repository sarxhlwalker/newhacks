import twilio from "twilio";

import { userModel } from "../models/users";
import { funcs } from "../funcs";
import { assModel } from "../models/assignments";
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
        let members: string[] = JSON.parse(group.members);
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

        let assignment = {
            _id: new mongoose.Types.ObjectId().toString(),
            title: body.title,
            description: body.description,
            date: body.date,
            completed: JSON.stringify([]),
            groupId: group._id,
        };

        // Validate the assignment object
        let errs = await funcs.validateAssignment(assignment);

        if (errs.length) {
            ctx.replyWithError(errs[0]);
        }

        let result = await assModel.create(assignment);
        let curr_ass = JSON.parse(group.assignments);
        curr_ass.push(assignment);

        let res2 = await groupModel.findByIdAndUpdate(group._id, {
            assignments: JSON.stringify(curr_ass),
        });

        return { result, res2 };
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
        let members = JSON.parse(groupFind.members);
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
        let resUser = await resolveSessionID(ctx, body.sid);

        // Checks Assignment Id:
        let assnRep = await safeGetAssignment(ctx, body.assignmentId);
        // Checks group
        let group = await safeGetGroup(ctx, assnRep.groupId);

        let res1 = await assModel.deleteOne({ id: body.assignmentId });
        let newGroups = await assModel.findById(group._id);
        if (newGroups) {
            await groupModel.findByIdAndUpdate(group._id, {
                assignments: JSON.stringify(newGroups),
            });
        }

        return res1;
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
        let resUser = await resolveSessionID(ctx, body.sid);

        let assn = await safeGetAssignment(ctx, body.assignmentId);
        let group = await safeGetGroup(ctx, assn.groupId);

        let completed = JSON.parse(assn.completed);
        if (completed.includes(resUser._id)) {
            ctx.replyWithError("Already filled");
        }

        // Complete assignment

        assn.completed = JSON.stringify(completed.concat(resUser._id));
        let groupAssignment = JSON.parse(group.assignments);
        for (let i in groupAssignment) {
            if (groupAssignment[i].assignmentId === assn._id) {
                let psCompleted = JSON.parse(groupAssignment[i].completed);
                psCompleted.push(resUser._id);
                groupAssignment[i].completed = JSON.stringify(psCompleted);
            }
        }
        group.assignments = JSON.stringify(groupAssignment);

        let res1 = await assModel.findByIdAndUpdate(assn._id, { completed: assn.completed });
        let res2 = await groupModel.updateOne(
            { id: assn.groupId },
            { assignments: group.assignments }
        );
        const accountSid = process.env.ACCOUNT_SID; // Your Account SID from www.twilio.com/console
        const authToken = process.env.AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

        const client = twilio(accountSid, authToken);

        let groupMembers = (await groupModel.findById(group._id))!;
        let phones = [];
        for (let member of JSON.parse(groupMembers.members) as string[]) {
            let user = await userModel.findOne({ id: member });
            phones.push(user!.phone);
        }

        let content =
            resUser.username + " has just completed " + assn.title + ". You can do it too!";
        console.log(phones);
        for (let phone of phones) {
            console.log(phone);
            await client.messages.create({
                body: content,
                to: "+1" + phone, // Text this number
                from: "+16416306193", // From a valid Twilio number
            });
        }

        return { res1, res2 };
    })
);

export function assignments_getRouter() {
    return router;
}
