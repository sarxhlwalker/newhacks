import { userModel } from "./models/users";

export namespace Database {
    export function getUser(id: string) {
        /* Returns null if no user was found */
        return userModel.findOne({})
    }
}