const scemoVSSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTextureCoord;
    
    //Normal correction matrix
    uniform mat4 uInvTransGeoMatrix;
    uniform mat4 uM;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjMatrix;
    
    varying vec3 vPositionW;
    varying highp vec2 vTextureCoord;
    varying vec3 vNormal;

    void main(void) {
      gl_Position = uProjMatrix * uViewMatrix * uM * vec4(aPosition,1.0);
      vTextureCoord = aTextureCoord;
      vNormal = (uInvTransGeoMatrix * vec4(aNormal,1.0)).xyz;
    }
  `;

const scemoFSSource = `
    precision highp float;
    
    varying highp vec2 vTextureCoord;
    varying vec3 vNormal;
    varying vec3 vPositionW;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

const vsShaderBaseline  = `
        //vertex
        attribute vec3 aPosition;
        //normals
        attribute vec3 aNormal;
        //texture
        attribute vec2 aTextureCoord;
        
        uniform mat4 uInvTransGeoMatrix;
        uniform mat4 uM;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjMatrix;
        
        //Position in world space
        varying vec3 vPositionC;
        //exiting normal (which needs to be corrected by uInvTransGeoMatrix)
        varying vec3 vNormal;
        //interpol. texture
        varying highp vec2 vTextureCoord;
        
        void main(void){
            //Point in camera space just in case we need it
            vPositionC = ( uM * vec4(aPosition,1.0)).xyz;
           
            gl_Position = uProjMatrix * uViewMatrix * vec4(vPositionC,1.0);
            
            //Sending correct normal to fragment shader
            vNormal = (uInvTransGeoMatrix * vec4(aNormal,1.0)).xyz;
            vTextureCoord = aTextureCoord;
            
        }
        `
const fsShaderBase  = `
        precision highp float;
        
        //Position in camera space on the object right now (interpolated)
        varying vec3 vPositionC;
        
        //exiting normal (which needs to be corrected by uInvTransGeoMatrix)
        //Corrected and interpolated normal
        varying vec3 vNormal;
        //Interpolated tex coordinates
         varying highp vec2 vTextureCoord;
        
        
        //Camera position
        uniform vec3 uEyePosition;
        
        //How many directional lights
        uniform int N_DIRLIGHTS;
        //We can have an offset for deciding which light is going to be rendered
        
        struct DirectionalLight{
            //Uniform
            float diffuseInt;
            float ambientInt;
            vec3 color;
            //Not uniform
            vec4 specular;
            vec4 ambient;
            vec4 diffuse;
            vec3 direction;
        };
        
        uniform sampler2D uSampler; // Texture
       // uniform sampler2D uNormalMap; //Height map
        
        //33
        //Luke skywalker
        
        uniform DirectionalLight sun[10];
        
        vec4 CalcDirectionalLight(DirectionalLight light,vec3 cameraPos,vec3 normal){
            vec3 normalizedNormal = normalize(normal);
            vec4 ambientColor = vec4(light.color * light.ambientInt,1.0) * texture2D(uSampler,vTextureCoord);
            vec4 diffuseColor = vec4(light.color * light.diffuseInt,1.0) * texture2D(uSampler,vTextureCoord) * max(0.0,dot(normalizedNormal,light.direction));
            vec3 H = normalize(normalize(light.direction) + normalize(cameraPos));
            vec4 specularColor = pow(max(0.0,dot(H,normalizedNormal)), 25.)  * texture2D(uSampler,vTextureCoord) * vec4(light.color,1.0);
            light.ambient = ambientColor;
            light.diffuse = diffuseColor;
            light.specular = specularColor;
            return light.ambient + light.specular + light.diffuse;
        }
        void main(void){
            vec4 finalColor = texture2D(uSampler,vTextureCoord);
            int counter = int(N_DIRLIGHTS);
            for(int i = 0; i < 50; i++){
                if(i > counter){
                    break;
                }
                finalColor += CalcDirectionalLight(sun[i],uEyePosition,vNormal);

            }
            gl_FragColor = finalColor;
        
        }
        
`



//const phongLight = new Program(gl,vsPhongSource,fsPhongSource)

