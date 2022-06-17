const scemoVSSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTextureCoord;
    
    //Normal correction matrix
    uniform mat4 uInvTransGeoMatrix;
    uniform mat4 uM;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjMatrix;
    
    varying vec4 vPositionW;
    varying highp vec2 vTextureCoord;
    varying vec3 vNormal;

    void main(void) {
      gl_Position = uProjMatrix * uViewMatrix * uM * vec4(aPosition,1.0);
      vPositionW = 
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
        
        uniform sampler2D uDiffuseColor; // Texture
        uniform sampler2D uNormalMap; //Height map

        //Position in world space
        varying vec4 vPositionC;
        //exiting normal (which needs to be corrected by uInvTransGeoMatrix)
        varying vec3 vNormal;
        //interpol. texture
        varying highp vec2 vTextureCoord;
        
        void main(void){
            //Point in camera space just in case we need it
            vPositionC =  uM * vec4(aPosition,1.0);
           
            gl_Position = uProjMatrix * uViewMatrix * vPositionC;
            
            //Correcting normal before having it interpolated for the fragment
            vNormal = (uInvTransGeoMatrix * vec4(aNormal,1.0)).xyz;
            vTextureCoord = aTextureCoord;
            
        }
        `
const fsShaderBase  = `
        precision highp float;
        
        //Position in camera space on the object right now (interpolated)
        varying vec4 vPositionC;
        
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
        
        //How many point lights
        uniform int N_POINTLIGHTS;
        
        //How many spotlights
        uniform int N_SPOTLIGHTS; 
        
        struct DirectionalLight{
            //Uniform
            float diffuseInt;
            float ambientInt;
            vec3 color;
            vec3 direction;
            //Not uniform
            vec4 specular;
            vec4 ambient;
            vec4 diffuse;
        };
        
         struct PointLight{
            //Uniform
            float diffuseInt;
            float ambientInt;
            vec3 color;
            vec3 position;
            float Kq;
            float Kl;
            
            //Not uniform
            vec4 specular;
            vec4 ambient;
            vec4 diffuse;
        };
        
        struct SpotLight{
            //Uniform
            float diffuseInt;
            float ambientInt;
            vec3 color;
            vec3 position;
            vec3 direction;
            float Kq;
            float Kl;
            float cutoff;

            //Not uniform
            vec4 specular;
            vec4 ambient;
            vec4 diffuse;
        };
        
        uniform sampler2D uDiffuseColor; // Texture
        uniform sampler2D uNormalMap; //Height map
        
        
        //Luke skywalker
        uniform DirectionalLight sun[1];
        //Point lights
        uniform PointLight pointLightArray[10];
        //Spotlight
        uniform SpotLight spotLightArray[10];
        
        vec4 CalcDirectionalLight(DirectionalLight light,vec3 cameraPos,vec3 normal,vec3 fragCoord){
            vec3 normalizedNormal = normalize(normal);
            vec4 ambientColor = vec4(light.color * light.ambientInt,1.0) * texture2D(uDiffuseColor,vTextureCoord);
            vec4 diffuseColor = vec4(light.color * light.diffuseInt,1.0) * texture2D(uDiffuseColor,vTextureCoord) * max(0.0,dot(normalizedNormal,normalize(-light.direction)));
            vec3 viewDirection = normalize(cameraPos - fragCoord);
            //Half way vector
            vec3 H = normalize(normalize(-light.direction) + normalize(viewDirection));
            vec4 specularColor = pow(max(0.0,dot(H,normalizedNormal)), 64.)  * texture2D(uDiffuseColor,vTextureCoord) * vec4(light.color,1.0);
            light.ambient = ambientColor;
            light.diffuse = diffuseColor;
            light.specular = specularColor;
            return light.ambient + light.specular + light.diffuse;
        }
        vec4 CalcPointLight(PointLight light,vec3 cameraPos,vec3 normal,vec3 fragPos){
            vec3 normalizedNormal = normalize(normal);
            vec3 rayDirection = normalize(light.position - fragPos);
            vec3 distanceVector = fragPos - light.position;
            float distance = length(distanceVector);
            vec3 viewDirection = normalize(fragPos - cameraPos);
            float attenuationFactor = 1. / (1. + light.Kl * distance + light.Kq * pow(distance,2.));
            vec4 ambientComponent = vec4(light.color * light.ambientInt,1.0) * texture2D(uDiffuseColor,vTextureCoord);
            vec4 diffuseComponent = vec4(light.color * light.diffuseInt,1.0) * texture2D(uDiffuseColor,vTextureCoord) * max(0.0,dot(normalizedNormal,-rayDirection));
            //Half way vector
            vec3 H = normalize(normalize(-rayDirection) + normalize(viewDirection));
            vec4 specularComponent = pow(max(dot(normalizedNormal,H),0.0),1.) * texture2D(uDiffuseColor,vTextureCoord) * vec4(light.color,1.0);
            return (specularComponent + diffuseComponent + ambientComponent) * attenuationFactor;
        }
        vec4 CalcSpotLight(SpotLight light,vec3 cameraPos,vec3 normal,vec3 fragPos){
        //todo to correct
            //Theta is the cosine between fragpos and light.direction
            float theta = dot(normalize(light.position - fragPos),normalize(-light.direction));
            vec3 normalizedNormal = normalize(normal);
            vec3 rayDirection = normalize(light.position - fragPos);
            if(theta > light.cutoff){
                vec3 distanceVector = fragPos - light.position;
                float distance = length(distanceVector);
                vec3 viewDirection = normalize(fragPos - cameraPos);
                float attenuationFactor = 1. / (1. + light.Kl * distance + light.Kq * pow(distance,2.));
                vec4 ambientComponent = vec4(light.color * light.ambientInt,1.0) * texture2D(uDiffuseColor,vTextureCoord);
                vec4 diffuseComponent = vec4(light.color * light.diffuseInt,1.0) * texture2D(uDiffuseColor,vTextureCoord) * max(0.0,dot(normalizedNormal,-rayDirection));
                //Half way vector
                vec3 H = normalize(normalize(-rayDirection) + normalize(viewDirection));
                vec4 specularComponent = pow(max(dot(normalizedNormal,H),0.0),1.) * texture2D(uDiffuseColor,vTextureCoord) * vec4(light.color,1.0);
                return (specularComponent + diffuseComponent + ambientComponent) * attenuationFactor;
            }
            return vec4(0.0);//vec4(light.color * light.diffuseInt,1.0) * texture2D(uDiffuseColor,vTextureCoord) * max(0.0,dot(normalizedNormal,-rayDirection));
        }
        
        void main(void){
            vec4 finalColor = vec4(0.0,0.0,0.0,1.0);//texture2D(uDiffuseColor,vTextureCoord);
            int dirLightCounter = int(N_DIRLIGHTS);
            int posLightCounter = int(N_POINTLIGHTS);
            int spotLightCounter = int(N_SPOTLIGHTS);
            for(int i = 0; i < 64; i++){
                //Height map code
                vec3 normal = texture2D(uNormalMap,vTextureCoord).rgb * vec3(0.5) + vec3(0.5);
                if(i < posLightCounter){
                    finalColor += CalcPointLight(pointLightArray[i],uEyePosition,vNormal,vPositionC.xyz);
                }
                if(i < dirLightCounter){
                    finalColor += CalcDirectionalLight(sun[i],uEyePosition,vNormal,vPositionC.xyz);
                }
                if(i < spotLightCounter){
                    finalColor += CalcSpotLight(spotLightArray[i],uEyePosition,vNormal,vPositionC.xyz);
                }
            }
            gl_FragColor = finalColor;
        
        }
        
`



//const phongLight = new Program(gl,vsPhongSource,fsPhongSource)

