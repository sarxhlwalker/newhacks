const express = require("express");
const router = express.Router();

const funcs = require("../funcs.js");

const userModel = require("../models/users");
const mongoose = require("mongoose");

// Check login post
/*
 * Sends back the apid I expect in future api calls if successfully logs in
 * Otherwise sends back just the number 404
 */
router.post("/login", async function (req, res, next) {
    console.log(req.body);
    let user = await userModel.findOne({
        username: req.body.username,
        password: funcs.md5password(req.body.password),
    });
    if (user) {
        let query = { username: req.body.username, password: funcs.md5password(req.body.password) };

        let result = await userModel.updateOne(query, { apid: req.sessionID });
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

// Add a new user
/*
 * Save the user data if it's valid, after doing server side validation.
 */
router.post("/save", async function (req, res, next) {
    let count = (await userModel.countDocuments({})) + 1;
    console.log(req.body);
    // A very stupid way to find a random unique string id that can be used as an api key
    let myApid = funcs.generateTextId(32);
    let repeats = await userModel.findOne({ sid: myApid });
    while (repeats) {
        myApid = funcs.generateTextId(32);
        repeats = await userModel.findOne({ sid: myApid });
    }

    let user = {
        _id: new mongoose.Types.ObjectId(),
        id: count,
        sid: myApid,
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        groups: JSON.stringify([]),
    };

    errors = await funcs.formValidation(user);
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
router.post('/data', async function(req, res, next){
    let sid = req.body.sid;
    let resUser = await userModel.findOne({sid: sid});
    if(resUser){
        res.send({
            ok: true,
            error: null,
            data: {
                firstname: resUser.firstname,
                lastname: resUser.lastname,
                email: resUser.email,
                username: resUser.username
            }
        })
    }else{
        res.send({
            ok: false,
            error: 'Invalid sid',
            data: null
        })
    }
});

module.exports = router;
