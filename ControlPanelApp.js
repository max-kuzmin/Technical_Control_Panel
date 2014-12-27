function ControlPanelApp(div) {
	window.updateAddr = "/update";
	window.initAddr = "/init";
	window.testmode = 0;
	
	var afterLoad = function() { 
		setInterval(updateClient, updateTime);	
		document.getElementById("loading").style.display = "none";
		document.getElementById("container").style.display = "block";
	}
	setTimeout (afterLoad, 5000);

	
	var container = div;
	var canvas = div.canvas;
	var scene = new THREE.Scene();
	var that = this;
	var keyboard = new THREEx.KeyboardState();
	var clock = new THREE.Clock();
	var noScroll=0;
	var updateTime;
	var jsonReq={};
	var jsonObjBase={};
	var camRotX = 0;
	var camRotY = 0;
	var camPosX = 0;
	var camPosY = 0;
	window.initComplete=false;
	window.audio0 = new Audio();
	window.audio0.src = 'click.mp3';
	window.audio0.load();
	window.audio1 = new Audio();
	window.audio1.src = 'drag.mp3';
	window.audio1.load();
	var tipShow=true;
	window.lightVisible=true;
	window.mouseMoveMul=0;
	window.prevMouseY=0;
	window.prevMouseX=0;
	var curObj=this;
	var tooltip = document.getElementById("tooltip");
	tooltip.hidden=true;
	var objects = [];
	var targetList = [];
	var mouse = {x: 0, y: 0};
	if (Detector.webgl)
	renderer = new THREE.WebGLRenderer({
antialias: false,
canvas: canvas,
maxLights: 100,
precision: "mediump",
	});
	else {
		Detector.addGetWebGLMessage();
		renderer = new THREE.CanvasRenderer();}
	renderer.shadowMapEnabled = true;
	renderer.shadowMapAutoUpdate = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	renderer.devicePixelRatio=1;
	this.hiRes= function() {
		if (renderer.devicePixelRatio==1) renderer.devicePixelRatio=0.8;
		else renderer.devicePixelRatio=1;
		renderer.setSize(window.innerWidth-2, window.innerHeight);
	}
	this.panelLights = function () {
		lightVisible=!lightVisible;
	}
	this.tips=function() {
		tipShow=!tipShow;
	}
	renderer.setSize(window.innerWidth-2, window.innerHeight);
	container.appendChild(renderer.domElement);
	var camera = new THREE.PerspectiveCamera(45, (window.innerWidth-2)/window.innerHeight, 1, 10000);
	camera.position.set(0, 50, 300);
	scene.add(camera);
	var rX=camera.rotation.x;
	var rY=camera.rotation.y;
	var pX=camera.position.x;
	var pY=camera.position.y;
	var dX = 70;
	var dY = 70;
	var hemisphereLight2 = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
	hemisphereLight2.position.set(0, 1000, 5000);
	scene.add(hemisphereLight2);
	var dirlight0 = new THREE.DirectionalLight(0xffffff);
	dirlight0.position.set(-50, 50, 200);
	dirlight0.shadowDarkness = 0.50;
	dirlight0.intensity = 0.5;
	dirlight0.castShadow = true;
	dirlight0.shadowBias = 0.0002;
	dirlight0.onlyShadow = true;
	dirlight0.shadowMapWidth = 4096;
	dirlight0.shadowMapHeight = 4096;
	var pointlight0 = new THREE.PointLight(0xffffff, 0.5, 800);
	pointlight0.position.set(0,50,300);
	this.shadows = function(){
		if (dirlight0.castShadow==false) {
			dirlight0.shadowDarkness = 0.50;
			setTimeout(function(){dirlight0.castShadow=true;}, 200)}
		else {
			dirlight0.shadowDarkness = 0;
			setTimeout(function(){dirlight0.castShadow=false;}, 200)}}
	var targetCam = new THREE.Object3D();
	targetCam.position.set(0, 50, 0);
	dirlight0.target = targetCam;
	var lightX=0;
	var lightY=50;
	scene.add(targetCam);
	scene.add(dirlight0);
	scene.add(pointlight0);
	if (testmode) {
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '30px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );}
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });
	THREEx.FullScreen.bindKey({ charCode : 'а'.charCodeAt(0) });
	var onMouseDown = function (event) {
		mouse.x = ((event.clientX - $("#container").offset().left) / container.offsetWidth) * 2 - 1;
		mouse.y = -((event.clientY - $("#container").offset().top) / container.offsetHeight) * 2 + 1;
		window.prevMouseY=event.clientY - $("#container").offset().top;
		window.prevMouseX = event.clientX - $("#container").offset().left;
		curObj=this;
		var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
		vector.unproject(camera);
		var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
		var intersects = ray.intersectObjects(targetList, true);
		if (intersects.length > 0) {
			curObj=intersects[0].object.me;
			if (curObj.changeY==0) curObj.changeY=1;
			if (curObj.changeX==0) curObj.changeX=1;
			if (event.button==0 && intersects[0].object.me.onClick) {
				intersects[0].object.me.onClick();}
			else if (event.button==2 && intersects[0].object.me.onRightClick) {
				intersects[0].object.me.onRightClick();}
		}
	}
	var tipUpd;
	window.delayMove=0;
	var onMouseMove = function (event) {
		mouse.x = event.clientX - $("#container").offset().left;
		mouse.y = event.clientY - $("#container").offset().top;
		if (curObj.changeY==1) {
			if (window.mouseMoveMul!=1 && mouse.y<(window.prevMouseY-25)) {
				window.mouseMoveMul=1;
			}
			else if (window.mouseMoveMul!=-1 && mouse.y>(window.prevMouseY+25)) {
				window.mouseMoveMul=-1;
			}
			else if (window.mouseMoveMul!=0 && mouse.y<(window.prevMouseY+25) && mouse.y>(window.prevMouseY-25)) {
				window.mouseMoveMul=0;}
		}
		if (curObj.changeX==1) {
			if (window.mouseMoveMul!=1 && mouse.x<(window.prevMouseX-25)) {
				window.mouseMoveMul=1;
			}
			else if (window.mouseMoveMul!=-1 && mouse.x>(window.prevMouseX+25)) {
				window.mouseMoveMul=-1;
			}
			else if (window.mouseMoveMul!=0 && mouse.x<(window.prevMouseX+25) && mouse.x>(window.prevMouseX-25)) {
				window.mouseMoveMul=0;}
		}
		if (noScroll==0) {
			if (mouse.x < (container.offsetWidth * 0.1)) {
				camRotY = 0.01/4;
				camPosX = -dX/19/4;
			} else if (mouse.x > (container.offsetWidth * 0.9)) {
				camRotY = -0.01/4;
				camPosX = dX/19/4;
			} else {
				camRotY = 0;
				camPosX = 0;
			}
			if (mouse.y < (container.offsetHeight * 0.1)) {
				camRotX = 0.01/4;
				camPosY = dY/9/4;
			} else if (mouse.y > (container.offsetHeight * 0.9)) {
				camRotX = -0.01/4;
				camPosY = -dY/9/4;
			} else {
				camRotX = 0;
				camPosY = 0;
			}
		}
		if (tipShow==true) {
			mouse.x1 = ((event.clientX - $("#container").offset().left) / container.offsetWidth) * 2 - 1;
			mouse.y1 = -((event.clientY - $("#container").offset().top) / container.offsetHeight) * 2 + 1;
			var vector = new THREE.Vector3(mouse.x1, mouse.y1, 1);
			vector.unproject(camera);
			var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
			var intersects = ray.intersectObjects(targetList, true);
			if (intersects.length > 0) {
				tipUpd=intersects[0];
				container.style.cursor = "pointer";
				tooltip.style.left = (event.clientX+10)+"px";
				tooltip.style.top = (event.clientY+10)+"px";
				tooltip.hidden=false;
			}
			else {
				tooltip.hidden=true;
				if (curObj.changeY!=1 && curObj.changeX!=1) {
					container.style.cursor = "default";}}
		}
	}
	var onMouseLeave = function (event) {
		if (curObj.changeY==1) curObj.changeY=0;
		if (curObj.changeX==1) curObj.changeX=0;
		window.mouseMoveMul=0;
	}
	var onMouseUp = function (event) {
		if (curObj.changeY==1)  curObj.changeY=0;
		if (curObj.changeX==1) curObj.changeX=0;
		window.mouseMoveMul=0;
	}
	var newZ=camera.position.z;
	var camPosXzoom = 0, camPosYzoom = 0;
	var onMouseWheel = function (event) {
		var deltaZoomX = (mouse.x-container.offsetWidth/2)*0.005;
		var deltaZoomY = -(mouse.y-container.offsetHeight/2)*0.005;
		event.preventDefault();
		if (event.deltaY<0 && newZ>70) {
			newZ-=20;
			camPosXzoom=deltaZoomX;
			camPosYzoom=deltaZoomY; }
		else if (event.deltaY>0 && newZ<350) {
			camPosXzoom=0;
			camPosYzoom=0;
			newZ+=20;}
	}
	var onClick = function (event) {
		event.preventDefault();
		return false;
	}
	document.getElementById("container").addEventListener('click', onClick, false);
	document.getElementById("container").addEventListener('mousemove', onMouseMove, false);
	document.getElementById("container").addEventListener('mouseleave', onMouseLeave, false);
	document.getElementById("container").addEventListener('wheel', onMouseWheel, false);
	document.getElementById("container").addEventListener('contextmenu', onClick, false);
	document.getElementById("container").addEventListener('mouseup', onMouseUp, false);
	document.getElementById("container").addEventListener('mousedown', onMouseDown, false);
	var room = new Room();
	objects.push(room);
	scene.add(room.object);
	var all = this;
	all.elements={};
	this.loadPanels = function () {
		$.getJSON("panelConf.json", function(jsonData) {
			updateTime=jsonData["server timeout"];
			for (var i=0; i<jsonData.panels.length; i++) {
				for (var k=0; k<jsonData.panels[i].elements.length; k++) {
					var type0=jsonData.panels[i].elements[k].type;
					if (type0=="button" || type0=="holding button" || type0=="rotary switch" || type0=="analog vertical switch" || type0=="analog rotary switch") {
						jsonReq[jsonData.panels[i].elements[k].name]=jsonData.panels[i].elements[k].value||0;
					}
					else jsonObjBase[jsonData.panels[i].elements[k].name]=1;
				}
			}
			if (jsonData["scroll off"]==1) {
				noScroll=1;}
			var panelX;
			var panelY=50;
			switch (jsonData.panels.length) {
			case 1:
				panelX=[0];
				dX=95;
				break;
			case 2:
				panelX=[-130, 130];
				dX=190;
				break;
			case 3:
				panelX=[-260, 0, 260];
				dX=340;
				break;
			}
			for (var i = 0 ; i<jsonData.panels.length && i<3; i++) {
				var panel = new Panel(panelX[i],panelY, jsonData.panels[i].angle, jsonData.panels[i].color);
				all[jsonData.panels[i].name] = panel;
				objects.push(panel);
				scene.add(panel.object);
				if (jsonData.panels[i].title!=0) {
					titleAdd(jsonData.panels[i].title, panelX[i], panelY, panel);}
				for (var j = 0 ; j<jsonData.panels[i].elements.length; j++) {
					var elem;
					elemX=jsonData.panels[i].elements[j].x+panelX[i];
					elemY=jsonData.panels[i].elements[j].y+panelY;
					switch (jsonData.panels[i].elements[j].type) {
					case "button":
						elem = new Button(elemX, elemY, jsonData.panels[i].elements[j].color, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "digit":
						elem = new Digit(elemX, elemY, jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j].color, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "rotary switch":
						elem = new Rotator(elemX, elemY, jsonData.panels[i].elements[j].positions, jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j].texture, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "arrow indicator":
						elem = new ArrowIndicator(elemX, elemY, jsonData.panels[i].elements[j]["min value"], jsonData.panels[i].elements[j]["max value"], jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j].cycled, jsonData.panels[i].elements[j].texture, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "oscillograph":
						elem = new Oscillograph(elemX, elemY, jsonData.panels[i].elements[j].color, jsonData.panels[i].elements[j].texture, jsonData.panels[i].elements[j]["max value"], jsonData.panels[i].elements[j]["min value"],jsonData.panels[i].elements[j]["show zero"], jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j]["update time"], jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "lamp":
						elem = new Lamp(elemX, elemY, jsonData.panels[i].elements[j].color, jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "vertical arrow indicator":
						elem = new VertArrowIndicator(elemX, elemY, jsonData.panels[i].elements[j].texture, jsonData.panels[i].elements[j]["max value"], jsonData.panels[i].elements[j]["min value"], jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "holding button":
						elem = new HoldingButton(elemX, elemY,jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j].color, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "5 digits":
						elem = new Digits4(elemX, elemY, jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j]["digits after dot"], jsonData.panels[i].elements[j].color,  jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "analog rotary switch":
						elem = new Rotator2(elemX, elemY, jsonData.panels[i].elements[j].texture, jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j]["min value"], jsonData.panels[i].elements[j]["max value"], jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "two lamps":
						elem = new TwoLamps(elemX, elemY, jsonData.panels[i].elements[j]["color"], jsonData.panels[i].elements[j]["color 2"], jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "horizontal arrow indicator":
						elem = new HorArrowIndicator(elemX, elemY, jsonData.panels[i].elements[j].texture, jsonData.panels[i].elements[j]["max value"], jsonData.panels[i].elements[j]["min value"], jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					case "analog vertical switch":
						elem = new VertSwitch(elemX, elemY, jsonData.panels[i].elements[j].texture, jsonData.panels[i].elements[j].value, jsonData.panels[i].elements[j]["min value"], jsonData.panels[i].elements[j]["max value"], jsonData.panels[i].elements[j].scale, jsonData.panels[i].elements[j].comment);
						break;
					}
					all[jsonData.panels[i].name][jsonData.panels[i].elements[j].name] = elem;
					all.elements[jsonData.panels[i].elements[j].name] = elem;
					objects.push(elem);
					targetList.push(elem.object);
					panel.object.add(elem.object);
					if (jsonData.panels[i].elements[j].title!=0) {
						titleAdd(jsonData.panels[i].elements[j].title, elemX, elemY, panel);
					}
				}
			}	
			if (window.testmode==1) console.log(all);			
		});
	}	
	var titleAdd = function (JSONtitle, objX, objY, panelCur) {
		var canvas1 = document.createElement('canvas');
		var context1 = canvas1.getContext('2d');
		var fontSize = JSONtitle.size;
		var text = JSONtitle.text;
		var color = JSONtitle.color;
		var lines = text.length;
		var textLength=0;
		for (var k=0; k<lines; k++) {
			if (text[k].length>textLength) {
				textLength=text[k].length;
			}
		}
		canvas1.width = fontSize*textLength*0.7;
		canvas1.height = fontSize*1.7*lines;
		context1.fillStyle = "white";
		context1.fillRect(0,0,fontSize*textLength*0.7, fontSize*1.8*lines);
		context1.fillStyle = "black";
		context1.lineWidth = fontSize/2.5;
		context1.strokeRect(1,-1,fontSize*textLength*0.7, fontSize*1.7*lines);
		context1.font = "Bold " + fontSize + "px Arial";
		context1.fillStyle = color;
		for (var k=0; k<lines; k++) {
			context1.fillText(text[k], fontSize*0.5, fontSize*1.3*(k+1));}
		var texture1 = new THREE.Texture(canvas1)
		texture1.needsUpdate = true;
		var material1 = new THREE.MeshPhongMaterial( {ambient: 0xffffff, color: 0xffffff, specular: 0xffffff, shininess: 1, map: texture1, side:THREE.DoubleSide} );
		material1.transparent = true;
		var mesh1 = new THREE.Mesh(new THREE.PlaneBufferGeometry(fontSize*textLength*0.7/10, fontSize*1.7*lines/10), material1);
		mesh1.position.set(objX+JSONtitle.x, objY+JSONtitle.y,0.01);
		mesh1.receiveShadow = true;
		mesh1.me=panelCur;
		panelCur.object.add( mesh1 );
	}
	this.loadPanels();
	this.run = function () {
		update();
		renderer.render(scene, camera);
		requestAnimationFrame(that.run);
	}
	var oldX, oldY;
	var update = function () {
		if (camRotX || camPosX || camRotY || camPosY) {
			if (delayMove<20) delayMove++;
			if (delayMove==20) {
				if ((camera.rotation.x < (rX - 0.1) && camRotX < 0) || (camera.rotation.x > (rX + 0.1) && camRotX > 0)) {
					camRotX = 0;}
				else camera.rotation.x += camRotX;
				if ((camera.position.x < (pX-dX) && camPosX < 0) || (camera.position.x > (pX+dX) && camPosX > 0)) {
					camPosX = 0;}
				else {
					camera.position.x += camPosX;
					lightX += camPosX;}
				if ((camera.rotation.y < (rY - 0.1) && camRotY < 0) || (camera.rotation.y > (rY + 0.1) && camRotY > 0)) {
					camRotY = 0;}
				else camera.rotation.y += camRotY;
				if ((camera.position.y < (pY-dY) && camPosY < 0) || (camera.position.y > (pY+dY) && camPosY > 0)) {
					camPosY = 0;}
				else {
					camera.position.y += camPosY;
					lightY += camPosY;}
			}}
		else delayMove=0;
		if (camera.position.z!=newZ) {
			if (camera.position.z<newZ) {
				camera.position.z+=4;}
			else {
				camera.position.z-=4;}
			if (camera.position.x >= (pX-dX-camPosXzoom) && camera.position.x <= (pX+dX-camPosXzoom) && camPosX==0){
				camera.position.x+=camPosXzoom;
				lightX += camPosXzoom;}
			if (camera.position.y >= (pY-dY-camPosYzoom) && camera.position.y <= (pY+dY-camPosYzoom) && camPosY==0) {
				camera.position.y+=camPosYzoom;
				lightY += camPosYzoom;}
		}
		if (camera.position.x!=oldX) {
			dirlight0.position.x=-lightX*0.7-50;
			pointlight0.position.x=lightX;
			oldX=camera.position.x;
			dirlight0.shadowBias = 0.0001 + 0.0001/190*Math.abs(camera.position.x);
		}
		if (camera.position.y!=oldY) {
			dirlight0.position.y=lightY*0.7+100;
			pointlight0.position.y=lightY;
			oldY=camera.position.y;
		}
		if (tipUpd!=null) {
			tooltip.innerHTML="";
			for (var i=0; i<tipUpd.object.me.comment.length; i++) {
				tooltip.innerHTML+=tipUpd.object.me.comment[i]+"<br>";}
			tooltip.innerHTML+="Значение: "+(Math.round(tipUpd.object.me.value*1000)/1000);
		}
		for (var i = 0; i < objects.length; i++) {
			objects[i].update();
		}
		if (window.testmode==1) stats.update();
	}
	
	
	var updateClient=function() {
		if (window.initComplete==false) {
			$.get(window.initAddr, null, response, "json");
		}
		else {
			for (var key in jsonReq) {
				if (all.elements[key]
						) {
					jsonReq[key]=Math.round(all.elements[key].value*1000)/1000;
					if (jsonReq[key]==null) jsonReq[key] = 0;
				}
			}
			$.post(window.updateAddr, jsonReq, response, "json");
		}
		
	}
	
	var response = function(resObj) {
		for (var key2 in resObj) {
			if ((all.elements[key2] && jsonObjBase[key2]) || (window.initComplete==false && all.elements[key2])) {
				all.elements[key2].value=parseInt(resObj[key2]);
			}
		}
		window.initComplete=true;
	}
}
function Room() {
	var object = new THREE.Object3D();
	var mesh = null;
	var material;
	var loader = new THREE.JSONLoader();
	this.object = object;
	loader.load("models//room.js", function (geometry, materials) {
		material = new THREE.MeshFaceMaterial(materials);
		mesh = new THREE.Mesh(geometry, material);
		mesh.receiveShadow = true;
		object.add(mesh);
	});
	this.update = function () {
		if (mesh != null) {}
	}
}function Panel(x0, y0, angle0, color0) {
	var object = new THREE.Object3D();
	var mesh = null;
	var material;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var angle=angle0;
	var color = color0;
	object.rotation.y=Math.PI*angle/180;
	object.position.z-=Math.PI*Math.abs(angle)/180*140;
	object.position.x-=Math.abs(angle)*angle/50;
	loader.load("models//panel.js", function (geometry, materials) {
		material = new THREE.MeshFaceMaterial(materials);
		mesh = new THREE.Mesh(geometry, material);
		mesh.position.y+=y0;
		mesh.position.x+=x0;
		mesh.material.materials[0].color=new THREE.Color(color);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		object.add(mesh);
	});
	this.update = function () {
		if (mesh != null) {
		}
	}
}function Button(posX0, posY0, color0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var mesh = null;
	var material;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var scale=scale0;
	var posY=posY0, posX=posX0;
	var pressTimer = 0;
	this.value=0;
	loader.load("models//button.js", function (geometry, materials) {
		materials[0].morphTargets = true;
		materials[1].morphTargets = true;
		material = new THREE.MeshFaceMaterial(materials);
		mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.position.set(posX, posY, 0);
		mesh.scale.set(scale,scale,scale);
		mesh.material.materials[1].color = new THREE.Color(color0);
		mesh.morphTargetInfluences[0] = 1;
		mesh.me=that;
		object.add(mesh);
	});
	this.update = function () {
		if (mesh != null) {
			if (pressTimer>10 && mesh.morphTargetInfluences[0] > 0.1) {
				mesh.morphTargetInfluences[0] -= 0.1;
				mesh.morphTargetInfluences[1] += 0.1;
				this.value=1;
				pressTimer--;
			} else if (pressTimer>0 && pressTimer<=10 && mesh.morphTargetInfluences[1] > 0.1) {
				mesh.morphTargetInfluences[1] -= 0.1;
				mesh.morphTargetInfluences[0] += 0.1;
				if (mesh.morphTargetInfluences[0]>0.9)
				this.value=0;
				pressTimer--;
			}
		}
	}
	this.onClick = function () {
		if (!pressTimer){
			window.audio0.load();
			window.audio0.play();
			pressTimer=20;}
	}
}
function Rotator(posX0, posY0, positions0, value0, texture0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var mesh = null;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var positions = positions0;
	var posY=posY0, posX=posX0;
	var scale = scale0;
	var posNum=positions.length;
	var switchNext=0;
	this.value = positions[0];
	for (var i=0; i<posNum; i++) {
		if (value0==positions[i]) {
			this.value=positions[i];
			switchNext=i;
		}
	}
	var dA = Math.PI/48;
	var switchRad=-Math.PI/(posNum-1);
	var firstRot;
	loader.load("models//rotator.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.receiveShadow = true;
		mesh0.position.set(posX, posY, 0);
		mesh0.rotation.z+=Math.PI/2;
		firstRot=mesh0.rotation.z;
		mesh0.scale.set(scale,scale,scale);
		mesh0.me=that;
		object.add(mesh0);
		mesh=mesh0;
	});
	loader.load("models//rotatorPanel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh1 = new THREE.Mesh(geometry, material);
		mesh1.castShadow = true;
		mesh1.receiveShadow = true;
		mesh1.position.set(posX, posY, 0);
		mesh1.scale.set(scale,scale,scale);
		mesh1.me=that;
		if (texture0!=0) {
			mesh1.material.materials[1].map = THREE.ImageUtils.loadTexture(texture0);}
		object.add(mesh1);
	});
	this.update = function () {
		if (mesh != null) {
			if (this.value!=positions[switchNext]) { 
				switchNext = positions.indexOf(parseInt(this.value));}
			
			if (mesh.rotation.z<=(firstRot+switchNext*switchRad-dA)) {
				mesh.rotation.z+=dA;
			}
			else if (mesh.rotation.z>=(firstRot+switchNext*switchRad+dA)) {
				mesh.rotation.z-=dA;
			}}
	}
	this.onClick = function () {
		window.audio0.load();
		window.audio0.play();
		if (switchNext<(posNum-1)) {
			switchNext++;
			this.value=positions[switchNext];}}
	this.onRightClick = function () {
		window.audio0.load();
		window.audio0.play();
		if (switchNext>0) {
			switchNext--;
			this.value=positions[switchNext];}}
}
function Digit(posX0, posY0, digit0, color0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var line = [];
	var color = color0;
	this.value = digit0;
	var valueCur;
	var posY=posY0, posX=posX0;
	var scale=scale0;
	var press = false;
	function setBright(c, i) {
		c.r*=i;
		c.g*=i;
		c.b*=i;
	}
	loader.load("models//digitLine0.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		line[0] = new THREE.Mesh(geometry, material);
		line[0].position.set(posX, posY, 0);
		line[0].scale.set(scale,scale,scale);
		line[0].me=that;
		object.add(line[0]);});
	loader.load("models//digitLine1.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		line[1] = new THREE.Mesh(geometry, material);
		line[1].position.set(posX, posY, 0);
		line[1].scale.set(scale,scale,scale);
		line[1].me=that;
		object.add(line[1]);});
	loader.load("models//digitLine2.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		line[2] = new THREE.Mesh(geometry, material);
		line[2].position.set(posX, posY, 0);
		line[2].scale.set(scale,scale,scale);
		line[2].me=that;
		object.add(line[2]);});
	loader.load("models//digitLine3.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		line[3] = new THREE.Mesh(geometry, material);
		line[3].position.set(posX, posY, 0);
		line[3].scale.set(scale,scale,scale);
		line[3].me=that;
		object.add(line[3]);});
	loader.load("models//digitLine4.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		line[4] = new THREE.Mesh(geometry, material);
		line[4].position.set(posX, posY, 0);
		line[4].scale.set(scale,scale,scale);
		line[4].me=that;
		object.add(line[4]);});
	loader.load("models//digitLine5.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		line[5] = new THREE.Mesh(geometry, material);
		line[5].position.set(posX, posY, 0);
		line[5].scale.set(scale,scale,scale);
		line[5].me=that;
		object.add(line[5]);});
	loader.load("models//digitLine6.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		line[6] = new THREE.Mesh(geometry, material);
		line[6].position.set(posX, posY, 0);
		line[6].scale.set(scale,scale,scale);
		line[6].me=that;
		object.add(line[6]);
	});
	loader.load("models//digitPanel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.position.set(posX, posY, 0);
		mesh.scale.set(scale,scale,scale);
		mesh.me=that;
		object.add(mesh);
	});
	var light = new THREE.PointLight( color, 4, 20*scale );
	light.position.set(posX, posY, 4);
	object.add(light);
	var lightVisibleOld;
	this.update = function () {
		if (line[0] != null && line[1] != null && line[2] != null && line[3] != null && line[4] != null && line[5] != null && line[6] != null) {
			if (valueCur!=this.value) {
				valueCur=this.value;
				setDigit(this.value);
			}
		}
		if (lightVisible!=lightVisibleOld) {
			lightVisibleOld=lightVisible;
			light.visible=lightVisible;
		}
	}
	var setDigit = function (num) {
		if (line[0]!=null && line[1]!=null && line[2]!=null && line[3]!=null && line[4]!=null && line[5]!=null && line[6]!=null) {
			for (var i=0; i<7; i++) {
				line[i].material.materials[0].color = new THREE.Color(color);
				setBright(line[i].material.materials[0].color, 0.2);
			}
			var linesMas=[];
			switch (num) {
			case 0: linesMas=[0,1,2,4,5,6]; break;
			case 1: linesMas=[2,5]; break;
			case 2: linesMas=[0,2,3,4,6]; break;
			case 3: linesMas=[0,2,3,5,6]; break;
			case 4: linesMas=[1,2,3,5]; break;
			case 5: linesMas=[0,1,3,5,6]; break;
			case 6: linesMas=[0,1,3,4,5,6]; break;
			case 7: linesMas=[0,2,5]; break;
			case 8: linesMas=[0,1,2,3,4,5,6]; break;
			case 9: linesMas=[0,1,2,3,5,6]; break;
			case 10: linesMas=[0,1,2,3,4,5]; break;
			case 11: linesMas=[1,3,4,5,6]; break;
			case 12: linesMas=[0,1,4,6]; break;
			case 13: linesMas=[2,3,4,5,6]; break;
			case 14: linesMas=[0,1,3,4,6]; break;
			case 15: linesMas=[0,1,3,4]; break;
			}
			if (num<0) {
				linesMas=[3];}
			lineOn(linesMas);
			light.intensity = 4/7*linesMas.length;
		}
	}
	this.onClick = function () {
		if (window.testmode)
		this.value++;
	}
	this.onRightClick = function () {
		if (window.testmode)
		this.value--;
	}
	var lineOn = function (nums) {
		for (var i=0; i<nums.length; i++) {
			line[nums[i]].material.materials[0].color = new THREE.Color(color);
			setBright(line[nums[i]].material.materials[0].color, 2);}
	}
}
function ArrowIndicator(posX0, posY0, valueMin0, valueMax0, value0, cycled0, texture0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var mesh = null;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var cycled=cycled0;
	var posY=posY0, posX=posX0;
	var scale=scale0;
	this.value=value0;
	var valueMax=valueMax0, valueMin=valueMin0, valueCur=valueMin;
	var posY=posY0, posX=posX0;
	var dot = Math.PI*2/(valueMax-valueMin);
	var speed=1;
	for (var dotTemp=dot; dotTemp<0.01; dotTemp*=10) {
		speed*=10;}
	loader.load("models//arrowIndicator.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.position.set(posX, posY, 0);
		mesh0.scale.set(scale,scale,scale);
		mesh0.me=that;
		object.add(mesh0);
		mesh=mesh0;
	});
	loader.load("models//arrowIndicatorPanel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh1 = new THREE.Mesh(geometry, material);
		mesh1.castShadow = true;
		mesh1.receiveShadow = true;
		mesh1.position.set(posX, posY, 0);
		mesh1.scale.set(scale,scale,scale);
		mesh1.me=that;
		if (texture0!=0) {
			mesh1.material.materials[0].map = THREE.ImageUtils.loadTexture(texture0);}
		object.add(mesh1);
	});
	this.update = function () {
		if (mesh != null) {
			if (this.value>valueMax && cycled==0) {
				this.value=valueMax;}
			if (this.value<valueMin) {
				this.value=valueMin;}
			if (valueCur<(this.value-speed/2)) {
				mesh.rotation.z-=dot*speed;
				valueCur+=speed;
			}
			else if (valueCur>(this.value+speed/2)) {
				mesh.rotation.z+=dot*speed;
				valueCur-=speed;
			}
		}
	}
	this.onClick = function () {
		if (window.testmode)
		this.value+=speed*5;}
	this.onRightClick = function () {
		if (window.testmode)
		this.value-=speed*5;
	}
}
function Oscillograph(posX0, posY0, color0, texture0, valueMax0, valueMin0, showZero0, value0, updateTime0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var meshLine=null;
	var timer = 0;
	var posY=posY0, posX=posX0;
	var scale = scale0;
	var color1 = color0;
	var updateTime = updateTime0;
	this.value=value0;
	var valueMax=valueMax0, valueMin=valueMin0, showZero=showZero0;
	var dot = 38/Math.abs(valueMax-valueMin);
	loader.load("models//oscillographPanel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.receiveShadow = true;
		mesh0.position.set(posX, posY, 0);
		mesh0.scale.set(scale,scale,scale);
		mesh0.me=that;
		if (texture0!=0) {
			mesh0.material.materials[1].map = THREE.ImageUtils.loadTexture(texture0);}
		object.add(mesh0);
	});
	loader.load("models//oscillographLine.js", function (geometry, materials) {
		var material = new THREE.LineBasicMaterial({ color: color1, linewidth: 2 });
		var mesh1 = new THREE.Line(geometry, material);
		mesh1.position.set(posX, posY, 0.5);
		mesh1.scale.set(scale,scale,scale);
		mesh1.me=that;
		object.add(mesh1);
		meshLine=mesh1;
	});
	if (showZero==1) {
		var zeroPos=-19-dot*valueMin;
		if (valueMax<0) zeroPos=19;
		else if (valueMin>0) zeroPos=-19;
		loader.load("models//oscillographLine.js", function (geometry, materials) {
			var material = new THREE.LineBasicMaterial({ color: "darkgray", linewidth: 2 });
			var mesh2 = new THREE.Line(geometry, material);
			mesh2.position.set(posX, posY+zeroPos, 0.1);
			mesh2.scale.set(scale,scale,scale);
			mesh2.me=that;
			object.add(mesh2);
		});}
	var testVal=0;
	var testSin=0;
	var light = new THREE.PointLight( color1, 1, 50 );
	light.position.set(posX, posY, 10);
	object.add(light);
	var lightVisibleOld;
	this.update = function () {
		if (meshLine!=null && timer>=updateTime) {
			if (this.value>valueMax) {
				this.value=valueMax;}
			else if (this.value<valueMin) {
				this.value=valueMin;}
			var bright=0;
			for (var i=meshLine.geometry.vertices.length-1; i>0; i--) {
				meshLine.geometry.vertices[i].y=meshLine.geometry.vertices[i-1].y;
				bright+=Math.abs(meshLine.geometry.vertices[i].y);}
			meshLine.geometry.vertices[0].y=dot*this.value-19-dot*valueMin;
			bright+=Math.abs(meshLine.geometry.vertices[0].y);
			meshLine.geometry.verticesNeedUpdate = true;
			light.intensity = 0.25+1/meshLine.geometry.vertices.length/19*bright;
			timer=0;
			if (testSin==1 && timer==updateTime) {
				this.value=75*Math.sin(testVal/7.5);
				testVal++;}
		}
		timer++;
		if (lightVisible!=lightVisibleOld) {
			lightVisibleOld=lightVisible;
			light.visible=lightVisible;
		}
	}
	this.onClick = function () {
		if (window.testmode) {
			this.value=Math.random() * (valueMax - (valueMin)) + (valueMin);
			testSin=0;}
	}
	this.onRightClick = function () {
		if (window.testmode)
		testSin=1;
	}
}
function Lamp(posX0, posY0, color0, value0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var mesh=null;
	var posY=posY0, posX=posX0;
	var scale=scale0;
	var color=color0;
	this.value = value0;
	var valueCur;
	var setBright = function(c, i) {
		c.r*=i;
		c.g*=i;
		c.b*=i;
	}
	var light = new THREE.PointLight( color, 2, 20*scale );
	light.position.set(posX, posY, 4);
	object.add(light);
	light.intensity = 0;
	loader.load("models//lamp.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.receiveShadow = true;
		mesh0.position.set(posX, posY, 0);
		mesh0.scale.set(scale,scale,scale);
		mesh0.me=that;
		mesh0.material.materials[0].color = new THREE.Color(color);
		setBright(mesh0.material.materials[0].color, 1);
		object.add(mesh0);
		mesh=mesh0;
	});
	var lightVisibleOld;
	this.update = function () {
		if (mesh!=null && valueCur!=this.value) {
			valueCur=this.value;
			if (valueCur<=0) {
				light.intensity = 0;
				mesh.material.materials[0].color = new THREE.Color(color);
				setBright(mesh.material.materials[0].color, 1);
			}
			else {
				light.intensity = 2;
				mesh.material.materials[0].color = new THREE.Color(color);
				setBright(mesh.material.materials[0].color, 5.0);
			}
		}
		if (lightVisible!=lightVisibleOld) {
			lightVisibleOld=lightVisible;
			light.visible=lightVisible;
		}
	}
	this.onClick = function () {
		if (window.testmode)
		if (mesh!=null) {
			this.value=1;
		}
	}
	this.onRightClick = function () {
		if (window.testmode)
		if (mesh!=null) {
			this.value=0;
		}
	}
}
function VertArrowIndicator(posX0, posY0, texture0, valueMax0, valueMin0, value0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var mesh = null;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	this.value=value0;
	var valueMax=valueMax0, valueMin=valueMin0, valueCur=valueMin;
	var posY=posY0, posX=posX0;
	var scale=scale0;
	var dot = 9.3*2/(valueMax-valueMin);
	var speed=1;
	for (var dotTemp=dot; dotTemp<0.01; dotTemp*=10) {
		speed*=10;}
	loader.load("models//vertArrowIndicator.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.position.set(posX, posY, 0);
		mesh0.scale.set(scale,scale,scale);
		mesh0.me=that;
		object.add(mesh0);
		mesh=mesh0;
		mesh.position.y-=9.3;
	});
	loader.load("models//vertArrowIndicatorPanel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh1 = new THREE.Mesh(geometry, material);
		mesh1.castShadow = true;
		mesh1.receiveShadow = true;
		mesh1.position.set(posX, posY, 0);
		mesh1.scale.set(scale,scale,scale);
		mesh1.me=that;
		if (texture0!=0) {
			mesh1.material.materials[0].map = THREE.ImageUtils.loadTexture(texture0);}
		object.add(mesh1);
	});
	this.update = function () {
		if (mesh != null) {
			if (this.value<valueMin) {
				this.value=valueMin;}
			else if (this.value>valueMax) {
				this.value=valueMax;}
			if (valueCur<(this.value-speed/2)) {
				valueCur+=speed;
				mesh.position.y+=dot*speed;}
			else if (valueCur>(this.value+speed/2)) {
				valueCur-=speed;
				mesh.position.y-=dot*speed;}
		}
	}
	this.onClick = function () {
		if (window.testmode)
		this.value+=5*speed;
	}
	this.onRightClick = function () {
		if (window.testmode)
		this.value-=5*speed;
	}
}
function HoldingButton(posX0, posY0, value0, color0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var mesh = null;
	var material;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var posY=posY0, posX=posX0;
	var scale=scale0;
	this.value = value0;
	loader.load("models//holdingButton.js", function (geometry, materials) {
		materials[0].morphTargets = true;
		materials[1].morphTargets = true;
		material = new THREE.MeshFaceMaterial(materials);
		mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.position.set(posX, posY, 0);
		mesh.scale.set(scale,scale,scale);
		mesh.material.materials[1].color = new THREE.Color(color0);
		mesh.morphTargetInfluences[0] = 1;
		mesh.me=that;
		object.add(mesh);
	});
	this.update = function () {
		if (mesh != null) {
			if (this.value==1 && mesh.morphTargetInfluences[0] > 0.1) {
				mesh.morphTargetInfluences[0] -= 0.1;
				mesh.morphTargetInfluences[1] += 0.1;
			} else if (this.value==0 && mesh.morphTargetInfluences[1] > 0.1) {
				mesh.morphTargetInfluences[1] -= 0.1;
				mesh.morphTargetInfluences[0] += 0.1;
			}
		}
	}
	this.onClick = function () {
		window.audio0.load();
		window.audio0.play();
		this.value = 1;}
	this.onRightClick = function () {
		window.audio0.load();
		window.audio0.play();
		this.value=0;}
}
function Digits4(posX0, posY0, digit0, afterDot0, color0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var line = [[],[],[],[],[]];
	var minus, dot = [];
	var color = color0;
	var afterDot=afterDot0;
	var posY=posY0, posX=posX0;
	var scale = scale0;
	var valueCur;
	this.value=digit0;
	var setBright = function(c, i) {
		c.r*=i;
		c.g*=i;
		c.b*=i;
	}
	var mult=1;
	switch (afterDot) {
	case 1: mult=10; break;
	case 2: mult=100; break;
	case 3: mult=1000; break;
	case 4: mult=10000; break;}
	var afD;
	switch (afterDot) {
	case 1: afD=3; break;
	case 2: afD=2; break;
	case 3: afD=1; break;
	case 4: afD=0; break;}
	var addDigit = function(i) {
		loader.load("models//4digitsLine0.js", function (geometry, materials) {
			var material = new THREE.MeshFaceMaterial(materials);
			line[i][0] = new THREE.Mesh(geometry, material);
			line[i][0].position.set(posX+6.43*i*scale, posY, 0);
			line[i][0].scale.set(scale,scale,scale);
			line[i][0].me=that;
			object.add(line[i][0]);});
		loader.load("models//4digitsLine1.js", function (geometry, materials) {
			var material = new THREE.MeshFaceMaterial(materials);
			line[i][1] = new THREE.Mesh(geometry, material);
			line[i][1].position.set(posX+6.43*i*scale, posY, 0);
			line[i][1].scale.set(scale,scale,scale);
			line[i][1].me=that;
			object.add(line[i][1]);});
		loader.load("models//4digitsLine2.js", function (geometry, materials) {
			var material = new THREE.MeshFaceMaterial(materials);
			line[i][2] = new THREE.Mesh(geometry, material);
			line[i][2].position.set(posX+6.43*i*scale, posY, 0);
			line[i][2].scale.set(scale,scale,scale);
			line[i][2].me=that;
			object.add(line[i][2]);});
		loader.load("models//4digitsLine3.js", function (geometry, materials) {
			var material = new THREE.MeshFaceMaterial(materials);
			line[i][3] = new THREE.Mesh(geometry, material);
			line[i][3].position.set(posX+6.43*i*scale, posY, 0);
			line[i][3].scale.set(scale,scale,scale);
			line[i][3].me=that;
			object.add(line[i][3]);});
		loader.load("models//4digitsLine4.js", function (geometry, materials) {
			var material = new THREE.MeshFaceMaterial(materials);
			line[i][4] = new THREE.Mesh(geometry, material);
			line[i][4].position.set(posX+6.43*i*scale, posY, 0);
			line[i][4].scale.set(scale,scale,scale);
			line[i][4].me=that;
			object.add(line[i][4]);});
		loader.load("models//4digitsLine5.js", function (geometry, materials) {
			var material = new THREE.MeshFaceMaterial(materials);
			line[i][5] = new THREE.Mesh(geometry, material);
			line[i][5].position.set(posX+6.43*i*scale, posY, 0);
			line[i][5].scale.set(scale,scale,scale);
			line[i][5].me=that;
			object.add(line[i][5]);});
		loader.load("models//4digitsLine6.js", function (geometry, materials) {
			var material = new THREE.MeshFaceMaterial(materials);
			line[i][6] = new THREE.Mesh(geometry, material);
			line[i][6].position.set(posX+6.43*i*scale, posY, 0);
			line[i][6].scale.set(scale,scale,scale);
			line[i][6].me=that;
			object.add(line[i][6]);});
		if (i<4) {
			loader.load("models//4digitsDot.js", function (geometry, materials) {
				var material = new THREE.MeshFaceMaterial(materials);
				dot[i] = new THREE.Mesh(geometry, material);
				dot[i].position.set(posX+6.43*i*scale, posY, 0);
				dot[i].scale.set(scale,scale,scale);
				dot[i].me=that;
				object.add(dot[i]);
				dot[i].material.materials[0].color = new THREE.Color(color);
				setBright(dot[i].material.materials[0].color, 0.2);
				if (i==afD) {
					dot[i].material.materials[0].color = new THREE.Color(color);
					setBright(dot[i].material.materials[0].color, 2);
				}
			});
		}
	}
	for (var ii=0; ii<5; ii++) {
		addDigit(ii);}
	loader.load("models//4digitsLine3.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		minus = new THREE.Mesh(geometry, material);
		minus.position.set(posX-6.43, posY, 0);
		minus.scale.set(scale,scale,scale);
		minus.me=that;
		object.add(minus);});
	loader.load("models//4digitsPanel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		mesh.position.set(posX, posY, 0);
		mesh.scale.set(scale,scale,scale);
		mesh.me=that;
		object.add(mesh);
	});
	var light = new THREE.PointLight( color, 1.5, 30*scale );
	light.position.set(posX, posY, 10);
	object.add(light);
	var lightVisibleOld;
	this.update = function () {
		if (minus!=null && dot[0]!=null && dot[1]!=null && dot[2]!=null && dot[3]!=null && line[0][0]!=null && line[0][1]!=null && line[0][2]!=null && line[0][3]!=null && line[0][4]!=null && line[0][5]!=null && line[0][6]!=null && line[1][0]!=null && line[1][1]!=null && line[1][2]!=null && line[1][3]!=null && line[1][4]!=null && line[1][5]!=null && line[1][6]!=null && line[2][0]!=null && line[2][1]!=null && line[2][2]!=null && line[2][3]!=null && line[2][4]!=null && line[2][5]!=null && line[2][6]!=null && line[3][0]!=null && line[3][1]!=null && line[3][2]!=null && line[3][3]!=null && line[3][4]!=null && line[3][5]!=null && line[3][6]!=null && line[4][0]!=null && line[4][1]!=null && line[4][2]!=null && line[4][3]!=null && line[4][4]!=null && line[4][5]!=null && line[4][6]!=null) {
			if (valueCur!=this.value) {
				valueCur=this.value;
				setDigit(this.value*mult);
			}
		}
		if (lightVisible!=lightVisibleOld) {
			lightVisibleOld=lightVisible;
			light.visible=lightVisible;
		}
	}
	var setDigit = function (num) {
		var numTemp=Math.round(num);
		var lineMinus=0;
		if (numTemp<-99999) {
			numTemp=-99999;}
		else if (numTemp>99999) {
			numTemp=99999;}
		if (numTemp<0) {
			numTemp=-numTemp;
			lineMinus=1;}
		var rang=[];
		rang[0]=Math.floor(numTemp/10000);
		rang[1]=Math.floor((numTemp%10000)/1000);
		rang[2]=Math.floor((numTemp%1000)/100);
		rang[3]=Math.floor((numTemp%100)/10);
		rang[4]=Math.floor((numTemp%10)/1);
		var linesMas=[[],[],[],[]];
		for (var k=0; k<5; k++) {
			for (var i=0; i<7; i++) {
				line[k][i].material.materials[0].color = new THREE.Color(color);
				setBright(line[k][i].material.materials[0].color, 0.2);
			}
			switch (rang[k]) {
			case 0: linesMas[k]=[0,1,2,4,5,6]; break;
			case 1: linesMas[k]=[2,5]; break;
			case 2: linesMas[k]=[0,2,3,4,6]; break;
			case 3: linesMas[k]=[0,2,3,5,6]; break;
			case 4: linesMas[k]=[1,2,3,5]; break;
			case 5: linesMas[k]=[0,1,3,5,6]; break;
			case 6: linesMas[k]=[0,1,3,4,5,6]; break;
			case 7: linesMas[k]=[0,2,5]; break;
			case 8: linesMas[k]=[0,1,2,3,4,5,6]; break;
			case 9: linesMas[k]=[0,1,2,3,5,6]; break;
			}
		}
		if (lineMinus==1) {
			minus.material.materials[0].color = new THREE.Color(color);
			setBright(minus.material.materials[0].color, 2);}
		else {
			minus.material.materials[0].color = new THREE.Color(color);
			setBright(minus.material.materials[0].color, 0.2);}
		lineOn(linesMas);
		light.intensity = 1.5/40*(linesMas[0].length+linesMas[1].length+linesMas[2].length+linesMas[3].length);
	}
	this.onClick = function () {
		if (window.testmode)
		this.value+=1234;
	}
	this.onRightClick = function () {
		if (window.testmode)
		this.value-=2314;
	}
	var lineOn = function (nums) {
		for (var k=0; k<5; k++) {
			for (var i=0; i<nums[k].length; i++) {
				line[k][nums[k][i]].material.materials[0].color = new THREE.Color(color);
				setBright(line[k][nums[k][i]].material.materials[0].color, 2);}
		}}
}
function Rotator2(posX0, posY0, texture0, value0, valueMin0, valueMax0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var mesh = null;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	this.value=value0;
	var valueMin=valueMin0, valueMax=valueMax0;
	var dotVal=(valueMax-valueMin)/50;
	var dotRot=Math.PI/50;
	var posY=posY0, posX=posX0;
	var scale = scale0;
	var dragTime=0;
	this.changeX=0;
	loader.load("models//rotator2.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.receiveShadow = true;
		mesh0.position.set(posX, posY, 0);
		mesh0.scale.set(scale,scale,scale);
		mesh0.me=that;
		object.add(mesh0);
		mesh=mesh0;
		mesh.rotation.z=-Math.abs(that.value-valueMin)/dotVal*dotRot+Math.PI/2;
	});
	loader.load("models//rotator2Panel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh1 = new THREE.Mesh(geometry, material);
		mesh1.castShadow = true;
		mesh1.receiveShadow = true;
		mesh1.position.set(posX, posY, 0);
		mesh1.scale.set(scale,scale,scale);
		mesh1.me=that;
		if (texture0!=0) {
			mesh1.material.materials[1].map = THREE.ImageUtils.loadTexture(texture0);}
		object.add(mesh1);
	});
	this.update = function () {
		if (mesh != null && this.changeX==1) {
			if (this.value<(valueMax) && window.mouseMoveMul<0) {
				this.value+=dotVal;
				if (this.value>valueMax) this.value=valueMax;
				mesh.rotation.z=-Math.abs(this.value-valueMin)/dotVal*dotRot+Math.PI/2;}
			if (this.value>(valueMin) && window.mouseMoveMul>0) {
				this.value-=dotVal;
				if (this.value<valueMin) this.value=valueMin;
				mesh.rotation.z=-Math.abs(this.value-valueMin)/dotVal*dotRot+Math.PI/2;}
			dragTime++;
			if (window.mouseMoveMul!=0 && dragTime>=5) {
				window.audio1.load();
				window.audio1.play();
				dragTime=0;
			}
		}
	}
}
function TwoLamps(posX0, posY0, color01, color02, value0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var mesh=null;
	var posY=posY0, posX=posX0;
	var scale=scale0;
	var color1=color01, color2=color02;
	var valueCur;
	this.value=value0;
	function setBright(c, i) {
		c.r*=i;
		c.g*=i;
		c.b*=i;
	}
	loader.load("models//2lamps.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.receiveShadow = true;
		mesh0.position.set(posX, posY, 0);
		mesh0.scale.set(scale,scale,scale);
		mesh0.me=that;
		mesh0.material.materials[0].color = new THREE.Color(color1);
		mesh0.material.materials[2].color = new THREE.Color(color2);
		setBright(mesh0.material.materials[0].color, 1);
		setBright(mesh0.material.materials[2].color, 1);
		object.add(mesh0);
		mesh=mesh0;
	});
	var light = new THREE.PointLight( color1, 3, 20*scale );
	light.position.set(posX-4, posY, 4);
	object.add(light);
	light.intensity = 0;
	var light2 = new THREE.PointLight( color2, 3, 20*scale );
	light2.position.set(posX+4, posY, 4);
	object.add(light2);
	light2.intensity = 0;
	var lightVisibleOld;
	this.update = function () {
		if (mesh!=null && valueCur!=this.value) {
			if (this.value>0) {
				light.intensity = 3;
				light2.intensity = 0;
				mesh.material.materials[0].color = new THREE.Color(color1);
				setBright(mesh.material.materials[0].color, 5);
				mesh.material.materials[2].color = new THREE.Color(color2);
				setBright(mesh.material.materials[2].color, 1);}
			else if (this.value<0) {
				light.intensity = 0;
				light2.intensity = 3;
				mesh.material.materials[0].color = new THREE.Color(color1);
				setBright(mesh.material.materials[0].color, 1);
				mesh.material.materials[2].color = new THREE.Color(color2);
				setBright(mesh.material.materials[2].color, 5);}
			else {
				light.intensity = 0;
				light2.intensity = 0;
				mesh.material.materials[0].color = new THREE.Color(color1);
				setBright(mesh.material.materials[0].color, 1);
				mesh.material.materials[2].color = new THREE.Color(color2);
				setBright(mesh.material.materials[2].color, 1);}
			valueCur=this.value;
		}
		if (lightVisible!=lightVisibleOld) {
			lightVisibleOld=lightVisible;
			light.visible=lightVisible;
			light2.visible=lightVisible;
		}
	}
	this.onClick = function () {
		if (window.testmode)
		this.value++;
	}
	this.onRightClick = function () {
		if (window.testmode)
		this.value--;
	}
}
function HorArrowIndicator(posX0, posY0, texture0, valueMax0, valueMin0, value0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var mesh = null;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	var posY=posY0, posX=posX0;
	var scale=scale0;
	var valueMax=valueMax0, valueMin=valueMin0, valueCur=valueMin;
	this.value=value0;
	var dot = Math.PI/2/(valueMax-valueMin);
	var speed=1;
	for (var dotTemp=dot; dotTemp<0.001; dotTemp*=10) {
		speed*=10;}
	loader.load("models//horArrowIndicator.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.position.set(posX, posY-10.7, 0);
		mesh0.scale.set(scale, scale, scale);
		mesh0.me=that;
		object.add(mesh0);
		mesh=mesh0;
		mesh.rotation.z+=Math.PI/4;
	});
	loader.load("models//horArrowIndicatorPanel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh1 = new THREE.Mesh(geometry, material);
		mesh1.castShadow = true;
		mesh1.receiveShadow = true;
		mesh1.position.set(posX, posY, 0);
		mesh1.scale.set(scale, scale, scale);
		mesh1.me=that;
		if (texture0!=0) {
			mesh1.material.materials[1].map = THREE.ImageUtils.loadTexture(texture0);}
		object.add(mesh1);
	});
	this.update = function () {
		if (mesh != null) {
			if (this.value<valueMin) {
				this.value=valueMin;}
			else if (this.value>valueMax) {
				this.value=valueMax;}
			if (valueCur<(this.value-speed/2)) {
				valueCur+=speed;
				mesh.rotation.z-=dot*speed;}
			else if (valueCur>(this.value+speed/2)) {
				valueCur-=speed;
				mesh.rotation.z+=dot*speed;}
		}
	}
	this.onClick = function () {
		if (window.testmode)
		this.value+=5*speed;
	}
	this.onRightClick = function () {
		if (window.testmode)
		this.value-=5*speed;
	}
}
function VertSwitch(posX0, posY0, texture0, value0, valueMin0, valueMax0, scale0, comment0) {
	this.comment=comment0;
	var object = new THREE.Object3D();
	var mesh = null;
	var loader = new THREE.JSONLoader();
	this.object = object;
	var that = this;
	this.value=value0;
	var valueMin=valueMin0, valueMax=valueMax0;
	var dotVal=(valueMax-valueMin)/50;
	var dotRot=Math.PI/2/50;
	var posY=posY0, posX=posX0;
	var scale = scale0;
	var dragTime=0;
	this.changeY=0;
	loader.load("models//vertSwitch.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh0 = new THREE.Mesh(geometry, material);
		mesh0.castShadow = true;
		mesh0.receiveShadow = true;
		mesh0.position.set(posX, posY, 0);
		mesh0.scale.set(0.7*scale,0.7*scale,0.7*scale);
		mesh0.me=that;
		object.add(mesh0);
		mesh=mesh0;
		mesh.rotation.x=-Math.abs(that.value-valueMin)/dotVal*dotRot+Math.PI/4;
	});
	loader.load("models//vertSwitchPanel.js", function (geometry, materials) {
		var material = new THREE.MeshFaceMaterial(materials);
		var mesh1 = new THREE.Mesh(geometry, material);
		mesh1.castShadow = true;
		mesh1.receiveShadow = true;
		mesh1.position.set(posX, posY, 0);
		mesh1.scale.set(0.7*scale,0.7*scale,0.7*scale);
		mesh1.me=that;
		if (texture0!=0) {
			mesh1.material.materials[1].map = THREE.ImageUtils.loadTexture(texture0);}
		object.add(mesh1);
	});
	this.update = function () {
		if (mesh != null && this.changeY==1) {
			if (this.value<(valueMax) && window.mouseMoveMul>0) {
				this.value+=dotVal;
				if (this.value>valueMax) this.value=valueMax;
				mesh.rotation.x=-Math.abs(this.value-valueMin)/dotVal*dotRot+Math.PI/4;}
			if (this.value>(valueMin) && window.mouseMoveMul<0) {
				this.value-=dotVal;
				if (this.value<valueMin) this.value=valueMin;
				mesh.rotation.x=-Math.abs(this.value-valueMin)/dotVal*dotRot+Math.PI/4;}
			dragTime++;
			if (window.mouseMoveMul!=0 && dragTime>=5) {
				window.audio1.load();
				window.audio1.play();
				dragTime=0;
			}
		}
	}
}