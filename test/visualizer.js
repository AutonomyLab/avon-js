/**
 * Description: This is a simple visualizer for Avon.
 * Author:		Abbas Sadat (sas21@sfu.ca)
 */


//laser = "{'n':'5','ranges':['2','4','6','8','10']}";
//position = "{'x':'10','y':'33'}";
/*
<div  width=400 height=400 >
	<div align="right" id="ui">
		robots:
		<select id="robotslist" onChange="selectedRobotChanged()" ></select>
		<div id="vizoptions">
		
		</div>
	</div>	
</div>
*/
/*
 * 	init()
 * 	mainloop(){
 * 		update()
 * 		render()
 * 	}
 * 
 */

var screenWidth, screenHeight;
var canvas, ctx;
var bgColor = "rgba(130,130,130,1)";
var rangerColor = "rgb(72,118,255)";
var beamsColor = "rgba(234,251,197,0.2);"
var rColor = "rgba(255,140,0,1)";

var nonrColor = "rgb(30,144,170)"; // color of models without any sensor 
var frameTic = 0;
var simTime = "";
var scaleFactor = 10;
var z = 3;
var vx = 0;
var vy = 0;

var robotNames;
var robots; // models without parents (i.e. under "sim") are considered as robots 
var entities;


var changeView = false;
var prex=0;
var prey=0;


function message( str){
	 document.getElementById('output').innerHTML ="Tics:" + str; 	
}


function init(){
	
	
	World.setServerURL("localhost:8000");
	Connect();
	//World.setServerPort("8000");
	
	initGraphics();	
	
	initUi();
	
	//addVizOption("showlaser","laser");
	//addVizOption("showranger","ranger");
	//addVizOption("showname", "robot name")
	
	//output("height="+screenHeight+"<br>"+"width="+screenWidth);
	//message("salam");
	//message("byebye");
	canvas.onmousedown = mouseViewDown;
	canvas.onmouseup = document.onmouseup= mouseViewUp;
	canvas.onmousemove  = mouseViewMove;
	
		
	setInterval(update,100);
	
	
}

function initUi(){

	if (window.addEventListener)
		window.addEventListener('DOMMouseScroll', wheel, false);
	window.onmousewheel = document.onmousewheel = wheel;
	/*
	rs = World.getRobotNames();
	
	var list = document.getElementById("robotslist");
	
	
	for(var i=0;i<rs.length; i++){
		
		var optn = document.createElement("OPTION");
		optn.text = rs[i];
		optn.value = i;
		list.options.add(optn);
		
		
	}
	
	var optn = document.createElement("OPTION");
	optn.text = "All"
	optn.value = rs.length;
	list.options.add(optn);
	*/
	
	
	
}


function btnConnect(){

	var url = document.getElementById("host").value;
	World.setServerURL(url);
	Connect();
	
}
function Connect(){
	
	if(World.Connect()){
		
		entities = World.getModelsWithoutParents();
		traverseTree(entities, setupModelCfg);
		flattenModelTree(entities);	
	}

}

function flattenModelTree(tree){
	for(i=0;i<tree.length;i++){
		model = entities[i];
		
		stack = new Array();
		if(model["children"].length > 0)
			stack = stack.concat(model["children"]);
		
		
		while(stack.length > 0){
			child = stack.pop();
			if(child.length > 0)
				stack.concat(child["children"]);
			if(model[child["prototype"]] == null){
				model[child["prototype"]] = new Array();
			}
			child["children"].length = 0;
			model[child["prototype"]].push(child);
			
		}
	}
	
}

/*
function setupCfg(es){
		var stack = new Array();
		stack = stack.concat(entities);
		
		while(stack.length > 0){
			model = stack.pop();
			
			model["geom"] = World.getModelGeom(model["name"]);
			
			if(model["prototype"] != "generic")
				model["config"] = World.getModelConfig(model["name"]);
			
			if(model["children"].length >0)
				stack = stack.concat(model["children"]);
			
		}
	
}
*/

function setupModelCfg(model){
		
		model["geom"] = World.getModelGeom(model["name"]);
		
		if(model["prototype"] != "generic")
			model["config"] = World.getModelConfig(model["name"]);
		
}

function traverseTree(modelTree, func){
	
	var stack = new Array();
	stack = stack.concat(modelTree);
	
	while(stack.length > 0){
		model = stack.pop();
		func(model);
		
		if(model["children"].length >0)
			stack = stack.concat(model["children"]);
	}
}

function initGraphics(){
	
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	screenHeight = canvas.height;
	screenWidth  = canvas.width;
		
	
}

function reset(){
	
	
}

function update(){
	
		if(World.connected){
			updateData();
			render();
		}
}

