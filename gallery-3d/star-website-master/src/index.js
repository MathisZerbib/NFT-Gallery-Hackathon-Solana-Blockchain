const THREE = require('three');
const TWEEN = require('tween');
const dat = require('dat.gui');
var PORTFOLIO =  false;
var GALLERYNAME = "";

let config_project = require('./config_file_solana');
require('three-fly-controls')(THREE);
var TrackballControls = require('three-trackballcontrols');

var template = [ { x: -2.00 -100, y: -10.00 -38, z: 10.00 },
	{ x: 18 -100, y: 12 -38, z: 3 },
	{ x: -1 -100, y: 10 -38, z: 10 },
	{ x: -18 -100, y: 0 -38, z: 10 },
	{ x: 20 -100, y: -10 -38, z: 10 },
	{ x: 10 -100, y: 0 -38, z: 15 },
	{ x: 10 -100, y: 7 -38, z: 7 },
	{ x: -10 -100, y: 0 -38, z: 10 },
	{ x: 0 -100, y: 0 -38, z: 8 },
	{ x: -10 -100, y: 8 -38, z: 15 },
	{ x: 10 -100, y: 0 -38, z: 16 },
	{ x: -20 -100, y: 8 -38, z: 15 },
	{ x: -18 -100, y: -8 -38, z: 16 },
	{ x: 18 -100, y: 8 -38, z: 16 } ];


/*******LOADER SCENE*******/
var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
};

var homePage = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera( 55, (window.innerWidth-28) / (window.innerHeight - 22), 2, 2000),
};

var loadingManager = null;
var RESOURCES_LOADED = false;
var CAN_DISPLAY_SCENE = false;
var SPLASH_SCREEN = false;


/****** CONFIG STARTS ******/
var config = [];

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

async function stars_config() {
	config = [];
	var i = 0;
	var row = 5;
	var done = 0;
	config_project.project = shuffleArray(config_project.project);
	console.log("REAL config ==>", config_project)
	for (project of config_project.project) {
		template[i % template.length].x += 50;
		if(i !== 0 && (i % template.length === 0)) {
			done++;
			if(done !== 0 && done % 4 === 0)
				for(let x = 0; x !== template.length; x++)
					template[x].y += 25;
			if(done !== 0 && done % 4 === 0)
				for(let x = 0; x !== template.length; x++)
					template[x].x -= 200;
		}
		config.push(
			{
				id: i++,
				file: project.src,
				text: project.name,
				description: project.description,
				isVideo : project.video,
				miniature : project.miniature,
				x : template[i % template.length].x,
				y : template[i % template.length].y,
				z : template[i % template.length].z,
				video: undefined,
				x_size : project.x_size,
				y_size : project.y_size
			}
		);
	}
}

/****** MAIN ******/
if ( WEBGL.isWebGLAvailable() === false ) {
	document.querySelector('.gallery').appendChild(WEBGL.getWebGLErrorMessage());
}

var camera, scene, renderer, stats, material, controls, homePage;
renderer = new THREE.WebGLRenderer({ alpha : true });

var windowHalfX = (window.innerWidth-28) / 2;
var windowHalfY = (window.innerHeight - 22) / 2;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();
var sprites = [];
var sprites_stars = [];
var spacesphere;
var range_x = config_project.config.range_x;
var range_y = config_project.config.range_y;
var range_z = config_project.config.range_z;

/**********LOAD PROJECT********/
function create_star(star, index) {
	var loader = new THREE.TextureLoader();

	loader.load(
		star.file,
		function (spriteMap) {

			//var spriteMap = await new THREE.TextureLoader(loadingManager).load(star.file);
			var materialArray = [];
			materialArray.push(new THREE.MeshBasicMaterial( {color: parseInt(config_project.config.color_epaisseur)}));
			materialArray.push(new THREE.MeshBasicMaterial( {color: parseInt(config_project.config.color_epaisseur)}));
			materialArray.push(new THREE.MeshBasicMaterial( {color: parseInt(config_project.config.color_epaisseur)}));
			materialArray.push(new THREE.MeshBasicMaterial( {color: parseInt(config_project.config.color_epaisseur)}));
			materialArray.push(new THREE.MeshBasicMaterial( { map: spriteMap }));
			materialArray.push(new THREE.MeshBasicMaterial( { map: spriteMap }));
			var DiceBlueMaterial = new THREE.MeshFaceMaterial(materialArray);

			//Set size du tableau
			var DiceBlueGeom = new THREE.BoxGeometry(
				spriteMap.image.width / spriteMap.image.height * 5 ,
				spriteMap.image.height /spriteMap.image.height * 5 ,
				parseFloat(config_project.config.epaisseur_tableau),
				1, 1, 1);

			sprites[index] = new THREE.Mesh( DiceBlueGeom, DiceBlueMaterial );
			sprites[index].name = star.id.toString();

			/*SET Position project*/
			if (config_project.config.random_position) {
				sprites[index].position.x = (range_x * 2) * Math.random() - range_x;
				sprites[index].position.y = (range_y * 2) * Math.random() - range_y;
				sprites[index].position.z = (range_z * 2) * Math.random() - range_z - 20;
			}
			else {
				sprites[index].position.x = parseFloat(star.x);
				sprites[index].position.z = parseFloat(star.y);
				sprites[index].position.y = parseFloat(star.z);
			}

			sprites[index].rotation.x = Math.PI  / 2;
			sprites[index].rotation.z = Math.PI;
			scene.add(sprites[index]);
		}
	)
}


