
/**
 * Description: This is a JavaScript Library for Avon.
 * Author:		Abbas Sadat (sas21@sfu.ca)
 */

/*
 * The 'World' object contains methods that 
 * is required to access the simulation configuration
 * as well as the data of entities that exists in
 * the environment.
 * 
 */



var World = new Object();
World.serverURL = "localhost:8000";
World.connected = true;


Object.prototype.getModelChildren = function(){

	if(this["children"] != null){
		return this.children;
	}
	
};

Object.prototype.getChild = function(childName){
	
	if(this["children"] != null){
		for(var i=0; i< this.children.length; i++){
			if(this.children[i].name == childName)
				return this.children[i];
		}
	}
};

Object.prototype.getPrototype = function(){
	
	if(this["prototype"] != null){
			return this.prototype;
		}
};

Object.prototype.getData = function(){
	if(this["name"] != null){
		var dataObj = World.Request(this.name+"/data");
		return dataObj;
	}
};

Object.prototype.getPVA = function(){
	if(this["name"] != null){
		var dataObj = World.Request(this.name+"/pva");
		return dataObj;
	}
};

Object.prototype.getGeom = function(){
	if(this["name"] != null){
		var dataObj = World.Request(this.name+"/geom");
		return dataObj;
	}
};


World.setServerURL =function(url){
	this.serverURL = url;	
};

World.Connect = function(){
	url = "sim/tree";
	World.connected = true;
	World.Request(url);
	return World.connected;
};

World.Request = function(url){
	
	if(!World.connected)
		return;
	
	url = "http://"+World.serverURL+"/"+url;
	var json_obj = {};
	var http_request = new XMLHttpRequest();
	try {
		http_request.open("GET", url, false);
		http_request.send(null);
		if (http_request.readyState == 4 && http_request.status == 200) {
			//alert("received:" + http_request.responseText);
			json_obj = json_parse(http_request.responseText);
		}
	} catch (error) {
		World.connected = false;
		alert(error);
	}
	return json_obj;

};


World.getModel = function(modelName){
	
	var tree = World.getWorldTree();
	//var tree = World.getModelTree();
	var model = {};
	var preobjs = [];
	var postobjs = [];
	var flag = false;
	
	preobjs = tree["children"];
	
	while(!flag){
		for(var i=0;i<preobjs.length;i++){
			if(preobjs[i].name == modelName){
				model = preobjs[i];
				flag = true;
				break;
			}
			if(preobjs[i]["children"].length != 0)
				postobjs = postobjs.concat(preobjs[i]["children"]);		
		}
		preobjs = postobjs;
		postobjs = [];
		
		if(preobjs.length == 0)
			break;
	}
	
	return model
};

World.getModelData = function(modelName){
	
	var dataObj = World.Request(modelName+"/data");
	return dataObj;
};

World.getModelConfig = function(modelName){
	
	var cfgObj = World.Request(modelName+"/cfg");
	return cfgObj;
};

World.getModelGeom = function(modelName){
	
	var geomObj = World.Request(modelName+"/geom");
	return geomObj;
};


World.getModelChildren = function(modelName){
	var model = World.getModel(modelName);
	if(model != null){
		return model["children"];
	}else{
		return null;
	}
};

World.getModelPVA = function(modelName){
	var dataObj = World.Request(modelName+"/pva");
	return dataObj;
}; 

World.getSimTime = function(){
	var dataObj = World.Request("sim/clock");
	return dataObj;
}; 

World.getModelsWithoutParents = function(){
	var obj = World.getWorldTree();
	return obj.children;
};

World.getWorldTree = function(){
	var dataObj = World.Request("sim/tree");
	return dataObj;
};
