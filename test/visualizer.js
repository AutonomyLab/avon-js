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
var bgColor = "rgb(100,149,237)";
//var bgColor = "rgba(130,130,130,1)";
var rangerColor = "rgb(72,118,255)";
var lbeamsColor = "rgba(94,91,197,0.3);" // laser beam color
var sbeamsColor = "rgba(34,201,17,0.3);" //sonar beam color

var rColor = "rgba(255,40,0,1)";
var nonrColor = "rgba(224,224,255,0.7)";
//var nonrColor = "rgb(30,144,170)"; // color of models without any sensor 
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
	
		
	setInterval(update,50);
	
	
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
			for(j=0;j<entities[i]["ranger"].length;j++){
				entities[i]["ranger"][j].data = entities[i]["ranger"][j].getData(); 
                entities[i]["ranger"][j].pva = entities[i]["ranger"][j].getPVA(); 
            }
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
		//message(simTime);
		drawRobot(ctx, model);
        
	   
	}
    ctx.restore();
	drawSimTime(ctx);			
    

}


function drawRobot(cntx, model){
	
   		
	rx = model["PVA"]["pva"][0][0]*scaleFactor;
	ry = model["PVA"]["pva"][0][1]*scaleFactor;
	ra = model["PVA"]["pva"][0][5];
	
	rwidth = model["geom"]["extent"][0]*scaleFactor;
	rheight = model["geom"]["extent"][1]*scaleFactor;
	
	cntx.save();
	
	if(model["children"].length < 1)
		ctx.fillStyle = nonrColor;
	
	cntx.translate(z*rx,-ry*z);
	cntx.rotate(-1* ra );
	       
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
	
    // offset the robot origin
    cntx.save();
    ofx = model["geom"]["pose"][0]*scaleFactor;
	ofy = model["geom"]["pose"][1]*scaleFactor;
	ofa = model["geom"]["pose"][5];
    
	cntx.translate(-z*ofx,ofy*z);
	cntx.rotate(ofa );

    ////////// DRAW ROBOT SENSORS and ... /////////////
	
	if(model.ranger != null){
		
		for(i=0;i<model.ranger.length;i++){
                
            	drawModelRanger(cntx,model.ranger[i]);
        }
	}
	
    cntx.restore();
    /////////////////////////////////////////////////
    
	cntx.save();
	cntx.rotate(ra );
	drawRobotName(cntx,model["name"]);
	cntx.restore();
	
	
	cntx.restore();		
	
}

function drawModelRanger(cntx, ranger){
	
	//Draw the transducers
	
	//cntx.translate(z*rx,-ry*z);
    cntx.save();
    radx = ranger.geom.pose[0]*scaleFactor;
	rady = ranger.geom.pose[1]*scaleFactor;
	rada = ranger.geom.pose[5];
    cntx.translate(z*radx,-rady*z);
	cntx.rotate(-1* rada );
    
    
	for(k=0;k<ranger.config.transducer_count;k++){
		cntx.save();
		
		cntx.fillStyle = rangerColor;
		
		tx = ranger.data.transducers[k].pose[0]*scaleFactor;
		ty = ranger.data.transducers[k].pose[1]*scaleFactor;
		ta = ranger.data.transducers[k].pose[5];
		
		twidth = ranger.config.transducers[k]["geom"].extent[0]*scaleFactor;
		theight = ranger.config.transducers[k]["geom"].extent[1]*scaleFactor;
		//twidth = ranger.geom.extent[0]*scaleFactor;
		//theight = ranger.geom.extent[1]*scaleFactor;
		
		cntx.translate(z*tx,-ty*z);
		cntx.rotate(-1* ta);
		cntx.fillRect(-z*twidth/2, -z*theight/2, z*twidth, z*theight);  
		
		cntx.strokeRect(-z*twidth/2, -z*theight/2, z*twidth,z* theight);
		
		cntx.restore();
	}
	
	//Draw the laser beams and ...
	cntx.save();
	cntx.fillStyle = lbeamsColor;//"rgba(100,100,100,0.4)";
    
    rx1 = ranger["pva"]["pva"][0][0]*scaleFactor;
	ry1 = ranger["pva"]["pva"][0][1]*scaleFactor;
	ra1 = ranger["pva"]["pva"][0][5];
    
    cntx.translate(z*rx1,-ry1*z);
	cntx.rotate(-ra1);
    
	
	for(k=0;k<ranger.config.transducer_count;k++){
		
        cntx.save();
        tdx = ranger.data.transducers[k].pose[0]*scaleFactor;
		tdy = ranger.data.transducers[k].pose[1]*scaleFactor;
		tda = ranger.data.transducers[k].pose[5];

        cntx.translate(z*tdx, -z*tdy);
        //cntx.rotate(-1*ranger.config.transducers[k].pose[5] * 180/Math.PI);	

        // chnage the beam color for laser/sonar
        if(ranger.data.transducers[k].sample_count > 1 ){
                  cntx.strokeStyle = lbeamsColor;
        }else{
                  cntx.fillStyle = sbeamsColor;
                  cntx.strokeStyle = sbeamsColor;
                  ranger.data.transducers[k].samples[0][0] += ranger.config.transducers[k]["fov"][0][0];
                  ranger.data.transducers[k].samples.push(ranger.data.transducers[k].samples[0].clone());
                                    
                  ranger.data.transducers[k].samples[1][0] += ranger.config.transducers[k]["fov"][0][1];
                  ranger.data.transducers[k].sample_count +=1;
                  
        }

        cntx.beginPath();
		cntx.moveTo(0,0);
		
		for(var i=0;i<ranger.data.transducers[k].sample_count;i++){
			
			xx = Math.cos(-1*(ranger.data.transducers[k].samples[i][0]+ranger.config.transducers[k]["geom"].pose[5])) * ranger.data.transducers[k].samples[i][2]*scaleFactor;
			yy = Math.sin(-1*(ranger.data.transducers[k].samples[i][0]+ranger.config.transducers[k]["geom"].pose[5])) * ranger.data.transducers[k].samples[i][2]*scaleFactor;
						
			cntx.lineTo(z*xx,z*yy);
		
        	
		}
		
		cntx.lineTo(0,0);
        cntx.stroke();
		cntx.fill();
        
		cntx.restore();
		
				
	}
	
	cntx.restore();
	
    cntx.restore();
}

