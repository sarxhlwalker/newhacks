import { User, userModel } from "../../models/users";
import { funcs } from "../../funcs";
import { globalFuncs } from "./globals";

import mongoose from "mongoose";

export interface UserInfoUpdate {
    newEmail: string;
    newFirstname: string;
    newLastname: string;
    newPhone: string;
    newPassword: string;
    previousEmail: string;
}

function isEmailValid(email: string) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return Boolean(email.toLowerCase().match(re));
}

export const userFuncs = {
    /*
     * Functions for routes/users.ts
     */

    /*
     * Changing data (panda.users) in: updateUserSid and validateNewUser
     */

    // Returns the user from users db based on login data if found, or undefined if not found
    getUserFromLogin: async function (username: string, password: string) {
        return userModel.findOne({
            username: username,
            password: password,
        });
    },

    // Updates the sid for a given user if the user is not undefined and returns the result
    updateUserSid: async function (user: User | null, sessionId: string) {
        let result = user ? await userModel.updateOne({ id: user.id }, { sid: sessionId }) : null;
        return result
            ? globalFuncs.generateResSend(true, null, { sid: sessionId, result: result })
            : globalFuncs.generateResSend(false, "Incorrect Username or Password", null);
    },

    // Create a user object from body arguments
    createNewUser: async function (body: any) {
        // Generate Unique Id's for a user
        let id = await globalFuncs.generateUniqueId();
        let sid = await globalFuncs.generateUniqueSid();

        // Return the user
        return {
            _id: new mongoose.Types.ObjectId().toString(),
            id: id,
            sid: sid,
            username: body.username,
            password: body.password,
            firstname: body.firstname,
            lastname: body.lastname,
            phone: body.phonenumber,
            email: body.email,
            groups: JSON.stringify([]),
        };
    },

    validateUpdatedUserInfo: async function (info: UserInfoUpdate): Promise<string | null> {
        if (!isEmailValid(info.newEmail)) return "Email is invalid";

        // Check to see if the email is already registered
        let repeat = await userModel.findOne({ email: info.newEmail });
        let didEmailChange = info.newEmail !== info.previousEmail;
        if (repeat && didEmailChange) return "This email is already in use";

        // Validate other fields
        if (!info.newFirstname || !info.newLastname) return "Name cannot be empty";
        if (!info.newPassword) return "Password cannot be empty";
        if (!info.newPhone) return "Invalid phone number";

        return null;
    },

    // Validates the user created from form data
    formValidation: async function (user: User) {
        let errs = [];

        // Ensure no field is empty
        if (!user.username) errs.push("Username cannot be empty");
        if (!user.firstname || !user.lastname) errs.push("Name cannot be empty"); // Either first or last name exists
        if (!user.email) errs.push("Email cannot be empty");

        if (!isEmailValid(user.email)) errs.push("Email is invalid");

        // Check to see if the email is already registered
        let repeat = await userModel.findOne({ email: user.email });
        if (repeat) {
            errs.push("This email is already in use");
        }

        // Check to see if the username is already registered
        let userRepeat = await userModel.findOne({ username: user.username });
        if (userRepeat) {
            errs.push("Username already exists");
        }
        if (user.password.length === 0) errs.push("Password cannot empty");
        return errs;
    },

    // Return the result of validating the user
    validateNewUser: async function (user: User) {
        // Get the errors when validating the form
        let errors = await this.formValidation(user);

        return errors;
    },

    // Return the user data from a user id
    userIdLookup: async function (id: string) {
        let user = await globalFuncs.findUserOnId(id, true);

        // Front end data if user exists, otherwise return "Invalid id"
        return user
            ? globalFuncs.generateResSend(true, null, {
                  firstname: user.firstname,
                  lastname: user.lastname,
                  username: user.username,
                  id: user.id,
              })
            : globalFuncs.generateResSend(false, "Invalid id", null);
    },

    // Return the user data from a user sid
    userSidLookup: async function (sid: string) {
        let user = await globalFuncs.findUserOnId(sid, false);

        // Front end data if user exists, otherwise return "Invalid sid"
        return user
            ? globalFuncs.generateResSend(true, null, {
                  firstname: user.firstname,
                  lastname: user.lastname,
                  email: user.email,
                  username: user.username,
                  id: user.id,
              })
            : globalFuncs.generateResSend(false, "Invalid sid", null);
    },
};
