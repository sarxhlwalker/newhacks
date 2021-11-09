import express from "express";
import mongoose from "mongoose";

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

interface APIFunctionContext {
    req: express.Request;
    res: express.Response;
    next: express.NextFunction;
    returnError: (msg: string) => never;
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
                returnError: _errorFunction,
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
