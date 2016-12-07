var React = require('react');
var Link = require('react-router').Link;

var routes = [
    { label: 'Market', route: '/' },
    { label: 'Orders', route: '/orders' },
];

var Navbar = React.createClass({
  render: function render() {
    return (
      <div className='nav'>
        <ul className='container'>
          <li className='nav-title'>GW2 Track</li>
          { routes.map(r => <li key={r.route}><Link to={r.route}>{r.label}</Link></li>)}
        </ul>
      </div>
    );
  }
});

module.exports = Navbar;
