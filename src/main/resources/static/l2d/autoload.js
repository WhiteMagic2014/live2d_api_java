const live2d_path = "/live2d/l2d/";
//const live2d_path = "./";

//waifu.css的绝对路径
$("<link>").attr({href: live2d_path + "waifu.css", rel: "stylesheet", type: "text/css"}).appendTo("head");

//live2d.min.js的绝对路径
$.ajax({
	url: live2d_path + "live2d.min.js",
	dataType: "script",
	cache: true,
	async: false
});

//waifu-tips.js的绝对路径
$.ajax({
	url: live2d_path + "waifu-tips.js",
	dataType: "script",
	cache: true,
	async: false
});

//初始化看板娘，会自动加载指定目录下的waifu-tips.json
$(window).on("load", function() {
	//获取当前网址，如： http://localhost:8083/proj/meun.jsp
    var curWwwPath = window.document.location.href;
    //获取主机地址之后的目录，如： proj/meun.jsp
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083
    var localhostPath = curWwwPath.substring(0, pos);
    //获取带"/"的项目名，如：/proj
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
    initWidget(live2d_path + "waifu-tips.json", localhostPath + projectName );
});

//initWidget第一个参数为waifu-tips.json的绝对路径
//第二个参数为api地址（无需修改）
//api后端可自行搭建，参考https://github.com/fghrsh/live2d_api
