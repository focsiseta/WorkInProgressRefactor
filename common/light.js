/*
* Light code could be way more clean,but I don't want to spoil all the fun for other people*/
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
        this.defaultDirection = direction
        DirectionalLight.lightKeeper.push(this)
        DirectionalLight.counter++
    }
    getDirection(){
        this.update()
        var updatedMatrix = this.getFrame()
        this.direction = [updatedMatrix[8],updatedMatrix[9],updatedMatrix[10]]
//        this.direction = glMatrix.vec3.transformMat4(glMatrix.vec3.create(),this.defaultDirection,this.getTransformation())
        //console.log(this.direction)
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
    // since everyone uses Kc = 1, I will as well, so it's hardcoded into the shader
    static counter = 0.0
    static lightKeeper = []
    static Kc = 1.0
    //Default values taken from http://www.ogre3d.org/tikiwiki/tiki-index.php?page=-Point+Light+Attenuation
    constructor(id = "PointLight_"+PointLight.counter,diffuseInt,ambientInt,color,position,linearTerm = 0.0022,quadraticTerm = 0.0019) {
        super(id,diffuseInt,ambientInt,color);
        this.Kl = linearTerm
        this.Kq = quadraticTerm
        this.translate(position)
        var updatedMatrix = this.getTransformation()
        this.position = [updatedMatrix[12],updatedMatrix[13],updatedMatrix[14]]
        this.defaultPosition = position
        this.uniformID = "pointLightArray[" + PointLight.counter + "]"
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
        this.position = glMatrix.vec3.transformMat4(this.position,this.defaultPosition,this.frame)
    }
    static updateLights(shader){
        for(let i = 0;i < PointLight.counter;i++) {
            shader.setVectorUniform("pointLightArray[" + i + "].position",PointLight.lightKeeper[i].getPosition())
        }
    }
    updateLight(shader){
        this.update()
        shader.setVectorUniform(this.uniformID + ".position",this.getPosition())
    }


    getPosition(){
        this.updatePosition()
        return this.position
    }
    getKq(){
        return this.Kq
    }
    getKl(){
        return this.Kl
    }
}
//Basically point lights with cutoff angle
class SpotLight extends Light{
    static counter = 0
    static lightKeeper = []
    constructor(id = "SpotLight_"+SpotLight.counter,diffuseInt,ambientInt,color,position,direction,cutoffAngle = 150,linearTerm = 0.0022,quadraticTerm = 0.0019){
        super(id,diffuseInt,ambientInt,color);
        this.translate(position)
        var updatedMatrix = this.getTranslation()
        this.position = [updatedMatrix[12],updatedMatrix[13],updatedMatrix[14]]
        this.defaultPosition = position
        this.defaultDirection = direction
        this.cutoffAngle = cutoffAngle
        this.Kl = linearTerm
        this.Kq = quadraticTerm
        this.direction = direction
        this.uniformID = "spotLightArray[" + SpotLight.counter + "]"
        SpotLight.counter++
        SpotLight.lightKeeper.push(this)
    }
    static bindLights(shader){
        shader.setUniform1Int("N_SPOTLIGHTS",SpotLight.counter)
        for(let i = 0;i < SpotLight.counter;i++) {
            shader.bindUniform("spotLightArray[" + i + "].diffuseInt")
            shader.bindUniform("spotLightArray[" + i + "].ambientInt")
            shader.bindUniform("spotLightArray[" + i + "].color")
            shader.bindUniform("spotLightArray[" + i + "].position")
            shader.bindUniform("spotLightArray[" + i + "].Kq")
            shader.bindUniform("spotLightArray[" + i + "].Kl")
            shader.bindUniform("spotLightArray[" + i + "].cutoff")
            shader.bindUniform("spotLightArray[" + i + "].direction")


        }
    }
    static loadLights(shader){
        /*  struct SpotLight{
            //Uniform
            float diffuseInt;
            float ambientInt;
            vec3 color;
            vec3 position;
            float Kq;
            float Kl;
            float cutoff;

            //Not uniform
            vec4 specular;
            vec4 ambient;
            vec4 diffuse;
            }
        */

        for(let i = 0;i < SpotLight.counter;i++) {
            shader.setUniform1Float("spotLightArray[" + i + "].diffuseInt",this.lightKeeper[i].getDiffuseInt())
            shader.setUniform1Float("spotLightArray[" + i + "].ambientInt",this.lightKeeper[i].getAmbientInt())
            shader.setVectorUniform("spotLightArray[" + i + "].color",this.lightKeeper[i].getColor())
            shader.setVectorUniform("spotLightArray[" + i + "].position",this.lightKeeper[i].getPosition())
            shader.setUniform1Float("spotLightArray[" + i + "].Kq",this.lightKeeper[i].getKq())
            shader.setUniform1Float("spotLightArray[" + i + "].Kl",this.lightKeeper[i].getKl())
            shader.setUniform1Float("spotLightArray[" + i + "].cutoff",this.lightKeeper[i].getCutoff())
            shader.setVectorUniform("spotLightArray[" + i + "].direction",this.lightKeeper[i].getDirection())

        }

    }
    getPosition(){
        this.updatePosition()
        return this.position
    }
    getKq(){
        return this.Kq
    }
    setCutoff(angle){
        this.cutoffAngle = angle
    }
    getKl(){
        return this.Kl
    }
    getCutoff(){
        return Math.cos(gradToRad(this.cutoffAngle))
    }
    getDirection(){
        this.updateDirection()
        return this.direction
    }
    updatePosition(){
        this.position = glMatrix.vec3.transformMat4(this.position,this.defaultPosition,this.getTranslation())
    }
    updateDirection(){
        //var matrix = this.getFatherFrame()
        //SpotLight.deltaDirection = glMatrix.vec3.subtract(SpotLight.deltaDirection,this.direction,this.defaultDirection)
        this.update()
//        this.direction = glMatrix.vec3.transformMat4(this.direction,this.defaultDirection,this.getTransformation())
        //glMatrix.vec3.normalize(this.direction,this.direction)
        //console.log(this.direction)
        //console.log(this.frame)
        var matrix = this.getFrame()
        this.direction = [matrix[8],matrix[9],matrix[10]]
        //glMatrix.vec3.normalize(this.direction,this.direction)
        //console.log(this.direction)


    }
    static updateLights(shader){
        for(let i = 0;i < SpotLight.counter;i++) {
            SpotLight.lightKeeper[i].update()
            shader.setUniform1Float("spotLightArray[" + i + "].cutoff",this.lightKeeper[i].getCutoff())
            shader.setVectorUniform("spotLightArray[" + i + "].position",SpotLight.lightKeeper[i].getPosition())
            shader.setVectorUniform("spotLightArray[" + i + "].direction",SpotLight.lightKeeper[i].getDirection())

        }
    }
    updateLight(shader){
        this.update()
        shader.setUniform1Float(this.uniformID + ".cutoff",this.getCutoff())
        shader.setVectorUniform(this.uniformID + ".position",this.getPosition())
        shader.setVectorUniform(this.uniformID + ".direction",this.getDirection())
    }
}