
/**
 * @file An image/animation of the UIUC Block I for CS418's MP1.
 * @author Josh Pike <joshuap5@illinois.edu>  
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The Modelview matrix */
var mvMatrix = glMatrix.mat4.create();

/** @global The Projection matrix */
var pMatrix = glMatrix.mat4.create();

/** @global Two times pi to save some multiplications...*/
var twicePi=2.0*3.14159;

/** @global Count the frames we render....*/
var frameNumber =0;

/** @global Amount to translate the block I horizontally....*/
var transHor = 0.01;

/** @global Amount to translate the block I vertically....*/
var transVert = -0.01;

/** @global variable to control when to bounce trans back....*/
var mult = 1;

/** @global The angle of rotation around the x axis */
var defAngle = 0;

/** @global Number of vertices around the circle boundary */
var numCircleVerts = 88;

//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix"); 
}

/**
 * Populate vertex buffer with data
 */
function loadVertices()
{
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    
  var triangleVerticies
  if (frameNumber < 1000) {
        bufferTrans();
    
        triangleVertices = [
        -0.63 + transHor,  0.88 + transVert,  0.0,
        -0.63 + transHor, 0.82 + transVert,  0.0,
         0.63 + transHor, 0.88 + transVert,  0.0,
      
         0.63 + transHor, 0.88 + transVert,  0.0,
         0.63 + transHor, 0.82 + transVert,  0.0,
        -0.63 + transHor, 0.82 + transVert,  0.0,
      
        -0.63 + transHor, 0.82 + transVert,  0.0,
        -0.63 + transHor, 0.5 + transVert,   0.0,
        -0.57 + transHor, 0.5 + transVert,   0.0,
      
        -0.63 + transHor, 0.82 + transVert,  0.0,
        -0.57 + transHor,  0.82 + transVert,  0.0,
        -0.57 + transHor,  0.5 + transVert,   0.0,
      
         0.63 + transHor, 0.82 + transVert, 0,
         0.63 + transHor, 0.5 + transVert, 0,
         0.57 + transHor, 0.5 + transVert, 0,
      
         0.63 + transHor, 0.82 + transVert,  0.0,
         0.57 + transHor,  0.82 + transVert,  0.0,
         0.57 + transHor,  0.5 + transVert,   0.0,
      
        
         0.25 + transHor, 0.44 + transVert, 0.0,
         0.63 + transHor, 0.44 + transVert, 0.0,
         0.63 + transHor, 0.5 + transVert,  0.0,
      
         0.25 + transHor, 0.5 + transVert, 0,
         0.25 + transHor, 0.44 + transVert, 0,
         0.63 + transHor, 0.5 + transVert, 0,
      
        -0.25 + transHor, 0.44 + transVert, 0.0,
        -0.63 + transHor, 0.44 + transVert, 0.0,
        -0.63 + transHor, 0.5 + transVert,  0.0,
      
        -0.25 + transHor, 0.5 + transVert, 0,
        -0.25 + transHor, 0.44 + transVert, 0,
        -0.63 + transHor, 0.5 + transVert, 0,
      
        0.25 + transHor, 0.44 + transVert, 0,
        0.31 + transHor, 0.44 + transVert, 0,
        0.31 + transHor, -0.44 + transVert, 0,
      
        0.25 + transHor, 0.44 + transVert, 0,
        0.25 + transHor, -0.44 + transVert, 0,
        0.31 + transHor, -0.44 + transVert, 0,
      
       -0.25 + transHor, 0.44 + transVert, 0,
       -0.31 + transHor, 0.44 + transVert, 0,
       -0.31 + transHor, -0.44 + transVert, 0,
      
       -0.25 + transHor, 0.44 + transVert, 0,
       -0.25 + transHor, -0.44 + transVert, 0,
       -0.31 + transHor, -0.44 + transVert, 0,
      
        0.25 + transHor, -0.5 + transVert, 0,
        0.25 + transHor, -0.44 + transVert, 0,
        0.63 + transHor, -0.5 + transVert, 0,
      
        0.25 + transHor, -0.44 + transVert, 0.0,
        0.63 + transHor, -0.44 + transVert, 0.0,
        0.63 + transHor, -0.5 + transVert,  0.0,
      
       -0.25 + transHor, -0.5 + transVert, 0,
       -0.25 + transHor, -0.44 + transVert, 0,
       -0.63 + transHor, -0.5 + transVert, 0,
      
       -0.25 + transHor, -0.44 + transVert, 0.0,
       -0.63 + transHor, -0.44 + transVert, 0.0,
       -0.63 + transHor, -0.5 + transVert,  0.0,
      
        0.63 + transHor, -0.82 + transVert, 0,
        0.63 + transHor, -0.5 + transVert, 0,
        0.57 + transHor, -0.5 + transVert, 0,
      
        0.63 + transHor, -0.82 + transVert,  0.0,
        0.57 + transHor,  -0.82 + transVert,  0.0,
        0.57 + transHor,  -0.5 + transVert,   0.0,
      
       -0.63 + transHor, -0.82 + transVert, 0,
       -0.63 + transHor, -0.5 + transVert, 0,
       -0.57 + transHor, -0.5 + transVert, 0,
      
       -0.63 + transHor, -0.82 + transVert,  0.0,
       -0.57 + transHor,  -0.82 + transVert,  0.0,
       -0.57 + transHor,  -0.5 + transVert,   0.0,
      
       -0.63 + transHor,  -0.88 + transVert,  0.0,
       -0.63 + transHor, -0.82 + transVert,  0.0,
        0.63 + transHor, -0.88 + transVert,  0.0,
      
         0.63 + transHor, -0.88 + transVert,  0.0,
         0.63 + transHor, -0.82 + transVert,  0.0,
        -0.63 + transHor, -0.82 + transVert,  0.0,
      
      
      
        0.57 + transHor, 0.82 + transVert, 0,
        0.57 + transHor, 0.5 + transVert, 0,
        -0.57 + transHor, 0.5 + transVert, 0,
      
        -0.57 + transHor, 0.82 + transVert, 0,
        -0.57 + transHor, 0.5 + transVert, 0,
        0.57 + transHor, 0.82 + transVert, 0,
        
        -0.25 + transHor, 0.5 + transVert, 0,
        0.25 + transHor, 0.5 + transVert, 0,
        -0.25 + transHor, -0.5 + transVert, 0,
      
        -0.25 + transHor, -0.5 + transVert, 0,
        0.25 + transHor, -0.5 + transVert, 0,
        0.25 + transHor, 0.5 + transVert, 0,
      
        0.57 + transHor, -0.82 + transVert, 0,
        0.57 + transHor, -0.5 + transVert, 0,
        -0.57 + transHor, -0.5 + transVert, 0,
      
        -0.57 + transHor, -0.82 + transVert, 0,
        -0.57 + transHor, -0.5 + transVert, 0,
        0.57 + transHor, -0.82 + transVert, 0
      
         
  ];
      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
        vertexPositionBuffer.itemSize = 3;
        vertexPositionBuffer.numberOfItems = 90;
  } else {
    var triangleVertices = [0.0,0.0,0.0];

    //Generate a triangle fan around origin
    var radius=0.5
    var z=0.0;    
    
    for (i=0;i<=88;i++){
        angle = i *  twicePi / 88;
        x=(radius * Math.cos(angle));
        y=(radius * Math.sin(angle));
        var ptOffset = deformSin(x, y, angle);
      
        triangleVertices.push(x + ptOffset[0]);
        triangleVertices.push(y + ptOffset[1]);
        triangleVertices.push(z);
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
        vertexPositionBuffer.itemSize = 3;
        vertexPositionBuffer.numberOfItems = 90;
    }
  }
  
    
  
}

