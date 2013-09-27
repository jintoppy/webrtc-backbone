define(function() {
    'use strict';

    if (!window.io) {
        return false;
    }
    // Module level variables act as singletons
    var _socket = io.connect("https://"+ window.location.host + window.location.pathname);
    
    return _socket;
});