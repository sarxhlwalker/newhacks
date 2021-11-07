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

interface IState {}

class GroupViewContainer extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <>
                <h1>Login bitch</h1>
            </>
        );
    }
}

export class GroupViewPagePage extends Page {
    pageRender() {
        return (
            <div className="login-page container">
                <GroupViewContainer pageView={this.props.pageView}></GroupViewContainer>
            </div>
        );
    }
}
