var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classNames = require('classnames');

var TreeNode = React.createClass({
  propTypes: {
    data: ImmutablePropTypes.map
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: new Immutable.Map()
    }
  },

  render: function render() {
    return (
      <li className="tree-node" key={this.props.data.get('name') + this.props.data.get('id')}>
        <input type="checkbox" /> {this.props.data.get('name')}
        <ul>
          {this.props.data.get('subtypes').map(st =>
            <li className="subnode" key={st.get('name') + st.get('id')}>{st.get('name')}</li>
          )}
        </ul>
      </li>);
  }
});

module.exports = TreeNode;
