/**!
 * Rest-In-Tag 0.1.0
 * https://github.com/KhaledElAnsari/RESTInTag/
 *
 * Inspired by Favre Anael works :
 * https://github.com/Ifnot/RestfulizerJs
 *
 * Copyright 2017 Khaled Al-Ansari
 * Released under the MIT license
 * https://github.com/KhaledElAnsari/RESTInTag/blob/master/LICENSE
 */

var restintag = function(selector, options, successCB, errorCB) {
    if(selector === "undefined" || selector === null) {
        throw new Error("selector must be provided");
    }
    else if(typeof selector !== "string"){
        throw new TypeError("selector must be a string");
    }
    
    if(!options) {
        options = {};
    }
    else if (!(options instanceof Object) || Object.prototype.toString.call(options) !== "[object Object]") {
        throw new TypeError("the options is not an object");
    }

    var elements = [].slice.call(document.querySelectorAll(selector));
    var defaultOptions = {
        parse: false,
        target: null,
        method: "GET",
        headers: {},
        timeout: 0,
        data: {},
        disable: true
    };
    for(var property in options) defaultOptions[property] = options[property];

    elements.forEach(function(element, index) {
        var thisOptions = {};
        for(var property in defaultOptions) thisOptions[property] = defaultOptions[property];
        
        var isDisabled = element.dataset ? element.dataset.disabled : element.getAttribute("data-disabled");
        var methodAttr = element.dataset ? element.dataset.method : element.getAttribute("data-method");
        var targetAttr = element.dataset ? element.dataset.target : element.getAttribute("data-target");

        if(typeof methodAttr !== 'undefined' && methodAttr !== false) thisOptions.method = methodAttr;
        if(typeof targetAttr !== 'undefined' && targetAttr !== false) thisOptions.target = targetAttr;
        element.removeAttribute("href");

        if (thisOptions.parse && thisOptions.method !== "GET") {
            var paramsIndex = thisOptions.target.indexOf("?");
            var hasParams = (paramsIndex > -1);

            if (hasParams) {
                var params = thisOptions.target.substr(paramsIndex + 1).split('#')[0].split('&');
                thisOptions.target = thisOptions.target.substr(0, paramsIndex);

                params.map(function(param, index) {
                    var pair = params[index].split('=');
                    thisOptions.data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                });
            }
        }
        
        if(typeof thisOptions.data !== "string") thisOptions.data = JSON.stringify(thisOptions.data);

        element.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if(isDisabled) {
                element.setAttribute("disabled", isDisabled);
                element.style.cursor = "default";
                element.style.pointerEvents = "none";
            }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if(xhr.status >= 200 && xhr.status < 400) {
                        if(successCB && typeof successCB === "function") successCB(JSON.parse(xhr.responseText));
                    }
                    else {
                        if(errorCB && typeof errorCB === "function") errorCB(xhr.responseText);
                        else console.log("Server response for " + thisOptions.target + " is " + this.status);
                    }

                    if(isDisabled) {
                        element.removeAttribute("disabled");
                        element.style.cursor = "";
                        element.style.pointerEvents = "";
                    }
                }
            };
            xhr.open(thisOptions.method, thisOptions.target, true);
            
            for(var header in thisOptions.headers) xhr.setRequestHeader(header, thisOptions.headers[header]);
            xhr.timeout = thisOptions.timeout; // time in milliseconds
            
            xhr.send(thisOptions.data);
        }, false);
    });
};

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = restintag;
  }
  exports.restintag = restintag;
}