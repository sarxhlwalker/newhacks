class AppStorage {
    static getSessionID() {
        return localStorage.getItem("sid");
    }

    static assertSessionID() {
        /*
            Gets the session ID, assuming the user is logged in.
            If the user is logged out, the page refreshes, which
            should take the user to the login screen.
        */

        let sid = this.getSessionID();
        if (!sid) {
            window.location.reload();
            throw new Error();
        }
        
        return sid!;
    }

    static setSessionID(sid: string) {
        localStorage.setItem("sid", sid);
    }

    static logout() {
        localStorage.removeItem("sid");
        window.location.reload();
    }

    static get isLoggedIn() {
        return this.getSessionID() !== null;
    }
}
