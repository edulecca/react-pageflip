'use strict';

var React = require('react');
var pageFlip = require('page-flip');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const HTMLFlipBookForward = React__default["default"].forwardRef((props, ref) => {
    const htmlElementRef = React.useRef(null);
    const childRef = React.useRef([]);
    const pageFlip$1 = React.useRef();
    const [pages, setPages] = React.useState([]);
    // Ref-bridge: store callbacks in refs so handlers are never stale
    const onFlipRef = React.useRef(props.onFlip);
    const onChangeOrientationRef = React.useRef(props.onChangeOrientation);
    const onChangeStateRef = React.useRef(props.onChangeState);
    const onInitRef = React.useRef(props.onInit);
    const onUpdateRef = React.useRef(props.onUpdate);
    React.useEffect(() => {
        onFlipRef.current = props.onFlip;
        onChangeOrientationRef.current = props.onChangeOrientation;
        onChangeStateRef.current = props.onChangeState;
        onInitRef.current = props.onInit;
        onUpdateRef.current = props.onUpdate;
    });
    // Track whether handlers have been registered
    const handlersRegistered = React.useRef(false);
    React.useImperativeHandle(ref, () => ({
        pageFlip: () => pageFlip$1.current,
    }));
    const refreshOnPageDelete = React.useCallback(() => {
        if (pageFlip$1.current) {
            pageFlip$1.current.clear();
        }
    }, []);
    React.useEffect(() => {
        childRef.current = [];
        if (props.children) {
            const childList = React__default["default"].Children.map(props.children, (child) => {
                return React__default["default"].cloneElement(child, {
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
    React.useEffect(() => {
        if (pages.length > 0 && childRef.current.length > 0) {
            if (htmlElementRef.current && !pageFlip$1.current) {
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
                pageFlip$1.current = new pageFlip.PageFlip(el, props);
            }
            if (!pageFlip$1.current.getFlipController()) {
                pageFlip$1.current.loadFromHTML(childRef.current);
            }
            else {
                pageFlip$1.current.updateFromHtml(childRef.current);
            }
            // Register handlers once via ref-bridge (stable, never stale)
            if (!handlersRegistered.current) {
                const flip = pageFlip$1.current;
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
    React.useEffect(() => {
        if (pageFlip$1.current && pageFlip$1.current.getFlipController()) {
            const current = pageFlip$1.current.getCurrentPageIndex();
            if (props.startPage !== undefined && props.startPage !== current) {
                pageFlip$1.current.turnToPage(props.startPage);
            }
        }
    }, [props.startPage]);
    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            var _a;
            if (pageFlip$1.current) {
                try {
                    (_a = pageFlip$1.current.getRender()) === null || _a === void 0 ? void 0 : _a.stop();
                }
                catch (_) {
                    // ignore if already destroyed
                }
                pageFlip$1.current = null;
            }
        };
    }, []);
    return (React__default["default"].createElement("div", { ref: htmlElementRef, className: props.className, style: props.style }, pages));
});
const HTMLFlipBook = React__default["default"].memo(HTMLFlipBookForward);

module.exports = HTMLFlipBook;
//# sourceMappingURL=index.js.map
