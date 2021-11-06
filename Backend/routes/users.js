const express = require('express');
const router = express.Router();

const funcs = require('../funcs.js')

const userModel = require('../models/users');
const mongoose = require("mongoose");

// Check login post
/*
 * Sends back the apid I expect in future api calls if successfully logs in
 * Otherwise sends back just the number 404
 */
router.post('/log', async function(req, res, next){
    let user = await userModel.findOne({username: req.body.username, password: req.body.password});
    if(user) {
        res.send(user.apid)
    }else{
        res.send('404')
    }
});

// Add a new user
/*
 * Save the user
 */
router.post('/save', async function(req, res, next){
    let count = await userModel.countDocuments({}) + 1;
    console.log(req.body)
    // A very stupid way to find a random unique string id that can be used as an api key
    let myApid = funcs.generateTextId(32);
    let repeats = await userModel.findOne({apid: myApid});
    while(repeats){
        myApid = funcs.generateTextId(32);
        repeats = await userModel.findOne({apid: myApid});
    }

    let user = {
        _id: new mongoose.Types.ObjectId(),
        id: count,
        apid: myApid,
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        groups: JSON.stringify([])
    }
    let access_token = req.body.token;

    let result = await userModel.create(user);
    res.send(result);

})

module.exports = router