var videos = [];

/***********LOAD VIDEO***********/
var movieScreen = [];

document.__proto__.customCreateElement = function(tag, attributes){
	var e = document.createElement(tag);

	for(var a in attributes) e.setAttribute(a, attributes[a]);

	return e;
};


async function create_video(star, index) {
	config[index].video  = 	{
		video: undefined,
		videoImage: undefined,
		videoImageContext: undefined,
		videoTexture: undefined,
		newVideoTexture: undefined,
		newVideoCover: undefined,
		movieMaterial: undefined,
		index: undefined,
		movieGeometry: undefined,
		movieScreen: []
	};

	let video;

	video = document.customCreateElement('video', {id: index, opacity : 0.3});

	video.src = star.file;
	video.load(loadingManager);
	console.log(video.src);
	//Set plan Geometry of size of video
	config[index].video.index = index;
	config[index].video.videoImage = document.customCreateElement('canvas', {id: index , opacity : 0.3});

	config[index].video.videoImage.width = star.x_size;
	config[index].video.videoImage.height = star.y_size;
	config[index].video.videoImageContext = config[index].video.videoImage.getContext( '2d' );

	// background color if no video present

	config[index].video.videoImageContext.fillStyle = '#FFFFFF';
	config[index].video.videoImageContext.fillRect( 0, 0, config[index].video.videoImage.width, config[index].video.videoImage.height );
	config[index].video.videoTexture = new THREE.Texture( config[index].video.videoImage );
	config[index].video.videoTexture.minFilter = THREE.LinearFilter;
	config[index].video.videoTexture.magFilter = THREE.LinearFilter;
	config[index].video.newVideoTexture = new THREE.Texture();
	if (!star.miniature) {
		config[index].video.movieMaterial = new THREE.MeshBasicMaterial( { map: config[index].video.videoTexture} );
	}
	else {
		config[index].video.newVideoCover = new THREE.TextureLoader(loadingManager).load(star.miniature);
		config[index].video.movieMaterial = new THREE.MeshBasicMaterial( { map: config[index].video.newVideoCover} );
	}
	config[index].material = new THREE.MeshBasicMaterial( { map: config[index].video.videoTexture ,side:THREE.DoubleSide } );
	config[index].video.movieGeometry = new THREE.PlaneGeometry( star.x_size / 100, star.y_size / 100, 4, 4 );
	config[index].video.movieScreen[index] = new THREE.Mesh( config[index].video.movieGeometry, config[index].video.movieMaterial);

	let x, y, z;
	if (config_project.config.random_position) {
		x = 20 * Math.random() - 10;
		y = 20 * Math.random() - 10;
		z = 20 * Math.random() - 10;
	}
	else {
		x = parseFloat(star.x);
		y = parseFloat(star.y);
		z = parseFloat(star.z);
	}

	config[index].video.movieScreen[index].position.set(x, z, y);
	config[index].video.movieScreen[index].rotation.x = Math.PI / 2
	config[index].video.movieScreen[index].name = "v" + index;

	config[index].video.video = video;
	//container.appendChild(config[index].video.video);
	//video.//document.appendChild(config[index].video.video);

	scene.add(config[index].video.movieScreen[index]);
}

/**********LOAD STAR****************/
async function create_star_p(index) {
	var spriteMap = new THREE.TextureLoader(loadingManager);
	spriteMap = spriteMap.load(config_project.star);
	var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
	sprites_stars[index] = new THREE.Sprite(spriteMaterial);
	sprites_stars[index].position.x = 150 * Math.random() - 50;
	sprites_stars[index].position.y = 150 * Math.random() - 50;
	sprites_stars[index].position.z = 1000 * Math.random() - 50;
	scene.add(sprites_stars[index]);
}

async function loadProject() {
	config_project = require('./config_file_solana_' + GALLERYNAME);
	await stars_config();
	for(var i =0; config.length !== i; i++) {
		if (config[i].isVideo !== true) {
			create_star(config[i], i);
		}
		else {
			create_video(config[i], i);
		}
	}

	for ( var x = 0; x < 500; x++ ) {
		create_star_p(x + sprites.length)
	}

	return;
}

function myWaiter() {
	CAN_DISPLAY_SCENE = true;
	SPLASH_SCREEN = true;
}

var max_distance = 3000.0;

function ctrl_trackball(x, y, z) {
	controls = new THREE.FlyControls( camera );
	controls.movementSpeed = 0.1;
	controls.domElement = renderer.domElement;
	controls.rollSpeed = 0;
	controls.autoForward = false;
	controls.dragToLook = false;
	controls.staticMoving = true;
}

