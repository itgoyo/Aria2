# Aria2 for windows

关于aria2在Windows下的配置大家一直很有疑问,所以我还是写点东西方便大家使用比较好

## Download
- 目前下载已经转移到Github上进行版本发布了,大家可以在[Release](https://github.com/tatsuhiro-t/aria2/releases/)下下载自己电脑对应的版本.

## Usage
- 直接运行exe只会闪现一个黑框消失,无法正常使用的,必须使用脚本进行启动.
- 拷贝这个目录下的配置文件和脚本文件,和下载解压缩的aria2c.exe放在同一个目录下.
- 点击 `start.bat`可以直接运行,但是会有一个命令行窗口,不能关闭,关闭也就意味着程序的退出
- 点击 `HideRun.vbs`也会直接运行,但是没有任何反应,因为隐藏窗口了,可以在任务管理器的进程窗口里看到程序的运行


## 配置

- 默认配置已经够用了,不过方便大家,还是讲解下常用的几个参数吧.
- 配置文件里面的 `#`符号代表注释,如果使用这个符号那么那一行的设置就不会生效,想启用设置必须先把前面的`#`号删除
- 一般情况下要根据自己的需求设置下载路径也就是`dir`这个参数,注意这里一定得写绝对路径
- 首先是 `rpc-user`和`rpc-passwd`很明显这个需要一起使用,这是旧的加密方式.如果启用的话RPC路径就变成 `http://username:passwd@hostname:port/jsonrpc` 这种格式了(不推荐使用这个格式)
- 其次是`rpc-secret`,使用这个设置加密路径的话,RPC格式就是`http://token:secret@hostname:port/jsonrpc`这样
- 如果只是在自己电脑上使用的话,没必要启用任何加密方式,默认的就行.这样RPC路径就是`http://localhost:6800/jsonrpc`
