import { model, Schema } from "mongoose";

export interface Assignment {
    _id: string;
    title: string;
    description: string;
    date: number;
    completedBy: string[];
    groupId: string;
}

export const assModel = model<Assignment>(
    "assignments",
    new Schema<Assignment>({
        _id: String,
        title: String,
        description: String,
        date: { type: Number, required: true },
        completedBy: [String],
        groupId: String,
    })
);
