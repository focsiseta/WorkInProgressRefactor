class Texture{
    static textureCounter = 0

    //Just throw a hashmap at the problem and all will be fine

    static pathToTexture = new Map()
    static textureToBuffer = new Map()

    static loadTexture(shader,path){
        if(Texture.textureCounter > 16){
            //Code to deallocate textures here
            return
        }
        var context = shader.getContext()
        var textureBuffer = context.createTexture()
        var thisTexture = context.TEXTURE0+Texture.textureCounter
        context.activeTexture(thisTexture)
        const image = new Image()
        image.onload = function(){
            context.bindTexture(context.TEXTURE_2D,textureBuffer)
            context.texImage2D(context.TEXTURE_2D,0,context.RGBA,context.RGBA,context.UNSIGNED_BYTE,image)
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                context.generateMipmap(context.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn off mips and set
                // wrapping to clamp to edge
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
            }
        }
        image.src = path
        Texture.pathToTexture.set(path,thisTexture)
        Texture.textureToBuffer.set(thisTexture,textureBuffer)
        Texture.textureCounter++
    }
    static getTextureBuffer(path){
        return Texture.textureToBuffer.get(Texture.pathToTexture.get(path))
    }
    static getTexture(path){
        return Texture.pathToTexture.get(path)
    }
}

class Material{
    static materialCounter = 0
    constructor(id = "Material_"+Material.materialCounter,diffuseTexturePath,heightMapPath = "None"){
        Material.materialCounter++
        this.id = id
        this.diffusePath = diffuseTexturePath
        this.heightPath = heightMapPath
    }
    getId(){
        return this.id
    }
    activateMaterial(shader){
        //We take for granted that everything will have a diffuseTexture a.k.a color of the object
        //Because ambientTexture it's usually the same
        var context = shader.getContext()
        if(this.heightPath !== "None"){
            var heightBuffer = Texture.getTextureBuffer(this.heightPath)
            var heightTexture = Texture.getTexture(this.heightPath)
            context.activeTexture(heightTexture)
            context.bindTexture(context.TEXTURE_2D,heightBuffer)
            shader.setUniform1Int("uNormalMap",heightTexture - context.TEXTURE0)
        }
        var diffuseBuffer = Texture.getTextureBuffer(this.diffusePath)
        var diffuseTexture = Texture.getTexture(this.diffusePath)
        context.activeTexture(diffuseTexture)
        context.bindTexture(context.TEXTURE_2D,diffuseBuffer)
        shader.setUniform1Int("uDiffuseColor",diffuseTexture - context.TEXTURE0)
    }



}