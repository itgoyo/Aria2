(function () {
    //网盘专辑页面导出
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
    var isSingleShare = window.location.pathname.includes("file");

    // 获得选中的文件
    function getShareFile() {
        var file_list = [];
        if (isSingleShare) {
            file_list.push({ name: yunData.server_filename, link: yunData.dlink });
        }
        else {
            var selected = $("#fileItems .on");
            if (selected.length == 0) {
                showToast("请选择一下你要保存的文件哦", "MODE_CAUTION");
                return;
            }

            for (var i=0;i<selected.length;i++) {
                var item =selected[i];
                var data = yunData[$(item).attr("_position")];
                file_list.push({ name: data.server_filename, link: data.dlink });
            }
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

    //生成请求参数 发送给后台 进行 http请求
    function generateParameter(rpc_list) {
        var paths = CORE.parseAuth(RPC_PATH);
        for (var i = 0; i < rpc_list.length; i++) {
            var parameter = { url: paths[1], dataType: "json", type: "POST", data: JSON.stringify(rpc_list[i]), headers: { Authorization: paths[0] } };
            sendToBackground("rpc_data", parameter, function (success) {
                if (success)
                    showToast("下载成功!赶紧去看看吧~", "MODE_SUCCESS");
                else
                    showToast("下载失败!是不是没有开启aria2?", "MODE_FAILURE");
            });
        }
    }

    CORE.requestCookies([{ url: "http://pan.baidu.com/", name: "BDUSS" }, { url: "http://pcs.baidu.com/", name: "pcsett" }]);

    var menu = CORE.addMenu.init("album");
    menu.on("click", ".rpc_export_list", function () {
        MODE = "RPC";
        RPC_PATH = $(this).data("id");
        getShareFile();
    });
    menu.on("click", "#aria2_download", function () {
        MODE = "TXT";
        CORE.dataBox.init("share");
        getShareFile();
    });
})();