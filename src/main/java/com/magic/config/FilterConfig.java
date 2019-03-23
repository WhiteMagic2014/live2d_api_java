package com.magic.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.magic.filter.CorsFilter;

/**
 * 
 * @ClassName: FilterConfig
 * @Description: 所有filter的配置
 * @author: chenhaoyu
 * @date: 2018年8月28日 上午11:52:13
 * @Copyright 注意：本内容仅限于梦想科技内部传阅，禁止外泄以及用于其他的商业目的。
 */
@Configuration
@ComponentScan({ "com.magic.filter.CorsFilter" })
public class FilterConfig {

	@Autowired
	private CorsFilter corsFilter;

	/**
	 * 
	 * @Description: 解决跨域问题
	 * @return
	 * @author: chenhaoyu
	 * @time:2018年9月26日 上午10:05:49
	 */
	@Bean
	public FilterRegistrationBean<CorsFilter> apiLimitFilterRegistration() {

		FilterRegistrationBean<CorsFilter> registration = new FilterRegistrationBean<CorsFilter>();
		registration.setFilter(corsFilter);
		// 根据需要配置 拦截url
		registration.addUrlPatterns("/*");
		registration.setName("mycorsFilter");
		registration.setOrder(1);
		return registration;

	}

}
