import React from "react";

interface IProps {}

interface IState {
    body: JSX.Element | null;
}

export class Modal extends React.Component<IProps, IState> {
    static currentModalInstance: Modal | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            body: null,
        };
    }

    setPopup(to: JSX.Element) {
        this.setState({
            body: to,
        });
    }

    close() {
        this.setState({
            body: null,
        });
    }

    componentDidMount() {
        Modal.currentModalInstance = this;
    }

    componentWillUnmount() {
        Modal.currentModalInstance = null;
    }

    render() {
        return this.state.body ? (
            <div className="modal" onClick={()=>{
                this.close();
            }}>
                <div className="card" onClick={(ev)=>{
                    ev.stopPropagation();
                }}>{this.state.body}</div>
            </div>
        ) : (
            ""
        );
    }
}
