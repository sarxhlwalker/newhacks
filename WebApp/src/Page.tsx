import React from "react";
import { PageView } from "./PageView";

interface IProps {
    pageView: PageView;
}

interface IState {
    _scrollX: number;
}

export abstract class Page extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            _scrollX: 0,
        };
    }

    abstract pageRender(): JSX.Element;

    render() {
        return (
            <div
                className="pm-page"
                style={{
                    left: -this.state._scrollX + "px",
                    position: "absolute",
                }}
            >
                {this.pageRender()}
            </div>
        );
    }
}
