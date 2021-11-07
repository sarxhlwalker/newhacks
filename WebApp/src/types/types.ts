// As represented in and returned from the server

export interface RawUserSelfData {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    id: string;
}

export interface RawGroupData {
    groupId: string;
    name: string;
    leaderId: string;
    leaderName: string;
    members: string;
    assignments: string;
}

export interface RawUserLookupData {
    firstname: string;
    lastname: string;
    username: string;
    id: string;
}

// Used internally

export interface Group {
    id: string;
    name: string;
    leaderID: string;
    leaderName: string;
    memberIDs: string[];
    assignments: any;
}

// Conversion functions

export function convertRawGroupData(data: RawGroupData): Group {
    return {
        id: data.groupId,
        name: data.name,
        leaderID: data.leaderId,
        leaderName: data.leaderName,
        memberIDs: JSON.parse(data.members),
        assignments: JSON.parse(data.assignments),
    };
}