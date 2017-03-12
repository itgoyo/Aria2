if (typeof browser != "undefined")
    chrome = browser;

var HttpSendRead = function (info) {
    Promise.prototype.done = Promise.prototype.then;
    Promise.prototype.fail = Promise.prototype.catch;
    return new Promise(function (resolve, reject) {
        var http = new XMLHttpRequest();
        var contentType = "\u0061\u0070\u0070\u006c\u0069\u0063\u0061\u0074\u0069\u006f\u006e\u002f\u0078\u002d\u0077\u0077\u0077\u002d\u0066\u006f\u0072\u006d\u002d\u0075\u0072\u006c\u0065\u006e\u0063\u006f\u0064\u0065\u0064\u003b\u0020\u0063\u0068\u0061\u0072\u0073\u0065\u0074\u003d\u0055\u0054\u0046\u002d\u0038";
        var timeout = 3000;
        if (info.contentType != null) {
            contentType = info.contentType;
        }
        if (info.timeout != null) {
            timeout = info.timeout;
        }
        var timeId = setTimeout(httpclose, timeout);
        function httpclose() {
            http.abort();
        }
        http.onreadystatechange = function () {
            if (http.readyState == 4) {
                if ((http.status == 200 && http.status < 300) || http.status == 304) {
                    clearTimeout(timeId);
                    if (info.dataType == "json") {
                        resolve(JSON.parse(http.responseText), http.status, http);
                    }
                    else if (info.dataType == "SCRIPT") {
                        // eval(http.responseText);
                        resolve(http.responseText, http.status, http);
                    }
                }
                else {
                    clearTimeout(timeId);
                    reject(http, http.statusText, http.status);
                }
            }
        };
        http.open(info.type, info.url, true);
        http.setRequestHeader("Content-type", contentType);
        var h;
        for (h in info.headers) {
            if (info.headers[h]) {
                http.setRequestHeader(h, info.headers[h]);
            }
        }
        if (info.type == "POST") {
            http.send(info.data);
        }
        else {
            http.send();
        }
    });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.method);
    console.log(request.data);
    switch (request.method) {
        case "add_script":
            chrome.tabs.executeScript(sender.tab.id, { file: request.data });
            break;
        case "rpc_data":
            HttpSendRead(request.data)
                .done(function (json, textStatus, jqXHR) {
                    sendResponse(true);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    sendResponse(false);
                });
            return true;
        case "config_data":
            for (var key in request.data) {
                localStorage.setItem(key, request.data[key]);
            }
            break;
        case "rpc_version":
            HttpSendRead(request.data)
                .done(function (json, textStatus, jqXHR) {
                    sendResponse(json);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    sendResponse(null);
                });
            return true;
        case "get_cookies":
            getCookies(request.data).then(value => sendResponse(value));
            return true;
    }
});

// Promise style `chrome.cookies.get()`
function getCookie(detail) {
    return new Promise(function (resolve) {
        chrome.cookies.get(detail, resolve);
    });
};

//async function getCookies(details)
//{
//    var obj = {};
//    for (var item of await Promise.all(details.map(item => getCookie(item))))
//        obj[item.name] = item.value;
//    return obj;
//}

function getCookies(details) {
    return new Promise(function (resolve) {
        var list = details.map(item => getCookie(item));
        Promise.all(list).then(function (cookies) {
            var obj = {};
            for (var item of cookies)
                if (item != null)
                obj[item.name] = item.value;
            resolve(obj);
        });
    });
}

//弹出chrome通知
function showNotification(id, opt) {
    if (!chrome.notifications)
        return;

    chrome.notifications.create(id, opt, function () { });
    setTimeout(function () {
        chrome.notifications.clear(id, function () { });
    }, 5000);
}

//软件版本更新提示
var manifest = chrome.runtime.getManifest();
var previousVersion = localStorage.getItem("version");
if (previousVersion == "" || previousVersion != manifest.version) {
    var opt = {
        type: "basic",
        title: "更新",
        message: "百度网盘助手更新到" + manifest.version + "版本啦～\n此次更新修复大量文件下载时的错误~",
        iconUrl: "images/icon.jpg"
    };
    var id = new Date().getTime().toString();
    showNotification(id, opt);
    localStorage.setItem("version", manifest.version);
}
