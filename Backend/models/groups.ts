import { model, Schema } from "mongoose";

export interface Group {
    _id: string;
    groupId: string;
    name: string;
    leaderId: string;
    leaderName: string;
    members: string;
    assignments: string;
}

export const groupModel = model<Group>(
    "groups",
    new Schema<Group>({
        _id: { type: String, required: true },
        groupId: { type: String, required: false },
        name: { type: String, required: true },
        leaderId: { type: String, required: true },
        leaderName: { type: String, required: true },
        members: { type: String, required: true },
        assignments: { type: String, required: true },
    })
);
