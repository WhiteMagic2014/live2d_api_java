package com.magic.util;

import java.util.HashMap;
import java.util.Map;

public class MagicHelper {
	public static final String ID = "id";
	public static final String TID = "tid";

	/**
	 * 
	 * @Description: 统一处理字符型 x-y 类型id，如果出现异常则用默认id
	 * @param origin
	 * @return
	 * @author: chenhaoyu
	 * @time:Mar 25, 2019 10:09:52 AM
	 */
	public static Map<String, Integer> getIdMap(String origin) {
		Map<String, Integer> result = new HashMap<String, Integer>();
		result.put(ID, 1);
		result.put(TID, 1);
		try {
			String[] ids = origin.split("-");
			int id = Integer.valueOf(ids[0]);
			if (id > 0) {
				result.put(ID, id);
			}
			int tid = Integer.valueOf(ids[1]);
			if (tid > 0) {
				result.put(TID, tid);
			}
			return result;
		} catch (Exception e) {
//			e.printStackTrace();
			return result;
		}
	}

}
