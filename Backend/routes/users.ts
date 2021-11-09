// Helper functions
import {globalFuncs} from "./funcs/globals";
import {userFuncs} from "./funcs/users";

// Models
import {User, userModel} from "../models/users";
import express from "express";

const router = express.Router();

/*
 * Login route
 * Sends back the sid, takes in username and password
 * Sends error string if not found, or data: sid, result
 */
router.post("/login", async function (req, res, next) {
    // First get the user from login data
    let user = await userFuncs.getUserFromLogin(req.body.username, globalFuncs.md5password(req.body.password));
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
router.post("/save", async function (req, res, next) {
    // Create a new user
    let user: User = await userFuncs.createNewUser(req.body);

    // Return the data after validating the user
    let data = await userFuncs.validateNewUser(user);

    res.send(data);
});

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

export function users_getRouter() {
    return router;
}
