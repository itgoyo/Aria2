/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	if (typeof browser != "undefined")
	    chrome = browser;

	function requestAddScript(name) {
	    chrome.runtime.sendMessage({
	        method: "add_script",
	        data: "js/" + name + ".js"
	    });
	}

	$(function() {
	    window.addEventListener("message", function(event) {
	        if (event.source != window)
	            return;

	        if (event.data.type == "yunData") {
	            // console.log(event.data.data);
	            window.yunData = JSON.parse(event.data.data);

	            if (window.location.href.includes("/disk/home"))
	                requestAddScript("home");
	            else if (window.location.href.includes("/pcloud/album/"))
	                requestAddScript("album");
	            else
	                requestAddScript("share");
	        }
	    });

	    function addBaiduJS() {
	        var s = document.createElement("script");
	        s.src = chrome.runtime.getURL("js/baidu.js");
	        document.body.appendChild(s);
	    }
	    if (document.readyState === "complete") {
	        addBaiduJS();
	    } else {
	        window.addEventListener('load', addBaiduJS);
	    }
	});

/***/ }
/******/ ]);