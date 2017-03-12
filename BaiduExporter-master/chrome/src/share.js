(function () {
    //网盘分享页面导出
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
    var cookies;
    var pathPrefixLength = 0;

    function getHashParameter(name) {
        var hash = window.location.hash;
        hash = hash.substr(1).split("&");
        for (var i=0;i<hash.length;i++) {
            var pair = hash[i];
            var arr = pair.split("=");
            if (arr[0] == name)
                return decodeURIComponent(decodeURIComponent(arr[1]));
        }
    }

    var Downloader = (function () {
        var delay;

        var currentTaskId = 0;
        // Paths of folders to be processed.
        var folders = [];
        // Ids of files to be processed.
        var files = {};
        var completedCount = 0;
        function getNextFile(taskId) {
            if (taskId != currentTaskId)
                return;

            if (folders.length != 0) {
                completedCount++;
                CORE.showToast("正在获取文件列表... " + completedCount + "/" + (completedCount + folders.length - 1), "MODE_SUCCESS");

                var path = folders.pop();
                $.getJSON(window.location.origin + "/share/list", {
                    "dir": path,
                    "bdstoken": yunData.MYBDSTOKEN,
                    "uk": yunData.SHARE_UK,
                    "shareid": yunData.SHARE_ID,
                    "channel": "chunlei",
                    "clienttype": 0,
                    "web": 1
                }).done(function (json) {
                    setTimeout(function () { getNextFile(taskId) }, delay);

                    if (json.errno != 0) {
                        CORE.showToast("未知错误", "MODE_FAILURE");
                        console.log(json);
                        return;
                    }
                    for (var i=0;i<json.list.length;i++) {
                        var item =json.list[i];
                        if (item.isdir)
                            folders.push(item.path);
                        else
                            files.push(item.fs_id);
                    }
                }).fail(function (xhr) {
                    CORE.showToast("网络请求失败", "MODE_FAILURE");
                    console.log(xhr);
                    setTimeout(function () { getNextFile(taskId) }, delay);
                });
            }
            else if (files.length != 0) {
                CORE.showToast("正在获取下载地址... ", "MODE_SUCCESS");
                setFileData(files);
                downloader.reset();
            }
            else {
                CORE.showToast("一个文件都没有哦", "MODE_CAUTION");
                downloader.reset();
            }
        }

        var downloader = {};

        downloader.addFolder = function (path) {
            folders.push(path);
        };

        downloader.addFile = function (fileId) {
            files.push(fileId);
            // files[fileId] = true;
        };

        downloader.start = function () {
            delay = parseInt(localStorage.getItem("rpc_delay")) || 300;
            currentTaskId = new Date().getTime();
            getNextFile(currentTaskId);
        };

        downloader.reset = function () {
            currentTaskId = 0;
            folders = [];
            files = [];
            completedCount = 0;
        };

        return downloader;
    })();
    window.addEventListener("message", function (event) {
        if (event.source != window)
            return;

        if (event.data.type == "selected") {
            Downloader.reset();

            var selectedFile = event.data.data;
            if (selectedFile.length == 0) {
                CORE.showToast("请选择一下你要保存的文件哦", "failure");
                return;
            }
            var path = getHashParameter("parentPath");

            // Short path, we are at root folder,
            // so the only thing we can do is downloading all files.
            // error solution for example :链接:http://pan.baidu.com/s/1hqOIdUk 密码:qat2
            if (path == "/" || path == undefined) {
                path =yunData.PATH.slice(0,yunData.PATH.lastIndexOf("/"));
                pathPrefixLength =1;
                // return [{ isdir: true, path: yunData.PATH, id: yunData.FS_ID }];
            }else{
                pathPrefixLength = path.length + 1;
            }

            for (var i = 0; i < selectedFile.length; i++) {
                var item = selectedFile[i];
                if (item.isdir)
                    Downloader.addFolder(item.path);
                else
                    Downloader.addFile(item.fs_id, path + "/" + item.server_filename);
            }

            Downloader.start();
        }
    });
    function getSelected() {
        if (yunData.SHAREPAGETYPE == "single_file_page") {
            return [{ isdir: false, path: yunData.PATH, id: yunData.FS_ID }];
        }
        else {
            // TODO(Simon): Download all files by default?
            // Maybe we can switch the button content between "导出全部" and "导出所选".
            window.postMessage({ "type": "get_selected" }, "*");
        }
    }

    //获得选中的文件
    function getShareFile() {
        Downloader.reset();

        var selected = getSelected();
        if (selected) {
            for (var i =0;i<selected.length;i++) {
                var item = selected[i];
                if (item.isdir)
                    Downloader.addFolder(item.path);
                else
                    Downloader.addFile(item.id);
            }

            Downloader.start();
        }
    }

    //设置要请求文件的POST数据
    function setFileData(fid) {
        var data = {
            "encrypt": "0",
            "product": "share",
            "uk": yunData.SHARE_UK,
            "primaryid": yunData.SHARE_ID,
            "fid_list": JSON.stringify(fid)
        };

        if (!yunData.SHARE_PUBLIC)
            data["extra"] = JSON.stringify({ sekey: cookies });

        getFilemetas(data);
    }

    function alertDialog(json, data) {
        var id = json.request_id;
        var div = $("<div>").attr("id", "alert_div" + id).addClass("vcode_div");
        var html = [
            '<div class="top">',
            '<div title="关闭" id="alert_dialog_close" class="close"></div>',
            "<h3>提示</h3>",
            "</div>",
            '<div class="dialog-body">',
            '<div class="alert-dialog-msg">',
            '<div class="download-verify">',
            '<div class="verify-body">请输入验证码：<input id="verification" type="text" class="input-code" maxlength="4">',
            '<img id="vcode" class="img-code" alt="验证码获取中"  width="100" height="30">',
            '<a href="javascript:;" class="underline" id="change">换一张</a>',
            "</div>",
            '<div class="verify-error">',
            (json.auth ? "\u9a8c\u8bc1\u7801\u8f93\u5165\u9519\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165" : ""),
            "</div>",
            "</div>",
            "</div>",
            "</div>",
            '<div class="dialog-footer g-clearfix">',
            '<a href="javascript:;" id="okay" class="button button-blue"><b>确定</b></a>',
            '<a href="javascript:;" id="ignore" class="button"><b>取消</b></a>',
            "</div>"
        ];
        div.html(html.join(""));
        div.appendTo($("body"));
        div.find("*[id]").each(function (index, element) {
            $(element).attr("id", $(element).attr("id") + id);
        });
        div.show();
        var offset = new Date().getTime().toString().slice(-2);
        var screenWidth = $(window).width(), screenHeight = $(window).height();
        var scrolltop = $(document).scrollTop();
        var divLeft = (screenWidth - div.width()) / 2 + parseInt(offset);
        var divTop = (screenHeight - div.height()) / 2 + scrolltop - parseInt(offset);
        div.css({ left: divLeft + "px", top: divTop + "px", "z-index": 2000 });
        $("#vcode" + id).attr("src", json.vcode_img);
        $("#change" + id).unbind().click(function () {
            var url = "//pan.baidu.com/genimage";
            $("#vcode" + id).attr("src", url + "?" + json.vcode_str + "&" + new Date().getTime());
        });
        $("#okay" + id).unbind().click(function () {
            data["vcode_input"] = $("#verification" + id).val();
            data["vcode_str"] = json.vcode_str;
            getFilemetas(data);
            div.remove();
        });
        $("#ignore" + id).unbind().click(function () {
            div.remove();
            CORE.showToast("\u5509\u002e\u002e\u002e\u002e\u002e", "MODE_CAUTION");
        });
        $("#alert_dialog_close" + id).unbind().click(function () {
            div.remove();
        });
    }

    //根据文件路径获取文件的信息
    function getFilemetas(data) {
        $.post(window.location.origin + "/api/sharedownload?" + $.param({
            "timestamp": yunData.TIMESTAMP,
            "sign": yunData.SIGN,
            "bdstoken": yunData.MYBDSTOKEN,
            "app_id": 250528,
            "channel": "chunlei",
            "clienttype": 0,
            "web": 1
        }), data, null, "json").done(function (json) {
            if (json.errno == -20) {
                $.getJSON("/api/getcaptcha", {
                    "prod": "share",
                    "bdstoken": yunData.MYBDSTOKEN,
                    "app_id": 250528,
                    "channel": "chunlei",
                    "clienttype": 0,
                    "web": 1
                }).done(function (json) {
                    if (json.errno != 0) {
                        CORE.showToast("未知错误", "MODE_FAILURE");
                        console.log(json);
                        return;
                    }

                    if (data["vcode_input"]) {
                        json.auth = true;
                    }
                    alertDialog(json, data);
                    CORE.showToast("请输入验证码以继续下载", "MODE_CAUTION");
                }).fail(function (xhr) {
                    CORE.showToast("获取验证码失败", "MODE_FAILURE");
                    console.log(xhr);
                });
            } else if (json.errno == 0) {
                var file_list = [];

                if (yunData.SHAREPAGETYPE == "single_file_page") {
                    var item = json.list[0];
                    // For single file, save to filename.
                    file_list.push({ name: yunData.FILENAME, link: item.dlink });
                }
                else {
                    // For multiple files, save relates to share base folder.
                    for (var i = 0;i<json.list.length;i++) {
                        var item = json.list[i];
                        file_list.push({ name: item.path.substr(pathPrefixLength), link: item.dlink });
                    }
                }

                if (MODE == "TXT") {
                    // Show download dialog when we got the first download link.
                    CORE.dataBox.show();
                    CORE.dataBox.fillData(file_list);
                } else {
                    var paths = CORE.parseAuth(RPC_PATH);
                    var rpc_list = CORE.aria2Data(file_list, paths[0], paths[2]);
                    generateParameter(rpc_list);
                }
            } else {
                CORE.showToast("未知错误", "MODE_FAILURE");
                console.log(json);
            }
        }).fail(function (xhr) {
            CORE.showToast("网络请求失败", "MODE_FAILURE");
            console.log(xhr);
        });
    }

    //生成请求参数 发送给后台 进行 http请求
    function generateParameter(rpc_list) {
        var paths = CORE.parseAuth(RPC_PATH);
        for (var i = 0; i < rpc_list.length; i++) {
            var parameter = { url: paths[1], dataType: "json", type: "POST", data: JSON.stringify(rpc_list[i]), headers: { Authorization: paths[0] } };
            CORE.sendToBackground("rpc_data", parameter, function (success) {
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

    // Get `BDCLND` cookie for private share.
    CORE.sendToBackground("get_cookies", [{ url: "http://pan.baidu.com/", name: "BDCLND" }], function (value) {
        cookies = decodeURIComponent(value["BDCLND"]);

        var menu = CORE.addMenu.init("share");
        menu.on("click", ".rpc_export_list", function () {
            MODE = "RPC";
            RPC_PATH = $(this).data("id");
            getShareFile();
        });
        menu.on("click", "#aria2_download", function () {
            MODE = "TXT";
            CORE.dataBox.init("share");
            // When closing download dialog, cancel all delay feteching.
            CORE.dataBox.onClose(Downloader.reset);
            getShareFile();
        });
        setTimeout(function () {
            // Hook transfering files function for multiple file share page
            if (yunData.SHAREPAGETYPE != "single_file_page") {
                var s = document.createElement("script");
                s.src = chrome.runtime.getURL("js/convert.js");
                document.body.appendChild(s);
            }
        }, 1000);
        CORE.showToast("初始化成功!", "MODE_SUCCESS");
    });
})();