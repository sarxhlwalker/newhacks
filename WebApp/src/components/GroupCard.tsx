import React, { useImperativeHandle } from "react";
import { apiPost } from "../api";
import { GroupViewPage } from "../pages/GroupViewPage";
import { PageView } from "../PageView";
import { Group, RawUserLookupData, RawUserSelfData } from "../types/types";
import { UserCard } from "./UserCard";

interface IProps {
    groupData: Group;
    amIOwner: boolean; // is this user the owner of this group?
    selfDataCache: RawUserSelfData;
    pageView: PageView;
}

interface IState {
    userList: RawUserLookupData[];
}

export class GroupCard extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            userList: [],
        };
    }

    componentDidMount() {
        (async () => {
            let userData: RawUserLookupData[] = [];

            for (let userID of this.props.groupData.memberIDs) {
                let resp = await apiPost<RawUserLookupData>("users/lookup", {
                    id: userID,
                });

                if (resp.ok) {
                    userData.push(resp.data!);
                }
            }

            return userData;
        })().then((userList) => {
            this.setState({
                userList: userList,
            });
        });
    }

    computeTitleFontSize(title: string) {
        if (title.length > 32) {
            return "16pt";
        }
        return "24pt";
    }

    goToGroupView() {
        // HACK: Pass group data to the page instance via static
        // variable.
        GroupViewPage.groupId = this.props.groupData.id;
        this.props.pageView.transitionToPage(GroupViewPage);
    }

    render() {
        let group = this.props.groupData;
        let groupCard = React.createRef<HTMLDivElement>();

        return (
            <div
                className="group-card"
                onClick={(ev) => {
                    if (ev.target !== groupCard.current) return;
                    this.goToGroupView();
                }}
                ref={groupCard}
            >
                <h3
                    style={{ fontSize: this.computeTitleFontSize(group.name) }}
                    onClick={(ev) => {
                        this.goToGroupView();
                    }}
                >
                    {group.name}
                </h3>
                Group Code: <code>{group.id}</code>
                <hr />
                <div>
                    {this.state.userList.length ? (
                        this.state.userList.map((m) => (
                            <UserCard
                                userData={m}
                                groupData={group}
                                myId={this.props.selfDataCache!.id}
                                key={m.username}
                            ></UserCard>
                        ))
                    ) : (
                        <span className="diminished">This group has no members</span>
                    )}
                </div>
                <hr />
                <div>
                    <span className="row footer">
                        <a
                            href="#"
                            onClick={() => {
                                apiPost("groups/leave", {
                                    sid: AppStorage.assertSessionID(),
                                    groupId: group.id,
                                }).then(() => {
                                    window.location.reload();
                                });
                            }}
                        >
                            {this.props.amIOwner ? "Delete Group" : "Leave Group"}
                        </a>
                    </span>
                </div>
            </div>
        );
    }
}
