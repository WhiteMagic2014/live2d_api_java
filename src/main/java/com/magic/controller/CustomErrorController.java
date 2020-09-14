package com.magic.controller;

import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.servlet.error.BasicErrorController;
import org.springframework.boot.web.servlet.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.ModelAndView;

/**
 * 
 * @ClassName: CustomErrorController
 * @Description: 自定义的错误处理controller 来代替spring 默认的Whitelabel Error Page ||
 *               默认的json返回格式
 * @author: magic chen
 * @date: Sep 14, 2020 4:52:11 PM
 * @Copyright
 */
@Controller
public class CustomErrorController extends BasicErrorController {

	public CustomErrorController(ServerProperties serverProperties) {
		super(new DefaultErrorAttributes(), serverProperties.getError());
	}

	/**
	 * 覆盖默认的Json响应
	 */
	@Override
	public ResponseEntity<Map<String, Object>> error(HttpServletRequest request) {
		Map<String, Object> body = getErrorAttributes(request, isIncludeStackTrace(request, MediaType.ALL));
		HttpStatus status = getStatus(request);

		Iterator it = body.keySet().iterator();
		while (it.hasNext()) {
			String key = it.next().toString();
		}

		if (500 <= status.value() && status.value() < 600) {
			body.put("code", "500");
			body.put("message", "服务器内部错误");
		} else if (status.value() == 403) {
			body.put("code", "403");
			body.put("message", "无权限");
		} else if (status.value() == 404) {
			body.put("code", "404");
			body.put("message", "接口不存在");
		} else if (status.value() == 400) {
			body.put("code", "400");
			body.put("message", "缺少所需参数");
		} else {
			body.put("code", "未知错误");
		}
		body.remove("trace");
		body.remove("error");

		return new ResponseEntity<>(body, status);
	}

	/**
	 * 覆盖默认的HTML响应
	 */
	@Override
	public ModelAndView errorHtml(HttpServletRequest request, HttpServletResponse response) {

		HttpStatus status = getStatus(request);
		response.setStatus(status.value());

		Map<String, Object> errMap = getErrorAttributes(request, isIncludeStackTrace(request, MediaType.TEXT_HTML));

		// 内部遍历看看有些什么东西
		Iterator it = errMap.keySet().iterator();
		while (it.hasNext()) {
			String key = it.next().toString();
		}

		if (500 <= status.value() && status.value() < 600) {
			errMap.put("message", "服务器内部错误");
		} else if (status.value() == 403) {
			errMap.put("message", "无权限");
		} else if (status.value() == 404) {
			errMap.put("message", "该页面不见了");
		} else if (status.value() == 400) {
			errMap.put("message", "缺少所需参数");
		}

		errMap.put("server", "您正在使用 WhiteMagic2014 后台接口服务");
		errMap.remove("trace");
		errMap.remove("error");

		ModelAndView mv = new ModelAndView("ErrorPage");
		mv.setStatus(status);
		mv.addAllObjects(errMap);

		return mv;
	}

}
