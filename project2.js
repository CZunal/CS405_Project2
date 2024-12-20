/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 * 		setMesh, draw, setAmbientLight and enableLighting functions 
 */
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
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
        /*
        * @Task4 :
        */ 
       
        this.textures = []; // Array to store multiple textures
        this.blendFactor = 0.5; // Default blend factor

		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');

		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
		this.colorLoc = gl.getUniformLocation(this.prog, 'color');
		this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');

		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();
		this.normalbuffer = gl.createBuffer();

        this.specularIntensity = 0.5; // Default value
        this.viewDirLoc = gl.getUniformLocation(this.prog, 'viewDir');
        this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity');

            
        
		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */
        this.lightPos = [1,1,1]
		this.ambient = 0.1;
		this.numTriangles = 0;
        this.enableLighting(false);


	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		// Create and uptade the normal buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;

		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */
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
        console.log('Specular Intensity:', this.specularIntensity);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
        	/**
		 * @Task2 : You should update this function to handle the lighting
		 */
		// Set the light position uniform
		updateLightPos();
		// gl.uniform3fv(this.lightPosLoc, new Float32Array(this.lightPos));
		gl.uniform3fv(this.lightPosLoc, new Float32Array([lightX,lightY,5]));

		// Set the ambient light level uniform
		gl.uniform1f(this.ambientLoc, this.ambient);

		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
		
		/**
		 * @Task3 :
		 */

        const viewDir = [0, 0, 1]; // Assuming the camera is along the Z-axis
        gl.uniform3fv(this.viewDirLoc, new Float32Array(viewDir));
        gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);


	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img, textureUnit = 0) {
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    
        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    
        this.textures[textureUnit] = texture; // Store texture reference
        gl.useProgram(this.prog);
        gl.uniform1i(gl.getUniformLocation(this.prog, `tex${textureUnit}`), textureUnit);
    }
    

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	enableLighting(show) {
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */
		gl.useProgram(this.prog);
		gl.uniform1i(this.enableLightingLoc, show);
	}
	
    setSpecularIntensity(intensity) {
        this.specularIntensity = intensity;
        gl.useProgram(this.prog);
        gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);
    }
    

    setAmbientLight(ambient) {
        // Check if lighting is enabled
        if (!this.isLightingEnabled()) return;
    
        // Update ambient value
        this.ambient = ambient;
        gl.useProgram(this.prog);
        gl.uniform1f(this.ambientLoc, this.ambient);
    }
    
    setSpecularIntensity(intensity) {
        // Check if lighting is enabled
        if (!this.isLightingEnabled()) return;
    
        // Update specular intensity
        this.specularIntensity = intensity;
        gl.useProgram(this.prog);
        gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);
    }
    
    // Helper function to check if lighting is enabled
    isLightingEnabled() {
        gl.useProgram(this.prog);
        const enableLighting = gl.getUniform(this.prog, this.enableLightingLoc);
        return enableLighting;
    }

    setBlendFactor(factor) {
        gl.useProgram(this.prog);
        gl.uniform1f(gl.getUniformLocation(this.prog, 'blendFactor'), factor);
    }
    
    setSecondTexture(img) {
        this.setTexture(img, 1); // Use texture unit 1 for the second texture
    }
    
    

}



function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			void main()
			{
				v_texCoord = texCoord;
				v_normal = (mvp * vec4(normal,0)).xyz;

				gl_Position = mvp * vec4(pos,1);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
precision mediump float;

uniform bool showTex;
uniform bool enableLighting;
uniform sampler2D tex0; // Base texture
uniform sampler2D tex1; // Additional texture
uniform float blendFactor; // Blend factor for texture mixing

uniform vec3 color;
uniform vec3 lightPos;
uniform float ambient;
uniform float specularIntensity;
uniform vec3 viewDir;

varying vec2 v_texCoord;
varying vec3 v_normal;

void main()
{
    vec3 norm = normalize(v_normal);
    vec3 lightDir = normalize(lightPos);
    vec3 reflectedLight = reflect(-lightDir, norm);
    vec3 viewerDir = normalize(viewDir);

    float adjustedAmbient = ambient * 0.5;
    float diff = max(dot(norm, -lightDir), 0.0) * 0.7;
    float light = adjustedAmbient + diff;

    float spec = 0.0;
    if (enableLighting) {
        float shininess = 64.0;
        spec = pow(max(dot(reflectedLight, viewerDir), 0.0), shininess) * specularIntensity;
    }

    vec4 texColor0 = texture2D(tex0, v_texCoord);
    vec4 texColor1 = texture2D(tex1, v_texCoord);
    vec4 blendedTex = mix(texColor0, texColor1, blendFactor);

    vec4 finalColor = showTex ? blendedTex : vec4(color, 1.0);
    gl_FragColor = finalColor * light + vec4(spec, spec, spec, 1.0);
}



`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
    if (!meshDrawer.isLightingEnabled()) return;

	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
	console.log("LightX: ", lightX, "LightY: ", lightY);
}
