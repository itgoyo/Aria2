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

	var showToast;

	(function () {
	    // 封装的百度的Toast提示消息
	    // Type类型有
	    // caution       警告  failure       失败  loading      加载 success      成功
	    // MODE_CAUTION  警告  MODE_FAILURE  失败  MODE_LOADING 加载 MODE_SUCCESS 成功

	    if (typeof window.require == "undefined") {
	        showToast = function (message, type) {
	            Utilities.useToast({
	                toastMode: disk.ui.Toast[type],
	                msg: message,
	                sticky: false
	            })
	        };
	    } else if (typeof manifest == "object") {
	        // New version
	        var Context = window.require("system-core:context/context.js").instanceForSystem;
	        Context.log.send=function(e){};
	        showToast = function (message, type) {
	            if (type.startsWith("MODE")) {
	                type = type.split("_")[1].toLowerCase();
	            }
	            Context.ui.tip({
	                mode: type,
	                msg: message
	            });
	        };

	        window.addEventListener("message", function (event) {
	            if (event.source != window)
	                return;

	            if (event.data.type == "get_selected") {
	                window.postMessage({ type: "selected", data: Context.list.getSelected() }, "*");
	            }
	        });
	    } else {
	        var Toast = window.require("common:widget/toast/toast.js");
	        showToast = function (message, type) {
	            Toast.obtain.useToast({
	                toastMode: Toast.obtain[type],
	                msg: message,
	                sticky: false
	            });
	        };
	    }

	    window.addEventListener("message", function (event) {
	        if (event.source != window)
	            return;

	        if (event.data.type == "show_toast") {
	            var request = event.data.data;
	            showToast(request.message, request.type);

	            var button = $("#export_menu");
	            if (button.length != 0) {
	                try {
	                    button.parent()[0].removeChild = function () {
	                        console.log("Remove me? Naive!");
	                    };
	                    Object.defineProperty(button.parent()[0], "removeChild", { writable: false} );
	                } catch (e) {
	                    console.log("Unable to hook removeChild");
	                }
	            }
	        }
	    });
	    if (window.yunData) {
	        if (window.yunData.sign2) {
	            var yunData = window.require('disk-system:widget/data/yunData.js').get();
	            window.postMessage({ type: "yunData", data: JSON.stringify(yunData) }, "*");
	        }
	        else {
	            window.postMessage({ type: "yunData", data: JSON.stringify(window.yunData) }, "*");
	        }
	    }
	    else if (window.disk.ui.album) {
	        var real = window.disk.ui.album.prototype.buildListView;
	        window.disk.ui.album.prototype.buildListView = function (list) {
	            window.postMessage({ type: "yunData", data: JSON.stringify(list) }, "*");
	            real.call(this, list);
	        }
	    }
	    else if (disk.util.ViewShareUtils) {
	        window.postMessage({ type: "yunData", data: disk.util.ViewShareUtils.viewShareData }, "*");
	    }
	})();

/***/ }
/******/ ]);