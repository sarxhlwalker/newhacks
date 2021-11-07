import React from "react";
import { Page } from "../Page";
import { PageView } from "../PageView";

interface IProps {
    pageView: PageView;
}

interface IState {}

class GroupsContainer extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return (
            <>
                <h1>Login bitch</h1>
            </>
        );
    }
}

export class GroupsPage extends Page {
    pageRender() {
        return (
            <div className="container">
                <GroupsContainer pageView={this.props.pageView}></GroupsContainer>
            </div>
        );
    }
}
