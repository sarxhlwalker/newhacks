import React from "react";
import { apiGet, apiPost } from "../api";
import { RawUserSelfData } from "../types/types";

interface IProps {}

interface IState {
    userData: RawUserSelfData | null;
}

export class Header extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            userData: null,
        };
    }

    componentDidMount() {
        let sessionID = AppStorage.assertSessionID();
        apiPost<RawUserSelfData>("users/data", {
            sid: sessionID,
        }).then((resp) => {
            this.setState({
                userData: resp.data,
            });
        });
    }

    render() {
        return (
            <div className="app-header u-full-width">
                {this.state.userData ? (
                    <span>Logged in as {this.state.userData.firstname} {this.state.userData.lastname}</span>
                ) : (
                    "Loading..."
                )}
                <a
                    href="#"
                    onClick={() => {
                        AppStorage.logout();
                    }}
                >
                    Log Out
                </a>
            </div>
        );
    }
}
