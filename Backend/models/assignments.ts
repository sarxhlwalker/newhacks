import { model, Schema } from "mongoose";

export interface Assignment {
    _id: string;
    assignmentId: string;
    title: string;
    description: string;
    date: number;
    completed: string;
    groupId: string;
}

export const assModel = model<Assignment>(
    "assignments",
    new Schema<Assignment>({
        _id: { type: String, required: true },
        assignmentId: { type: String, required: false },
        title: { type: String, required: true },
        description: { type: String, required: false },
        date: { type: Number, required: true },
        completed: { type: String, required: true },
        groupId: { type: String, required: true },
    })
);
