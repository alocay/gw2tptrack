var React = require('react');
var bindActionCreators = require('redux').bindActionCreators;
var connect = require('react-redux').connect;
var withRouter = require('react-router').withRouter;
var Immutable = require('immutable');
var ImmutablePropTypes = require('react-immutable-proptypes');
var classNames = require('classnames');
var assign = require('object-assign');
var TypesActions = require('../actions/TypesActions');
var Constants = require('../constants/Constants');
var DataTable = require('../components/DataTable');
var NewOrder = require('../components/NewOrder');
var Loading = require('../components/Loading');
var FixedHeader = require('../components/FixedHeader');

var Orders = React.createClass({
  getInitialState: function getInitialState() {
      return {
        filter: null,
        detailedOrders: new Immutable.List(),
        addingOrder: false,
        modifiedOrders: new Immutable.List(),
        updateIncoming: false
      };
  },

  componentDidMount: function componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);

    if (!this.props.orders.get('data') && !this.props.orders.get('loading')) {
      this.props.actions.fetchOrders();
    } else if (this.props.orders.get('data')) {
      this.setState({
        detailedOrders: this.calculateAllOrderDetails(this.props.orders.get('data'))
      });
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.orders.get('data')) {
      if (!nextProps.orders.get('updating') && this.props.orders.get('updating')) {
        // Updated orders incoming
        this.setState({ updateIncoming: true });
      } else if (this.state.updateIncoming) {
        // Update is complete, refresh the whole list
        this.setState({
          updateIncoming: false,
          detailedOrders: this.calculateAllOrderDetails(nextProps.orders.get('data'))
        });
      } else if (nextProps.orders.get('data').size > this.state.detailedOrders.size) {
        // If there are new orders, don't lose changes made to current ones. Just append the new ones.
        var detailed = this.calculateAllOrderDetails(nextProps.orders.get('data'));
        this.setState({
          detailedOrders: this.state.detailedOrders.concat(detailed.slice(this.state.detailedOrders.size, detailed.size))
        });
      }
    }
  },

  routerWillLeave: function routerWillLeave(nextLocation) {
    if (this.state.modifiedOrders.size > 0) {
      return "Modified orders weren't saved. Do you want to leave them unsaved?";
    }
  },

  filterOrders: function filterOrders(orders) {
    var filtered = this.state.filter && this.state.filter != '' ?
      orders.filter(o => o.get('name').indexOf(this.state.filter) != -1) :
      orders;

    return filtered;
  },

  getTableHeaders: function getTableHeaders() {
    return Immutable.fromJS([
      { title: 'Name', property: 'name', type: 'string' },
      { title: 'Buy Price', property: 'buy_price', type: 'number' },
      { title: 'Amount Ordered', property: 'amount_ordered', type: 'number' },
      { title: 'Total Cost', property: 'total_cost', type: 'noedit' },
      { title: 'Predicted Sell Unit Price', property: 'predicted_sell_unit_price', type: 'number' },
      { title: 'Predicted Profit', property: 'predicted_profit', type: 'noedit' },
      { title: 'Amount Filled', property: 'amount_filled', type: 'number' },
      { title: 'Actual Cost', property: 'actual_total_cost', type: 'noedit' },
      { title: 'Amount Listed', property: 'amount_listed', type: 'number' },
      { title: 'Amount Sold', property: 'amount_sold', type: 'number' },
      { title: 'Actual Profit', property: 'actual_profit', type: 'noedit' },
      { title: 'Actual Sell Unit Price', property: 'actual_sell_unit_price', type: 'number' },
    ]);
  },

  getExtendedHeaders: function getExtendedHeaders() {
    return Immutable.fromJS([
      { title: 'Predicted Sale Taxed', property: 'predicted_total_sale_aftertax', type: 'noedit' },
      { title: 'Actual Sale Taxed', property: 'actual_total_sale_aftertax', type: 'noedit' },
      { title: 'Profit Per Unit', property: 'profit_per_unit', type: 'noedit' },
      { title: 'Date Ordered', property: 'date_ordered', type: 'date' },
      { title: 'Date Filled', property: 'date_filled', type: 'date' },
      { title: 'Date Sold', property: 'date_sold', type: 'date' }
    ]);
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

  onOrderChanged: function onOrderChanged(changedOrder) {
    var orderIndex = this.state.detailedOrders.findIndex(o => o.get('id') === changedOrder.get('id'));
    var modifiedOrderIndex = this.state.modifiedOrders.findIndex(o => o.get('id') === changedOrder.get('id'));

    if (orderIndex > -1) {
      var order = this.calculateOrderDetails(changedOrder);

      this.setState({
        detailedOrders: this.state.detailedOrders.set(orderIndex, order),
        modifiedOrders: modifiedOrderIndex > -1 ? this.state.modifiedOrders.set(modifiedOrderIndex, order) : this.state.modifiedOrders.push(order)
      });
    }
  },

  saveChanges: function saveChanges() {
    if (this.props.actions.postUpdatedOrders) {
      this.props.actions.postUpdatedOrders(this.state.modifiedOrders.toJS());
    }
  },

  cancelChanges: function cancelChanges() {
    this.setState({
      detailedOrders: this.calculateAllOrderDetails(this.props.orders.get('data')),
      modifiedOrders: this.state.modifiedOrders.clear()
    })
  },

  calculateAllOrderDetails: function(orders) {
    return orders.map(o => this.calculateOrderDetails(o));
  },

  calculateOrderDetails: function calculateOrderDetails(order) {
    var totalCost = order.get('buy_price') * order.get('amount_ordered');
    var predictedTotal = order.get('predicted_sell_unit_price') * order.get('amount_ordered');
    var predictedTotalTax = predictedTotal - (predictedTotal * Constants.LISTING_FEE) - (predictedTotal * Constants.TRANSACTION_FEE);

    var orderWithPredictions = order.withMutations(o => {
      o.set('total_cost', totalCost)
       .set('predicted_total_sale', predictedTotal)
       .set('predicted_total_sale_aftertax', predictedTotalTax)
       .set('predicted_profit', predictedTotalTax - totalCost);
    });

    if (order.get('actual_sell_unit_price') && order.get('amount_filled') && order.get('amount_listed') && order.get('amount_sold')) {
      var actualCost = order.get('amount_filled') * order.get('buy_price');
      var actualTotalListed = order.get('actual_sell_unit_price') * order.get('amount_listed');
      var actualTotal = order.get('actual_sell_unit_price') * order.get('amount_sold');
      var actualTotalTax = actualTotal - (actualTotalListed * Constants.LISTING_FEE) - (actualTotal * Constants.TRANSACTION_FEE);
      var actualProfit = actualTotalTax - actualCost;
      var orderWithActuals = orderWithPredictions.withMutations(o => {
        o.set('actual_total_cost', actualCost)
         .set('actual_total_sale', actualTotal)
         .set('actual_total_sale_aftertax', actualTotalTax)
         .set('actual_profit', actualProfit)
         .set('profit_per_unit', actualProfit / o.get('amount_sold'))
         .set('profit_differential', actualProfit - o.get('predicted_profit'));
      });

      return orderWithActuals;
    }

    return orderWithPredictions;
  },

  calculateTotalProfit: function calculateTotalProfit(orders) {
    return orders.reduce((a, b) => b.get('actual_profit') ? a + b.get('actual_profit') : a, 0);
  },

  createOrderHeaderButtons: function createOrderHeaderButtons() {
    return [
      <button className="two columns offset-by-two" onClick={this.addOrder} disabled={this.state.addingOrder}>Add Order</button>,
      <button className="two columns save-order-changes" onClick={this.saveChanges} disabled={this.state.modifiedOrders.size === 0}>Save</button>,
      <button className="two columns cancel-order-changes" onClick={this.cancelChanges} disabled={this.state.modifiedOrders.size === 0}>Cancel</button>,
    ];
  },

  render: function render() {
    var filteredOrders = this.filterOrders(this.state.detailedOrders);
    var totalProfitElement = <div>Total Profit: {this.calculateTotalProfit(filteredOrders)}</div>;
    var newOrderElement = <NewOrder onSave={this.saveNewOrder} onCancel={this.cancelNewOrder}/>;

    return (
      <div>
        <Loading enable={this.props.orders.get('loading') || this.props.orders.get('updating')} />
        <FixedHeader search={this.onSearchChanged}
                     buttons={this.createOrderHeaderButtons()}
                     subElements={totalProfitElement}
                     extend={this.state.addingOrder}
                     extendElement={newOrderElement}/>
        <div id="orders-content">
          <DataTable headers={this.getTableHeaders()}
                     data={filteredOrders}
                     extendedHeaders={this.getExtendedHeaders()}
                     keyProperty={'id'}
                     onChange={this.onOrderChanged} />
        </div>
      </div>
    );
  }
});

/*<div id="orders-header">
  <div className="container">
    <div className="row">
      <input className="four columns" type="text" placeholder="Search" onKeyUp={this.onSearchChanged}></input>
      <button className="two columns offset-by-two" onClick={this.addOrder} disabled={this.state.addingOrder}>Add Order</button>
      <button className="two columns save-order-changes" onClick={this.saveChanges} disabled={this.state.modifiedOrders.size === 0}>Save</button>
      <button className="two columns cancel-order-changes" onClick={this.cancelChanges} disabled={this.state.modifiedOrders.size === 0}>Cancel</button>
    </div>
    <div>Total Profit: {this.calculateTotalProfit(filteredOrders)}</div>
    {this.state.addingOrder ? <NewOrder headers={this.getNewOrderHeaders()} onSave={this.saveNewOrder} onCancel={this.cancelNewOrder}/> : null}
  </div>
</div>*/

const mapStateToProps = (state) => {
  return {
    orders: state.orders
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(TypesActions, dispatch)
  }
};

module.exports = withRouter(connect(mapStateToProps, mapDispatchToProps)(Orders));
