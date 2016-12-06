var React = require('react');
var createDevTools = require('redux-devtools').createDevTools;

// Monitors are separate packages, and you can make a custom one
var LogMonitor = require('redux-devtools-log-monitor').default;
var DockMonitor = require('redux-devtools-dock-monitor').default;

// createDevTools takes a monitor and produces a DevTools component
module.exports = createDevTools(
  // Monitors are individually adjustable with props.
  // Note: DockMonitor is visible by default.
  <DockMonitor toggleVisibilityKey='ctrl-h'
               changePositionKey='ctrl-q'
               defaultIsVisible={false}>
    <LogMonitor theme='tomorrow' />
  </DockMonitor>
);
