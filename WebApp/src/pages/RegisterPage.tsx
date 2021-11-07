import React from "react";
import { apiPost } from "../api";
import { AlertBox } from "../components/alert";
import { Page } from "../Page";
import { PageView } from "../PageView";
import { GroupsPage } from "./GroupsPage";
import { LoginPage } from "./LoginPage";

interface IProps {
    pageView: PageView;
}

interface IState {
    registerStatusMessage: string | null;
}

class RegistrationContainer extends React.Component<IProps, IState> {
    firstnameRef = React.createRef<HTMLInputElement>();
    lastnameRef = React.createRef<HTMLInputElement>();
    emailRef = React.createRef<HTMLInputElement>();
    usernameRef = React.createRef<HTMLInputElement>();
    passwordRef = React.createRef<HTMLInputElement>();
    passwordConfirmRef = React.createRef<HTMLInputElement>();

    constructor(props: IProps) {
        super(props);

        this.state = {
            registerStatusMessage: null,
        };
    }

    renderAlerts() {
        if (this.state.registerStatusMessage !== null) {
            return <AlertBox>Error: {this.state.registerStatusMessage}</AlertBox>;
        }
    }

    render() {
        return (
            <>
                <h1>Register hoe</h1>
                <input placeholder="First Name" type="text" ref={this.firstnameRef}></input>
                <input placeholder="Last Name" type="text" ref={this.lastnameRef}></input>
                <input placeholder="Email" type="email" ref={this.emailRef}></input>
                <input placeholder="Username" type="text" ref={this.usernameRef}></input>
                <input placeholder="Password" type="password" ref={this.passwordConfirmRef}></input>
                <input
                    placeholder="Confirm Password"
                    type="password"
                    ref={this.passwordRef}
                ></input>
                {this.renderAlerts()}
                <button
                    onClick={() => {
                        // check to see whether the passwords entered are the same
                        let password = this.passwordRef.current!.value;
                        let passwordConf = this.passwordConfirmRef.current!.value;

                        if (password != passwordConf) {
                            this.setState({
                                registerStatusMessage: "Passwords don't match",
                            });

                            return;
                        }

                        apiPost("users/save", {
                            firstname: this.firstnameRef.current!.value,
                            lastname: this.lastnameRef.current!.value,
                            email: this.emailRef.current!.value,
                            username: this.usernameRef.current!.value,
                            password: this.passwordRef.current!.value,
                        }).then((response) => {
                            if (response.error) {
                                this.setState({
                                    registerStatusMessage: response.error[0],
                                });
                            } else {
                                let sessionID = (response.data as any).sid;
                                AppStorage.setSessionID(sessionID);
                                this.props.pageView.transitionToPage(GroupsPage);
                            }
                        });
                    }}
                >
                    Register
                </button>
                <span>
                    Already have an account?{" "}
                    <a
                        href="#"
                        onClick={() => {
                            this.props.pageView.transitionToPage(LoginPage);
                        }}
                    >
                        Login
                    </a>
                </span>
            </>
        );
    }
}

export class RegistrationPage extends Page {
    pageRender() {
        return (
            <div className="login-page container">
                <RegistrationContainer pageView={this.props.pageView}></RegistrationContainer>
            </div>
        );
    }
}
