import {User, userModel} from "../../models/users";
import {globalFuncs} from "./globals";

import mongoose from "mongoose";
import {Group, groupModel} from "../../models/groups";

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
        let groups = (user) ? JSON.parse(user.groups) : null;

        let groupsList = [];

        for (let group of groups) {
            groupsList.push(await groupModel.findOne({groupId: group}));
        }

        return groups
            ? globalFuncs.generateResSend(true, null, {groups: groupsList})
            : globalFuncs.generateResSend(false, "Invalid sid", null);
    },

    // Generate a unique groupId
    generateUniqueGroupId: async function () {
        // Create a random 5 bit alpha-num
        let groupId = globalFuncs.generateTextId(5);
        // Check if the generated Id already exists
        let repeats = await groupModel.findOne({groupId: groupId});

        while (repeats) {
            groupId = globalFuncs.generateTextId(5);
            repeats = await groupModel.findOne({groupId: groupId});
        }

        return groupId;
    },

    // Create a group model given the group name and the user
    createNewGroup: async function (name: string, user: User | null) {
        let groupId = await this.generateUniqueGroupId();

        // If the user exists, then create and send a new model, otherwise send null
        return (user && name)
            ? {
                _id: new mongoose.Types.ObjectId().toString(),
                groupId: groupId,
                name: name,
                leaderId: user.id,
                leaderName: user.username,
                members: JSON.stringify([user.id]),
                assignments: JSON.stringify([]),
            }
            : null;
    },

    // Validate a new group, ensuring they have a non-empty name
    validateNewGroup: async function (group: Group | null) {
        let errs: string[] | any[] = [];
        // At this stage, if group is null, then errs will stop the flow
        return (group && group.name) ? [] : errs.concat('Name cannot be empty');
    },

    // If the group object exists, then save it to mongodb and return result. Otherwise return null
    saveNewGroup: async function (group: Group | null) {
        return (group) ? await groupModel.create(group) : null;
    },

    // Save the group model and update leader groups, then return the data to be sent back
    updateGroups: async function (group: Group | null, user: User | null, errors: string[]) {
        // Save the group first
        let saveResult = await this.saveNewGroup(group);

        // Get the current groups for the leader
        let currGroups = (user) ? JSON.parse(user.groups) : null;

        // Update the user's groups
        let updateResult =
            (currGroups && group && user) // @ian Why do I need to put the && user here?
                ? await userModel.updateOne({id: user.id},
                    {groups: JSON.stringify(currGroups.concat(group.groupId))})
                : null;

        // Create the return data
        return (updateResult)
            ? globalFuncs.generateResSend(true, null, updateResult)
            : globalFuncs.generateResSend(false, errors[0], null);
    }
}