import React, { useImperativeHandle } from "react";
import { apiPost } from "../api";
import { Group, RawUserLookupData, RawUserSelfData } from "../types/types";

interface IProps {
    groupData: Group;
    amIOwner: boolean; // is this user the owner of this group?
    selfDataCache: RawUserSelfData;
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

    renderUserCard(userData: RawUserLookupData) {
        let userIsMe = userData.username == this.props.selfDataCache.username;
        return (
            <div className="user-card" key={userData.username}>
                <div className="about">
                    <span className="name">
                        {userData.firstname} {userData.lastname}
                    </span>
                </div>
                <span className="controls">
                    {userIsMe || !this.props.amIOwner ? (
                        ""
                    ) : (
                        <a
                            href="#"
                            onClick={() => {
                                apiPost("groups/kick", {
                                    sid: AppStorage.assertSessionID(),
                                    groupId: this.props.groupData.id,
                                    userId: userData.id,
                                }).then(() => {
                                    window.location.reload();
                                });
                            }}
                        >
                            Kick
                        </a>
                    )}
                </span>
            </div>
        );
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

    render() {
        let group = this.props.groupData;
        let groupCard = React.createRef<HTMLDivElement>();

        return (
            <div
                className="group-card"
                onClick={(ev) => {
                    if (ev.target !== groupCard.current) return;
                    this.props;
                }}
                ref={groupCard}
            >
                <h3>{group.name}</h3>
                Group Code: <code>{group.id}</code>
                <hr />
                <div>
                    {this.state.userList.length ? (
                        this.state.userList.map((m) => this.renderUserCard(m))
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
