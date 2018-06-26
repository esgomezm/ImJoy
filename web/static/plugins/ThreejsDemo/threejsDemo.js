// Create a new, plain <span> element
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function addStyleString(str) {
    var node = document.createElement('style');
    node.innerHTML = str;
    document.body.appendChild(node);
}

const html = `
<div>
<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> framebuffer to texture <br/>
			The area of the white square is copied from the framebuffer to a texture (shown in the top-left corner).
		</div>

		<div id="overlay">
			<div>
			</div>
		</div>
</div>
`

const css = `
body {
				background:#777;
				padding:0;
				margin:0;
				overflow:hidden;
			}
			#info {
				position: absolute;
				top: 0px;
				width: 100%;
				color: #ffffff;
				padding: 5px;
				font-family:Monospace;
				font-size:13px;
				text-align:center;
			}
			a {
				color: #ffffff;
			}
			#overlay {
				position: fixed;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 100%;
				width: 100%;
				top: 0;
				z-index: 999;
			}
			#overlay > div {
				height: 128px;
				width: 128px;
				border: 1px solid white;
			}

`



// Insert the new element into the DOM
addStyleString(css);
document.body.appendChild(htmlToElement(html));


var loadJS = function(url, implementationCode){
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to
    //insert the <script> element
    return new Promise((resolve, reject) => {
      var scriptTag = document.createElement('script');
      scriptTag.src = url;
      scriptTag.onload = resolve;
      scriptTag.onreadystatechange = resolve;
      document.head.appendChild(scriptTag);
    })
};
//
// importScripts("https://threejs.org/build/three.js")
// importScripts("https://threejs.org/js/controls/OrbitControls.js")
// importScripts("https://threejs.org/js/Detector.js")

loadJS("https://threejs.org/build/three.js").then(()=>{
  loadJS("https://threejs.org/examples/js/controls/OrbitControls.js").then(()=>{
    loadJS("https://threejs.org/examples/js/Detector.js").then(()=>{
      build3d()
    })
  })
})

function build3d(){
  if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
  var camera, scene, renderer;
  var mesh, sprite, texture;
  var cameraOrtho, sceneOrtho;
  var dpr = window.devicePixelRatio;
  var textureSize = 128 * dpr;
  var vector = new THREE.Vector2();
  ui();
  animate();
  function ui() {
  	//
  	var width = window.innerWidth;
  	var height = window.innerHeight;
  	camera = new THREE.PerspectiveCamera( 70, width / height, 1, 1000 );
  	camera.position.z = 20;
  	cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
  	cameraOrtho.position.z = 10;
  	scene = new THREE.Scene();
  	scene.background = new THREE.Color( 0x20252f );
  	sceneOrtho = new THREE.Scene();
  	//
  	var geometry = new THREE.TorusKnotBufferGeometry( 3, 1, 256, 32 );
  	var material = new THREE.MeshStandardMaterial( { color: 0x6083c2 } );
  	mesh = new THREE.Mesh( geometry, material );
  	scene.add( mesh );
  	//
  	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
  	scene.add( ambientLight );
  	var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
  	camera.add( pointLight );
  	scene.add( camera );
  	//
  	var data = new Uint8Array( textureSize * textureSize * 3 );
  	texture = new THREE.DataTexture( data, textureSize, textureSize, THREE.RGBFormat );
  	texture.minFilter = THREE.NearestFilter;
  	texture.magFilter = THREE.NearestFilter;
  	texture.needsUpdate = true;
  	//
  	var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
  	sprite = new THREE.Sprite( spriteMaterial );
  	sprite.scale.set( textureSize, textureSize, 1 );
  	sceneOrtho.add( sprite );
  	updateSpritePosition();
  	//
  	renderer = new THREE.WebGLRenderer( { antialias: true } );
  	renderer.setPixelRatio( window.devicePixelRatio );
  	renderer.setSize( window.innerWidth, window.innerHeight );
  	renderer.autoClear = false;
  	document.body.appendChild( renderer.domElement );
  	//
  	var overlay = document.getElementById( 'overlay' );
  	var controls = new THREE.OrbitControls( camera, overlay );

  	controls.enablePan = false;
  	//
  	window.addEventListener( 'resize', onWindowResize, false );
  }
  function onWindowResize() {
  	var width = window.innerWidth;
  	var height = window.innerHeight;
  	camera.aspect = width / height;
  	camera.updateProjectionMatrix();
  	cameraOrtho.left = - width / 2;
  	cameraOrtho.right = width / 2;
  	cameraOrtho.top = height / 2;
  	cameraOrtho.bottom = - height / 2;
  	cameraOrtho.updateProjectionMatrix();
  	renderer.setSize( window.innerWidth, window.innerHeight );
  	updateSpritePosition();
  }
  function updateSpritePosition() {
  	var halfWidth = window.innerWidth / 2;
  	var halfHeight = window.innerHeight / 2;
  	var halfImageWidth = textureSize / 2;
  	var halfImageHeight = textureSize / 2;
  	sprite.position.set( - halfWidth + halfImageWidth, halfHeight - halfImageHeight, 1 );
  }
  function animate() {
  	requestAnimationFrame( animate );
  	mesh.rotation.x += 0.005;
  	mesh.rotation.y += 0.01;
  	renderer.clear();
  	renderer.render( scene, camera );
  	// calculate start position for copying data
  	vector.x = ( window.innerWidth * dpr / 2 ) - ( textureSize / 2 );
  	vector.y = ( window.innerHeight * dpr / 2 ) - ( textureSize / 2 );
  	renderer.copyFramebufferToTexture( vector, texture );
  	renderer.clearDepth();
  	renderer.render( sceneOrtho, cameraOrtho );
  }

}


class Histogram2dPlugin {
  setup(){
    api.register({
      name: "render 2D histogram",
      type: "localization/render_2d_histogram",
      tags: ["localization", "op", "histogram"],
      ui: "Render a histogram with pixel size {id:'pixel_size', type:'number', placeholder: 20}nm",
    })
  }

  async run(my){
    const pixel_size = my.config.pixel_size
    return my
  }
}

api.export(new Histogram2dPlugin())
