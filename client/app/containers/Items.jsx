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

var Items = React.createClass({
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
      { title: '', property: 'img', image: true },
      { title: 'Name', property: 'name' },
      { title: 'Flip Profit', property: 'flipProfit' },
      { title: 'Max Buy', property: 'max_offer_unit_price' },
      { title: 'Min Sell', property: 'min_sale_unit_price' },
      { title: 'Num of Buys', property: 'offer_availability' },
      { title: 'Num of Sells', property: 'sale_availability' },
      { title: 'Buy Change', property: 'offer_price_change_last_hour' },
      { title: 'Sell Change', property: 'sale_price_change_last_hour' },
    ]);
  },

  prepareMarketData: function prepareMarketData() {
    if (!this.props.marketdata.get('data')) return new Immutable.List();
    return this.props.marketdata.get('data').filter(d => d.get('min_sale_unit_price') > 0 && d.get('max_offer_unit_price') > 0);
  },

  render: function render() {
    return (
      <div>
        Items
        <Loading enable={this.props.marketdata.get('loading')} />
        <DataTable headers={this.getTableHeaders()}
                   data={this.prepareMarketData()} />
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
