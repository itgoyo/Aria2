(function() {
    //网盘主页导出
    /*
     基本步骤是首先设定导出模式,文本模式的话
     只需要初始化文本框即可,RPC模式要设置好 RPC地址
     然后开始分析选中的文件 获取当前文件夹的所以文件id
     然后进行比较,如果是文件 直接进行下载 如果是文件夹则递归查找
     遇到文件就下载 遇到文件夹继续获取文件夹里面的内容

     */
    //两种导出模式 RPC模式 和 TXT模式
    var MODE = "RPC";
    var RPC_PATH = "http://localhost:6800/jsonrpc";

    function getHashParameter(name) {
        var hash = window.location.hash;
        hash = hash.substr(1).split("&");
        for (var i = 0; i < hash.length; i++) {
            var pair = hash[i];
            var arr = pair.split("=");
            if (arr[0] == name)
                return decodeURIComponent(decodeURIComponent(arr[1]));
        }
    }

    var Downloader = (function() {
        var delay;

        var currentTaskId = 0;
        // Paths of folders to be processed.
        var folders = [];
        // { id: path } of files to be processed.
        var files = {};
        var completedCount = 0;

        function getNextFile(taskId) {
            if (taskId != currentTaskId)
                return;

            if (folders.length != 0) {
                completedCount++;
                CORE.showToast("正在获取文件列表... " + completedCount + "/" + (completedCount + folders.length - 1), "MODE_SUCCESS");

                var path = folders.pop();
                $.getJSON(window.location.origin + "/api/list", {
                    "dir": path,
                    "bdstoken": yunData.MYBDSTOKEN,
                    "channel": "chunlei",
                    "clienttype": 0,
                    "web": 1
                }).done(function(json) {
                    setTimeout(function() { getNextFile(taskId) }, delay);

                    if (json.errno != 0) {
                        CORE.showToast("未知错误", "MODE_FAILURE");
                        console.log(json);
                        return;
                    }

                    for (var i = 0; i < json.list.length; i++) {
                        var item = json.list[i];
                        if (item.isdir)
                            folders.push(item.path);
                        else
                            files[item.fs_id] = item.path;
                    }
                }).fail(function(xhr) {
                    CORE.showToast("网络请求失败", "MODE_FAILURE");
                    console.log(xhr);

                    setTimeout(function() { getNextFile(taskId) }, delay);
                });
            } else if (files.length != 0) {
                CORE.showToast("正在获取下载地址... ", "MODE_SUCCESS");
                
                var counter = 0;
                var tmp_files = {};
                for (var fs_id in files) {
                    tmp_files[fs_id] = files[fs_id];
                    counter++;
                    if (counter == 100) {
                        setFileData(tmp_files);
                        // Reset files and counters
                        tmp_files = {};
                        counter = 0;
                    }
                }
                setFileData(tmp_files);

                downloader.reset();
            } else {
                CORE.showToast("一个文件都没有哦", "MODE_CAUTION");
                downloader.reset();
            }
        }

        var downloader = {};

        downloader.addFolder = function(path) {
            folders.push(path);
        };

        downloader.addFile = function(id, path) {
            files[id] = path;
        };

        downloader.start = function() {
            delay = parseInt(localStorage.getItem("rpc_delay")) || 300;
            currentTaskId = new Date().getTime();
            getNextFile(currentTaskId);
        }

        downloader.reset = function() {
            currentTaskId = 0;
            folders = [];
            files = {};
            completedCount = 0;
        };

        return downloader;
    })();

    var sign = btoa(new Function("return " + yunData.sign2)()(yunData.sign3, yunData.sign1));

    function setFileData(files) {
        if (localStorage.getItem("svip") == "true"){
            $.get(window.location.origin + "/api/download", {
                "type": "dlink",
                "bdstoken": yunData.MYBDSTOKEN,
                "fidlist": JSON.stringify(Object.keys(files)),
                "timestamp": yunData.timestamp,
                "sign": sign, 
                "channel": "chunlei",
                "clienttype": 0,
                "web": 1,
                "app_id": 250528
            }, null, "json").done(function(json) {
                var file_list = [];
                if (json.errno != 0) {
                    CORE.showToast("未知错误", "MODE_FAILURE");
                    console.log(json);
                    return;
                }
                for (var i = 0; i < json.dlink.length; i++) {
                    var item = json.dlink[i];
                    var path = files[item.fs_id];
                    file_list.push({ name: path.substr(pathPrefixLength), link: item.dlink });
                }

                if (MODE == "TXT") {
                    CORE.dataBox.show();
                    CORE.dataBox.fillData(file_list);
                } else {
                    var paths = CORE.parseAuth(RPC_PATH);
                    var rpc_list = CORE.aria2Data(file_list, paths[0], paths[2]);
                    generateParameter(rpc_list);
                }
            }).fail(function(xhr) {
                CORE.showToast("网络请求失败", "MODE_FAILURE");
                console.log(JSON.stringify(xhr));
            });
        } else {
            var file_list = [];
            var restAPIUrl = location.protocol + "//pcs.baidu.com/rest/2.0/pcs/";
            for (var key in files) {
                var path = files[key];
                var dlink = restAPIUrl + 'file?method=download&app_id=250528&path=' + encodeURIComponent(path);
                file_list.push({ name: path.substr(pathPrefixLength), link: dlink });
            }
            if (MODE == "TXT") {
                CORE.dataBox.show();
                CORE.dataBox.fillData(file_list);
            } else {
                var paths = CORE.parseAuth(RPC_PATH);
                var rpc_list = CORE.aria2Data(file_list, paths[0], paths[2]);
                generateParameter(rpc_list);
            }
        }

    }

    window.addEventListener("message", function(event) {
        if (event.source != window)
            return;

        if (event.data.type == "selected") {
            Downloader.reset();

            var selectedFile = event.data.data;
            if (selectedFile.length == 0) {
                CORE.showToast("请选择一下你要保存的文件哦", "failure");
                return;
            }

            for (var i = 0; i < selectedFile.length; i++) {
                var item = selectedFile[i];
                if (item.isdir)
                    Downloader.addFolder(item.path);
                else
                    Downloader.addFile(item.fs_id, item.path);
            }

            Downloader.start();
        }
    });

    var pathPrefixLength;

    function getSelected() {
        var path = getHashParameter("path");
        var level = parseInt(localStorage.getItem("rpc_fold")) || 0;

        if (path == undefined || path == "/" || level == -1) {
            pathPrefixLength = 1;
        } else if (level == 0) {
            pathPrefixLength = path.length + 1;
        }

        window.postMessage({ "type": "get_selected" }, "*");
    }
    //生成请求参数 发送给后台 进行 http请求
    function generateParameter(rpc_list) {
        var paths = CORE.parseAuth(RPC_PATH);
        for (var i = 0; i < rpc_list.length; i++) {
            var parameter = { url: paths[1], dataType: "json", type: "POST", data: JSON.stringify(rpc_list[i]), headers: { Authorization: paths[0] } };
            CORE.sendToBackground("rpc_data", parameter, function(success) {
                if (success)
                    CORE.showToast("下载成功!赶紧去看看吧~", "MODE_SUCCESS");
                else
                    CORE.showToast("下载失败!是不是没有开启aria2?", "MODE_FAILURE");
            });
        }
    }

    // Init
    var CORE = require("./core");
    CORE.init();
    CORE.requestCookies([{ url: "http://pan.baidu.com/", name: "BDUSS" }, { url: "http://pcs.baidu.com/", name: "pcsett" }]);

    var menu = CORE.addMenu.init("home");
    menu.on("click", ".rpc_export_list", function() {
        MODE = "RPC";
        RPC_PATH = $(this).data("id");
        getSelected();
    });
    menu.on("click", "#aria2_download", function() {
        MODE = "TXT";
        CORE.dataBox.init("home");
        // When closing download dialog, cancel all delay feteching.
        CORE.dataBox.onClose(Downloader.reset);
        getSelected();
    });
    CORE.showToast("初始化成功!", "success");
})();