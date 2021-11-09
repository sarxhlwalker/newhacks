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

    // Get a given user's groups
    getUserGroups: async function (user: User | null) {
        // Parse the list of groups from the user data if the user is not null
        let groups = user ? JSON.parse(user.groups) : null;

        let groupsList = [];

        for (let group of groups) {
            groupsList.push(await groupModel.findOne({ groupId: group }));
        }

        return groups
            ? globalFuncs.generateResSend(true, null, { groups: groupsList })
            : globalFuncs.generateResSend(false, "Invalid sid", null);
    },

    // Generate a unique groupId
    generateUniqueGroupId: async function () {
        // Create a random 5 bit alpha-num
        let groupId = globalFuncs.generateTextId(5);
        // Check if the generated Id already exists
        let repeats = await groupModel.findOne({ groupId: groupId });

        while (repeats) {
            groupId = globalFuncs.generateTextId(5);
            repeats = await groupModel.findOne({ groupId: groupId });
        }

        return groupId;
    },
};
