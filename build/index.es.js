import React, { useRef, useState, useEffect, useImperativeHandle, useCallback } from 'react';
import { PageFlip } from 'page-flip';

const HTMLFlipBookForward = React.forwardRef((props, ref) => {
    const htmlElementRef = useRef(null);
    const childRef = useRef([]);
    const pageFlip = useRef();
    const [pages, setPages] = useState([]);
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
                return React.cloneElement(child, {
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
                el.removeChild = function (child) {
                    if (child.parentNode === el) {
                        return origRemoveChild(child);
                    }
                    if (child.parentNode) {
                        return child.parentNode.removeChild(child);
                    }
                    return child;
                };
                pageFlip.current = new PageFlip(el, props);
            }
            if (!pageFlip.current.getFlipController()) {
                pageFlip.current.loadFromHTML(childRef.current);
            }
            else {
                pageFlip.current.updateFromHtml(childRef.current);
            }
            // Register handlers once via ref-bridge (stable, never stale)
            if (!handlersRegistered.current) {
                const flip = pageFlip.current;
                flip.on('flip', (e) => { var _a; return (_a = onFlipRef.current) === null || _a === void 0 ? void 0 : _a.call(onFlipRef, e); });
                flip.on('changeOrientation', (e) => { var _a; return (_a = onChangeOrientationRef.current) === null || _a === void 0 ? void 0 : _a.call(onChangeOrientationRef, e); });
                flip.on('changeState', (e) => { var _a; return (_a = onChangeStateRef.current) === null || _a === void 0 ? void 0 : _a.call(onChangeStateRef, e); });
                flip.on('init', (e) => { var _a; return (_a = onInitRef.current) === null || _a === void 0 ? void 0 : _a.call(onInitRef, e); });
                flip.on('update', (e) => { var _a; return (_a = onUpdateRef.current) === null || _a === void 0 ? void 0 : _a.call(onUpdateRef, e); });
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
            var _a;
            if (pageFlip.current) {
                try {
                    (_a = pageFlip.current.getRender()) === null || _a === void 0 ? void 0 : _a.stop();
                }
                catch (_) {
                    // ignore if already destroyed
                }
                pageFlip.current = null;
            }
        };
    }, []);
    return (React.createElement("div", { ref: htmlElementRef, className: props.className, style: props.style }, pages));
});
const HTMLFlipBook = React.memo(HTMLFlipBookForward);

export { HTMLFlipBook as default };
//# sourceMappingURL=index.es.js.map
