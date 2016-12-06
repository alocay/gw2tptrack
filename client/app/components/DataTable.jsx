var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classNames = require('classnames');
var Cells = require('./Cells');

var DataTable = React.createClass({
  propTypes: {
    headers: ImmutablePropTypes.list,
    data: ImmutablePropTypes.list,
    extendedHeaders: ImmutablePropTypes.list,
    keyProperty: React.PropTypes.string,
    onChange: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      headers: new Immutable.List(),
      data: new Immutable.List(),
      extendedHeaders: new Immutable.List(),
      keyProperty: 'data_id'
    }
  },

  getInitialState: function getInitialState() {
    return {
      sortBy: null,
      ascending: false,
      expanded: false
    }
  },

  sortByHeader: function sortByHeader(property) {
    this.setState({sortBy: property});
  },

  onFieldChanged: function(change) {
  },

  render: function render() {
    if (!this.props.data) {
        return <div>No Data...</div>;
    }

    var data = this.props.data;
    if (this.state.sortBy) {
      data = this.props.data.sortBy(d => d.get(this.state.sortBy));
      data = !this.state.ascending ? data.reverse() : data;
    }

    return (
      <table>
        <thead>
          <tr>
            {this.props.extendedHeaders.size > 0 ? <th></th> : null}
            {this.props.headers.map(h =>
              <th key={h.get('property')}
                  onClick={this.sortByHeader.bind(null, h.get('property'))}>{h.get('title')}</th>
              )}
          </tr>
        </thead>
        {data.map(d =>
          <Cells key={d.get(this.props.keyProperty)}
                 keyProperty={this.props.keyProperty}
                 data={d}
                 headers={this.props.headers}
                 extendedHeaders={this.props.extendedHeaders}
                 onChange={this.props.onChange} />
         )}
      </table>
    );

  }
});

module.exports = DataTable;