function updateData(){
	
	for( i=0; i<entities.length; i++){
		var name = entities[i]["name"];
		entities[i]["PVA"]  = entities[i].getPVA();
		
		if(entities[i]["ranger"] != null){
			for(j=0;j<entities[i]["ranger"].length;j++)
				entities[i]["ranger"][j].data = entities[i]["ranger"][j].getData(); 
		}
			
	
		simTime = entities[i]["PVA"]["time"];
	}
	
}

function render(){
	
	
	// ctx.clearRect(0,0,screenWidth,screenHeight);
	
	ctx.strokeStyle = "rgba(255,255,255,1)";
	ctx.fillStyle = bgColor;//"rgb(155,255,255)"; 
	ctx.lineWidth = 1;
	
	ctx.fillRect(0,0,screenWidth,screenHeight);
	
	ctx.save();
    // note that all other translates are relative to this
    ctx.translate(vx+screenWidth/2, vy+screenHeight/2);


    // draw the plane
	//ctx.fillStyle = "rgb(100,149,237)";
	//ctx.fillRect(-z*pwidth/2,-z*pheight/2,z*pwidth,z*pheight);
	
	// draw the plane axis
	//ctx.beginPath();
	//ctx.moveTo(0,-z*pheight/2);
	//ctx.lineTo(0,z*pheight/2);
	///ctx.moveTo(-z*pwidth/2,0);
	//ctx.lineTo(z*pwidth/2, 0);
	//ctx.stroke();
	
	
    
    //robots style
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
	ctx.fillStyle = rColor; 
	ctx.lineWidth = 1;
	
	// Draw the whole model tree
	
	for(var i=0; i<entities.length; i++){
		var model = entities[i];
		//message(robot["name"] + "<b> Pos: x="+robot["PVA"]["x"]+" y="+robot["PVA"]["y"]+"</b>");
		message(simTime);
		drawRobot(ctx, model);
		
	   
	}
	
	ctx.restore();
	
}


function drawRobot(cntx, model){
	
		
	rx = model["PVA"]["pva"][0][0]*scaleFactor;
	ry = model["PVA"]["pva"][0][1]*scaleFactor;
	ra = model["PVA"]["pva"][0][5]*180/Math.PI;
	
	rwidth = model["geom"]["extent"][0]*scaleFactor;
	rheight = model["geom"]["extent"][1]*scaleFactor;
	
	cntx.save();
	
	if(model["children"].length < 1)
		ctx.fillStyle = nonrColor;
	
	cntx.translate(z*rx,-ry*z);
	cntx.rotate(-1* ra * Math.PI / 180);
	cntx.fillRect(-z*rwidth/2, -z*rheight/2, z*rwidth, z*rheight);  
	
	cntx.strokeRect(-z*rwidth/2, -z*rheight/2, z*rwidth,z* rheight);
	
	if(model["children"].length > 0){
		cntx.beginPath();
		cntx.moveTo(z*rwidth/2, -z*rheight/2);
		cntx.lineTo(0,0);
		cntx.lineTo(z*rwidth/2,z*rheight/2);
		cntx.stroke();
	}else{
		
		cntx.strokeStyle = "rgba(255,255,255,1)";
		cntx.lineWidth = 1;
		
		cntx.beginPath();
		cntx.moveTo(0,-z*rheight/2);
		cntx.lineTo(0,z*rheight/2);
		cntx.moveTo(-z*rwidth/2,0);
		cntx.lineTo(z*rwidth/2, 0);
		cntx.stroke();
		
		
	}
	
	// restore for drowing laser
	//cntx.save();
	//cntx.rotate(ra * Math.PI / 180);

	if(model.ranger != null){
		
		for(i=0;i<model.ranger.length;i++)
			drawModelRanger(cntx,model.ranger[i]);
	
	}
	
	/* 
	if(robot["showranger"])
		drawRanger(cntx, robot["ranger"]);
	
	*/
	cntx.save();
	cntx.rotate(ra * Math.PI / 180);
	//if(model["showname"])
	drawRobotName(cntx,model["name"]);
	cntx.restore();
	
	
	cntx.restore();		
	
}

