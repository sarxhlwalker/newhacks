import { funcs } from "../funcs";
import { User, userModel } from "../models/users";

import mongoose from "mongoose";
import express from "express";
const router = express.Router();

// Check login post
/*
 * Sends back the apid I expect in future api calls if successfully logs in
 * Otherwise sends back just the number 404
 */
router.post("/login", async function (req, res, next) {
    let user = await userModel.findOne({
        username: req.body.username,
        password: funcs.md5password(req.body.password),
    });

    if (user) {
        let query = { username: req.body.username, password: funcs.md5password(req.body.password) };

        let result = await userModel.updateOne(query, { sid: req.sessionID });
        res.send({
            ok: true,
            error: null,
            data: { sid: req.sessionID, result: result }, // sid and result of trying to update the req
        });
    } else {
        res.send({
            ok: true,
            error: "Incorrect username or password.",
            data: null,
        });
    }
});

/*
 * Get the user firstname, lastname and username from userid
 */
router.post("/lookup", async function (req, res, next) {
    let id = "" + req.body.id;
    let resUser = await userModel.findOne({ id: id.toString() });
    if (resUser) {
        res.send({
            ok: true,
            error: null,
            data: {
                firstname: resUser.firstname,
                lastname: resUser.lastname,
                username: resUser.username,
                id: resUser.id,
            },
        });
    } else {
        res.send({
            ok: false,
            error: "Invalid id",
            data: null,
        });
    }
});

// Add a new user
/*
 * Save the user data if it's valid, after doing server side validation.
 */
router.post("/save", async function (req, res, next) {
    // A very stupid way to find a random unique string id that can be used as an api key
    let myApid = funcs.generateTextId(32);
    let repeats = await userModel.findOne({ sid: myApid });
    while (repeats) {
        myApid = funcs.generateTextId(32);
        repeats = await userModel.findOne({ sid: myApid });
    }

    let ps_id = funcs.generateTextId(8);
    let id_repeats = await userModel.findOne({ id: ps_id });
    while (id_repeats) {
        ps_id = funcs.generateTextId(8);
        id_repeats = await userModel.findOne({ id: ps_id });
    }

    let user = {
        _id: new mongoose.Types.ObjectId().toString(),
        id: ps_id,
        sid: myApid,
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phonenumber,
        email: req.body.email,
        groups: JSON.stringify([]),
    };

    let errors = await funcs.formValidation(user);
    if (errors.length > 0) {
        res.send({
            ok: false,
            error: errors,
            data: null,
        });
    } else {
        user.password = funcs.md5password(user.password);
        let result = await userModel.create(user);
        res.send({
            ok: true,
            error: null,
            data: result,
        });
    }
});

/*
 * Get user front data
 */
router.post("/data", async function (req, res, next) {
    let sid = req.body.sid;
    let resUser = await userModel.findOne({ sid: sid });
    if (resUser) {
        res.send({
            ok: true,
            error: null,
            data: {
                firstname: resUser.firstname,
                lastname: resUser.lastname,
                email: resUser.email,
                username: resUser.username,
                id: resUser.id,
            },
        });
    } else {
        res.send({
            ok: false,
            error: "Invalid sid",
            data: null,
        });
    }
});

export function users_getRouter() {
    return router;
}
