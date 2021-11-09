import {Assignment, assModel} from "./models/assignments";
import {Group, groupModel} from "./models/groups";
import {User, userModel} from "./models/users";

import crypto from "crypto";
import mongoose from "mongoose";

export const funcs = {
    validateGroup: async function (group: Group) {
        let errs = [];
        if (!group.name) errs.push("Name cannot be empty");
        return errs;
    },
    validateAssignment: async function (assignment: Assignment) {
        let errs = [];

        if (!assignment.title) errs.push("Assignment title cannot be empty");
        if (!assignment.date) errs.push("Due date cannot be empty");

        // Ensure the title is unique
        let repeats = await assModel.findOne({title: assignment.title});
        console.log(repeats);
        if (repeats) errs.push("An assignment already exists with that name");

        return errs;
    },
};
