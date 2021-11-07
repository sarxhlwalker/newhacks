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
    }
}