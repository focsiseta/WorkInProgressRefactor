class Material{
    static materialCounter = 0
    constructor(id = "Material_"+Material.materialCounter) {
        Material.materialCounter++
        this.id = id
        this.counter = 0
        this.textureTable = new Map()
    }
    loadTexture(shader,path){
        this.textureTable.set(shader.getContext().TEXTURE0+this.counter,shader.getContext().createTexture())
        var thisTexture = shader.getContext().TEXTURE0+this.counter
        var context = shader.getContext()
        const image = new Image()
        image.onload = function(){
            context.bindTexture(context.TEXTURE_2D,thisTexture)
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
        this.counter++


    }


}