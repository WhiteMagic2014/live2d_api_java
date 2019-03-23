package com.magic.util;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.util.ResourceUtils;

import com.alibaba.fastjson.JSONArray;

public class ModelTextures {

	/**
	 * 缓存map
	 */
	private static Map<String, JSONArray> cache = new HashMap<String, JSONArray>();

	/**
	 * 
	 * @Description:获取材质
	 * @author: chenhaoyu
	 * @time:Mar 23, 2019 12:14:58 PM
	 */
	public static Object getTextures(String modelName, int id) {
		JSONArray list = getList(modelName);
		Object obj = list.get(id - 1);
		if (obj instanceof JSONArray) {
			return obj;
		} else {
			return new JSONArray().fluentAdd(obj);
		}

	}

	/**
	 * 
	 * @Description:获取列表缓存
	 * @return
	 * @author: chenhaoyu
	 * @time:Mar 23, 2019 12:43:09 PM
	 */
	public static JSONArray getList(String modelName) {
		if (cache.containsKey(modelName)) {
			return cache.get(modelName);
		} else {
			JSONArray textures = getTextures(modelName);
			cache.put(modelName, textures);
			return textures;
		}
	}

	/**
	 * 
	 * @Description: 获得材质列表
	 * @return
	 * @author: chenhaoyu
	 * @throws FileNotFoundException
	 * @time:Mar 23, 2019 1:09:58 PM
	 */
	private static JSONArray getTextures(String modelName) {
		if (FileUtils.exists("/model/" + modelName + "/textures_order.json")) {
			try {
				List<String> texture_00 = getOrderedFileName(modelName, "texture_00");
				List<String> texture_01 = getOrderedFileName(modelName, "texture_01");
				List<String> texture_02 = getOrderedFileName(modelName, "texture_02");
				List<String> texture_03 = getOrderedFileName(modelName, "texture_03");

				JSONArray result = new JSONArray();
				for (int i = 0; i < texture_00.size(); i++) {
					for (int j = 0; j < texture_01.size(); j++) {
						for (int k = 0; k < texture_03.size(); k++) {
							JSONArray temp = new JSONArray();
							temp.add(texture_00.get(i));
							temp.add(texture_01.get(j));
							temp.add(texture_02.get(j));
							temp.add(texture_03.get(k));
							result.add(temp);
						}
					}
				}
				return result;
			} catch (Exception e) {
				return new JSONArray();
			}
		} else {
			try {
				return getAllTextureFileName(modelName);
			} catch (FileNotFoundException e) {
				return new JSONArray();
			}
		}
	}

	/**
	 * 
	 * @Description:获得指定模型 中指定资源文件夹下资源
	 * @param modelname
	 * @param foldername
	 * @return
	 * @throws FileNotFoundException
	 * @author: chenhaoyu
	 * @time:Mar 23, 2019 4:31:00 PM
	 */
	private static List<String> getOrderedFileName(String modelname, String foldername) throws FileNotFoundException {
		String serverpath = ResourceUtils.getURL("classpath:static").getPath();
		String[] namesTemp = FileUtils.getFileName(serverpath + "/model/" + modelname + "/" + foldername);
		List<String> list = Arrays.asList(namesTemp).stream().sorted(String::compareTo).collect(Collectors.toList());

		List<String> resultList = new ArrayList<String>();
		for (String name : list) {
			resultList.add("../model/" + modelname + "/" + foldername + "/" + name);
		}
		return resultList;
	}

	/**
	 * 
	 * @Description: 获取当前目录下 textures.xxx 中左右的文件名 返回
	 * @param modelnameString
	 * @return
	 * @throws FileNotFoundException
	 * @author: chenhaoyu
	 * @time:Mar 23, 2019 2:09:06 PM
	 */
	private static JSONArray getAllTextureFileName(String modelname) throws FileNotFoundException {
		String serverpath = ResourceUtils.getURL("classpath:static").getPath();
		String[] namesTemp = FileUtils.getFileName(serverpath + "/model/" + modelname);
		String texturefolder = "";
		for (String name : namesTemp) {
			if (name.startsWith("textures")) {
				texturefolder = name;
			}
		}
		String[] names = FileUtils.getFileName(serverpath + "/model/" + modelname + "/" + texturefolder);
		List<String> list = Arrays.asList(names).stream().sorted(String::compareTo).collect(Collectors.toList());
		JSONArray jsonArray = new JSONArray();
		for (String name : list) {
			jsonArray.add("../model/" + modelname + "/" + texturefolder + "/" + name);
		}
		return jsonArray;
	}

}
