import fs from "fs";

let _profanityList = fs.readFileSync("resources/profanity_list.txt", "utf-8").split("\n");
const PROFANITY = _profanityList.filter((line) => {
    return !(isStringEmpty(line) || line.startsWith("#"));
});

export function isProfane(word: string) {
    /*
        Returns true if a provided word (i.e. username, no spaces) is profane
    */

    word = word.trim().toLowerCase();
    word = word.replace(/0/g, "o");
    word = word.replace(/1/g, "i");
    word = word.replace(/4/g, "a");
    word = word.replace(/5/g, "s");
    word = word.replace(/7/g, "t");
    word = word.replace(/_/g, "");

    for (let bannedWord of PROFANITY) {
        if (bannedWord.length <= 3) {
            if (word == bannedWord) return true;
        } else {
            let isProfane = word.includes(bannedWord);
            if (isProfane) return true;
        }
    }

    return false;
}

export function isStringEmpty(s: string) {
    return s.trim().length === 0;
}

export function isAlphanumeric(s: string) {
    /*
        Returns true if the provided stirng contains only
        letters, numbers, and underscores.
    */

    return s.match(/^\w+$/g) !== null;
}
