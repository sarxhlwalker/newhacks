import { User, userModel } from "./models/users";

export namespace Database {
    export async function getUser(id: string) {
        /* Returns null if no user was found */
        return await userModel.findById(id) as User | null;
    }
}