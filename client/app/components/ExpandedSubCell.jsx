var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classNames = require('classnames');
var moment = require('moment');
var RIEInput = require('riek').RIEInput;
var RIENumber = require('riek').RIENumber;
var DatePicker = require('./DatePicker');

var Cell = React.createClass({
  propTypes: {
    colspan: React.PropTypes.number,
    headers: ImmutablePropTypes.list,
    data: ImmutablePropTypes.map,
    onChange: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: new Immutable.Map(),
      headers: new Immutable.List()
    }
  },

  getInitialState: function getInitialState() {
    return {
    }
  },

  getCell: function getCell(header) {
    var cell = null;
    var value = this.props.data ? this.props.data.get(header.get('property')) : null;

    switch(header.get('type')) {
      case 'string':
        cell = (<RIEInput value={value || '--'}
                          propName={header.get('property')}
                          change={this.props.onChange}
                          shouldBlockWhileLoading={true}
                          className="cell-editable"/>);
        break;
      case 'number':
        cell = (<RIENumber value={value || 0}
                           propName={header.get('property')}
                           change={this.props.onChange}
                           shouldBlockWhileLoading={true}
                           className="cell-editable"/>);
        break;
      case 'date':
        var date = value ? moment(value).format("YYYY-MM-DD") : '--';
        cell = (<DatePicker value={date}
                            propName={header.get('property')}
                            change={this.props.onChange}
                            className="cell-editable" />);
        break;
      case 'image':
        cell = (<img src={value} width="32" height="32" />);
        break;
      case 'noedit':
        cell = (<span>{value ? value : '--'}</span>);
        break;
      default:
          cell = (<span>UNKNOWN TYPE</span>);
          break;
    }

    return cell;
  },

  render: function render() {
    if (this.props.headers.size === 0 || !this.props.data || this.props.data.size === 0)
      return <div>No data</div>;

    return (
      <tr>
        <td></td>
        <td colSpan={this.props.colspan}>
          {this.props.headers.map(h =>
            <div key={h.get('property')}>
              <span className="expanded-cell-title">{h.get('title')}:</span>
              {this.getCell(h)}
            </div>
          )}
        </td>
      </tr>
    );

  }
});

module.exports = Cell;
