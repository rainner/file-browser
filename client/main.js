/**
 * App entry file
 */
import './scripts/Polyfills';
import Vue from 'vue';
import App from './components/App.vue';
import Tooltip from './scripts/Tooltip';

const EventBus = new Vue();
const tooltip  = new Tooltip();

// create global vue $bus property
Object.defineProperties( Vue.prototype, {
  $bus: { get: function() { return EventBus; } }
});

// single tooltip instance for entire app
Vue.directive( 'tooltip', {
  bind: el => { tooltip.select( el ); },
  unbind: el => { tooltip.unselect( el ); },
});

// custom directive for detecting if a click came from outside an element
Vue.directive( 'clickout', {
  bind: ( el, binding, vnode ) => {
    el.event = ( event ) => {
      if ( !( el == event.target || el.contains( event.target ) ) ) {
        vnode.context[ binding.expression ]( event );
      }
    };
    document.body.addEventListener( 'click', el.event );
  },
  unbind: ( el ) => {
    document.body.removeEventListener( 'click', el.event );
  },
});

// render app
new Vue({
  el: '#app',
  render: h => h( App )
});
