var React = require('react');
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classNames = require('classnames');
const uuid = require('uuid/v1');

var NewOrder = React.createClass({
  propTypes: {
    headers: ImmutablePropTypes.list.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      order: this.createEmptyOrder()
    }
  },

  createEmptyOrder: function createEmptyOrder() {
    return Immutable.fromJS({
      id: uuid(),
      name: null,
      buy_price: null,
      amount_ordered: null,
      predicted_sell_unit_price: null,
      date_ordered: null
    });
  },

  onBlur: function onChange(e) {
    this.setState({order: this.state.order.set(e.target.name, e.target.value)});
  },

  saveRow: function saveRow() {
    if (this.props.onSave) {
      this.props.onSave(this.state.order);
    }
  },

  cancelRow: function cancelRow() {
    this.setState({order: this.createEmptyOrder()});

    if (this.props.onCancel) {
      this.props.onCancel();
    }
  },

  getCell: function getCell(header) {
    var cell = null;

    switch(header.get('type')) {
      case 'string':
      case 'date':
        cell = (
          <td key={header.get('property')}>
            <input type='text'
                   name={header.get('property')}
                   onBlur={this.onBlur} />
          </td>);
        break;
      case 'number':
        cell = (
          <td key={header.get('property')}>
            <input type='number'
                   name={header.get('property')}
                   onBlur={this.onBlur} />
         </td>);
        break;
      case 'date':
        cell = (
          <td key={header.get('property')}>
            <input type='date'
                   name={header.get('property')}
                   onBlur={this.onBlur} />
          </td>);
        break;
      default:
          cell = (<td key={header.get('property')}><span>UNKNOWN TYPE</span></td>);
          break;
    }

    return cell;
  },

  render: function render() {
    return (
      <table className="new-row-table">
        <thead>
          <tr>
            {this.props.headers.map(h =>
              <th key={h.get('property')}>{h.get('title')}</th>
            )}
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {this.props.headers.map(h => this.getCell(h))}
            <td><button onClick={this.saveRow}>Save</button></td>
            <td><button onClick={this.cancelRow}>Cancel</button></td>
          </tr>
        </tbody>
      </table>
    );
  }
});

module.exports = NewOrder;
