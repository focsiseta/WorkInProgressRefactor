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
        varying vec3 vPositionW;
        //exiting normal (which needs to be corrected by uInvTransGeoMatrix)
        varying vec3 vNormal;
        //interpol. texture
        varying highp vec2 vTextureCoord;
        
        void main(void){
            //Point in world space just in case we need it
            vPositionW = (uViewMatrix * uM * vec4(aPosition,1.0)).xyz;
            
            gl_Position = uProjMatrix * vec4(vPositionW,1.0);
            
            //Sending correct normal to fragment shader
            vNormal = (uInvTransGeoMatrix * vec4(aNormal,1.0)).xyz;
            vTextureCoord = aTextureCoord;
            
        }
        `
const fsShaderBase  = `
        precision highp float;
        
        //Position in world space on the object right now (interpolated)
        varying vec3 vPositionW;
        
        //exiting normal (which needs to be corrected by uInvTransGeoMatrix)
        //Corrected and interpolated normal
        varying vec3 vNormal;
        //Interpolated tex coordinates
         varying highp vec2 vTextureCoord;
        
        
        //Camera position
        uniform vec3 uEyePosition;
        
        //How many directional lights
        uniform float N_DIRLIGHTS;
        //We can have an offset for deciding which light is going to be rendered
        
        struct DirectionalLight{
            float diffuseInt;
            float ambientInt;
            vec3 color;
            
            vec3 specular;
            vec3 ambient;
            vec3 diffuse;
            vec3 direction;
        };
        
        uniform sampler2D uSampler; // Texture
        
        //33
        //Luke skywalker
        
        uniform DirectionalLight sun[10];
        
        vec3 CalcDirectionalLight(DirectionalLight light,vec3 cameraPos,vec3 normal){
            vec3 normalizedNormal = normalize(normal);
            vec3 ambientColor = (light.color * light.ambientInt) * texture2D(uSampler,vTextureCoord).xyz;
            vec3 diffuseColor = (light.color * light.diffuseInt) * texture2D(uSampler,vTextureCoord).xyz * max(0.0,dot(normalizedNormal,light.direction));
            vec3 H = normalize(-light.direction + normalize(cameraPos));
            vec3 specularColor = pow(max(0.5,dot(H,normalizedNormal)), 30.)  * texture2D(uSampler,vTextureCoord).xyz * light.color;
            light.ambient = ambientColor;
            light.diffuse = diffuseColor;
            light.specular = specularColor;
            return vec3(light.ambient + light.specular + light.diffuse);
        }
        void main(void){
            vec3 finalColor = texture2D(uSampler,vTextureCoord).xyz;
            int counter = int(N_DIRLIGHTS);
            for(int i = 0; i < 50; i++){
                if(i > counter){
                    break;
                }
                finalColor += CalcDirectionalLight(sun[i],uEyePosition,vNormal);

            }
            gl_FragColor = vec4(finalColor,1.0);
        
        }
        
`



//const phongLight = new Program(gl,vsPhongSource,fsPhongSource)

