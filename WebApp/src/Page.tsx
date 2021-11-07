import React from "react";
import { PageView } from "./PageView";

interface IProps {
    pageView: PageView;
}

interface IState {}

export abstract class Page extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    abstract pageRender(): JSX.Element;

    render() {
        return <div className="pm-page">{this.pageRender()}</div>;
    }
}
