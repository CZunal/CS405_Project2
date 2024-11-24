function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
    var trans1 = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];
    var rotatXCos = Math.cos(rotationX);
    var rotatXSin = Math.sin(rotationX);

    var rotatYCos = Math.cos(rotationY);
    var rotatYSin = Math.sin(rotationY);

    var rotatx = [
        1, 0, 0, 0,
        0, rotatXCos, -rotatXSin, 0,
        0, rotatXSin, rotatXCos, 0,
        0, 0, 0, 1
    ];

    var rotaty = [
        rotatYCos, 0, -rotatYSin, 0,
        0, 1, 0, 0,
        rotatYSin, 0, rotatYCos, 0,
        0, 0, 0, 1
    ];

    var test1 = MatrixMult(rotaty, rotatx);
    var test2 = MatrixMult(trans1, test1);
    var mvp = MatrixMult(projectionMatrix, test2);

    return mvp;
}

class MeshDrawer {
    // The constructor is a good place for taking care of the necessary initializations.
    constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
        this.colorLoc = gl.getUniformLocation(this.prog, 'color');

        /**
         * @Task2 : You should initialize the required variables for lighting here
         */
        this.ambientLightLoc = gl.getUniformLocation(this.prog, "ambient");
        this.enableLightingLoc = gl.getUniformLocation(this.prog, "enableLighting");
        this.lightPosLoc = gl.getUniformLocation(this.prog, "lightPos");

        this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
        this.normalLoc = gl.getAttribLocation(this.prog, 'normal');

        this.vertbuffer = gl.createBuffer();
        this.texbuffer = gl.createBuffer();
        this.normbuffer = gl.createBuffer();

        this.numTriangles = 0;
    }

    setMesh(vertPos, texCoords, normalCoords) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        // Update texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        /**
         * @Task2 : You should update the rest of this function to handle the lighting
         */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

        this.numTriangles = vertPos.length / 3;
    }

    // This method is called to draw the triangular mesh.
    // The argument is the transformation matrix, the same matrix returned
    // by the GetModelViewProjection function above.
    draw(trans) {
        gl.useProgram(this.prog);

        gl.uniformMatrix4fv(this.mvpLoc, false, trans);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.enableVertexAttribArray(this.vertPosLoc);
        gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.enableVertexAttribArray(this.texCoordLoc);
        gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        // Bind the normals buffer to handle lighting
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
        gl.enableVertexAttribArray(this.normalLoc);
        gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

        /**
         * @Task2 : You should update this function to handle the lighting
         */

        // Update light position, ambient light, and lighting enable state
        gl.uniform3fv(this.lightPosLoc, [lightX, lightY, 1]);
        gl.uniform1f(this.ambientLightLoc, this.ambient);
        gl.uniform1i(this.enableLightingLoc, this.enableLight ? 1 : 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }

    // This method is called to set the texture of the mesh.
    // The argument is an HTML IMG element containing the texture data.
    setTexture(img) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // You can set the texture image data using the following command.
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            img);

        // Set texture parameters
        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            console.error("Task 1: Non power of 2, you should implement this part to accept non power of 2 sized textures");
            /**
             * @Task1 : You should implement this part to accept non power of 2 sized textures
             */
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        gl.useProgram(this.prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const sampler = gl.getUniformLocation(this.prog, 'tex');
        gl.uniform1i(sampler, 0);
    }

    showTexture(show) {
        gl.useProgram(this.prog);
        gl.uniform1i(this.showTexLoc, show);
    }

    enableLighting(show) {
        console.error("Task 2: You should implement the lighting and implement this function");
        /**
         * @Task2 : You should implement the lighting and implement this function
         */
        this.enableLight = show;
        gl.useProgram(this.prog);
        gl.uniform1i(this.enableLightingLoc, show ? 1 : 0);
    }

    setAmbientLight(ambient) {
        console.error("Task 2: You should implement the lighting and implement this function");
        /**
         * @Task2 : You should implement the lighting and implement this function
         */
        this.ambient = ambient;
        gl.useProgram(this.prog);
        gl.uniform1f(this.ambientLightLoc, ambient);
    }
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

// Vertex Shader
const meshVS = `
attribute vec3 pos;
attribute vec2 texCoord;
attribute vec3 normal;

uniform mat4 mvp;

varying vec2 v_texCoord;
varying vec3 v_normal;

void main() {
    v_texCoord = texCoord;
    v_normal = normal;
    gl_Position = mvp * vec4(pos, 1);
}`;

// Fragment Shader
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
precision mediump float;

uniform bool showTex;
uniform bool enableLighting;
uniform sampler2D tex;
uniform vec3 lightPos;
uniform float ambient;

varying vec2 v_texCoord;
varying vec3 v_normal;

void main() {
    if (enableLighting) {
        // Normalize the normal vector
        vec3 normalizedNormal = normalize(v_normal);

        // Calculate the light direction vector
        vec3 lightDir = normalize(lightPos);

        // Compute diffuse intensity using Lambertian reflectance
        float diffuse = max(dot(normalizedNormal, lightDir), 0.0);

        // Calculate ambient and diffuse lighting components
        vec4 ambientLight = ambient * vec4(1.0, 1.0, 1.0, 1.0); // Ambient light (white)
        vec4 diffuseLight = diffuse * vec4(1.0, 1.0, 1.0, 1.0); // Diffuse light (white)

        // Combine ambient and diffuse components
        vec4 finalColor = ambientLight + diffuseLight;

        // Apply texture if enabled
        if (showTex) {
            vec4 texColor = texture2D(tex, v_texCoord);
            gl_FragColor = finalColor * texColor; // Modulate texture with lighting
        } else {
            gl_FragColor = finalColor; // Use final lighting color without texture
        }
    } else {
        // If lighting is disabled, fallback to texture or base color
        if (showTex) {
            gl_FragColor = texture2D(tex, v_texCoord);
        } else {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Default red color
        }
    }
}`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
    const translationSpeed = 1;
    if (keys['ArrowUp']) lightY -= translationSpeed;
    if (keys['ArrowDown']) lightY += translationSpeed;
    if (keys['ArrowRight']) lightX -= translationSpeed;
    if (keys['ArrowLeft']) lightX += translationSpeed;
}
