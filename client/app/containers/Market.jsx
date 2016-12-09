var React = require('react');
var bindActionCreators = require('redux').bindActionCreators;
var connect = require('react-redux').connect;
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classNames = require('classnames');
var assign = require('object-assign');
var TypesActions = require('../actions/TypesActions');
var DataTable = require('../components/DataTable');
var Loading = require('../components/Loading');
var FixedHeader = require('../components/FixedHeader');
var NewOrder = require('../components/NewOrder');

var Items = React.createClass({
  getInitialState: function getInitialState() {
      return {
        addingOrder: false
      };
  },

  componentDidMount: function componentDidMount() {
    if (!this.props.marketdata.get('data') &&
        !this.props.marketdata.get('loading') &&
        this.validRequestTime()) {
      this.props.actions.fetchItemMarketData();
    }
  },

  validRequestTime: function() {
    return !this.props.marketdata.get('lastrequest') || (Date.now() - this.props.marketdata.get('lastrequest') > 180000);
  },

  createTreeData: function createTreeData() {
    if (!this.props.itemtypes) {
      return new Immutable.List();
    }

    var x = this.props.itemtypes.map(t => {
      return t.set('subtypes', this.props.itemtypes.filter(st => st.get('parent_id') == t.get('id')));
    });

    return x;
  },

  getTableHeaders: function getTableHeaders() {
    return Immutable.fromJS([
      { title: '', property: 'img', type: 'image' },
      { title: 'Name', property: 'name', type: 'noedit' },
      { title: 'Flip Profit', property: 'flipProfit', type: 'noedit' },
      { title: 'Max Buy', property: 'max_offer_unit_price', type: 'noedit' },
      { title: 'Min Sell', property: 'min_sale_unit_price', type: 'noedit' },
      { title: 'Num of Buys', property: 'offer_availability', type: 'noedit' },
      { title: 'Num of Sells', property: 'sale_availability', type: 'noedit' },
      { title: 'Buy Change', property: 'offer_price_change_last_hour', type: 'noedit' },
      { title: 'Sell Change', property: 'sale_price_change_last_hour', type: 'noedit' },
    ]);
  },

  prepareMarketData: function prepareMarketData() {
    if (!this.props.marketdata.get('data')) return new Immutable.List();
    return this.props.marketdata.get('data').filter(d => d.get('min_sale_unit_price') > 0 && d.get('max_offer_unit_price') > 0);
  },

  addOrder: function addOrder() {
    this.setState({addingOrder: true});
  },

  saveNewOrder: function saveNewOrder(order) {
    if (this.props.actions.postNewOrder) {
      this.props.actions.postNewOrder(order);
    }
  },

  cancelNewOrder: function cancelNewOrder() {
    this.setState({addingOrder: false});
  },

  onSearchChanged: function onSearchChanged(e) {
    this.setState({filter: e.target.value });
  },

  createOrderHeaderButtons: function createOrderHeaderButtons() {
    return [
      <button className="two columns offset-by-two" onClick={this.addOrder} disabled={this.state.addingOrder}>Add Order</button>
    ];
  },

  render: function render() {
    var newOrderElement = <NewOrder onSave={this.saveNewOrder} onCancel={this.cancelNewOrder}/>;

    return (
      <div>
        <Loading enable={this.props.marketdata.get('loading')} />
        <FixedHeader search={this.onSearchChanged}
                     buttons={this.createOrderHeaderButtons()}
                     extend={this.state.addingOrder}
                     extendElement={newOrderElement}/>
        <div id="market-content">
          <DataTable headers={this.getTableHeaders()}
                     data={this.prepareMarketData()} />
        </div>
      </div>
    );
  }
});

const mapStateToProps = (state) => {
  return {
    items: state.items,
    marketdata: state.marketdata
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(TypesActions, dispatch)
  }
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(Items);
