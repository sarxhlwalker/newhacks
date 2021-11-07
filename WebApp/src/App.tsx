import React from "react";
import { apiPost } from "./api";
import { Page } from "./Page";
import { GroupsPage } from "./pages/GroupsPage";
import { LoginPage } from "./pages/LoginPage";
import { PageView } from "./PageView";

export function App() {
    let isLoggedIn = AppStorage.isLoggedIn;
    let sid = AppStorage.getSessionID();
    if (sid) {
        apiPost("users/data", { sid: sid }).then((resp) => {
            if (!resp.ok) {
                AppStorage.logout();
            }
        });
    }
    return <PageView initialPage={isLoggedIn ? GroupsPage : LoginPage} />;
}
