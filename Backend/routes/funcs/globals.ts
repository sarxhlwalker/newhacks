import crypto from "crypto";
import mongoose from "mongoose";
import {userModel} from "../../models/users";

export const globalFuncs = {
    /*
     * Global helper functions
     */

    // Create a random alpha-num of a given length
    generateTextId: function (length: number) {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    // Hashes the password using md5
    md5password: function (password: string) {
        return crypto.createHash("md5").update(password).digest("hex");
    },

    generateResSend: function (ok: boolean, error: null | string[] | string, data: any) {
        return {
            ok: ok,
            error: error,
            data: data
        };
    },

    // Generate unique sid for a user
    generateUniqueSid: async function () {
        let sid = this.generateTextId(32); // Create a 32 bit alpha-num for the user sid
        let repeats = await userModel.findOne({sid: sid}); // Check whether a user has that sid already

        // Loop through until you find an sid that is unique
        while (repeats) {
            sid = this.generateTextId(32);
            repeats = await userModel.findOne({sid: sid});
        }

        return sid;
    },

    // Generate unique id for a user
    generateUniqueId: async function () {
        let id = this.generateTextId(8); // Create an 8 bit alpha-num for the user id
        let repeats = await userModel.findOne({id: id}); // Check whether a user has that id already

        // Loop through until you find an id that is unique
        while (repeats) {
            id = this.generateTextId(8);
            repeats = await userModel.findOne({id: id});
        }

        return id;
    },

    // Find a user based off id or sid
    findUserOnId: async function (uid: string, use: boolean) {
        // Return based on id if use is true, sid if use is false
        return (use) ? await userModel.findOne({id: uid}) : await userModel.findOne({sid: uid});
    },

}