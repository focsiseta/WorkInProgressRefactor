class Light extends Transformations{
    constructor(type = "Local",diffuseInt,ambientInt,color) {
        super(Transformations.gimbalT.XYZ)
        this.name = type
        this.diffuseIntensity = diffuseInt
        this.ambientIntensity = ambientInt
        this.color = color
    }

    getType(){
        return this.name
    }
    getDiffuseInt(){
        return this.diffuseIntensity
    }
    getAmbientInt(){
        return this.ambientIntensity
    }
    getColor(){
        return this.color
    }
}

class DirectionalLight extends Light{
    static counter = 0
    static lightKeeper = []
    constructor(name = "Directional_" + DirectionalLight.counter,diffuseInt,ambientInt,direction,color) {
        super(name,diffuseInt,ambientInt,color)
        this.direction = direction
        DirectionalLight.lightKeeper.push(this)
        DirectionalLight.counter++
    }
    getDirection(){
        return this.direction
    }
    static getLightCounter(){
        return DirectionalLight.counter
    }
    static bindLights(shader){
        for(let i = 0;i < DirectionalLight.counter;i++) {
            shader.bindUniform("sun[" + i + "].diffuseInt")
            shader.bindUniform("sun[" + i + "].ambientInt")
            shader.bindUniform("sun[" + i + "].color")
            shader.bindUniform("sun[" + i + "].direction")
        }

    }
    static loadLights(shader){
        /*        struct DirectionalLight{
                float diffuseInt; //uniform
                float ambientInt; //uniform
                vec3 color; //uniform

                vec3 specular; //calc
                vec3 ambient; //calc
                vec3 diffuse; //calc
                vec3 direction; //uniform
            }
        */
        shader.setUniform1Int("N_DIRLIGHTS",DirectionalLight.counter)
        for(let i = 0;i < DirectionalLight.counter;i++){
            shader.setUniform1Float("sun["+i+"].diffuseInt",DirectionalLight.lightKeeper[i].getDiffuseInt())
            shader.setUniform1Float("sun["+i+"].ambientInt",DirectionalLight.lightKeeper[i].getAmbientInt())
            shader.setVectorUniform("sun["+i+"].color",DirectionalLight.lightKeeper[i].getColor())
            shader.setVectorUniform("sun["+i+"].direction",DirectionalLight.lightKeeper[i].getDirection())
            //console.log(shader.getUniformValue("sun["+i+"].specular"))
        }

    }
}




class PointLight extends Light{
    /*
    * Attenuation Function :
    *   1/(Kc + Kl * d + Kq * d^2)
    *
    * */
    //The attenuation function needs 2 params and usually a linear constant
    // since everyone uses Kc = 1, I will as well
    static counter = 0.0
    static lightKeeper = []
    static Kc = 1.0
    //Default values taken from http://www.ogre3d.org/tikiwiki/tiki-index.php?page=-Point+Light+Attenuation
    constructor(id = "PointLight_"+PointLight.counter,diffuseInt,ambientInt,color,position,linearTerm = 0.0022,quadraticTerm = 0.0019) {
        super(id,diffuseInt,ambientInt,color);
        this.Kl = linearTerm
        this.Kq = quadraticTerm
        this.translate(position)
        this.position = [this.transformationMatrix[12],this.transformationMatrix[13],this.transformationMatrix[14]]
        PointLight.counter++
        PointLight.lightKeeper.push(this)
    }
    static bindLights(shader){
        shader.setUniform1Int("N_POINTLIGHTS",PointLight.counter)
        for(let i = 0;i < PointLight.counter;i++) {
            shader.bindUniform("pointLightArray[" + i + "].diffuseInt")
            shader.bindUniform("pointLightArray[" + i + "].ambientInt")
            shader.bindUniform("pointLightArray[" + i + "].color")
            shader.bindUniform("pointLightArray[" + i + "].position")
            shader.bindUniform("pointLightArray[" + i + "].Kq")
            shader.bindUniform("pointLightArray[" + i + "].Kl")
        }
    }
    static loadLights(shader){
        /*  struct PointLight{
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
            }
        */
        for(let i = 0;i < PointLight.counter;i++) {
            shader.setUniform1Float("pointLightArray[" + i + "].diffuseInt",this.lightKeeper[i].getDiffuseInt())
            shader.setUniform1Float("pointLightArray[" + i + "].ambientInt",this.lightKeeper[i].getAmbientInt())
            shader.setVectorUniform("pointLightArray[" + i + "].color",this.lightKeeper[i].getColor())
            shader.setVectorUniform("pointLightArray[" + i + "].position",this.lightKeeper[i].getPosition())
            shader.setUniform1Float("pointLightArray[" + i + "].Kq",this.lightKeeper[i].getKq())
            shader.setUniform1Float("pointLightArray[" + i + "].Kl",this.lightKeeper[i].getKl())
        }
    }
    updatePosition(){
        var updatedMatrix = this.getTransformation()
        this.position = [updatedMatrix[12],updatedMatrix[13],updatedMatrix[14]]
    }
    static updateLights(shader){
        for(let i = 0;i < PointLight.counter;i++) {
            shader.setVectorUniform("pointLightArray[" + i + "].position",PointLight.lightKeeper[i].getPosition())
        }
    }


    getPosition(){
        return this.position
    }
    getKq(){
        return this.Kq
    }
    getKl(){
        return this.Kl
    }



}