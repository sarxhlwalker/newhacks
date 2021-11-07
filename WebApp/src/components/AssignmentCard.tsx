import React from "react";
import { apiPost } from "../api";
import { Assignment, Group, RawUserLookupData, RawUserSelfData } from "../types/types";
import { Modal } from "./Modal";

const YELLOW = "#FFB300";
const GREEN = "#7CB342";
const RED = "#E53935";

interface IProps {
    assignment: Assignment;
    selfDataCache: RawUserSelfData;
    groupMembers: RawUserLookupData[];
    groupId: string;
}

interface IState {}

export class AssignmentCard extends React.Component<IProps, IState> {
    assignmentContextModal() {
        let modal = Modal.currentModalInstance!;
        let errorMsg = React.createRef<HTMLSpanElement>();

        modal.setPopup(
            <div>
                <h1>{this.props.assignment.title}</h1>
                <hr></hr>
                <button
                    onClick={() => {
                        apiPost("assignments/mark/done", {
                            sid: AppStorage.assertSessionID(),
                            assignmentId: this.props.assignment.id,
                            groupId: this.props.groupId,
                        }).then((resp) => {
                            if (resp.ok) {
                                window.location.reload();
                            } else {
                                errorMsg.current!.innerText = "Error: " + resp.error!;
                            }
                        });
                    }}
                >
                    I've Completed this Assignment
                </button>
                <br />
                <span style={{ textAlign: "left", display: "block", fontSize: "small" }}>
                    <a
                        href="#"
                        onClick={() => {
                            apiPost("assignments/delete", {
                                sid: AppStorage.assertSessionID(),
                                assignmentId: this.props.assignment.id,
                            }).then((resp) => {
                                if (resp.ok) {
                                    window.location.reload();
                                } else {
                                    errorMsg.current!.innerText = "Error: " + resp.error!;
                                }
                            });
                        }}
                    >
                        Delete this assignment
                    </a>
                </span>
                <br />
                <div style={{ textAlign: "left" }}>
                    <span ref={errorMsg} style={{ color: "#E53935" }}></span>
                </div>
            </div>
        );
    }

    render() {
        const SEC = 1000;
        const MIN = 60 * SEC;
        const HR = 60 * MIN;
        const DAY = 24 * HR;

        let assn = this.props.assignment;
        let dueDateText = assn.date.toLocaleDateString("en-US");
        let dueTimeText = assn.date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
        let dueText = "Due " + dueDateText + " at " + dueTimeText;

        let dueTimestamp = assn.date.getTime();
        let dueInWhen = dueTimestamp - Date.now();

        let dueInWhenText = "";

        // Display urgency by color
        let dueColor = GREEN;
        if (dueInWhen < DAY) {
            dueColor = YELLOW;
        }
        if (dueInWhen < 0) {
            dueColor = RED;
        }

        let overdue = dueInWhen < 0;
        dueInWhen = Math.abs(dueInWhen);

        // "Due in [xyz]"
        if (dueInWhen <= 60 * MIN) {
            dueInWhenText = Math.round(dueInWhen / MIN) + " minutes";
        } else if (dueInWhen <= 24 * HR) {
            dueInWhenText = Math.round(dueInWhen / HR) + " hours";
        } else {
            dueInWhenText = Math.round(dueInWhen / DAY) + " days";
        }

        // Did I finish this assignment?
        let didFinish = this.props.assignment.completedBy.includes(this.props.selfDataCache.id);

        // User objects of all people who finished this assignment
        let usersWhoCompleted = this.props.assignment.completedBy.map((userId) => {
            for (let user of this.props.groupMembers) {
                if (user.id === userId) {
                    return user;
                }
            }
            throw new Error("User not found " + userId);
        });

        let completedList;

        if (usersWhoCompleted.length) {
            completedList = (
                <>
                    <b>Completed by:</b>
                    <ul>
                        {usersWhoCompleted.map((u) => (
                            <li key={u.id}>{u.firstname + " " + u.lastname}</li>
                        ))}
                    </ul>
                </>
            );
        } else {
            completedList = (
                <span style={{ fontSize: "small" }}>Nobody has completed this assignment yet.</span>
            );
        }

        return (
            <div
                className={didFinish ? "assn-card assn-completed" : "assn-card"}
                onClick={() => {
                    this.assignmentContextModal();
                }}
            >
                <div className="row">
                    <div className="six columns">
                        <b className="title">{assn.title}</b>
                        <br />
                        <div className="description">
                            {assn.description || (
                                <span className="diminished">No description provided.</span>
                            )}
                        </div>
                        <div>{completedList}</div>
                    </div>
                    <div className="six columns right">
                        <div style={{ color: dueColor }}>
                            <span>{dueText}</span>
                        </div>
                        <div style={{ color: dueColor }}>
                            {!overdue ? (
                                <span>(in {dueInWhenText})</span>
                            ) : (
                                <span>({dueInWhenText} ago)</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