function loadColors()
{
    vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    
  var colors = [
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
        .19, 0.41, 0.75, 1.0,
      
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
        2.32, 0.74, 0.39, 1.0,
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 90;  
}
/**
 * Populate buffers with data
 */
function setupBuffers() {
  //Generate the vertex positions    
  loadVertices();

  //Generate the vertex colors
  loadColors();
    
}

/**
 * Draw model...render a frame
 */
function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
  glMatrix.mat4.identity(mvMatrix); // Part of animation?
  glMatrix.mat4.identity(pMatrix); // Part of animation?

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
                          
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
function animate() { 
    defAngle = (defAngle + 0.1) % 88;
    loadVertices();
}

/**
 * Startup function called from html code to start program.
 */
 function startup() {
  console.log("No bugs so far...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick(); 
}

/**
 * Tick called for every animation frame.
 */
function tick() {
    //console.log("Frame ",frameNumber);
    frameNumber=frameNumber+1;
    requestAnimationFrame(tick);
    draw();
    animate();
}

/*
* Applies a translation to the right and down
*/
function bufferTrans() 
{
    transHor = transHor + (0.005 * mult);
    transVert = transVert + (0.005 * mult);
    if (frameNumber%50 == 0) {
        mult = mult * -1;
    }
}


/**
* Calculate the deformation for a given vertex on the circle
@param {number} x coordinate of a circle boundary point
@param {number} y coordinate of a circle boundary point
@param {number} angle of the boundary point around the circle
@return {object} a vector with an x and y value to add to the boundary point
*/
function deformSin(x, y, angle)
{
    var pointOffset = glMatrix.vec2.fromValues(x,y);
    
    var displacement = 0.2*Math.sin(angle+degToRad(defAngle));
    glMatrix.vec2.normalize(pointOffset, pointOffset);
    glMatrix.vec2.scale(pointOffset, pointOffset, displacement);
    return pointOffset;
}