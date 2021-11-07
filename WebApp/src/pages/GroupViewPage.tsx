import React from "react";
import { apiPost } from "../api";
import { AssignmentCard } from "../components/AssignmentCard";
import { Modal } from "../components/Modal";
import { Header } from "../components/PageHeader";
import { UserCard } from "../components/UserCard";
import { Page } from "../Page";
import { PageView } from "../PageView";
import {
    convertRawAssignment,
    convertRawGroupData,
    Group,
    RawGroupData,
    RawUserLookupData,
    RawUserSelfData,
} from "../types/types";
import { GroupsPage } from "./GroupsPage";

const SEC = 1000;
const MIN = 60 * SEC;
const HR = 60 * MIN;

interface IProps {
    pageView: PageView;
    groupId: string;
}

interface IState {
    groupData: Group | null;
    userList: RawUserLookupData[];
}

class GroupViewContainer extends React.Component<IProps, IState> {
    selfDataCache: RawUserSelfData | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            groupData: null,
            userList: [],
        };
    }

    renderAssignmentList() {
        let groupData = this.state.groupData!;
        let rawAssignments = [...groupData.assignments].sort((a, b) => a.date - b.date);

        let assignments = rawAssignments.map((m) => convertRawAssignment(m));

        if (groupData.assignments.length) {
            return (
                <>
                    {assignments.map((a) => (
                        <AssignmentCard assignment={a} key={a.id}></AssignmentCard>
                    ))}
                </>
            );
        } else {
            return <span className="diminished">No assignments yet</span>;
        }
    }

    _parseTimeString(timeStr: string) {
        /*
            Parses a time string into a number of milliseconds
            from 12:00 AM of that day. Will throw an error as
            a string message, if there was a problem.
        */

        // Lower case, remove spaces
        timeStr = timeStr.toLowerCase().replace(/ /g, "");

        // match time to regex
        if (!timeStr.match(/\d+:\d+(am|pm)/)) throw "Invalid time string (must be AM/PM time)";

        // AM or PM ?
        let pm = timeStr.includes("pm");

        // parse time
        let hhmm: string[] = timeStr.match(/\d+/g)!;
        let [hhStr, mmStr] = hhmm;

        let hh = Number.parseInt(hhStr);
        let mm = Number.parseInt(mmStr);

        if (hh <= 0 || hh > 12) throw "Invalid time string (hh must be in [1, 12])";

        // makes math easier
        if (hh == 12) hh = 0;

        // add pm
        if (pm) hh += 12;

        return hh * HR + mm * MIN;
    }

    createAssignmentModal() {
        let modal = Modal.currentModalInstance!;
        let titleInput = React.createRef<HTMLInputElement>();
        let descInput = React.createRef<HTMLTextAreaElement>();
        let dateInput = React.createRef<HTMLInputElement>();
        let timeInput = React.createRef<HTMLInputElement>();
        let errorMsg = React.createRef<HTMLSpanElement>();

        modal.setPopup(
            <div>
                <h1>Create Assignment</h1>
                <hr></hr>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <input placeholder="Assignment Name" type="text" ref={titleInput}></input>
                    <textarea
                        placeholder="Description (Optional)"
                        style={{
                            resize: "none",
                            height: "10em",
                        }}
                        cols={100}
                        ref={descInput}
                    ></textarea>
                    <span
                        className="row"
                        style={{
                            textAlign: "left",
                        }}
                    >
                        <input type="date" ref={dateInput}></input>{" "}
                        <input
                            type="text"
                            placeholder="Time (Default 11:59 PM)"
                            ref={timeInput}
                        ></input>
                    </span>
                    <button
                        onClick={() => {
                            let title = titleInput.current!.value;
                            let description = descInput.current!.value;
                            let date = dateInput.current!.valueAsDate;
                            let timeStr = timeInput.current!.value || "11:59pm";

                            let setErr = (err: string) => {
                                errorMsg.current!.innerText = "Error: " + err;
                            };

                            // Parse and validate date and time

                            if (date === null) {
                                setErr("Invalid date");
                                return;
                            }

                            let dateTimestamp =
                                date.getTime() + new Date().getTimezoneOffset() * MIN;
                            let timeOffset;

                            try {
                                timeOffset = this._parseTimeString(timeStr);
                            } catch (err) {
                                setErr(err as string);
                                return;
                            }

                            dateTimestamp += timeOffset;

                            if (dateTimestamp < Date.now()) {
                                setErr("Date is set in the past");
                                return;
                            }

                            apiPost("assignments/create", {
                                sid: AppStorage.assertSessionID(),
                                groupId: this.props.groupId,
                                date: dateTimestamp,
                                title: title,
                                description: description,
                            }).then((response) => {
                                if (!response.ok) {
                                    setErr(response.error!);
                                } else {
                                    this.fetchGroupData();
                                    modal.close();
                                }
                            });
                        }}
                    >
                        Create
                    </button>
                    <br />
                    <div style={{ textAlign: "left" }}>
                        <span ref={errorMsg} style={{ color: "#E53935" }}></span>
                    </div>
                </div>
            </div>
        );
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
                Group Code:{" "}
                <code>{this.state.groupData!.id}</code>
                <br />
                <a
                    href="#"
                    onClick={() => {
                        this.props.pageView.transitionToPage(GroupsPage);
                    }}
                >
                    Back
                </a>
                <hr />
                <div className="row">
                    <div className="four columns assignments-list-container">
                        <h3>Members</h3>
                        {this.state.userList.length ? (
                            this.state.userList.map((m) => (
                                <UserCard
                                    userData={m}
                                    groupData={groupData}
                                    myId={this.selfDataCache!.id}
                                    key={m.username}
                                ></UserCard>
                            ))
                        ) : (
                            <span className="diminished">This group has no members</span>
                        )}
                    </div>
                    <div className="eight columns assignments-list-container">
                        <h3>Assignments</h3>
                        <span className="row">
                            <button
                                onClick={() => {
                                    this.createAssignmentModal();
                                }}
                            >
                                Create Assignment
                            </button>
                        </span>
                        <hr></hr>
                        <div className="assignments-list">{this.renderAssignmentList()}</div>
                    </div>
                </div>
                <hr />
            </>
        );
    }

    amIOwner() {
        return this.state.groupData?.leaderID === this.selfDataCache!.id;
    }

    fetchGroupData() {
        apiPost<{ groups: RawGroupData[] }>("groups/get", {
            sid: AppStorage.assertSessionID(),
        }).then((response) => {
            if (response.ok) {
                let rawGroupData = response.data!;
                let groupData = rawGroupData.groups.map((g) => convertRawGroupData(g));
                let thisGroup = groupData.filter((g) => g.id === this.props.groupId)[0];

                this.setState({
                    groupData: thisGroup,
                });

                // Then, fetch group member data
                (async () => {
                    let userData: RawUserLookupData[] = [];

                    for (let userID of thisGroup.memberIDs) {
                        let resp = await apiPost<RawUserLookupData>("users/lookup", {
                            id: userID,
                        });

                        if (resp.ok) {
                            userData.push(resp.data!);
                        }
                    }

                    return userData;
                })().then((userList) => {
                    // Then, update state
                    this.setState({
                        userList: userList,
                    });
                });
            }
        });
    }

    componentDidMount() {
        // Do not read this function.

        // Fetch self user data
        apiPost<RawUserSelfData>("users/data", {
            sid: AppStorage.assertSessionID(),
        }).then((response) => {
            this.selfDataCache = response.data!;
            // Then, fetch group data
            this.fetchGroupData();
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
                <Modal></Modal>
            </>
        );
    }
}
