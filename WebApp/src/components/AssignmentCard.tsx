import React from "react";
import { Assignment } from "../types/types";
import { Modal } from "./Modal";

const YELLOW = "#FFB300";
const GREEN = "#7CB342";
const RED = "#E53935";

interface IProps {
    assignment: Assignment;
}

interface IState {}

export class AssignmentCard extends React.Component<IProps, IState> {
    assignmentContextModal() {
        let modal = Modal.currentModalInstance!;

        modal.setPopup(<div>
            <h1>{this.props.assignment.title}</h1>
            <hr></hr>
            <button>I've Completed this Assignment</button>
            <br />
            <span style={{textAlign: "left", display: "block", fontSize: "small"}}><a href="#">Delete this assignment</a></span>
        </div>)
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

        return (
            <div className="assn-card" onClick={()=>{
                this.assignmentContextModal();
            }}>
                <div className="row">
                    <div className="six columns">
                        <b className="title">{assn.title}</b>
                        <br />
                        <div className="description">
                            {assn.description || (
                                <span className="diminished">No description provided.</span>
                            )}
                        </div>
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
