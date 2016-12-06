var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classNames = require('classnames');
var TreeNode = require('./TreeNode');

var Tree = React.createClass({
  propTypes: {
    nodes: ImmutablePropTypes.list
  },

  getDefaultProps: function getDefaultProps() {
    return {
      nodes: new Immutable.List()
    }
  },

  render: function render() {
    return (
      <div>
        <ul className="tree">
          {this.props.nodes.map(n => <TreeNode data={n} />)}
        </ul>
      </div>
    );
  }
});

module.exports = Tree;
