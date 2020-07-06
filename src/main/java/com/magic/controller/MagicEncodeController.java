package com.magic.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.magic.util.MagicEncode;
import com.magic.vo.CustomHex;
import com.magic.vo.ResultModel;

@Controller
@RequestMapping("/code")
public class MagicEncodeController {

	@RequestMapping("")
	public ModelAndView mainPage() {
		ModelAndView mv = new ModelAndView("code");
		return mv;
	}

	@ResponseBody
	@PostMapping("encode")
	public ResultModel encode(String str,@ModelAttribute CustomHex hex) {
		try {
			String result = MagicEncode.encode(str,hex);
			return new ResultModel().success().result(result);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResultModel().fail("5000").result("系统出错");
		}
	}
	
	@ResponseBody
	@PostMapping("decode")
	public ResultModel decode(String str,@ModelAttribute CustomHex hex) {
		try {
			String result = MagicEncode.decode(str,hex);
			return new ResultModel().success().result(result);
		} catch (Exception e) {
			return new ResultModel().fail("5000").result("系统出错");
		}
	}
	
	@ResponseBody
	@PostMapping("encodePunc")
	public ResultModel encodePunc(String str,@ModelAttribute CustomHex hex) {
		try {
			String result = MagicEncode.encodeWithPunc(str,hex);
			return new ResultModel().success().result(result);
		} catch (Exception e) {
			return new ResultModel().fail("5000").result("系统出错");
		}
	}
	
	@ResponseBody
	@PostMapping("decodePunc")
	public ResultModel decodePunc(String str,@ModelAttribute CustomHex hex) {
		try {
			String result = MagicEncode.decodeWithPunc(str,hex);
			return new ResultModel().success().result(result);
		} catch (Exception e) {
			return new ResultModel().fail("5000").result("系统出错");
		}
	}

}
