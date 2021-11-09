import { Assignment, assModel } from "./models/assignments";
import { Group, groupModel } from "./models/groups";
import { User, userModel } from "./models/users";

import mongoose from "mongoose";
import crypto from "crypto";

export const funcs = {
    generateTextId: function (length: number) {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    formValidation: async function (user: User) {
        let errs = [];

        if (!user.username) errs.push("Username cannot be empty");
        if (!user.firstname || !user.lastname) errs.push("Name cannot be empty");

        if (!user.email) errs.push("Email cannot be empty");

        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let val = re.test(String(user.email).toLowerCase());
        if (!val) errs.push("Email is invalid");

        let repeat = await userModel.findOne({ email: user.email });
        if (repeat) {
            errs.push("This email is already in use");
        }
        let userRepeat = await userModel.findOne({ username: user.username });
        if (userRepeat) {
            errs.push("Username already exists");
        }
        if (user.password.length === 0) errs.push("Password cannot empty");
        return errs;
    },
    validateGroup: async function (group: Group) {
        let errs = [];
        if (!group.name) errs.push("Name cannot be empty");
        return errs;
    },
    md5password: function (password: string) {
        return crypto.createHash("md5").update(password).digest("hex");
    },
    validGroup: async function (groupId: string) {
        let group = await groupModel.findOne({ groupId: groupId });
        return !!group;
    },
    validateAssignment: async function (assignment: Assignment) {
        let errs = [];

        if (!assignment.title) errs.push("Assignment title cannot be empty");
        if (!assignment.date) errs.push("Due date cannot be empty");

        // Ensure the title is unique
        let repeats = await assModel.findOne({ title: assignment.title });
        console.log(repeats);
        if (repeats) errs.push("An assignment already exists with that name");

        return errs;
    },
};
