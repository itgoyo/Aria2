(function () {
    // Baidu will add these querystring for us
    //"bdstoken": yunData.MYBDSTOKEN,
    //"app_id": yunData.FILEINFO[0].app_id,
    //"channel": "chunlei",
    //"clienttype": 0,
    //"web": 1

    //网盘分享页面转存
    /*
    */
    const LIMIT = 2000;

    var pathPrefixLength = 0;
    function showToast(message, type){
        window.postMessage({ type: "show_toast", data: { message: message, type: type } }, "*");
    }
    function getHashParameter(name) {
        var hash = window.location.hash;
        hash = hash.substr(1).split("&");
        for (var pair of hash) {
            var arr = pair.split("=");
            if (arr[0] == name)
                return decodeURIComponent(decodeURIComponent(arr[1]));
        }
    }

    // 中心思想
    // 1. 直接转存整个文件夹, if
    //     1a. 成功 -> 结束
    //     1b. 错误12：文件过多, then
    //        1b1. 在自己的库里创建文件夹
    //        1b2. 获取文件夹内容，对每个项目, if
    //            1b1a. 是文件夹 -> 跳到 1.
    //            1b1b. 是文件 -> 根据转存限制进行批量转存

    var Downloader = (function () {
        var delay;

        var currentTaskId = 0;
        var savePath;
        // Paths of folders to be processed.
        var folders = [];
        // Paths of files to be processed.
        var files = [];
        var completedCount = 0;
        function getNextFile(taskId) {
            if (taskId != currentTaskId)
                return;

            if (files.length != 0) {
                // Use `files.splice(0, LIMIT)` to get and remove
                // the first `LIMIT` items (or all if length < LIMIT) from `files`.
                saveConvertFile(files.splice(0, LIMIT), savePath, function () {
                    setTimeout(function () { getNextFile(taskId) }, delay);
                });
            }
            else if (folders.length != 0) {
                completedCount++;
                showToast("正在获取文件列表... " + completedCount + "/" + (completedCount + folders.length - 1), "MODE_SUCCESS");

                var path = folders.pop();
                saveConvertFile([path], savePath, function (error) {
                    if (error == 0) {
                        setTimeout(function () { getNextFile(taskId) }, delay);
                    }
                    if (error == 12) {
                        setTimeout(function () {
                            createFold(savePath + "/" + path.substr(pathPrefixLength), function () {
                                setTimeout(function () {
                                    $.getJSON("/share/list", {
                                        "dir": path,
                                        "uk": yunData.SHARE_UK,
                                        "shareid": yunData.SHARE_ID
                                    }).done(function (json) {
                                        setTimeout(function () { getNextFile(taskId) }, delay);

                                        if (json.errno != 0) {
                                            showToast("未知错误", "MODE_FAILURE");
                                            console.log(json);
                                            return;
                                        }

                                        for (var item of json.list) {
                                            if (item.isdir)
                                                folders.push(item.path);
                                            else
                                                files.push(item.path);
                                        }
                                    }).fail(function (xhr) {
                                        showToast("网络请求失败", "MODE_FAILURE");
                                        console.log(xhr);

                                        setTimeout(function () { getNextFile(taskId) }, delay);
                                    });
                                }, delay);
                            });
                        }, delay);
                    }
                });
            }
            else {
                showToast("分批转存完成！", "MODE_SUCCESS");
                downloader.reset();
            }
        }

        var downloader = {};

        downloader.setSavePath = function (path) {
            savePath = path;
        };

        downloader.addFolder = function (path) {
            folders.push(path);
        };

        downloader.setFolders = function (paths) {
            folders = paths;
        }

        downloader.addFile = function (path) {
            files.push(fileId);
        };

        downloader.setFiles = function (paths) {
            files = paths;
        }

        downloader.start = function () {
            delay = parseInt(localStorage.getItem("rpc_delay")) || 300;
            currentTaskId = new Date().getTime();
            getNextFile(currentTaskId);
        }

        downloader.reset = function () {
            currentTaskId = 0;
            folders = [];
            files = [];
            completedCount = 0;
        };

        return downloader;
    })();

    function getSelected() {
        if (yunData.SHAREPAGETYPE == "single_file_page") {
            return [{ isdir: false, path: yunData.PATH, id: yunData.FS_ID }];
        }
        else {
            // TODO(Simon): Download all files by default?
            // Maybe we can switch the button content between "导出全部" and "导出所选".
            var selected = $(".chked").closest(".item");
            if (selected.length == 0)
                return [];

            var path = getHashParameter("path");

            // Short path, we are at root folder,
            // so the only thing we can do is downloading all files.
            if (path == "/" || path == undefined) {
                pathPrefixLength = 1;
                return [{ isdir: true, path: yunData.PATH, id: yunData.FS_ID }];
            }

            pathPrefixLength = path.length + 1;
            return selected.map(function (index, item) {
                item = $(item);
                return {
                    isdir: item.data("extname") == "dir",
                    path: path + "/" + item.find(".name-text").data("name"),
                    id: item.data("id")
                };
            });
        }
    }

    function startDownloader(selected, savePath) {
        for (var item of selected) {
            if (item.isdir)
                Downloader.addFolder(item.path);
            else
                Downloader.addFile(item.path);
        }

        Downloader.setSavePath(savePath);
        Downloader.start();
    }

    //获得选中的文件
    function getConvertFile(savePath) {
        var selected = getSelected();
        if (selected.length == 0) {
            showToast("请选择一下你要保存的文件哦", "MODE_CAUTION");
            return;
        }

        // First try transfering all selected items together before using Downloader.
        if (selected.length < LIMIT) {
            saveConvertFile(selected.map(item => item.path), savePath, function (error) {
                if (error == 0)
                    showToast("转存成功!", "MODE_SUCCESS");
                else if (error == 12) {
                    startDownloader(selected, savePath);
                }
            });
        }
        else {
            startDownloader(selected, savePath);
        }
    }

    function removeFold(path) {
        $.post("/api/filemanager?" + $.param({
            "opera": "delete",
            "async": 2
        }), {
            "filelist": JSON.stringify([path])
        }, null, "json").done(function (json) {
            if (json.errno == 12)
                console.log("删除失败!");
            else if (json.erron == 0)
                console.log("删除成功");
            else {
                showToast("未知错误", "MODE_FAILURE");
                console.log(json);
            }
        }).fail(function (xhr) {
            showToast("网络请求失败", "MODE_FAILURE");
            console.log(xhr);
        });
    }

    function saveConvertFile(files, savePath, callback) {
        var path = savePath + "/" + files[0].substr(pathPrefixLength, files[0].lastIndexOf("/"));
        $.post("/share/transfer?" + $.param({
            "async": 1,
            "ondup": "overwrite",
            "shareid": yunData.SHARE_ID,
            "from": yunData.SHARE_UK
        }), {
            "filelist": JSON.stringify(files),
            "path": path
        }, null, "json").done(function (json) {
            callback(json.errno, files, path);
            switch (json.errno) {
                case 0:
                    // TODO(Simon): Track progress, avoid error 111.
                    break;
                case 2:
                    console.log("folder miss" + path);
                    break;
                case 12:
                    showToast("文件过多，正在分批转存。", "MODE_CAUTION");
                    break;
                case 111: //当前还有未完成的任务，需完成后才能操作
                    showToast("保存的有点太快了!", "MODE_FAILURE");
                    break;
                default:
                    showToast("未知错误", "MODE_FAILURE");
                    console.log(json);
                    break;
            }
        }).fail(function (xhr) {
            showToast("网络请求失败", "MODE_FAILURE");
            console.log(xhr);
        });
    }

    //创建转存文件需要的文件夹
    function createFold(path, callback) {
        //检测这个文件夹是否存在
        $.getJSON("/api/list", { "dir": path }).done(function (json) {
            if (json.errno == -9) {
                $.post("/api/create?" + $.param({
                    "a": "commit"
                }), {
                    "path": path,
                    "isdir": 1,
                    "size": "",
                    "block_list": "[]",
                    "method": "post"
                }, null, "json").done(function (json) {
                    showToast("创建文件夹成功!", "MODE_SUCCESS");
                    callback(path);

                    if (json.path != path && /\(\d+\)/.exec(json.path.substr(path.length))) {
                        setTimeout(function () {
                            removeFold(json.path);
                        }, POLLING_INTERVAL * 50);
                    }
                });
            } else {
                callback(path);
            }
        }).fail(function (xhr) {
            showToast("网络请求失败", "MODE_FAILURE");
            console.log(xhr);
        });
    }

    // Hook OK button for transfering files.
    (function () {
        var e = require;
        var i = $;

        var moveSaveDialog = require("common:widget/moveSaveDialog/moveSaveDialog.js");
        var s = e("common:widget/toast/toast.js"),
            n = e("common:widget/panel/panel.js");
        moveSaveDialog.prototype._init = function () {
            var e = this;
            i("#" + this._mCloseId2 + ", #" + this._mCloseId1).click(function () {
                "function" == typeof e.cancleBack && e.cancleBack(e._getSavePath()),
                e.visible(!1)
            }),
            i("#" + this._mMoveId).click(function () {
                var t = i(".plus-create-folder input").val();

                // This line edited.
                return void 0 === t && (getConvertFile(e._getSavePath()),

                e._saveTransferPath(),
                e.visible(!1)),
                e.FILE_NAME_REG.test(t) ? (s.obtain.useToast({
                    toastMode: s.obtain.MODE_CAUTION,
                    msg: "文件名不能包含以下字符：<,>,|,*,?,,/",
                    sticky: !1
                }),
                !1) : void 0
            }),
            i("#" + this._mNewDirId).click(function () {
                e.creatNewFolder()
            }),
            i(".move-dialog").delegate(".save-path-item", "mouseover", function () {
                i(this).addClass("save-path-hover")
            }).delegate(".save-path-item", "mouseout", function () {
                i(this).removeClass("save-path-hover")
            }),
            i(".move-dialog").delegate(".save-path-item", "click", function () {
                i(this).hasClass("check") ? i(this).removeClass("check") : (i(this).addClass("check"),
                d.obtain.resetSelectedPath())
            }),
            i(window).bind("resize", function () {
                e.setGravity(n.CENTER)
            })
        };
    })();
})();