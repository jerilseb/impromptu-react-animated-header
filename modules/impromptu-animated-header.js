var React = require('react');
var tweenState = require('react-tween-state');

var Item = React.createClass({
    displayName: 'Item',

    render: function () {
        return null;
    }
});

var Brand = React.createClass({
    displayName: 'Brand',

    render: function () {
        return null;
    }
});

var TopMenu = React.createClass({
    displayName: 'TopMenu',

    mixins: [tweenState.Mixin],
    getDefaultProps: function () {
        return {
            align: 'left',
            brandAlign: 'left',
            autoClose: true,
            threshold: 769,
            cssTransitions: false,
            animate: true,
            duration: 300
        };
    },
    getInitialState: function () {
        var innerWidth = window.innerWidth;
        return {
            expanded: false,
            wide: innerWidth >= this.props.threshold,
            scrolled: window.pageYOffset > 1,
            maskHeight: 0
        };
    },
    toggleExpanded: function () {
        var expanded = !this.state.expanded,
            height = this.refs.anchor.getDOMNode().clientHeight;
        if (true === this.props.animate) {
            this.setState({ expanded: expanded });
            this.tweenState('maskHeight', {
                easing: tweenState.easingTypes.easeInOutQuad,
                duration: this.props.duration,
                endValue: expanded ? height : 0
            });
        } else {
            this.setState({
                expanded: expanded,
                maskHeight: expanded ? height : 0
            });
        }
    },
    handleResize: function (e) {
        var innerWidth = window.innerWidth,
            oldWide = this.state.wide,
            newWide = innerWidth >= this.props.threshold;
        if (true === this.state.expanded && true === oldWide && false === newWide) {
            this.setState({
                expanded: false,
                maskHeight: 0,
                wide: false
            });
            return;
        }
        if (oldWide != newWide) this.setState({ wide: newWide });
    },
    handleScroll: function (e) {
        var scrolled = this.state.scrolled,
            newScrolled = window.pageYOffset > 1;
        if (scrolled != newScrolled) this.setState({ scrolled: newScrolled });
    },
    componentWillUnmount: function () {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
    },
    componentDidMount: function () {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll);
    },
    render: function () {
        var brandStyle = {};
        var buttonStyle = {};
        if ('right' === this.props.brandAlign) {
            brandStyle = { float: 'right' };
            buttonStyle = { float: 'left' };
        }
        var brand = React.createElement('span', null);
        var items = React.Children.map(this.props.children, function (item) {
            if (item.type === Item) {
                var onClick = function () {
                    if ('function' === typeof item.props.onClick) item.props.onClick();
                    if (true === this.props.autoClose) this.toggleExpanded();
                };
                return React.createElement(
                    'li',
                    { onClick: onClick.bind(this) },
                    item.props.children
                );
            } else if (item.type === Brand) {
                brand = React.createElement(
                    'span',
                    { style: brandStyle, className: 'nav-logo ' + (true === this.state.wide ? 'nav-logo-full' : 'nav-logo-compact') },
                    item.props.children
                );
            } else {
                return item;
            }
        }.bind(this));
        var animClass = true === this.props.cssTransitions ? 'nav-transitions' : '';
        if (true === this.state.wide) {
            var cssClass = this.state.scrolled ? 'sticky' : 'fixed';
            return React.createElement(
                'header',
                { className: animClass ? cssClass + ' ' + animClass : cssClass },
                brand,
                React.createElement(
                    'nav',
                    { className: 'nav-collapse nav-full' + ('right' === this.props.align ? ' nav-right' : '') },
                    React.createElement(
                        'ul',
                        { ref: 'anchor' },
                        items
                    )
                )
            );
        } else {
            return React.createElement(
                'header',
                { className: animClass },
                brand,
                React.createElement(
                    'a',
                    { style: buttonStyle, href: 'javascript:', onClick: this.toggleExpanded, className: 'nav-toggle' + (this.state.expanded ? ' active' : '') },
                    'Menu'
                ),
                React.createElement(
                    'nav',
                    { className: 'nav-collapse nav-compact' },
                    React.createElement(
                        'div',
                        { className: 'mask', style: { height: this.getTweeningValue('maskHeight') } },
                        React.createElement(
                            'ul',
                            { ref: 'anchor' },
                            items
                        )
                    )
                )
            );
        }
    }
});

module.exports = {
    TopMenu: TopMenu,
    MenuItem: Item,
    MenuBrand: Brand
};
