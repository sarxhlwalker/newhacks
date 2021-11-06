import React from "react";
import { Page } from "./Page";
import { LoginPage } from "./pages/LoginPage";
import { PageView } from "./PageView";

export function App() {
    return <PageView initialPage={LoginPage} />;
}
