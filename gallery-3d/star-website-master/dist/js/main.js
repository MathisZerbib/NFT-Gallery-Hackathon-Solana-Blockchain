/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var container, stats;\nvar camera, scene, raycaster, renderer;\nvar mouse = new THREE.Vector2(), INTERSECTED;\nvar radius = 100, theta = 0;\nvar mouseX = 0;\nvar mouseY = 0;\nvar windowHalfX = window.innerWidth / 2;\nvar windowHalfY = window.innerHeight / 2;\ninit();\nanimate();\nfunction init() {\n  container = document.createElement( 'div' );\n  document.body.appendChild( container );\n  var info = document.createElement( 'div' );\n  info.style.position = 'absolute';\n  info.style.top = '10px';\n  info.style.width = '100%';\n  info.style.textAlign = 'center';\n  info.innerHTML = '<a href=\"http://threejs.org\" target=\"_blank\" rel=\"noopener\">three.js</a> webgl - interactive cubes';\n  container.appendChild( info );\n  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );\n  scene = new THREE.Scene();\n  scene.background = new THREE.Color( 0xf0f0f0 );\n\n  var light = new THREE.DirectionalLight( 0xffffff, 1 );\n  light.position.set( 1, 1, 1 ).normalize();\n  scene.add( light );\n\n  var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );\n  var sprite = new THREE.TextureLoader().load( 'star.png' );\n  for ( var i = 0; i < 500; i ++ ) {\n    var object = new THREE.PointsMaterial( { size: 35, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true } );\n    object.position.x = Math.random() * 800 - 400;\n    object.position.y = Math.random() * 800 - 400;\n    object.position.z = Math.random() * 800 - 400;\n    object.rotation.x = Math.random() * 2 * Math.PI;\n    object.rotation.y = Math.random() * 2 * Math.PI;\n    object.rotation.z = Math.random() * 2 * Math.PI;\n    object.scale.x = Math.random() + 0.5;\n    object.scale.y = Math.random() + 0.5;\n    object.scale.z = Math.random() + 0.5;\n    scene.add( object );\n  }\n  raycaster = new THREE.Raycaster();\n  renderer = new THREE.WebGLRenderer();\n  renderer.setPixelRatio( window.devicePixelRatio );\n  renderer.setSize( window.innerWidth, window.innerHeight );\n  container.appendChild( renderer.domElement );\n  stats = new Stats();\n  container.appendChild( stats.dom );\n  document.addEventListener( 'mousemove', onDocumentMouseMove, false );\n  //\n  window.addEventListener( 'resize', onWindowResize, false );\n}\nfunction onWindowResize() {\n  camera.aspect = window.innerWidth / window.innerHeight;\n  camera.updateProjectionMatrix();\n  renderer.setSize( window.innerWidth, window.innerHeight );\n}\nfunction onDocumentMouseMove( event ) {\n  mouseX = ( event.clientX - windowHalfX ) / 100;\n  mouseY = ( event.clientY - windowHalfY ) / 100;\n}\n//\nfunction animate() {\n  requestAnimationFrame( animate );\n  render();\n  stats.update();\n}\nfunction render() {\n  theta += 0.1;\n  camera.position.x += ( mouseX - camera.position.x ) * .05;\n  camera.position.y += ( - mouseY - camera.position.y ) * .05;\n  camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );\n  camera.lookAt( scene.position );\n  camera.updateMatrixWorld();\n  // find intersections\n  raycaster.setFromCamera( mouse, camera );\n  // var intersects = raycaster.intersectObjects( scene.children );\n  // if ( intersects.length > 0 ) {\n  // \tif ( INTERSECTED != intersects[ 0 ].object ) {\n  // \t\tif ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );\n  // \t\tINTERSECTED = intersects[ 0 ].object;\n  // \t\tINTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();\n  // \t\tINTERSECTED.material.emissive.setHex( 0xff0000 );\n  // \t}\n  // } else {\n  // \tif ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );\n  // \tINTERSECTED = null;\n  // }\n  renderer.render( scene, camera );\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanM/YjYzNSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0JBQWtCLFNBQVM7QUFDM0IsNENBQTRDLG1GQUFtRjtBQUMvSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiIuL3NyYy9pbmRleC5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjb250YWluZXIsIHN0YXRzO1xudmFyIGNhbWVyYSwgc2NlbmUsIHJheWNhc3RlciwgcmVuZGVyZXI7XG52YXIgbW91c2UgPSBuZXcgVEhSRUUuVmVjdG9yMigpLCBJTlRFUlNFQ1RFRDtcbnZhciByYWRpdXMgPSAxMDAsIHRoZXRhID0gMDtcbnZhciBtb3VzZVggPSAwO1xudmFyIG1vdXNlWSA9IDA7XG52YXIgd2luZG93SGFsZlggPSB3aW5kb3cuaW5uZXJXaWR0aCAvIDI7XG52YXIgd2luZG93SGFsZlkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xuaW5pdCgpO1xuYW5pbWF0ZSgpO1xuZnVuY3Rpb24gaW5pdCgpIHtcbiAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggY29udGFpbmVyICk7XG4gIHZhciBpbmZvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgaW5mby5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIGluZm8uc3R5bGUudG9wID0gJzEwcHgnO1xuICBpbmZvLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICBpbmZvLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICBpbmZvLmlubmVySFRNTCA9ICc8YSBocmVmPVwiaHR0cDovL3RocmVlanMub3JnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXJcIj50aHJlZS5qczwvYT4gd2ViZ2wgLSBpbnRlcmFjdGl2ZSBjdWJlcyc7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZCggaW5mbyApO1xuICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoIDcwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMDAgKTtcbiAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgc2NlbmUuYmFja2dyb3VuZCA9IG5ldyBUSFJFRS5Db2xvciggMHhmMGYwZjAgKTtcblxuICB2YXIgbGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCggMHhmZmZmZmYsIDEgKTtcbiAgbGlnaHQucG9zaXRpb24uc2V0KCAxLCAxLCAxICkubm9ybWFsaXplKCk7XG4gIHNjZW5lLmFkZCggbGlnaHQgKTtcblxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94QnVmZmVyR2VvbWV0cnkoIDIwLCAyMCwgMjAgKTtcbiAgdmFyIHNwcml0ZSA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCkubG9hZCggJ3N0YXIucG5nJyApO1xuICBmb3IgKCB2YXIgaSA9IDA7IGkgPCA1MDA7IGkgKysgKSB7XG4gICAgdmFyIG9iamVjdCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCggeyBzaXplOiAzNSwgc2l6ZUF0dGVudWF0aW9uOiBmYWxzZSwgbWFwOiBzcHJpdGUsIGFscGhhVGVzdDogMC41LCB0cmFuc3BhcmVudDogdHJ1ZSB9ICk7XG4gICAgb2JqZWN0LnBvc2l0aW9uLnggPSBNYXRoLnJhbmRvbSgpICogODAwIC0gNDAwO1xuICAgIG9iamVjdC5wb3NpdGlvbi55ID0gTWF0aC5yYW5kb20oKSAqIDgwMCAtIDQwMDtcbiAgICBvYmplY3QucG9zaXRpb24ueiA9IE1hdGgucmFuZG9tKCkgKiA4MDAgLSA0MDA7XG4gICAgb2JqZWN0LnJvdGF0aW9uLnggPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XG4gICAgb2JqZWN0LnJvdGF0aW9uLnkgPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XG4gICAgb2JqZWN0LnJvdGF0aW9uLnogPSBNYXRoLnJhbmRvbSgpICogMiAqIE1hdGguUEk7XG4gICAgb2JqZWN0LnNjYWxlLnggPSBNYXRoLnJhbmRvbSgpICsgMC41O1xuICAgIG9iamVjdC5zY2FsZS55ID0gTWF0aC5yYW5kb20oKSArIDAuNTtcbiAgICBvYmplY3Quc2NhbGUueiA9IE1hdGgucmFuZG9tKCkgKyAwLjU7XG4gICAgc2NlbmUuYWRkKCBvYmplY3QgKTtcbiAgfVxuICByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgcmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyggd2luZG93LmRldmljZVBpeGVsUmF0aW8gKTtcbiAgcmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcbiAgc3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKCBzdGF0cy5kb20gKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uRG9jdW1lbnRNb3VzZU1vdmUsIGZhbHNlICk7XG4gIC8vXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgb25XaW5kb3dSZXNpemUsIGZhbHNlICk7XG59XG5mdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZSgpIHtcbiAgY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICByZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG59XG5mdW5jdGlvbiBvbkRvY3VtZW50TW91c2VNb3ZlKCBldmVudCApIHtcbiAgbW91c2VYID0gKCBldmVudC5jbGllbnRYIC0gd2luZG93SGFsZlggKSAvIDEwMDtcbiAgbW91c2VZID0gKCBldmVudC5jbGllbnRZIC0gd2luZG93SGFsZlkgKSAvIDEwMDtcbn1cbi8vXG5mdW5jdGlvbiBhbmltYXRlKCkge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIGFuaW1hdGUgKTtcbiAgcmVuZGVyKCk7XG4gIHN0YXRzLnVwZGF0ZSgpO1xufVxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICB0aGV0YSArPSAwLjE7XG4gIGNhbWVyYS5wb3NpdGlvbi54ICs9ICggbW91c2VYIC0gY2FtZXJhLnBvc2l0aW9uLnggKSAqIC4wNTtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgKz0gKCAtIG1vdXNlWSAtIGNhbWVyYS5wb3NpdGlvbi55ICkgKiAuMDU7XG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gcmFkaXVzICogTWF0aC5jb3MoIFRIUkVFLk1hdGguZGVnVG9SYWQoIHRoZXRhICkgKTtcbiAgY2FtZXJhLmxvb2tBdCggc2NlbmUucG9zaXRpb24gKTtcbiAgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG4gIC8vIGZpbmQgaW50ZXJzZWN0aW9uc1xuICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYSggbW91c2UsIGNhbWVyYSApO1xuICAvLyB2YXIgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKCBzY2VuZS5jaGlsZHJlbiApO1xuICAvLyBpZiAoIGludGVyc2VjdHMubGVuZ3RoID4gMCApIHtcbiAgLy8gXHRpZiAoIElOVEVSU0VDVEVEICE9IGludGVyc2VjdHNbIDAgXS5vYmplY3QgKSB7XG4gIC8vIFx0XHRpZiAoIElOVEVSU0VDVEVEICkgSU5URVJTRUNURUQubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KCBJTlRFUlNFQ1RFRC5jdXJyZW50SGV4ICk7XG4gIC8vIFx0XHRJTlRFUlNFQ1RFRCA9IGludGVyc2VjdHNbIDAgXS5vYmplY3Q7XG4gIC8vIFx0XHRJTlRFUlNFQ1RFRC5jdXJyZW50SGV4ID0gSU5URVJTRUNURUQubWF0ZXJpYWwuZW1pc3NpdmUuZ2V0SGV4KCk7XG4gIC8vIFx0XHRJTlRFUlNFQ1RFRC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoIDB4ZmYwMDAwICk7XG4gIC8vIFx0fVxuICAvLyB9IGVsc2Uge1xuICAvLyBcdGlmICggSU5URVJTRUNURUQgKSBJTlRFUlNFQ1RFRC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoIElOVEVSU0VDVEVELmN1cnJlbnRIZXggKTtcbiAgLy8gXHRJTlRFUlNFQ1RFRCA9IG51bGw7XG4gIC8vIH1cbiAgcmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgY2FtZXJhICk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/index.js\n");

/***/ })

/******/ });