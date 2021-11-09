// Helper functions
import { globalFuncs } from "./funcs/globals";
import { userFuncs } from "./funcs/users";

// Models
import { User, userModel } from "../models/users";
import express from "express";
import { apiFunctionWrap, APIFunctionContext, resolveSessionID } from "./util";

const router = express.Router();

/*
 * Login route
 * Sends back the sid, takes in username and password
 * Sends error string if not found, or data: sid, result
 */
router.post("/login", async function (req, res, next) {
    // First get the user from login data
    let user = await userFuncs.getUserFromLogin(
        req.body.username,
        globalFuncs.md5password(req.body.password)
    );
    // Then try and update the user sid
    let data = await userFuncs.updateUserSid(user, req.sessionID);

    res.send(data);
});

/*
 * Save route
 * Sends back the result of trying to create a new user
 * Takes in the firstname, lastname, username, phone number, email and password
 * Validates to ensure username and email are unique
 */
router.post(
    "/save",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        // Create a new user
        let user: User = await userFuncs.createNewUser(ctx.req.body);

        user.password = globalFuncs.md5password(user.password);

        // Return the data after validating the user
        let errors = await userFuncs.validateNewUser(user);

        if (errors.length) {
            ctx.replyWithError(errors[0]);
        }

        await userModel.create(user);
        return user;
    })
);

/*
 * Data route
 * Sends back user front end data
 * Takes in the user sid generated during login or "Invalid sid" if no user is found
 */
router.post("/data", async function (req, res, next) {
    // Lookup the user based on sid and then generate data
    let data = await userFuncs.userSidLookup(req.body.sid);

    res.send(data);
});

/*
 * Lookup route
 * Sends back the front end data
 * Takes in the user id generated during create user or "Invalid id" if no user is found
 */
router.post("/lookup", async function (req, res, next) {
    // Lookup the user based on id and then generate data
    let data = await userFuncs.userIdLookup(req.body.id.toString());

    res.send(data);
});

/*
    Allow a user to update their personal information
*/
router.post(
    "/update-info",
    apiFunctionWrap(async (ctx: APIFunctionContext) => {
        let body = ctx.req.body;

        let user = await resolveSessionID(ctx, body.sid);

        let errorMessage = await userFuncs.validateUpdatedUserInfo({
            newEmail: body.newEmail,
            newFirstname: body.newFirstname,
            newLastname: body.newLastname,
            newPassword: body.newPassword,
            newPhone: body.newPhone,
            previousEmail: user.email,
        });

        if (errorMessage !== null) ctx.replyWithError(errorMessage);

        await userModel.updateOne(
            { id: user.id },
            {
                email: body.newEmail,
                firstname: body.newFirstname,
                lastname: body.newLastname,
                password: globalFuncs.md5password(body.newPassword),
                phone: body.newPhone,
            }
        );

        return null;
    })
);

export function users_getRouter() {
    return router;
}
