import React from "react";
import { apiPost } from "../api";
import { Group, RawUserLookupData } from "../types/types";

interface IProps {
    userData: RawUserLookupData;
    groupData: Group;
    myId: string;
}

interface IState {}

export class UserCard extends React.Component<IProps, IState> {
    render() {
        let userIsMe = this.props.userData.id == this.props.myId;
        let amIOwner = this.props.groupData.leaderID == this.props.myId;

        return (
            <div className="user-card">
                <div className="about">
                    <span className="name">
                        {this.props.userData.firstname} {this.props.userData.lastname}
                    </span>
                </div>
                <span className="controls">
                    {userIsMe || !amIOwner ? (
                        ""
                    ) : (
                        <a
                            href="#"
                            onClick={() => {
                                apiPost("groups/kick", {
                                    sid: AppStorage.assertSessionID(),
                                    groupId: this.props.groupData.id,
                                    userId: this.props.userData.id,
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
}
