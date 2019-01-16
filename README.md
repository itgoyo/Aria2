## ↓支持一下
[![GitHub stars](https://img.shields.io/github/stars/itgoyo/Aria2.svg?style=social&label=Star)](https://github.com/itgoyo/Aria2) [![GitHub forks](https://img.shields.io/github/forks/itgoyo/Aria2.svg?style=social&label=Fork)](https://github.com/itgoyo/Aria2/fork) [![GitHub watchers](https://img.shields.io/github/watchers/itgoyo/Aria2.svg?style=social&label=Watch)](https://github.com/itgoyo/Aria2) [![GitHub followers](https://img.shields.io/github/followers/itgoyo.svg?style=social&label=Follow)](https://github.com/itgoyo/Aria2)

* [Aria2](#aria2)
     * [webui-aria2](#webui-aria2)
     * [YAAW](#yaaw)
     * [Aria2-GUI](#aria2-gui)
         * [增加chrome插件安装](#增加chrome插件安装)
         * [关于导入插件老是提示“建议停止开发者模式”解决方法(仅适用于.crx插件)](#关于导入插件老是提示建议停止开发者模式解决方法仅适用于crx插件)

   * [如果您是Mac用户](#如果您是mac用户)
   * [BaiduPCS-Go](#baidupcs-go)
   * [Tampermonkey](#tampermonkey)
   * [Proxyee-down](#proxyee-down)
         * [下载](#下载)
         * [安装](#安装)
         * [安装成功](#安装成功)
      * [常见问题(<strong>必看</strong>)](#常见问题必看)
      * [常用功能](#常用功能)
         * [手动创建任务](#手动创建任务)
         * [刷新任务下载链接](#刷新任务下载链接)
   * [速盘](#速盘)
   * [Pandownload](#Pandownload)
   * [手机百度云客户端](#手机百度云客户端)
   * [如果觉得对您有帮助，想请我喝咖啡](#如果觉得对您有帮助想请我喝咖啡)


# Aria2

**aria2是基于命令行的下载工具，不过还好大神们早已开发了各种易用的UI方便我们小白们使用**

## webui-aria2
[http://ziahamza.github.io/webui-aria2/](http://ziahamza.github.io/webui-aria2/)

## YAAW
[http://binux.github.io/yaaw/demo/](http://binux.github.io/yaaw/demo/)

## Aria2-GUI

[http://kotlinandroid.net/Aria2-GUI](http://kotlinandroid.net/Aria2-GUI/index.html)

下载完了Github上的文件之后打开会有以下几个文件

- [1] 先打开start.bat

- [2] 再打开aria2.exe

完了之后会出现一个命令框，让它一直开着不能断，否则下载也会跟着断

-----
### 增加chrome插件安装

安装如下：

- 打开开发者额模式

- 加载已解压的拓展程序，找到下载下来的拓展程序，即可（注意，目录一般就叫chrome）

[BaiduExporter](https://github.com/acgotaku/BaiduExporter)

-------

### 关于导入插件老是提示“建议停止开发者模式”解决方法(仅适用于.crx插件)

将非官方扩展程序加入chrome的白名单

[解决方法](http://xclient.info/a/1ddd2a3a-d34b-b568-c0d0-c31a95f0b309.html?_=cf9dfad27682664c64044361f26166a5)

### 如果您是Mac用户

- [Aria2GUI for Mac](https://github.com/yangshun1029/aria2gui)

- [BaiduNetdiskPlugin-macOS](https://github.com/CodeTips/BaiduNetdiskPlugin-macOS)

-----

# BaiduPCS-Go
[BaiduPCS-Go](https://github.com/iikira/BaiduPCS-Go)

本人比较推荐的下载工具，但是由于百度云最近封ID，所以如果遇到不能链接服务器或者是403,请看[issue](https://github.com/iikira/BaiduPCS-Go/issues/460)

解决方法：

请参考：https://loli.today/baidupcs-appid/

```
创建 AppID 目录

用已登录百度账号的浏览器访问下面的网址

http://pcs.baidu.com/rest/2.0/pcs/file?app_id=265486&method=list&path=%2F

网页显示

{"error_code":31064,"error_msg":"file is not authorized","request_id":***************}
不出意外的话，现在网盘里 /我的应用数据/ 目录下已经出现了 baidu_shurufa，把需要下载的文件/文件夹移动到这个目录。

使用 BaiduPCS-Go 下载

cd /apps/baidu_shurufa
config set -appid=265486
ls
此时应该会返回你已经移动过去的文件列表，按正常方式开始下载即可满速。

彻底删除此文件夹后，访问上面的链接无法再次生成，需在 /我的应用数据/ 手动创建名为 baidu_shurufa 的文件夹。

```

如果遇到`31301，无法切换目录的问题`，AppID没有根目录权限，换回266719就可以了,在当前目录输入`config set -appid=266719`

这个 AppID 只有读取 /apps/baidu_shurufa 的权限
访问其他目录要换回 310646,`config set -appid=310646`



-----

# Tampermonkey

[Chrome商店地址](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-CN)

不能翻墙的小伙伴可以直接从我的Github里边的文件直接获取

[百度云直接下载助手(原作者版)](https://greasyfork.org/zh-CN/scripts/23635-%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%98%E7%9B%B4%E6%8E%A5%E4%B8%8B%E8%BD%BD%E5%8A%A9%E6%89%8B)

由于原作者提供的代码总是出现不能正常显示直接下载的入口,本人修改此bug之后又发布了在作者原基础上修改的版本

[百度网盘直接下载助手(显示直接下载入口)](https://greasyfork.org/zh-CN/scripts/36549-%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%98%E7%9B%B4%E6%8E%A5%E4%B8%8B%E8%BD%BD%E5%8A%A9%E6%89%8B-%E6%98%BE%E7%A4%BA%E7%9B%B4%E6%8E%A5%E4%B8%8B%E8%BD%BD%E5%85%A5%E5%8F%A3)

进入以上直接点击`安装`或者`install`,完了直接刷新界面，进入到自己的百度云盘选择所需的下载文件即可。


这样即可获取下载连接，复制到迅雷或者IMD之类的下载器，让你享受飞一般的感觉。(本人百兆光纤，速度基本保持10m/s左右)


# Proxyee-down
[Proxyee-down](https://github.com/monkeyWie/proxyee-down)
### 下载
- [OneDrive](https://imhx-my.sharepoint.com/:f:/g/personal/pd_imhx_onmicrosoft_com/EnPrybHS3rVFuy_HdcP7RLoBwhb0k5ayJdIzwjU0hCM9-A?e=he0oIz)(推荐)
- [百度云](https://pan.baidu.com/s/1fgBnWJ0gl6ZkneGkVDIEfQ) 提取码:d92x
### 安装
1. [Windows安装教程](https://github.com/monkeyWie/proxyee-down/blob/master/.guide/windows/read.md)
2. [MAC安装教程](https://github.com/monkeyWie/proxyee-down/blob/master/.guide/mac/read.md)
3. [Linux安装教程](https://github.com/monkeyWie/proxyee-down/blob/master/.guide/linux/read.md)
### 安装成功
在安装成功之后，**进入浏览器**下载资源时会跳转到创建任务页面，然后选择保存的路径和分段数进行创建下载任务。
**200带宽下的速度　22m/s**

![](https://raw.githubusercontent.com/itgoyo/PicRes/master/687474703a2f2f6f6d76626c343669332e626b742e636c6f7564646e2e636f6d2f33316138366365343831373138323830373036326139663166373137393733642e706e67.png)

## 常见问题(**必看**)
在开始使用前务必看一遍[常见问题列表](https://github.com/monkeyWie/proxyee-down/blob/master/.guide/FAQ.md)，可以解决你使用proxyee-down下载遇到的绝大多数问题。
## 常用功能
### 手动创建任务
可以根据链接来创建一个任务，支持自定义请求头和请求体，具体请[查看](https://github.com/monkeyWie/proxyee-down/blob/master/.guide/common/create/read.md)。
### 刷新任务下载链接
当任务下载链接失效了，下载没速度或失败则可以使用刷新下载链接的功能，使用新的链接继续下载，具体请[查看](https://github.com/monkeyWie/proxyee-down/blob/master/.guide/common/refresh/read.md)。

# 速盘
官网：http://www.speedpan.com

# Pandownload
官网：http://pandownload.com/index.html


# 手机百度云客户端
悄悄告诉你们一个秘密，手机版的百度云客户端原来用来下载视频或者是zip文件都是满速下载的，不嫌麻烦的直接挂手机客户端,小文件下载不推荐使用客户端，因为小文件很多速度确实很慢。
# 如果觉得对您有帮助，想请我喝咖啡


![](/wechat.jpg)
