import React from "react";
import { Group } from "../types/types";

interface IProps {
    groupData: Group;
}

interface IState {}

export class GroupCard extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        let group = this.props.groupData;

        return (
            <div className="group-card">
                <h3>{group.name}</h3>
                Group Code: <code>{group.id}</code>
                <hr />
                <div>fsadljsdlk</div>
                <hr />
                <div>
                <span className="row footer">
                    <a href="#">Leave Group</a>
                </span>
                </div>
            </div>
        );
    }
}