function ctrl_fly() {


	controls = new THREE.MapControls( camera, renderer.domElement );

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.25;
	controls.screenSpacePanning = false;
	controls.maxPolarAngle = 0;
	controls.maxDistance = 200;
	controls.minDistance = -200;
}


async function init() {
	myWaiter();


	scene = new THREE.Scene();
	// scene.background = new THREE.Color( 0xff0000 );
	//camera = new THREE.PerspectiveCamera( 40, (window.innerWidth-28) / (window.innerHeight - 22), 2, 2000);
	camera =  new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 100;

	//Load manager

	var _loadingScreen = document.getElementById( 'loading-screen' );
	//_loadingScreen.style.display =  "none"

	var _loadingScreen = document.querySelector( '.container-x' );
	_loadingScreen.style.display =  "none"

	var loader = new THREE.FontLoader();
	homePage.scene.add(homePage.camera);
	homePage.camera.position.x = 0;
	homePage.camera.position.y = 0;
	homePage.camera.position.z = 200;

	var _header = document.getElementById('header');
	_header.classList.add('hide')

	var _footer = document.getElementById('footer');
	_footer.classList.add('hide')

	loader.load( 'fonts/gentilis_regular.typeface.json', function ( font ) {

		var geometry = new THREE.TextGeometry( config_project.config.homePage_first_line, {
			font: font,
			size: 8,
			height: 1,
			curveSegments: 1,
			bevelEnabled: true,
			bevelThickness: 0,
			bevelSize: 0,
			bevelSegments: 0
		} );

		var geometry_second_text = new THREE.TextGeometry( config_project.config.homePage_second_text_line, {
			font: font,
			size: 5,
			height: 1,
			curveSegments: 1,
			bevelEnabled: true,
			bevelThickness: 0,
			bevelSize: 0,
			bevelSegments: 0
		} );

		var geometry_second = new THREE.TextGeometry( config_project.config.homePage_second_line, {
			font: font,
			size: 5,
			height: 1,
			curveSegments: 1,
			bevelEnabled: true,
			bevelThickness: 0,
			bevelSize: 0,
			bevelSegments: 0
		} );

		//First Line
		var geometryMat =  new THREE.MeshBasicMaterial({color: config_project.config.homePage_first_line_color});
		var textHome = new THREE.Mesh(geometry, geometryMat);
		textHome.position.set(config_project.config.homePage_first_line_start_x, 20, 30)
		textHome.name = "first_line";
		homePage.scene.add(textHome);

		//second Text line
		var geometryMat_second_text =  new THREE.MeshBasicMaterial({color:config_project.config.homePage_second_text_color});
		var textHome_second_text = new THREE.Mesh(geometry_second_text, geometryMat_second_text);
		textHome_second_text.position.set(config_project.config.homePage_second_text_start_x, 10, 30)
		textHome_second_text.name = "second_line_text";
		homePage.scene.add(textHome_second_text);

		//Second
		var geometryMat_second =  new THREE.MeshBasicMaterial({color: config_project.config.homePage_second_line_color});
		var textHome_second = new THREE.Mesh(geometry_second, geometryMat_second);
		textHome_second.position.set(config_project.config.homePage_second_line_start_x, -20, 30)
		textHome_second.name = "second_line";
		homePage.scene.add(textHome_second);
	} );

	PORTFOLIO = false;

	var geometry = new THREE.BoxGeometry( 45, 8, 1 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.set(config_project.config.homePage_second_line_start_x + 20, -18, 30)
	cube.name = "test_cube";
	homePage.scene.add(cube);

	var geometry_2 = new THREE.BoxGeometry( 46, 9, 1 );
	var material_2 = new THREE.MeshBasicMaterial( {color: 0x000000} );
	var cube_2 = new THREE.Mesh( geometry_2, material_2 );
	cube_2.position.set(config_project.config.homePage_second_line_start_x + 20, -18, 29)
	cube_2.name = "test_cube_2";

	homePage.scene.add(cube_2);


	renderer.setClearColor( 0xffffff, 0);
	renderer.setSize( (window.innerWidth-28), (window.innerHeight - 22) );
	document.body.appendChild( renderer.domElement );

	loadingManager = new THREE.LoadingManager();

	loadingManager.onProgress = function(item, progress, result){
		console.log("loading: ", item, progress + "/" + result)
	};

	loadingManager.onLoad = function(){
		const _loadingGif = document.getElementById( 'loader' );
		RESOURCES_LOADED = true;
	};

	var spacetex = new THREE.TextureLoader(loadingManager).load(config_project.background_image);
	var spacesphereGeo = new THREE.SphereGeometry(1000,100,100);
	var spacesphereMat = new THREE.MeshMatcapMaterial();
	spacesphereMat.map = spacetex;

	spacesphere = new THREE.Mesh(spacesphereGeo,spacesphereMat);
	spacesphere.material.side = THREE.DoubleSide;
	spacesphere.material.map.wrapS = THREE.RepeatWrapping;
	spacesphere.material.map.wrapT = THREE.RepeatWrapping;
	spacesphere.material.map.repeat.set( 5, 3);
//	scene.add(spacesphere);

	ctrl_trackball();

	//Set event listener
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'click', onDocumentClick, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

var animate = function () {
	//Render le loading screen tant que les ressources n'ont pas load
	if( (RESOURCES_LOADED == false || CAN_DISPLAY_SCENE == false) && PORTFOLIO === false){
		requestAnimationFrame(animate);
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}
	else if (PORTFOLIO) {
		for(var i = 0; config.length !== i; i++)
		{
			if(config[i].video)
				if ( config[i].video.video.readyState === config[i].video.video.HAVE_ENOUGH_DATA )
				{
					config[i].video.videoImageContext.drawImage( config[i].video.video, 0, 0 );
					if ( config[i].video.videoTexture )
						config[i].video.videoTexture.needsUpdate = true;
				}
		}
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
		render();
	}
	else {
		requestAnimationFrame(animate);
		renderer.render(homePage.scene, homePage.camera);
		render_homePage();
	}
};

/*** Render ***/

var last_video = undefined;
var INTERSECTED;
var video_playing = false;

var box = undefined;

function render_homePage() {
	raycaster.setFromCamera(mouse, homePage.camera);
	var childrens = homePage.scene.children;
	let intersects = raycaster.intersectObjects(childrens);

	if ( intersects.length > 0) {
		if ( intersects[0].object.name === "test_cube" ) {
			INTERSECTED = intersects[ 0 ].object;
			box = INTERSECTED;
			box.material.color.setHex(parseInt(config_project.config.homePage_second_line_color_hover));

		}
	}

	else {
		if(box)
		{
			box.material.color.setHex(parseInt("0xffffff"));
			box = undefined
		}

		if ( INTERSECTED && INTERSECTED.name == "second_line") {
			console.log("change color", INTERSECTED.name)
			// INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
			INTERSECTED = null;
		}
		if (  INTERSECTED && INTERSECTED.name == "test_cube" ) {
			INTERSECTED = null;
		}
	}

	renderer.render(homePage.scene, homePage.camera);
}

function render() {

	TWEEN.update();
	//camera.rotation.set(0,0,0);

	let delta = clock.getDelta();
	controls.update( delta );

		raycaster.setFromCamera(mouse, camera);
		var childrens = scene.children;
		let intersects = raycaster.intersectObjects(childrens);

		// Rotation tableau
		if (config_project.config.rotation_tableau) {
			childrens.forEach(object => {
				if(object.name)
				{
					if(object !== last_star)
						object.rotation.y += 0.02;
					else
						object.rotation.y = 0;
				}
			});
		}


		if ( intersects.length !== 0 ) {
			if (intersects[ 0 ].object && intersects[ 0 ].object.name) {
				INTERSECTED = intersects[ 0 ].object;
				if (video_playing) {
					if(INTERSECTED.name.charAt(0) === 'v') {
						let index_video = parseInt(INTERSECTED.name.slice(1, INTERSECTED.name.length));
						if(index_video !== last_video) {
							config[last_video].video.video.pause();
							last_video = undefined;
							video_playing = false
						}
					}
					//console.log(INTERSECTED.name, " last_video", last_video);
					if(INTERSECTED.name.charAt(0) !== 'v' && last_video !== undefined) {
						config[last_video].video.video.pause();
						last_video = undefined;
						video_playing = false;
					}
				}
				if (INTERSECTED.name.charAt(0) === 'v') {

					let index_id_video = parseInt(INTERSECTED.name.slice(1, INTERSECTED.name.length));
					INTERSECTED.material = config[index_id_video].material;
					INTERSECTED.material.needsUpdate = true;
					video_playing = true;
					config[index_id_video].video.video.play();
					if(index_id_video !== last_video) {
						//config[index_id_video].video.video = config.querySelector("video#"+ index_id_video);
						last_video = index_id_video;
						document.querySelector("h1").textContent = config[index_id_video].text;
						document.querySelector("h3").textContent = config[index_id_video].description;
					}
				}
				else {
					document.querySelector("h1").textContent = config[INTERSECTED.name].text;
					document.querySelector("h3").textContent = config[INTERSECTED.name].description;
				}
			}

	}
	renderer.render( scene, camera );
}

/******SPLASH SCREEN***********/
var animation = false;

function splashScreen() {

	ctrl_fly();
	// document.getElementById('music').play();
	var _header = document.getElementById('header');
	_header.classList.remove('hide');

	var _footer = document.getElementById('footer');
	_footer.classList.remove('hide');
	//document.getElementById( 'loading-screen' ).remove();
	var from = {
		x: camera.position.x,
		y: camera.position.y,
		z: -50
	};

	var index = config.length - 1 - Math.floor(Math.random() * 5);
	var firstObject = config[index];

	var object = scene.getObjectByName( !firstObject.isVideo ? firstObject.id.toString() : 'v-' + firstObject.id.toString(), true);
	last_star = object;

	const pos = object.position.clone();
	//camera.lookAt(pos);
	console.log("CAMERA rotation: ", camera.rotation);
	console.log("OBJECT rotation: ", object.rotation);
	if(object && object.position)
		//controls.target = object.position.clone();
	var to = {
		x: object.position.x,
		y: object.position.y,
		z: object.position.z + 8
	};

	last_pos_camera.x = object.position.x;
	last_pos_camera.y = object.position.y;
	last_pos_camera.z = object.position.z + 100 ;
	camera.rotation.set(0,0,0)

	camera.position.set(last_pos_camera.x,last_pos_camera.y, last_pos_camera.z)

	max_distance = 100.0;

	if (config_project.config.go_to_random_tableau)
		animation = false;
	controls.target.copy(object.position);
	INTERSECTED = object
	onDocumentClick(true);

}

stars_config();
init();
animate();

/*************EVENT*************/
var last_star = null;
var last_pos_camera = {};

async function loadGallery(){

	var _loadingScreen = document.querySelector( '.gallery-list' );
	_loadingScreen.style.display =  "none"
	_loadingScreen = document.getElementById( 'loading-screen' );
	_loadingScreen = document.querySelector( 'canvas' );
	console.log("canvas: ", _loadingScreen)
	_loadingScreen.classList.add('show')

	_loadingScreen = document.querySelector( '.container-x' );
	_loadingScreen.style.display =  "block"
	await stars_config()
	splashScreen();
}

setInterval(()=>{
	console.log("position: ",camera.position.x.toFixed(1),camera.position.y.toFixed(1),camera.position.z.toFixed(1), "rotation: ",camera.rotation.x.toFixed(1),camera.rotation.y.toFixed(1),camera.rotation.z.toFixed(1))
},1000);

var camera_rt = undefined;
function onDocumentClick(start) {
	let delay = 0;
	if (start === true) delay = 3000
	console.log("CLICK", INTERSECTED);
	if(INTERSECTED && animation === false) {

		animation = true;

		console.log("goto: ", INTERSECTED.name);
		var position = INTERSECTED.position.clone();
		//camera.lookAt(position);
		var from = {
			x: camera.position.x,
			y: camera.position.y,
			z: camera.position.z
		};

		var to = {
			x: position.x,
			y: position.y + 8,
			z: position.z
		};

		if(last_star === INTERSECTED) {
			console.log("back to :", last_pos_camera);
			to.x = position.x;
			to.y = position.y + 60;
			to.z = position.z;
			last_star = null;
			console.log("come back");
			//ctrl_trackball();
		} else {
			console.log("save position :", last_pos_camera)
			last_star = INTERSECTED;
			last_pos_camera.x =  camera.position.x;
			last_pos_camera.y =  camera.position.y;
			last_pos_camera.z =  camera.position.z;
			//ctrl_trackball();
		}

		console.log("start", camera.position, camera.rotation);

		animation = false;
		var tween = new TWEEN.Tween(from)
			.to(to, delay)
			.easing(TWEEN.Easing.Linear.None)
			.onUpdate(function () {
				camera.position.set(this.x, this.y, this.z);
				animation = true;
			})
			.onComplete(function () {
				controls.target.copy(position);
				camera.rotation.set(0.0, 0.0, 0.0)
				animation = false;
				INTERSECTED = null;
			})
			.start();
	}
}

function onDocumentMouseMove( event ) {
	mouseY = event.clientY - windowHalfY;
	mouse.x = ( event.clientX / (window.innerWidth-28) ) * 2 - 1;
	mouse.y = - ( event.clientY / (window.innerHeight - 22) ) * 2 + 1;
}

function onWindowResize() {/*
	camera.updateProjectionMatrix();
	renderer.setSize( (window.innerWidth-28), (window.innerHeight - 22) );*/
	camera.aspect = (window.innerWidth-28) / (window.innerHeight - 22);
	camera.updateProjectionMatrix();

	renderer.setSize( (window.innerWidth-28), (window.innerHeight - 22) );
}



THREE.MapControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = false;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = false; // if true, pan in screen-space
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.saveState = function () {

		scope.target0.copy( scope.target );
		scope.position0.copy( scope.object.position );
		scope.zoom0 = scope.object.zoom;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();


			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

				panOffset.multiplyScalar( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

				panOffset.set( 0, 0, 0 );

			}

			scale = 1;

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function () {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = {
		NONE: 0,
		ROTATE_UP: 1,
		ROTATE_LEFT: 2,
		ROTATE: 3, // ROTATE_UP | ROTATE_LEFT
		DOLLY: 4,
		DOLLY_ROTATE: 7, // ROTATE | DOLLY
		PAN: 8,
		DOLLY_PAN: 12, // DOLLY | PAN
	};

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateStart2 = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateEnd2 = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();
	var rotateDelta2 = new THREE.Vector2();
	var rotateDeltaStartFingers = new THREE.Vector2();
	var rotateDeltaEndFingers = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	var panLeft = function () {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function () {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			if ( scope.screenSpacePanning === true ) {

				v.setFromMatrixColumn( objectMatrix, 1 );

			} else {

				v.setFromMatrixColumn( objectMatrix, 0 );
				v.crossVectors( scope.object.up, v );

			}

			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {

		var offset = new THREE.Vector3();

		return function pan( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object.isPerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we use only clientHeight here so aspect ratio does not distort speed
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object.isOrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: MapControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: MapControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: MapControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );

		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		// console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		// console.log( 'handleMouseWheel' );

		if ( event.deltaY < 0 ) {

			dollyOut( getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		// console.log( 'handleTouchStartRotate' );

		// First finger
		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		// Second finger
		rotateStart2.set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		if ( scope.enableZoom ) {

			// console.log( 'handleTouchStartDolly' );

			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

			var distance = Math.sqrt( dx * dx + dy * dy );

			dollyStart.set( 0, distance );

		}

	}

	function handleTouchStartPan( event ) {

		if ( scope.enablePan ) {

			// console.log( 'handleTouchStartPan' );

			panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		}

	}

	function handleTouchMoveRotate( event ) {

		if ( scope.enableRotate === false ) return;
		if ( ( state & STATE.ROTATE ) === 0 ) return;

		// First finger
		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		// Second finger
		rotateEnd2.set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY );

		rotateDelta.subVectors( rotateEnd, rotateStart );
		rotateDelta2.subVectors( rotateEnd2, rotateStart2 );
		rotateDeltaStartFingers.subVectors( rotateStart2, rotateStart );
		rotateDeltaEndFingers.subVectors( rotateEnd2, rotateEnd );

		if ( isRotateUp() ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			// rotating up and down along whole screen attempts to go 360, but limited to 180
			rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

			// Start rotateUp ==> disable all movement to prevent flickering
			state = STATE.ROTATE_UP;

		} else if ( ( state & STATE.ROTATE_LEFT ) !== 0 ) {

			rotateLeft( ( rotateDeltaStartFingers.angle() - rotateDeltaEndFingers.angle() ) * scope.rotateSpeed );

		}

		rotateStart.copy( rotateEnd );
		rotateStart2.copy( rotateEnd2 );

	}

	function isRotateUp() {

		// At start, does the two fingers are aligned horizontally
		if ( ! isHorizontal( rotateDeltaStartFingers ) ) {

			return false;

		}

		// At end, does the two fingers are aligned horizontally
		if ( ! isHorizontal( rotateDeltaEndFingers ) ) {

			return false;

		}

		// does the first finger moved vertically between start and end
		if ( ! isVertical( rotateDelta ) ) {

			return false;

		}

		// does the second finger moved vertically between start and end
		if ( ! isVertical( rotateDelta2 ) ) {

			return false;

		}

		// Does the two finger moved in the same direction (prevent moving one finger vertically up while the other goes down)
		return rotateDelta.dot( rotateDelta2 ) > 0;

	}

	var isHorizontal = function () {

		var precision = Math.sin( Math.PI / 6 );

		return function isHorizontal( vector ) {

			return Math.abs( Math.sin( vector.angle() ) ) < precision;

		};

	}();

	var isVertical = function () {

		var precision = Math.cos( Math.PI / 2 - Math.PI / 6 );

		return function isVertical( vector ) {

			return Math.abs( Math.cos( vector.angle() ) ) < precision;

		};

	}();

	function handleTouchMoveDolly( event ) {

		if ( scope.enableZoom === false ) return;
		if ( ( state & STATE.DOLLY ) === 0 ) return;

		// console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );

		dollyIn( dollyDelta.y );

		dollyStart.copy( dollyEnd );

	}

	function handleTouchMovePan( event ) {

		if ( scope.enablePan === false ) return;
		if ( ( state & STATE.PAN ) === 0 ) return;

		// console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.button ) {

			case scope.mouseButtons.LEFT:

				if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

					if ( scope.enableRotate === false ) return;

					handleMouseDownRotate( event );

					state = STATE.ROTATE;

				} else {

					if ( scope.enablePan === false ) return;

					handleMouseDownPan( event );

					state = STATE.PAN;

				}

				break;

			case scope.mouseButtons.MIDDLE:

				if ( scope.enableZoom === false ) return;

				handleMouseDownDolly( event );

				state = STATE.DOLLY;

				break;

			case scope.mouseButtons.RIGHT:

				if ( scope.enableRotate === false ) return;

				handleMouseDownRotate( event );

				state = STATE.ROTATE;

				break;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.ROTATE:

				if ( scope.enableRotate === false ) return;

				handleMouseMoveRotate( event );

				break;

			case STATE.DOLLY:

				if ( scope.enableZoom === false ) return;

				handleMouseMoveDolly( event );

				break;

			case STATE.PAN:

				if ( scope.enablePan === false ) return;

				handleMouseMovePan( event );

				break;

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();
		event.stopPropagation();

		scope.dispatchEvent( startEvent );

		handleMouseWheel( event );

		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.PAN;

				break;

			case 2:	// two-fingered touch: rotate-dolly

				if ( scope.enableZoom === false && scope.enableRotate === false ) return;

				handleTouchStartRotate( event );
				handleTouchStartDolly( event );

				state = STATE.DOLLY_ROTATE;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.PAN ) return; // is this needed?

				handleTouchMovePan( event );

				scope.update();

				break;

			case 2: // two-fingered touch: rotate-dolly

				if ( scope.enableZoom === false && scope.enableRotate === false ) return;
				if ( ( state & STATE.DOLLY_ROTATE ) === 0 ) return; // is this needed?

				handleTouchMoveRotate( event );
				handleTouchMoveDolly( event );

				scope.update();

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.MapControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.MapControls.prototype.constructor = THREE.MapControls;

Object.defineProperties( THREE.MapControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.MapControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.MapControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.MapControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.MapControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.MapControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.MapControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.MapControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.MapControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.MapControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving: {

		get: function () {

			console.warn( 'THREE.MapControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.MapControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.enableDamping = ! value;

		}

	},

	dynamicDampingFactor: {

		get: function () {

			console.warn( 'THREE.MapControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.MapControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.dampingFactor = value;

		}

	}

} );


//  Provider Web3 Phantom Wallet
const getProvider = () => {
	if ("solana" in window) {
		const provider = window.solana;
		if (provider.isPhantom) {
			return provider;
		}
	}
	window.open("https://phantom.app/", "_blank");
};

// Can be replaced by solflare instead of Phantom
// const isSolflareInstalled = window.solflare && window.solflare.isSolflare;
const isPhantomInstalled = window.solana && window.solana.isPhantom;
const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");

// Initiate selector on buttons
const connectButton = document.querySelector('.connectButton');
const disconnectButton = document.querySelector('.disconnectButton');
const showAccount = document.querySelector('.showAccount');
const sendSolButton = document.querySelector('.sendSolButton');
const showBalance = document.querySelector('.showBalance');
const balanceSpan = document.querySelector('.balanceSpan')
// const mainContainer = document.querySelector('.mainContainer');
const buttonNetwork = document.querySelector('.buttonNetwork');
const networkSpan = document.querySelector('.networkSpan');
const txScanLinkSuccess = document.querySelector('.txScanLinkSuccess');
const txScanLinkError = document.querySelector('.txScanLinkError');
const connectWalletButton = document.querySelector('.connectWallet');
const toastError = document.querySelector('.toastBody');
const collections = document.querySelectorAll('.collections');
const AllBuyButtons = document.querySelectorAll('.sendSolButton')
const allPrices = document.querySelectorAll('.priceInSol');
const homeButton = document.querySelector('.homeButton');
function getHistory(connection, publicKey, options = { limit: 1000 }) {
  return connection.getConfirmedSignaturesForAddress2(publicKey, options);
}


AllBuyButtons.forEach( async function (value, i) {
		value.addEventListener('click', async function() {
			var price = allPrices[i].innerHTML;
		price = price.replace(' ◎', "");
		price = price.replace(/<img[^>]*>/g,"");
		var uniquePrice = parseFloat(price);
			if (uniquePrice > 0 ) {
				console.log(uniquePrice)
				sendSol(i);
			}
			else {
				const collectionName = collections[i].innerHTML
				GALLERYNAME = collectionName.toString()
				setLoading(AllBuyButtons[i]);
				await loadProject();
				AllBuyButtons[i].innerHTML = "Enter Web3 Gallery"
				AllBuyButtons[i].addEventListener('click', async () => {
					PORTFOLIO = true
					await loadGallery();
				}, { once: true });

			 }
		},
			{ once: true })
	}
);
// Home Button 
window.addEventListener('load', function() { 
	connectWallet(); 
});

	homeButton.addEventListener('click', () => { 
		window.location.reload() })
// Connect Wallet Button
connectButton.addEventListener('click', () => {
	connectWallet();
});

connectWalletButton.addEventListener('click', () => {
	connectWallet();
});

// Disconnect Wallet Button
disconnectButton.addEventListener('click', () => {
	setLoading(showAccount);
	window.solana.disconnect();
	window.solana.on('disconnect', () => console.log("disconnected!"))
	showAccount.innerHTML = "Connect Wallet" +  '<i class="fas fa-sign-in-alt m-1"></i>';
	showBalance.innerHTML = "";
	connectWalletButton.classList.remove('d-none');

});

// Set Timer
var sec = 0;
function pad(val) {
	return val > 9 ? val : "0" + val;
}


// // Toast valid Tx
function toastSuccessTx() {
	// Set Timer
	var timer = setInterval(function () {
		document.getElementById("seconds").innerHTML = pad(++sec % 60);
		document.getElementById("minutes").innerHTML = pad(parseInt(sec / 60, 10));
	}, 1000);

	setTimeout(function () {
		clearInterval(timer);
	}, 11000);

	txScanLinkSuccess.href = "https://solscan.io/account/" + window.solana.publicKey;
	txScanLinkSuccess.innerHTML = "https://solscan.io/account/" + window.solana.publicKey;
	var succesAlert = document.getElementById('toastSuccess');//select id of toast
	var bsSuccess = new bootstrap.Toast(succesAlert);//inizialize it
	bsSuccess.show();//show it
};



// Toast error Tx
function toastErrorTx() {

	if (!window.solana.isConnected) {
		toastError.innerHTML = "Please Connect Your Phantom Wallet !";
	} else {
		toastError.innerHTML = "Your transaction has been rejected, you can check it at:"
		txScanLinkError.href = "https://solscan.io/account/" + window.solana.publicKey;
		txScanLinkError.innerHTML = "https://solscan.io/account/" + window.solana.publicKey;
	}

	console.log('Toast Error')
	var errorAlert = document.getElementById('toastError');//select id of toast
	var bsError = new bootstrap.Toast(errorAlert);//inizialize it
	bsError.show();//show it
};

// Set Loading
function setLoading(div) {
	div = div.innerHTML = `
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span class="sr-only">Loading...</span>`;
}

// Wallet conection Web3
async function connectWallet() {
	// Auto Trusted
	// window.solana.connect({ onlyIfTrusted: true });
	try {
		if (!window.solana.isConnected) {
			setLoading(showAccount);
			window.solana.connect();
			window.solana.on("connect", () => {
				console.log("connected To:", connection._rpcEndpoint);
				console.log("SolScan :", "https://solscan.io/address/" + window.solana.publicKey)
				console.log("AutoProve:", window.solana.autoApprove);
				getAccountInfo();
				console.log("isConnect:", window.solana.isConnected);
				connectButton.setAttribute("data-bs-toggle", "dropdown");
				connectWalletButton.classList.add('d-none');
			});
			// Check Network
			let network = connection._rpcEndpoint.replace('https://api.', "")
			network = network.replace('.solana.com', "")
			console.log(network, "NetWork")
			networkSpan.innerHTML = capitalizeFirstLetter(network);
		}
	} catch (e) {
		console.log('error:', e)
	}
}

async function getAccountInfo() {
	var pubKey = window.solana.publicKey.toString();
	let account = await connection.getAccountInfo(window.solana.publicKey);
	const balance = await connection.getBalance(window.solana.publicKey, "recent");
	pubKey = pubKey.replace(pubKey.substring(4, 40), "...")
	showAccount.innerHTML = pubKey;
	if ((balance / 1000000000) < 1) {
		console.log(balance / 1000000000)
		showBalance.innerHTML = numberWithCommas(balance) + "◎";
	} else {
		console.log(balance / 1000000000)
		showBalance.innerHTML = numberWithCommas(balance).slice(0, -1);
		showBalance.append("◎")
	}

}

// Utils Tools
function numberWithCommas(x) {
	var formatedNum = x / solanaWeb3.LAMPORTS_PER_SOL;
	return formatedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
// Solana Phantom Wallet Functions
// const getSolanaPrice = async () => {
// 	const response = await fetch(
// 		`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`,
// 		{
// 			method: "GET",
// 		}
// 	);

// 	const data = await response.json();
// 	return data.solana.usd;
// };
async function sendSol(i) {
	const collectionName = collections[i].innerHTML;
	GALLERYNAME = collectionName.toString();
	const history = await getHistory(connection, window.solana.publicKey);
	try {
		var price = allPrices[i].innerHTML;
		price = price.replace(' ◎', "");
		price = price.replace(/<img[^>]*>/g,"");
		var uniquePrice = parseFloat(price);
		console.log('parseFloat Price is:', uniquePrice)
		setLoading(AllBuyButtons[i]);
		var transaction = new solanaWeb3.Transaction().add(
			solanaWeb3.SystemProgram.transfer({
				fromPubkey: window.solana.publicKey,
				toPubkey: '8huBZ41MG2fyw7hwwbJ41Uenfn28xhrRTyMCL3R6KtWP',
				lamports: uniquePrice * solanaWeb3.LAMPORTS_PER_SOL //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
			}),
		);

		// Setting the variables for the transaction
		transaction.feePayer = await window.solana.publicKey;
		let blockhashObj = await connection.getRecentBlockhash();
		transaction.recentBlockhash = await blockhashObj.blockhash;

		// Transaction constructor initialized successfully
		if (transaction) {
			console.log("Txn created successfully", transaction);
		}

		// Request creator to sign the transaction (allow the transaction)
		await loadProject();
		let signed = await window.solana.signTransaction(transaction);
		// The signature is generated
		let signature = await connection.sendRawTransaction(signed.serialize());
		// Confirm whether the transaction went through or not
		let confirmed = await connection.confirmTransaction(signature);
		console.log("Signed", signed)
		console.log("Signature: ", signature);
		console.log("confirmed: ", confirmed);
		getAccountInfo();

		if (signature && confirmed) {

			// **Idea** check history with old signatures
			console.log('Signatures:', history);
			if (signature == history[0].signature && history[0].confirmationStatus == "finalized") {
			  console.log('Verified')
			}
			toastSuccessTx();
			console.log("Paid for", collections[i].innerHTML);
			AllBuyButtons[i].innerHTML = "Enter Web3 Gallery"
			AllBuyButtons[i].addEventListener('click', async () => {
				PORTFOLIO = true
				await loadGallery();
			}, { once: true });
		}
	} catch (error) {
		console.log(error)
		console.log("Failed for", collections[i].innerHTML);
		toastErrorTx();
		AllBuyButtons[i].innerHTML = 'Buy Ticket';
		AllBuyButtons[i].addEventListener('click', () => {
			sendSol(i);
		}, { once: true });
	}
};
