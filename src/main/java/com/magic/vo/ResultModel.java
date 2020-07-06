package com.magic.vo;

import java.io.Serializable;
import java.util.HashMap;

public class ResultModel extends HashMap<String, Object> implements Serializable {

	private static final long serialVersionUID = 1L;
	/**
	 * 状态码
	 */
	private static final String CODE = "code";
	/**
	 * 描述性内容
	 */
	private static final String MESSAGE = "message";
	/**
	 * 令牌
	 */
	private static final String TOKEN = "token";
	/**
	 * 返回结果集
	 */
	private static final String RESULT = "result";
	// ---------------以下只添加状态码--------------------------

	public ResultModel success() {
		this.put(CODE, "0000");
		return this;
	}

	public ResultModel fail(String code) {
		this.put(CODE, code);
		return this;
	}

	public ResultModel message(String message) {
		this.put(MESSAGE, message);
		return this;
	}

	public ResultModel token(String token) {
		this.put(TOKEN, token);
		return this;
	}

	public ResultModel result(Object object) {
		if (null != object) {
			this.put(RESULT, object);
		} else {
			this.put(RESULT, "");
		}
		return this;
	}

	public ResultModel base(String code, String message) {
		this.put(CODE, code);
		this.put(MESSAGE, message);
		return this;
	}

	public ResultModel base(String code, String message, Object object) {
		this.put(CODE, code);
		this.put(MESSAGE, message);
		this.result(object);
		return this;
	}

	public ResultModel base(String code, String message, String token) {
		this.put(CODE, code);
		this.put(MESSAGE, message);
		this.put(TOKEN, token);
		return this;
	}

	public ResultModel base(String code, String message, String token, Object object) {
		this.put(CODE, code);
		this.put(MESSAGE, message);
		this.put(TOKEN, token);
		this.result(object);
		return this;
	}

	public Object getObject() {
		return this.get(RESULT);
	}

	public String getJsonString() {
		return this.toString();
	}

	public boolean isSuccess() {
		if (this.get(CODE).equals("0000")) {
			return true;
		}
		return false;
	}

}
