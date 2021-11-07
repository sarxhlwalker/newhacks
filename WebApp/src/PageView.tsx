import React from "react";
import { Page } from "./Page";

interface IProps {
    initialPage: new (props: any) => Page;
}

interface IState {
    _currentPage: JSX.Element;
    _scrollX: number;
}

export class PageView extends React.Component<IProps, IState> {
    // Page scroll animation state variables
    targetScrollX = 0;
    _transition = 0;
    scrollSpeed = window.innerWidth / 0.33; // pixels/sec
    animationSpeed = 20; // ms between frames

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
            _scrollX: 0,
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
        this.animationInterval = (setInterval(() => {
            this.animationLoop();
        }, this.animationSpeed) as any);
    }

    componentWillUnmount() {
        clearInterval(this.animationInterval);
    }

    animationLoop() {
        const deltaTime = this.animationSpeed / 1000;

        if (this._transition == 1) {
            let scrollX = this.state._scrollX;

            this.setState({
                _scrollX: scrollX + this.scrollSpeed * deltaTime,
            });

            if (this.state._scrollX >= window.innerWidth+100) {
                this._mountPage(this.nextPage!);
                this._transition = 2;
            }
        } else if (this._transition == 2) {
            let scrollX = this.state._scrollX;

            this.setState({
                _scrollX: scrollX - this.scrollSpeed * deltaTime,
            });

            if (this.state._scrollX <= 0) {
                this.setState({
                    _scrollX: 0,
                });
                //this._transition = 0;
            }
        }
    }

    transitionToPage(toPage: new (props: any) => Page) {
        this._transition = 1;
        this.nextPage = toPage;
    }

    render() {
        return (
            <div
                style={{
                    left: -this.state._scrollX + "px",
                    width: "100%",
                    position: "absolute",
                }}
            >
                {this.state._currentPage}
            </div>
        );
    }
}
