import React from "react";
import { apiGet, apiPost } from "../api";
import { AlertBox } from "../components/alert";
import { Header } from "../components/PageHeader";
import { Page } from "../Page";
import { PageView } from "../PageView";
import { convertRawGroupData, Group, RawGroupData, RawUserSelfData } from "../types/types";
import { GroupsPage } from "./GroupsPage";
import { RegistrationPage } from "./RegisterPage";

interface IProps {
    pageView: PageView;
    groupId: string;
}

interface IState {
    groupData: Group | null;
}

class GroupViewContainer extends React.Component<IProps, IState> {
    selfDataCache: RawUserSelfData | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            groupData: null,
        };
    }

    _renderLoading() {
        return (
            <>
                <h2 className="diminished">Loading...</h2>
            </>
        );
    }

    _render() {
        let groupData = this.state.groupData!;
        return (
            <>
                <h2>{groupData.name}</h2>
                <a
                    href="#"
                    onClick={() => {
                        this.props.pageView.transitionToPage(GroupsPage);
                    }}
                >
                    Back
                </a>
            </>
        );
    }

    componentDidMount() {
        apiPost<RawUserSelfData>("users/data", {
            sid: AppStorage.assertSessionID(),
        }).then((response) => {
            this.selfDataCache = response.data!;
            console.log(response.data);

            apiPost<{ groups: RawGroupData[] }>("groups/get", {
                sid: AppStorage.assertSessionID(),
            }).then((response) => {
                if (response.ok) {
                    let rawGroupData = response.data!.groups;
                    let groupData = rawGroupData.map((g) => convertRawGroupData(g));
                    console.log(groupData);
                    this.setState({
                        groupData: groupData.filter((g) => g.id === this.props.groupId)[0],
                    });
                }
            });
        });
    }

    render() {
        return this.state.groupData ? this._render() : this._renderLoading();
    }
}

export class GroupViewPage extends Page {
    static groupId: string;

    pageRender() {
        return (
            <>
                <Header></Header>
                <div className="container">
                    <GroupViewContainer
                        pageView={this.props.pageView}
                        groupId={GroupViewPage.groupId}
                    ></GroupViewContainer>
                </div>
            </>
        );
    }
}
