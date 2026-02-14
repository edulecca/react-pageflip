import React, {
    ReactElement,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import { PageFlip } from 'page-flip';
import { IFlipSetting, IEventProps } from './settings';

interface IProps extends IFlipSetting, IEventProps {
    className: string;
    style: React.CSSProperties;
    children: React.ReactNode;
    renderOnlyPageLengthChange?: boolean;
}

const HTMLFlipBookForward = React.forwardRef(
    (props: IProps, ref: React.MutableRefObject<PageFlip>) => {
        const htmlElementRef = useRef<HTMLDivElement>(null);
        const childRef = useRef<HTMLElement[]>([]);
        const pageFlip = useRef<PageFlip>();

        const [pages, setPages] = useState<ReactElement[]>([]);

        // Ref-bridge: store callbacks in refs so handlers are never stale
        const onFlipRef = useRef(props.onFlip);
        const onChangeOrientationRef = useRef(props.onChangeOrientation);
        const onChangeStateRef = useRef(props.onChangeState);
        const onInitRef = useRef(props.onInit);
        const onUpdateRef = useRef(props.onUpdate);

        useEffect(() => {
            onFlipRef.current = props.onFlip;
            onChangeOrientationRef.current = props.onChangeOrientation;
            onChangeStateRef.current = props.onChangeState;
            onInitRef.current = props.onInit;
            onUpdateRef.current = props.onUpdate;
        });

        // Track whether handlers have been registered
        const handlersRegistered = useRef(false);

        useImperativeHandle(ref, () => ({
            pageFlip: () => pageFlip.current,
        }));

        const refreshOnPageDelete = useCallback(() => {
            if (pageFlip.current) {
                pageFlip.current.clear();
            }
        }, []);

        useEffect(() => {
            childRef.current = [];

            if (props.children) {
                const childList = React.Children.map(props.children, (child) => {
                    return React.cloneElement(child as ReactElement, {
                        ref: (dom) => {
                            if (dom) {
                                childRef.current.push(dom);
                            }
                        },
                    });
                });

                if (!props.renderOnlyPageLengthChange || pages.length !== childList.length) {
                    if (childList.length < pages.length) {
                        refreshOnPageDelete();
                    }

                    setPages(childList);
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [props.children]);

        useEffect(() => {
            if (pages.length > 0 && childRef.current.length > 0) {
                if (htmlElementRef.current && !pageFlip.current) {
                    // Patch removeChild to handle nodes that PageFlip reparents
                    const el = htmlElementRef.current;
                    const origRemoveChild = el.removeChild.bind(el);
                    el.removeChild = function <T extends Node>(child: T): T {
                        if (child.parentNode === el) {
                            return origRemoveChild(child);
                        }
                        if (child.parentNode) {
                            return child.parentNode.removeChild(child) as T;
                        }
                        return child;
                    };

                    pageFlip.current = new PageFlip(el, props);
                }

                if (!pageFlip.current.getFlipController()) {
                    pageFlip.current.loadFromHTML(childRef.current);
                } else {
                    pageFlip.current.updateFromHtml(childRef.current);
                }

                // Register handlers once via ref-bridge (stable, never stale)
                if (!handlersRegistered.current) {
                    const flip = pageFlip.current;
                    flip.on('flip', (e: unknown) => onFlipRef.current?.(e));
                    flip.on('changeOrientation', (e: unknown) => onChangeOrientationRef.current?.(e));
                    flip.on('changeState', (e: unknown) => onChangeStateRef.current?.(e));
                    flip.on('init', (e: unknown) => onInitRef.current?.(e));
                    flip.on('update', (e: unknown) => onUpdateRef.current?.(e));
                    handlersRegistered.current = true;
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [pages]);

        // startPage reactivity: navigate when startPage prop changes
        useEffect(() => {
            if (pageFlip.current && pageFlip.current.getFlipController()) {
                const current = pageFlip.current.getCurrentPageIndex();
                if (props.startPage !== undefined && props.startPage !== current) {
                    pageFlip.current.turnToPage(props.startPage);
                }
            }
        }, [props.startPage]);

        // Cleanup on unmount
        useEffect(() => {
            return () => {
                if (pageFlip.current) {
                    try {
                        pageFlip.current.getRender()?.stop();
                    } catch (_) {
                        // ignore if already destroyed
                    }
                    pageFlip.current = null;
                }
            };
        }, []);

        return (
            <div ref={htmlElementRef} className={props.className} style={props.style}>
                {pages}
            </div>
        );
    }
);

export const HTMLFlipBook = React.memo(HTMLFlipBookForward);
