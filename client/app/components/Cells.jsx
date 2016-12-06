var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classnames = require('classnames');
var moment = require('moment');
var RIEInput = require('riek').RIEInput;
var RIENumber = require('riek').RIENumber;
var ExpandedSubCell = require('./ExpandedSubCell');

var Cells = React.createClass({
  propTypes: {
    keyProperty: React.PropTypes.string.isRequired,
    data: ImmutablePropTypes.map,
    headers: ImmutablePropTypes.list,
    extendedHeaders: ImmutablePropTypes.list,
    onChange: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      headers: new Immutable.List(),
      data: new Immutable.Map(),
      extendedHeaders: new Immutable.List()
    }
  },

  getInitialState: function getInitialState() {
    return {
      expanded: false
    }
  },

  onFieldChange: function onFieldChange(e) {
    var allHeaders = this.props.headers.concat(this.props.extendedHeaders);
    for(var i = 0; i < allHeaders.size; i++) {
      var prop = allHeaders.get(i).get('property');
      var type = allHeaders.get(i).get('type');

      if (typeof e[prop] !== 'undefined') {
        var value = type === 'number' ? parseInt(e[prop]) : e[prop];
        this.props.onChange(this.props.data.set(prop, value));
      }
    }
  },

  toggleExpandedProperties: function() {
    this.setState({expanded: !this.state.expanded});
  },

  isCellEditable: function isCellEditable(header) {
    return header.get('type') === 'string' || header.get('type') === 'number' || header.get('type') === 'date';
  },

  getCell: function getCell(header) {
    var cell = null;
    var value = this.props.data ? this.props.data.get(header.get('property')) : null;

    switch(header.get('type')) {
      case 'string':
        cell = (<RIEInput value={value || '--'}
                          propName={header.get('property')}
                          change={this.onFieldChange}
                          shouldBlockWhileLoading={true}
                          className="cell-editable"/>);
        break;
      case 'number':
        cell = (<RIENumber value={value || 0}
                           propName={header.get('property')}
                           change={this.onFieldChange}
                           shouldBlockWhileLoading={true}
                           className="cell-editable"/>);
        break;
      case 'date':
        var date = value ? moment(value).format("YYYY-MM-DD") : '--';
        cell = (<RIEInput value={date}
                          propName={header.get('property')}
                          change={this.onFieldChange}
                          shouldBlockWhileLoading={true}
                          className="cell-editable"/>);
        break;
      case 'image':
        cell = (<img src={value} width="32" height="32" />);
        break;
      case 'noedit':
        cell = (<div>{value ? value : '--'}</div>);
        break;
      default:
          cell = (<div>UNKNOWN TYPE</div>);
          break;
    }

    return cell;
  },

  render: function render() {
    var keyValue = this.props.data.get(this.props.keyProperty);

    if (!this.props.data || this.props.headers.size === 0 || this.props.data.size === 0)
      return null;

    var expandButton = null;
    if (this.state.expanded && this.props.extendedHeaders.size > 0) {
      expandButton = '-';
    } else if(this.props.extendedHeaders.size > 0 ) {
      expandButton = '+';
    }

    return (
      <tbody>
        <tr>
          { this.props.extendedHeaders.size > 0 ? <td onClick={this.toggleExpandedProperties} className="cell-expand-button">{expandButton}</td> : null }
          {this.props.headers.map(h =>
            <td key={keyValue+h.get('property')}
                className={classnames({ 'cell-editable': this.isCellEditable(h) })}>
              {this.getCell(h)}
            </td>
          )}
        </tr>
        {this.state.expanded && this.props.extendedHeaders.size > 0 ?
          <ExpandedSubCell headers={this.props.extendedHeaders}
                           data={this.props.data}
                           colspan={this.props.headers.size}
                           onChange={this.onFieldChange}/> :
          null}
      </tbody>
    );
  }
});

module.exports = Cells;
