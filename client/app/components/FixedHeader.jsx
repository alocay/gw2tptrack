var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classnames = require('classnames');
var moment = require('moment');
var RIEInput = require('riek').RIEInput;
var RIENumber = require('riek').RIENumber;
var DatePicker = require('./DatePicker');

var FixedHeader = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    search: React.PropTypes.func,
    buttons: React.PropTypes.array,
    subElements: React.PropTypes.array,
    extend: React.PropTypes.bool,
    extendElement: React.PropTypes.element,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      buttons: []
    };
  },

  /*<button className={classnames({'two columns': true, 'offset-by-two': i === 0, [b.class]: true})}
          onClick={b.click}
          disabled={b.disabled}>{b.text}</button>*/

  render: function render() {
    return (
      <div id="fixed-header" className={this.props.className}>
        <div className="container">
          <div className="row">
            <input className="four columns" type="text" placeholder="Search" onKeyUp={this.props.search}></input>
            {this.props.buttons}
          </div>
          {this.props.subElements}
          {this.props.extend ? this.props.extendElement : null}
        </div>
      </div>
    );
  }
});

module.exports = FixedHeader;
