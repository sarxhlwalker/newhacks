import React from "react";
import { Page } from "../Page";

export class LoginPage extends Page {
    pageRender() {
        return (
            <div className="login-page">
                <h1>Login bitch</h1>
                <input placeholder="Username" type="text"></input>
                <input placeholder="Password" type="password"></input>
                <br></br>
                <button
                    onClick={() => {
                        this.props.pageView.transitionToPage(LoginPage);
                    }}
                >Login</button>
            </div>
        );
    }
}
