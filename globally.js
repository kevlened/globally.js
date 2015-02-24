;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.globally = factory();
    }

}(this, function() {
    'use strict';

    // Create a public object to pass to the user
    var pub = {};

    // Track functions and their wrapped versions so we can cancel them if necessary
    var fnTracker = {};

    pub.debug = false;

    // Constants
    var LOG_PREFIX = '[globally]';

    var DEFAULT_EVENTS = [
        'click',
        'mousedown',
        'mouseup',
        'mousemove',
        'keydown',
        'keyup',
        'keypress',
        'change',
        'input',
        'popstate',
        'hashchange',
        'focus',
        'focusin',
        'focusout',
        'blur'
    ];

    // Functions
    function log() {
        if (pub.debug) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(LOG_PREFIX + ' ');
            console.log.apply(console, args);
        }
    };

    function wrap(fn) {
        return function(e) {
            if(pub.debug) {
                switch (e.type) {

                    case 'keydown':
                    case 'keyup':
                    case 'keypress':
                        log(e.type, e.keyCode + " (" + String.fromCharCode(e.keyCode) + ")", e.target);
                        break;

                    case 'change':
                    case 'input':
                        log(e.type, e.target.value, e.target);
                        break;

                    case 'hashchange':
                    case 'popstate':
                        log(e.type, document.URL);
                        break

                    case 'mousemove':
                        log(e.type, { x: e.clientX, y: e.clientY });
                        break;

                    default:
                        log(e.type, e.target);
                        break;
                }
            }

            return fn && fn.apply(this, arguments);
        };
    }

    pub.addEventListener = function(type, fn) {
        var wrappedFn = wrap(fn);
        fnTracker[type] = fnTracker[type] || {};
        fnTracker[type][fn] = wrappedFn;
        window.addEventListener(type, wrappedFn, true);
    }

    pub.removeEventListener = function(type, fn) {
        var wrappedFn = fnTracker[type] && fnTracker[type][fn];
        window.removeEventListener(type, wrappedFn, true);
    }

    pub.addDefaultEventListeners = function(f) {
        for(var i = 0, eLength = DEFAULT_EVENTS.length; i < eLength; i++) {
            pub.addEventListener(DEFAULT_EVENTS[i], f);
        }
    }

    pub.removeDefaultEventListeners = function(f) {
        for(var i = 0, eLength = DEFAULT_EVENTS.length; i < eLength; i++) {
            pub.removeEventListener(DEFAULT_EVENTS[i], f);
        }
    }

    return pub;
}));