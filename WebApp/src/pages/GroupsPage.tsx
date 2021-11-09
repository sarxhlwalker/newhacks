import React from "react";
import { apiPost } from "../api";
import { Modal } from "../components/Modal";
import { Header } from "../components/PageHeader";
import { Page } from "../Page";
import { PageView } from "../PageView";
import { convertRawGroupData, Group, RawGroupData, RawUserSelfData } from "../types/types";
import { GroupCard } from "../components/GroupCard";

interface IProps {
    pageView: PageView;
}

interface IState {
    groups: Group[];
}

class GroupsContainer extends React.Component<IProps, IState> {
    selfDataCache: RawUserSelfData | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            groups: [],
        };
    }

    reloadCardData() {
        apiPost<RawUserSelfData>("users/data", {
            sid: AppStorage.assertSessionID(),
        }).then((response) => {
            this.selfDataCache = response.data!;

            apiPost<{ groups: RawGroupData[] }>("groups/get", {
                sid: AppStorage.assertSessionID(),
            }).then((response) => {
                if (response.ok) {
                    let rawGroupData = response.data!.groups;
                    let groupData = rawGroupData.map((g) => convertRawGroupData(g));
                    this.setState({
                        groups: groupData,
                    });
                }
            });
        });
    }

    componentDidMount() {
        this.reloadCardData();
    }

    renderGroups() {
        if (this.state.groups.length) {
            return this.state.groups.map((group) => {
                let myID = this.selfDataCache!.id;
                let amIOwner = myID === group.leaderID;
                return (
                    <GroupCard
                        groupData={group}
                        amIOwner={amIOwner}
                        key={group.id}
                        selfDataCache={this.selfDataCache!}
                        pageView={this.props.pageView}
                    ></GroupCard>
                );
            });
        }

        return <span className="diminished">You aren't in any groups :(</span>;
    }

    joinGroupModal(modal: Modal) {
        let codeInput = React.createRef<HTMLInputElement>();
        let errorMsg = React.createRef<HTMLSpanElement>();

        return (
            <div>
                <h1>Join a Group</h1>
                <hr />
                <input placeholder="Group Code" type="text" ref={codeInput}></input>{" "}
                <button
                    onClick={() => {
                        apiPost("groups/join", {
                            sid: AppStorage.assertSessionID(),
                            groupId: codeInput.current!.value,
                        }).then((response) => {
                            if (response.ok) {
                                this.reloadCardData();
                                modal.close();
                            } else {
                                errorMsg.current!.innerText =
                                    "Error: " + (response.error || "Unknown error");
                            }
                        });
                    }}
                >
                    Join
                </button>
                <br />
                <div style={{ textAlign: "left" }}>
                    <span ref={errorMsg} style={{ color: "#E53935" }}></span>
                </div>
            </div>
        );
    }

    createGroupModal(modal: Modal) {
        let nameInput = React.createRef<HTMLInputElement>();
        let errorMsg = React.createRef<HTMLSpanElement>();

        return (
            <div>
                <h1>Create a Group</h1>
                <hr />
                <input placeholder="Group Name" type="text" ref={nameInput}></input>
                <br />
                <button
                    onClick={() => {
                        apiPost("groups/create", {
                            sid: AppStorage.assertSessionID(),
                            name: nameInput.current!.value,
                        }).then((response) => {
                            if (response.ok) {
                                this.reloadCardData();
                                modal.close();
                            } else {
                                errorMsg.current!.innerText =
                                    "Error: " + (response.error || "Unknown error");
                            }
                        });
                    }}
                >
                    Create
                </button>
                <br />
                <div style={{ textAlign: "left" }}>
                    <span style={{ color: "#E53935" }} ref={errorMsg}></span>
                </div>
            </div>
        );
    }

    render() {
        return (
            <>
                <h2>Groups</h2>
                <span className="row">
                    <button
                        className="four columns"
                        onClick={() => {
                            let modal = Modal.currentModalInstance!;
                            modal.setPopup(this.joinGroupModal(modal));
                        }}
                    >
                        Join a Group
                    </button>
                    <button
                        className="four columns"
                        onClick={() => {
                            let modal = Modal.currentModalInstance!;
                            modal.setPopup(this.createGroupModal(modal));
                        }}
                    >
                        Create a Group
                    </button>
                </span>
                <hr></hr>
                <div style={{ overflowY: "hidden" }}>
                    <div className="groups-list">{this.renderGroups()}</div>
                </div>
                <Modal></Modal>
            </>
        );
    }
}

export class GroupsPage extends Page {
    pageRender() {
        return (
            <>
                <Header></Header>
                <div className="container">
                    <GroupsContainer pageView={this.props.pageView}></GroupsContainer>
                </div>
            </>
        );
    }
}
