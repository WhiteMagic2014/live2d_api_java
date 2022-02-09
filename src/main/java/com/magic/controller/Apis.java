package com.magic.controller;

import java.io.IOException;
import java.util.Random;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.magic.util.FileUtils;
import com.magic.util.MagicHelper;
import com.magic.util.ModelList;
import com.magic.util.ModelTextures;

@RestController
public class Apis {

	@RequestMapping("/get")
	public JSONObject get(@RequestParam("id") String id) throws IOException {
//		System.out.println("get");
		int modelId = MagicHelper.getIdMap(id).get(MagicHelper.ID);
		int modelTexturesId = MagicHelper.getIdMap(id).get(MagicHelper.TID);

		Object modelName = ModelList.idToName(modelId);
		String realModelName = "";
		JSONObject json = null;
		if (modelName instanceof JSONArray) {
			// model name 为 array 型 则将array视作资源列表,modelTexturesId 为 array的序号
			try {
				realModelName = ((JSONArray) modelName).getString(modelTexturesId - 1);
				json = FileUtils.readJsonFromClassPath("model/" + realModelName + "/index.json", JSONObject.class);
				String texturesTemp = json.getJSONArray("textures").toJSONString().replace("textures",
						"../model/" + realModelName + "/textures");
				JSONArray resultArray = JSONArray.parseArray(texturesTemp);
				json.put("textures", resultArray);
			} catch (IndexOutOfBoundsException e) {
				json = new JSONObject().fluentPut("textures", null).fluentPut("model", "");
			}
		} else {
			// model name 为string ,则 需要调用帮助方法，获得资源列表
			realModelName = modelName.toString();
			json = FileUtils.readJsonFromClassPath("model/" + realModelName + "/index.json", JSONObject.class);
			JSONArray modelTexturesName = ModelTextures.getTextures(modelName.toString(), modelTexturesId);
			json.put("textures", modelTexturesName);

		}

		String model = json.getString("model");
		json.put("model", "../model/" + realModelName + "/" + model);

		if (json.containsKey("pose")) {
			String pose = json.getString("pose");
			json.put("pose", "../model/" + realModelName + "/" + pose);
		}

		if (json.containsKey("physics")) {
			String physics = json.getString("physics");
			json.put("physics", "../model/" + realModelName + "/" + physics);
		}

		if (json.containsKey("motions")) {
			JSONObject motions = json.getJSONObject("motions");
			String motionsTemp = motions.toJSONString().replace("motions", "../model/" + realModelName + "/motions")
					.replace("sounds", "../model/" + realModelName + "/sounds");
			JSONObject motionsResult = JSONObject.parseObject(motionsTemp);
			json.put("motions", motionsResult);
		}

		if (json.containsKey("expressions")) {
			JSONArray expressions = json.getJSONArray("expressions");
			String expressionsTemp = expressions.toJSONString().replace("expressions",
					"../model/" + realModelName + "/expressions");
			JSONArray expressionsResult = JSONArray.parseArray(expressionsTemp);
			json.put("expressions", expressionsResult);
		}

		return signature(json);
	}

	@RequestMapping("/switch")
	public JSONObject switchRole(@RequestParam("id") Integer id) throws IOException {
//		System.out.println("switch");

		JSONObject modelList = ModelList.getList();
		int modelId = id + 1;

		JSONArray models = modelList.getJSONArray("models");
		JSONArray messages = modelList.getJSONArray("messages");

		if (modelId > models.size()) {
			modelId = 1;
		}

		JSONObject result = new JSONObject();
		result.put("model", new JSONObject().fluentPut("id", modelId)
//				.fluentPut("name", models.get(id))
				.fluentPut("message", messages.get(modelId - 1)));

		System.out.println(result);
		return signature(result);
	}

	@RequestMapping("/switch_textures")
	public JSONObject switchTextures(@RequestParam("id") String id) throws IOException {
//		System.out.println("switch_textures");

		int modelId = MagicHelper.getIdMap(id).get(MagicHelper.ID);
		int modelTexturesId = MagicHelper.getIdMap(id).get(MagicHelper.TID);

		Object modelName = ModelList.idToName(modelId);
		String realModelName = "";
		JSONArray texturesArray = null;

		if (modelName instanceof JSONArray) {
			texturesArray = ((JSONArray) modelName);
		} else {
			realModelName = modelName.toString();
			texturesArray = ModelTextures.getList(realModelName);
		}

		int newid = modelTexturesId + 1;

		if (newid > texturesArray.size()) {
			newid = 1;
		}
		if ("".equals(realModelName)) {
			realModelName = texturesArray.getString(newid - 1);
		}

		JSONObject result = new JSONObject();
		result.put("textures", new JSONObject().fluentPut("id", newid).fluentPut("name", realModelName));
		return signature(result);
	}

	@RequestMapping("/rand")
	public JSONObject randRole(@RequestParam("id") Integer id) throws IOException {
//		System.out.println("rand");

		JSONObject modelList = ModelList.getList();
		JSONArray models = modelList.getJSONArray("models");
		JSONArray messages = modelList.getJSONArray("messages");

		Random rand = new Random();

		int newNum = rand.nextInt(models.size()) + 1;
		while (newNum == id) {
			newNum = rand.nextInt(models.size()) + 1;
		}
		JSONObject result = new JSONObject();
		result.put("model", new JSONObject().fluentPut("id", newNum).fluentPut("message", messages.get(newNum - 1)));
		return signature(result);
	}

	@RequestMapping("/rand_textures")
	public JSONObject randTextures(@RequestParam("id") String id) throws IOException {
//		System.out.println("rand_textures");
		int modelId = MagicHelper.getIdMap(id).get(MagicHelper.ID);
		int modelTexturesId = MagicHelper.getIdMap(id).get(MagicHelper.TID);

		Object modelName = ModelList.idToName(modelId);
		String realModelName = "";
		JSONArray texturesArray = null;

		if (modelName instanceof JSONArray) {
			texturesArray = ((JSONArray) modelName);
		} else {
			realModelName = modelName.toString();
			texturesArray = ModelTextures.getList(realModelName);
		}

		Random rand = new Random();
		int newid = rand.nextInt(texturesArray.size()) + 1;
		while (newid == modelTexturesId) {
			newid = rand.nextInt(texturesArray.size()) + 1;
		}
		if ("".equals(realModelName)) {
			realModelName = texturesArray.getString(newid - 1);
		}

		JSONObject result = new JSONObject();
		result.put("textures", new JSONObject().fluentPut("id", newid).fluentPut("name", realModelName));
		return signature(result);
	}


	private JSONObject signature(JSONObject origin){
		origin.put("github","https://github.com/WhiteMagic2014/live2d_api_java");
		origin.put("msg","thanks for your using, why not give me a star on github? ");
		return origin;
	}

}
