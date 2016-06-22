
function init() 
{
    ///////////
    // SCENE //
    ///////////
    scene = new THREE.Scene();

    ////////////
    // CAMERA //
    ////////////

    // var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
    var SCREEN_WIDTH = width, SCREEN_HEIGHT = height;   
    // camera attributes
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    // set up camera
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    // add the camera to the scene
    scene.add(camera);
    // the camera defaults to position (0,0,0)
    //  so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
    camera.position.set(0, 0,400);
    camera.lookAt(scene.position);  
    
    //////////////
    // RENDERER //
    //////////////
    

    renderer = new THREE.WebGLRenderer( {antialias:true, alpha:true} );

    
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    renderer.domElement.setAttribute("id", "threeCanvas")
    document.body.appendChild(renderer.domElement);
    
    
    
    
    ///////////
    // LIGHT //
    ///////////
    
    // create a light
    var light = new THREE.PointLight(0xffffff);
    light.position.set(150,250,550);
    scene.add(light);
    var ambientLight = new THREE.AmbientLight(0x111111);
    // scene.add(ambientLight);
    
    //////////////
    // GEOMETRY //
    //////////////
        


    var sphereGeometry = new THREE.SphereGeometry( 50, 32, 16 ); 

    var earthTexture = THREE.ImageUtils.loadTexture("img/earthmap1k.jpg");
    earthTexture.minFilter = THREE.NearestFilter;
    var sphereMaterial = new THREE.MeshLambertMaterial({
        map: earthTexture,
    });


    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    sphere.position.needsUpdate = true;
    sphere.geometry.dynamic = true;
    var vector = new THREE.Vector3( (x / width ) * 2 - 1, -( y / height ) * 2 + 1,  0.5 );   
    console.log(vector)
    sphere.position.set(0,0,0)
    scene.add(sphere);

    console.log("Initialize complete")

    clock = new THREE.Clock();
}

function pointConverter(x, y, r ) {     

    // event.preventDefault();

    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = - (y / window.innerHeight) * 2 + 1;
    console.log(mouse)

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject( camera );
    var dir = vector.sub( camera.position ).normalize();
    var distance = - camera.position.z / dir.z;
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    sphere.position.copy(pos);

}

function animate() 
{
    requestAnimationFrame( animate );
    render();       
    update();
}

function update()
{
    // delta = change in time since last call (in seconds)
    var delta = clock.getDelta(); 
    sphere.rotation.y += 0.05;
}

function render() 
{   
    renderer.render( scene, camera );
}

