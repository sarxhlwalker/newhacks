import express from "express";
import mongoose from "mongoose";
import { Assignment, assModel } from "../models/assignments";
import { Group, groupModel } from "../models/groups";
import { User, userModel } from "../models/users";

export const ERROR_MSGS = {
    invalidSession: "Invalid session; try logging out and back in.",
};

export function createMongoObjectID() {
    return new mongoose.Types.ObjectId().toString();
}

class _APIFunctionError {
    message: string;

    constructor(msg: string) {
        this.message = msg;
    }
}

export interface APIFunctionContext {
    req: express.Request;
    res: express.Response;
    next: express.NextFunction;
    replyWithError: (msg: string) => never;
}

function _errorFunction(msg: string): never {
    throw new _APIFunctionError(msg);
}

export type APIEndpointFunction = (context: APIFunctionContext) => Promise<any>;
export function apiFunctionWrap(func: APIEndpointFunction) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let output;

        try {
            output = await func({
                req: req,
                res: res,
                next: next,
                replyWithError: _errorFunction,
            });
        } catch (err) {
            if (err instanceof _APIFunctionError) {
                res.send({
                    ok: false,
                    error: err.message,
                    data: null,
                });
                return;
            } else {
                throw err;
            }
        }

        res.send({
            ok: true,
            error: null,
            data: output,
        });
    };
}

/*
    The following are getter functions that will throw an error to the user
    if an error occurs, otherwise returning the requested resource guaranteed
    to be non-null.
*/

export async function safeGetAssignment(ctx: APIFunctionContext, id: string) {
    let assignment = await assModel.findOne({ assignmentId: id });

    if (!assignment) ctx.replyWithError("The requested assignment was not found.");
    return assignment as Assignment;
}

export async function safeGetGroup(ctx: APIFunctionContext, id: string) {
    let group = await groupModel.findOne({ groupId: id });

    if (!group) ctx.replyWithError("The requested group was not found.");
    return group as Group;
}

export async function resolveSessionID(ctx: APIFunctionContext, sid: string) {
    /*
        Returns the user associated with a session ID, returning an error
        to the user if there is none.
    */
    let user = await userModel.findOne({ sid: sid });
    if (!user) {
        ctx.replyWithError(ERROR_MSGS.invalidSession);
    }

    return user as User;
}