function drawSimTime(cntx){
    
    var hour = Math.floor(simTime/3600);
	var min = Math.floor((simTime - hour*3600)/60);
	var sec = (simTime - hour*3600 - min*60);
	timeStr = hour+"h "+min+"m "+sec.toFixed(1)+"s";
    
    cntx.save();
	cntx.translate(5,5);    
    cntx.fillStyle    = '#fff';
	cntx.font         = '15px sans-serif';
	cntx.textBaseline = 'top';
	cntx.fillText  (timeStr, 0, 0);
	cntx.restore();
}
 
function drawRobotName(cntx, rname){
	
	cntx.save();
	cntx.fillStyle    = '#fff';
	cntx.font         = '15px sans-serif';
	cntx.textBaseline = 'top';
	cntx.fillText  (rname, 0, 0);
	//cntx.font         = 'bold 11px sans-serif';
	//cntx.strokeText('Hello world!', 0, 50);
	cntx.restore();
}
function zoomIn(){
	
	z += (z < 20)? .4 :0;
	
}
function zoomOut(){
	
	z -= (z > 1.5)? .4 :0;
	
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
			
			if(prex == 0 || prey == 0){
				
				prex = e.clientX-canvas.offsetLeft-11;
				prey = e.clientY-canvas.offsetTop-115;
				
				return;
			}
			
			offsetX = prex - (e.clientX-canvas.offsetLeft-11);
			offsetY = prey - (e.clientY-canvas.offsetTop-115);
			
			vx -= offsetX;
			vy -= offsetY;
		}
		
		prex = e.clientX-canvas.offsetLeft-11;
		prey = e.clientY-canvas.offsetTop-115;
		//message("<br>prex= "+(prex-vx-screenWidth/2)/(z*scaleFactor)+"<br>"+"prey= "+(-prey+vy+screenHeight/2)/(z*scaleFactor));
}

function mouseViewDown(){
	
    var mx=(prex-vx-screenWidth/2)/(z*scaleFactor);
    var my=(-prey+vy+screenHeight/2)/(z*scaleFactor);
    var selectedModel;
    //check if the user has selected a robot
    for(var ii=0;ii<entities.length;ii++){

        var model = entities[ii];
            
        if(model["children"].length < 1)
            continue;
    
        var rx = model["PVA"]["pva"][0][0];
        var ry = model["PVA"]["pva"][0][1];
        var rwidth = model["geom"]["extent"][0]
        //var rwidth = model["geom"]["extent"][0]
        message("<br>"+model["name"]+" "+ Math.sqrt(Math.pow(mx-rx,2)+Math.pow(my-ry,2)));
        if(Math.sqrt(Math.pow(mx-rx,2)+Math.pow(my-ry,2)) < rwidth){
            
            selectedModel = model;
            break;
        }
    }
    //message("<br>prex= "+mx+"<br>"+"prey= "+my);
    if(selectedModel != null){
        message("selectedModel = "+selectedModel["name"] );
    }else{
        message("" );
        changeView = true;
        }
    
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