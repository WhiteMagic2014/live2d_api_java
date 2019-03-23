package com.magic.apis;

import java.io.IOException;
import java.util.Random;

import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.magic.util.FileUtils;
import com.magic.util.ModelList;
import com.magic.util.ModelTextures;

@RestController
public class apis {

	@RequestMapping("/get")
	public JSONObject get(@RequestParam("id") String id ,HttpServletResponse response) throws IOException {
//		System.out.println("get");
		String[] ids = id.split("-");
		int modelId = Integer.valueOf(ids[0]);
		int modelTexturesId = 0;
		if (ids.length > 1) {
			modelTexturesId = Integer.valueOf(ids[1])==0 ? 1 : Integer.valueOf(ids[1]);
		}
		if (modelId <= 0 || modelTexturesId <= 0) {
			return new JSONObject();
		}
		Object modelName = ModelList.idToName(modelId);
		String realModelName = "";
		JSONObject json = null;
		if (modelName instanceof JSONArray) {
			try {
				realModelName = modelTexturesId > 0 ? ((JSONArray) modelName).getString(modelTexturesId - 1)
						: ((JSONArray) modelName).getString(0);
				json = FileUtils.readJsonFromClassPath("model/" + realModelName + "/index.json", JSONObject.class);
				String texturesTemp = json.getJSONArray("textures").toJSONString().replace("textures",
						"../model/" + realModelName + "/textures");
				JSONArray resultArray = JSONArray.parseArray(texturesTemp);
				json.put("textures", resultArray);
			} catch (IndexOutOfBoundsException e) {
				json = new JSONObject().fluentPut("textures", null).fluentPut("model", "");
			}
		} else {
			realModelName = modelName.toString();
			json = FileUtils.readJsonFromClassPath("model/" + realModelName + "/index.json", JSONObject.class);
			if (modelTexturesId > 0) {
				Object modelTexturesName = ModelTextures.getTextures(modelName.toString(), modelTexturesId);
				if (modelTexturesName != null) {
					json.put("textures", modelTexturesName);
				}
			}
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

		return json;
	}

	@RequestMapping("/switch")
	public JSONObject switchRole(@RequestParam("id") Integer id) throws IOException {
//		System.out.println("switch");
		
		if (id == null) {
			id = 0;
		}
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
				.fluentPut("message", messages.get(modelId-1)));

		System.out.println(result);
		return result;
	}

	@RequestMapping("/switch_textures")
	public JSONObject switchTextures(@RequestParam("id") String id) throws IOException {
//		System.out.println("switch_textures");
		
		String[] ids = id.split("-");
		int modelId = Integer.valueOf(ids[0]);
		int modelTexturesId = 0;
		if (ids.length > 1) {
			modelTexturesId = Integer.valueOf(ids[1]);
		}
		if (modelId <= 0 || modelTexturesId < 0) {
			return new JSONObject();
		}

		Object modelName = ModelList.idToName(modelId);
		String realModelName = "";
		JSONArray texturesArray = null;

		if (modelName instanceof JSONArray) {
			texturesArray = ((JSONArray) modelName);
		} else {
			realModelName = modelName.toString();
			texturesArray = ModelTextures.getList(realModelName);
		}

		int newid = modelTexturesId == 0 ? 2 : modelTexturesId + 1;

		if (newid > texturesArray.size()) {
			newid = 1;
		}
		if ("".equals(realModelName)) {
			realModelName = texturesArray.getString(newid-1);
		}

		JSONObject result = new JSONObject();
		result.put("textures", new JSONObject().fluentPut("id", newid).fluentPut("name", realModelName));
		return result;
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
		result.put("model", new JSONObject()
							.fluentPut("id", newNum)
							.fluentPut("message", messages.get(newNum-1)));
		return result;
	}

	@RequestMapping("/rand_textures")
	public JSONObject randTextures(@RequestParam("id") String id) throws IOException {
//		System.out.println("rand_textures");
		
		String[] ids = id.split("-");
		int modelId = Integer.valueOf(ids[0]);
		int modelTexturesId = 0;
		if (ids.length > 1) {
			modelTexturesId = Integer.valueOf(ids[1]);
		}
		if (modelId <= 0 || modelTexturesId < 0) {
			return new JSONObject();
		}
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
			realModelName = texturesArray.getString(newid-1);
		}
		
		JSONObject result = new JSONObject();
		result.put("textures", new JSONObject().fluentPut("id", newid).fluentPut("name", realModelName));
		return result;
	}
	
}
