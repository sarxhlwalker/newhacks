import React from "react";
import { apiPost } from "../api";
import { AlertBox } from "../components/alert";
import { Page } from "../Page";
import { PageView } from "../PageView";
import { GroupsPage } from "./GroupsPage";
import { RegistrationPage } from "./RegisterPage";

interface IProps {
    pageView: PageView;
}

interface IState {
    loginStatusMessage: string | null;
}

class LoginContainer extends React.Component<IProps, IState> {
    usernameFieldRef = React.createRef<HTMLInputElement>();
    passwordFieldRef = React.createRef<HTMLInputElement>();

    constructor(props: IProps) {
        super(props);

        this.state = {
            loginStatusMessage: null,
        };
    }

    renderAlerts() {
        if (this.state.loginStatusMessage !== null) {
            return <AlertBox>Error: {this.state.loginStatusMessage}</AlertBox>;
        }
    }

    render() {
        return (
            <>
                <h1>Login bitch</h1>
                <input placeholder="Username" type="text" ref={this.usernameFieldRef}></input>
                <input placeholder="Password" type="password" ref={this.passwordFieldRef}></input>
                {this.renderAlerts()}
                <button
                    onClick={() => {
                        apiPost("users/login", {
                            username: this.usernameFieldRef.current!.value,
                            password: this.passwordFieldRef.current!.value,
                        }).then((response) => {
                            if (response.error) {
                                this.setState({
                                    loginStatusMessage: response.error,
                                });
                            } else {
                                console.log(response);
                                this.props.pageView.transitionToPage(GroupsPage);
                            }
                        });
                    }}
                >
                    Login
                </button>
                <span>
                    Don't have an account?{" "}
                    <a
                        href="#"
                        onClick={() => {
                            this.props.pageView.transitionToPage(RegistrationPage);
                        }}
                    >
                        Create an Account
                    </a>
                </span>
            </>
        );
    }
}

export class LoginPage extends Page {
    pageRender() {
        return (
            <div className="login-page container">
                <LoginContainer pageView={this.props.pageView}></LoginContainer>
            </div>
        );
    }
}
