class Light{
    constructor(type = "Local",diffuseInt,ambientInt,color) {
        this.type = type
        this.diffuseIntensity = diffuseInt
        this.ambientIntensity = ambientInt
        this.color = color
    }

    getType(){
        return this.type
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
        shader.setUniform1Float("N_DIRLIGHTS",DirectionalLight.counter)
        for(let i = 0;i < DirectionalLight.counter;i++){
            shader.setUniform1Float("sun["+i+"].diffuseInt",DirectionalLight.lightKeeper[i].getDiffuseInt())
            shader.setUniform1Float("sun["+i+"].ambientInt",DirectionalLight.lightKeeper[i].getAmbientInt())
            shader.setVectorUniform("sun["+i+"].color",DirectionalLight.lightKeeper[i].getColor())
            shader.setVectorUniform("sun["+i+"].direction",DirectionalLight.lightKeeper[i].getDirection())
            //console.log(shader.getUniformValue("sun["+i+"].specular"))
        }

    }



}
