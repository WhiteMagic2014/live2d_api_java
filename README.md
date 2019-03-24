

# live2d_api JAVA


### [Live2D API][1]
&emsp;&emsp;详情请见原作者的github

### 开发原因
&emsp;&emsp;原版使用php开发，本人没怎么用过php，部署的时候一脸懵逼，考虑到肯定会有和我一样的人存在，所以参考原php版本，用 java 撸了一份。

### 本项目所用环境
- spring boot 2.1.3
- java version "1.8.0_121"
- maven  Apache Maven 3.5.3
- 开发ide sts-3.9.5

### 与原版功能区别
- 阉割掉了add 接口
- 部分资源获取逻辑变更
- 新增了一些模型

### 试用接口
-  Url : http://45.77.240.191:8080/live2d
ps : 服务器再海外，所以访问可能会有些慢

### 接口用法
&emsp;&emsp; 与原版一致:无需修改原版的js
- `/get/?id=1-23` 获取 分组 1 的 第 23 号 皮肤
- `/rand/?id=1` 根据 上一分组 随机切换
- `/switch/?id=1` 根据 上一分组 顺序切换
- `/rand_textures/?id=1-23` 根据 上一皮肤 随机切换 同分组其他皮肤
- `/switch_textures/?id=1-23` 根据 上一皮肤 顺序切换 同分组其他皮肤



### CDN
&emsp;&emsp;本案例的资源访问没有使用cdn，需要用cdn的请自己用nginx。


### 无关的话
&emsp;&emsp; 之前没有接触过php，所以看原版翻译的时候内心有无数草泥马，花了1天半的时间肝了这个初版。之后有空应该会更新优化。


### 参考资料
- php版后端api
https://github.com/fghrsh/live2d_api

- 前端使用参考原作者 https://www.fghrsh.net/post/123.html
- 或者下面这位大佬的文章 https://github.com/stevenjoezhang/live2d-widget


[1]: https://github.com/fghrsh/live2d_api

## 版权声明

**API 内所有模型 版权均属于原作者，仅供研究学习，不得用于商业用途**

MIT © WhiteMagic2014