function drawModelRanger(cntx, ranger){
	
	//Draw the transducers
	
	for(k=0;k<ranger.config.transducer_count;k++){
		cntx.save();
		
		cntx.fillStyle = rangerColor;
		
		tx = ranger.data.transducers[k].pose[0]*scaleFactor;
		ty = ranger.data.transducers[k].pose[1]*scaleFactor;
		ta = ranger.data.transducers[k].pose[5]*180/Math.PI;
		
		//twidth = ranger.config.transducers[k].extent[0]*scaleFactor;
		//theight = ranger.config.transducers[k].extent[1]*scaleFactor;
		twidth = ranger.geom.extent[0]*scaleFactor;
		theight = ranger.geom.extent[1]*scaleFactor;
		
		cntx.translate(z*tx,-ty*z);
		cntx.rotate(-1* ta * Math.PI / 180);
		cntx.fillRect(-z*twidth/2, -z*theight/2, z*twidth, z*theight);  
		
		cntx.strokeRect(-z*twidth/2, -z*theight/2, z*twidth,z* theight);
		
		cntx.restore();
	}
	
	//Draw the laser beams and ...
	cntx.save();
	cntx.fillStyle = beamsColor;//"rgba(100,100,100,0.4)";
	
	for(k=0;k<ranger.config.transducer_count;k++){
			
		cntx.beginPath();
		cntx.moveTo(0,0);
		
		for(i=0;i<ranger.data.transducers[k].sample_count;i++){
			
			xx = Math.cos(-1*ranger.data.transducers[k].samples[i][0]) * ranger.data.transducers[k].samples[i][2]*scaleFactor;
			yy = Math.sin(-1*ranger.data.transducers[k].samples[i][0]) * ranger.data.transducers[k].samples[i][2]*scaleFactor;
						
			cntx.lineTo(z*xx,z*yy);
			
		}
		
		cntx.lineTo(0,0);
		cntx.fill();
		
		
				
	}
	
	cntx.restore();
	
}

 
function drawRobotName(cntx, rname){
	
	cntx.save();
	cntx.fillStyle    = '#00f';
	cntx.font         = '15px sans-serif';
	cntx.textBaseline = 'top';
	cntx.fillText  (rname, 0, 0);
	//cntx.font         = 'bold 11px sans-serif';
	//cntx.strokeText('Hello world!', 0, 50);
	cntx.restore();
}
function zoomIn(){
	
	z += (z < 20)? 1 :0;
	
}
function zoomOut(){
	
	z -= (z > 1.5)? 1 :0;
	
}


function handle(delta) {
	if (delta < 0)
		zoomOut();
	else
		zoomIn();
}

function wheel(event){
	var delta = 0;
	if (!event) event = window.event;
	if (event.wheelDelta) {
		delta = event.wheelDelta/120; 
		if (window.opera) delta = -delta;
	} else if (event.detail) {
		delta = -event.detail/3;
	}
	if (delta)
		handle(delta);
        if (event.preventDefault)
                event.preventDefault();
        event.returnValue = false;
}

function mouseViewMove(e){
	
		if(!e) e = canvas.event;
		
		var offsetX = 0;
		var offsetY = 0;
		
		if(changeView){
			
			if(prex == 0 || prey ==0){
				
				prex = e.clientX;
				prey = e.clientY;
				
				return;
			}
			
			offsetX = prex - e.clientX;
			offsetY = prey - e.clientY;
			
			vx -= offsetX;
			vy -= offsetY;
		}
		
		prex = e.clientX;
		prey = e.clientY;
		
}

function mouseViewDown(){
	changeView = true;
}

function mouseViewUp(){
	changeView = false;
	prex=0;
	prey=0;
}

/*
function addVizOption(optName, description){
	var visoptions = document.getElementById("vizoptions");
	//visoptions.innerHTML += '<br/>';
	var option = document.createElement("input");
	option.setAttribute('type', "checkbox");
	option.setAttribute('id', optName);
	option.setAttribute('checked','true');
	option.setAttribute('onChange', 'handleVizOptionChange(\''+optName+'\')');
	
	
	
	var label = document.createElement("p");
	label.setAttribute("align","right");
	label.innerHTML = description;
	
	label.appendChild(option);
	//option.setAttribute('innerHTML',description);
	//option.innerHTML = '<b>'+description+ '</b>';
	visoptions.appendChild(label)
}

function handleVizOptionChange(optionName){
	var val = document.getElementById(optionName).checked;
	var indx = document.getElementById("robotslist").selectedIndex;
	var rname = document.getElementById("robotslist").options[indx].text;
	
	for(var i=0; i<robots.length; i++)
			robots[i][optionName] = (rname == "All" || rname == robots[i]["name"])?val:robots[i][optionName];
	
}

function selectedRobotChanged(){
	
	var indx = document.getElementById("robotslist").selectedIndex;
	var rname = document.getElementById("robotslist").options[indx].text;
	
	var options = (document.getElementById("vizoptions")).getElementsByTagName("input");
	
	for(var i=0; i<options.length; i++){
		
		var attr = options[i].getAttribute("id");
		var val = getRobot(rname)[attr];
		
		//options[i].setAttribute("checked", val );
		options[i].checked = val;
	}
}	
*/