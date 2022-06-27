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
        //tangent
        attribute vec3 aTangent;
        //bitangent
        attribute vec3 aBitangent;
        
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
        
        varying mat3 TBN;
        
        void main(void){
            //Point in camera space just in case we need it
            vPositionC =  uM * vec4(aPosition,1.0);
            vPositionC =  vPositionC / vPositionC.w;
           
            gl_Position = uProjMatrix * uViewMatrix * vPositionC;
            
            //Correcting normal before having it interpolated for the fragment
            vNormal = (uInvTransGeoMatrix * vec4(aNormal,0.0)).xyz;
            vTextureCoord = aTextureCoord;
            vec3 T = normalize(vec3(uViewMatrix * vec4(aTangent,0.0)));
            vec3 B = normalize(vec3(uViewMatrix * vec4(cross(aTangent,aNormal),0.0)));
            vec3 N = normalize(vec3(uViewMatrix * vec4(aNormal,0.0)));
            TBN = mat3(T,B,N);
            
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
         //Interpolated TBN
         varying mat3 TBN;
        
        
        //Camera position
        uniform vec3 uEyePosition;
        //Camera direction
        uniform vec3 uEyeDirection;
        
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
        uniform DirectionalLight sun[2];
        //Point lights
        uniform PointLight pointLightArray[10];
        //Spotlight
        uniform SpotLight spotLightArray[10];
        
        vec4 CalcDirectionalLight(DirectionalLight light,vec3 cameraPosition,vec3 normal,vec3 fragCoord){
            vec3 normalizedNormal = normalize(normal);
            vec4 ambientColor = vec4(light.color * light.ambientInt,1.0) * texture2D(uDiffuseColor,vTextureCoord);
            vec4 diffuseColor = vec4(light.color * light.diffuseInt,1.0) * texture2D(uDiffuseColor,vTextureCoord) * max(0.3,dot(normalizedNormal,normalize(-light.direction)));
            vec3 viewDirection = normalize(cameraPosition - fragCoord);
            //Half way vector
            vec3 H = normalize(-light.direction + viewDirection);
            vec4 specularColor = pow(max(0.1,dot(normalizedNormal,H)), 64.)  * texture2D(uDiffuseColor,vTextureCoord) * vec4(light.color,1.0);
            light.ambient = ambientColor;
            light.diffuse = diffuseColor;
            light.specular = specularColor;
            return light.ambient + light.specular + light.diffuse;
            //return vec4(light.direction,1.0);
        }
        vec4 CalcPointLight(PointLight light,vec3 cameraPos,vec3 normal,vec3 fragPos){
            vec3 normalizedNormal = normalize(normal);
            vec3 rayDirection = normalize(fragPos - light.position);
            vec3 distanceVector = fragPos - light.position;
            float distance = length(distanceVector);
            vec3 viewDirection = normalize(fragPos - cameraPos);
            float attenuationFactor = 1. / (1. + light.Kl * distance + light.Kq * pow(distance,2.));
            vec4 ambientComponent = vec4(light.color * light.ambientInt,1.0) * texture2D(uDiffuseColor,vTextureCoord);
            vec4 diffuseComponent = vec4(light.color * light.diffuseInt,1.0) * texture2D(uDiffuseColor,vTextureCoord) * max(0.0,dot(normalizedNormal,-rayDirection));
            //Half way vector
            vec3 H = normalize(normalize(rayDirection) + normalize(viewDirection));
            vec4 specularComponent = pow(max(dot(normalizedNormal,H),0.0),1.) * texture2D(uDiffuseColor,vTextureCoord) * vec4(light.color,1.0);
            return (specularComponent + diffuseComponent + ambientComponent) * attenuationFactor;
        }
         vec4 CalcSpotLight(SpotLight light,vec3 cameraPos,vec3 normal,vec3 fragPos){
            //Theta is the cosine between fragpos and light.direction
            vec3 LightDirection = normalize(-light.direction);
            float theta = dot(normalize(light.position - fragPos) , LightDirection);
            vec3 normalizedNormal = normalize(normal);
           
            if(theta < light.cutoff){
                vec3 distanceVector = light.position - fragPos;
                float dist = length(distanceVector);
                vec3 viewDirection = normalize(fragPos - cameraPos);
                float attenuation = 1. / (1. + light.Kl * dist + light.Kq * pow(dist,2.));
                float attenuationFactor = min(attenuation,1.0);
                vec4 ambientComponent = vec4(light.color * light.ambientInt,1.0) * texture2D(uDiffuseColor,vTextureCoord);
                vec4 diffuseComponent = vec4(light.color * light.diffuseInt,1.0) * texture2D(uDiffuseColor,vTextureCoord) * max(0.0,dot(normalizedNormal,LightDirection));
                //Half way vector
                vec3 H = normalize(normalize(LightDirection) + normalize(viewDirection));
                vec4 specularComponent = pow(max(dot(normalizedNormal,H),0.1),1.) * texture2D(uDiffuseColor,vTextureCoord) * vec4(light.color,1.0);
                attenuationFactor = attenuationFactor >= 0.01 ? attenuationFactor : 0.0;
                return ((specularComponent+ambientComponent+diffuseComponent) * attenuationFactor);
            }
            return vec4(0.0);
        }
        
        void main(void){
            vec4 finalColor = vec4(0.0,0.0,0.0,1.0);//texture2D(uDiffuseColor,vTextureCoord);
            int dirLightCounter = int(N_DIRLIGHTS);
            int posLightCounter = int(N_POINTLIGHTS);
            int spotLightCounter = int(N_SPOTLIGHTS);
            vec3 normal = texture2D(uNormalMap,vTextureCoord).xyz;
            normal = (normal * 2.0) - vec3(1.0);
            normal = normalize(TBN * normal);
            vec3 finalNormal = normal.x > 0.0 || normal.y > 0.0 || normal.z > 0.0 ? normal + vNormal : vNormal;
            for(int i = 0; i < 64; i++){
                //Height map code
                if(i < posLightCounter){
                    finalColor += CalcPointLight(pointLightArray[i],uEyePosition,finalNormal,vPositionC.xyz);
                }
                if(i < dirLightCounter){
                    finalColor += CalcDirectionalLight(sun[i],uEyePosition,finalNormal,vPositionC.xyz);
                }
                if(i < spotLightCounter){
                    finalColor += CalcSpotLight(spotLightArray[i],uEyePosition,finalNormal,vPositionC.xyz);
                }
            }
            if(finalColor.x <= 0.0 && finalColor.y <= 0.0 && finalColor.z <= 0.0){
            
                //finalColor = vec4(1.0,0.0,0.0,1.0);
                
            }
            gl_FragColor = finalColor;
        
        }
        
`



//const phongLight = new Program(gl,vsPhongSource,fsPhongSource)

