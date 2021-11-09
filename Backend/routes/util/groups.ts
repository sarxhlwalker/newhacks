import { User, userModel } from "../../models/users";
import { globalFuncs } from "./globals";

import mongoose from "mongoose";
import { Group, groupModel } from "../../models/groups";

export const groupsFuncs = {
    /*
     * Functions for routes/groups.ts
     */

    /*
     * Changing data (panda.groups) in
     * Changing data (panda.users) in
     */



    // Generate a unique groupId
    generateUniqueGroupCode: async function () {
        // Create a random 5 bit alpha-num
        let code = globalFuncs._generateNDigitCode(5);
        // Check if the generated Id already exists
        let repeats = await groupModel.findOne({ groupCode: code });

        while (repeats) {
            code = globalFuncs._generateNDigitCode(5);
            repeats = await groupModel.findOne({ groupCode: code });
        }

        return code;
    },
};
