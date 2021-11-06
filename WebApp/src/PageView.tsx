import React from "react";
import { Page } from "./Page";

interface IProps {
    initialPage: new (props: any) => Page;
}

interface IState {
    _currentPage: JSX.Element;
}

export class PageView extends React.Component<IProps, IState> {
    // Page scroll animation state variables
    targetScrollX = 0;
    playing = false;
    scrollSpeed = 3000; // pixels/sec
    animationSpeed = 25; // ms between frames

    // Animation loop interval; will be set
    // on component mount
    animationInterval = 0;

    // Current page references
    _childPageRef: React.RefObject<Page> = React.createRef();

    // Misc
    nextPage: (new (props: any) => Page) | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            _currentPage: this._instantiatePageInstance(props.initialPage),
        };
    }

    _mountPage(PageType: new (props: any) => Page) {
        let _currentPage = this._instantiatePageInstance(PageType);
        this.setState({
            _currentPage: _currentPage,
        });
    }

    _instantiatePageInstance(PageType: new (props: any) => Page) {
        return <PageType pageView={this} ref={this._childPageRef}></PageType>;
    }

    getCurrentPageInstance() {
        return this._childPageRef.current!;
    }

    componentDidMount() {
        this.animationInterval = setInterval(() => {
            this.animationLoop();
        }, this.animationSpeed);
    }

    componentWillUnmount() {
        clearInterval(this.animationInterval);
    }

    animationLoop() {
        const deltaTime = this.animationSpeed / 1000;

        let currPage = this.getCurrentPageInstance();

        if (this.playing) {
            let scrollX = currPage.state._scrollX;

            currPage.setState({
                _scrollX: scrollX + this.scrollSpeed * deltaTime,
            });
        }

        if (currPage.state._scrollX >= window.innerWidth) {
            currPage.setState({
                _scrollX: 0,
            });
            this._mountPage(this.nextPage!);
            this.playing = false;
        }
    }

    transitionToPage(toPage: new (props: any) => Page) {
        this.playing = true;
        this.nextPage = toPage;
    }

    render() {
        return <div>{this.state._currentPage}</div>;
    }
}
