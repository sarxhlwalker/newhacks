import React from "react";

export class AlertBox extends React.Component {
    render() {
        return <div className="alert-box">
            {this.props.children}
        </div>
    }
}