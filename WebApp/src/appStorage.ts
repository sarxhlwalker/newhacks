class AppStorage {
    static getSessionID() {
        return localStorage.getItem("sid");
    }

    static setSessionID(sid: string) {
        localStorage.setItem("sid", sid);
    }

    static get isLoggedIn() {
        return this.getSessionID() !== null;
    }
}
