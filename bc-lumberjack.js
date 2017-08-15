var Lumberjack = (function () {
    var lumberjack = this;

    function getBrowserInfo() {
        return {
            origin: window.location.origin,
            pathname: window.location.pathname,
            params: window.location.search,
            hash: window.location.search,
            language: window.navigator.language,
            platform: window.navigator.platform,
            userAgent: window.navigator.userAgent,
        };
    }

    function getLogData(type, args) {
        var argsArr = Array.prototype.slice.call(args);
        var otherData = argsArr.filter(function(arg, index) {
            return index !== 0;
        });

        if (!argsArr.length) {
            console.error('you have to pass at least one parameter to this function');
            return;
        }

        return {
            appName: lumberjack.options.appName,
            type: type,
            message: argsArr[0],
            otherData: otherData,
            browserData: getBrowserInfo(),
        };
    }

    function logToConsole(data) {
        var type = data.type;

        if (console[type] && typeof console[type] === 'function') {
            console[type](data);
        }
        else {
            var logType = 'log';
            var logMessage = "generic log: ";

            if (type === 'fatal') {
                logType = 'error';
                logMessage = 'fatal error: ';
            }
            else if (type === 'notify') {
                logType = 'info';
                logMessage = 'notification: ';
            }

            console[logType](logMessage, data);
        }
    }

    function logSuccessResponse(response) {
        if (lumberjack.isConsoleLoggingEnabled) {
            console.log('Successful logging', response);
        }
    }

    function logErrorResponse(xhrObj) {
        if (lumberjack.isConsoleLoggingEnabled) {
            console.error('Something went wrong when logging', xhrObj);
        }
    }

    function logToApi(data) {
        postAjax(lumberjack.options.apiUrl, data, logSuccessResponse, logErrorResponse);
    }

    function log(type, args) {
        var logData = getLogData(type, args);
        

        if (lumberjack.isConsoleLoggingEnabled) {
            logToConsole(logData);
        }
        if (lumberjack.isApiLoggingEnabled) {
            logData.otherData = JSON.stringify(logData.otherData);
            logData.browserData = JSON.stringify(logData.browserData); //Format Data for server
            logToApi(logData);
        }
    }

    function postAjax(url, data, success, error) {
        var params = typeof data == 'string' ? data : Object.keys(data).map(
                function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
            ).join('&');

        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open('POST', url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
            else { error(xhr) };
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params);
        return xhr;
    }

    function init(options) {
        lumberjack.options = options || {};
        lumberjack.options.appName = options.appName || null;
        lumberjack.options.apiUrl = options.apiUrl || console.error('please provide an api url');
        lumberjack.options.debugMode = options.debugMode || 'console-server'; // console-only, server-only, console-server, null
        lumberjack.isConsoleLoggingEnabled = lumberjack.options.debugMode && lumberjack.options.debugMode.indexOf('console') > -1;
        lumberjack.isApiLoggingEnabled = lumberjack.options.debugMode && lumberjack.options.debugMode.indexOf('server') > -1;
    }

    function debug() {
        log("debug", arguments);
    }
    function info() {
        log("info", arguments);
    }
    function warn() {
        log("warn", arguments);
    }
    function notify() {
        log("notify", arguments);
    }
    function error() {
        log("error", arguments);
    }
    function fatal() {
        log("fatal", arguments);
    }

    return {
        init: init,
        debug: debug,
        log: log,
        info: info,
        warn: warn,
        notify: notify,
        error: error,
        fatal: fatal
    };
})();