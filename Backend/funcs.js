const userModel = require('./models/users');
const mongoose = require("mongoose");

module.exports = {
    generateTextId: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    },
    formValidation: async function (user) {
        let errs = []

        if (!user.username) errs.push('Add a username');
        if (!user.firstname || !user.lastname) errs.push('Have a name')

        if (!user.email) errs.push('Have email')

        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let val = re.test(String(user.email).toLowerCase());
        if (!val) errs.push('Have an email');

        let repeat = await userModel.findOne({email: user.email});
        if (repeat) {
            errs.push('Email already exists')
        }
        let userRepeat = await userModel.findOne({username: user.username});
        if (userRepeat) {
            errs.push('Username already exists');
        }
        if (user.password.length === 0) errs.push('Password empty');
        return errs;
    },
    md5password: function (password) {
        let crypto = require('crypto');
        return crypto.createHash('md5').update(password).digest('hex');
    }
}
