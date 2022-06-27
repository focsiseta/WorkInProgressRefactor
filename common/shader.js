class Shader {
    static id_last_draw = ""
    static id_last_material = ""
    constructor(glContext, vsSource, fsSource) {
        //DEBUGGING
        this.vsLog = ""
        this.fsLog = ""
        this.uniLog = ""

        this.vsSource = vsSource
        this.fsSource = fsSource
        this.gl = glContext
        this.textureArray = []
        this.program = this.gl.createProgram()
        this.vertexShader = this.gl.createShader(gl.VERTEX_SHADER)
        this.fragmentShader = this.gl.createShader(gl.FRAGMENT_SHADER)
        this.gl.shaderSource(this.vertexShader, this.vsSource)
        this.gl.compileShader(this.vertexShader)
        //DEBUGGING
        this.vsLog = this.gl.getShaderInfoLog(this.vertexShader)
        this.gl.shaderSource(this.fragmentShader, this.fsSource)
        this.gl.compileShader(this.fragmentShader)
        //DEBUGGING
        this.fsLog = this.gl.getShaderInfoLog(this.fragmentShader)

        this.gl.attachShader(this.program, this.vertexShader)
        this.gl.attachShader(this.program, this.fragmentShader)

        this.gl.linkProgram(this.program)

        let [attributeArray, uniformArray] = Shader.parseShaders(this.vsSource, this.fsSource)
        this.attributes = attributeArray
        this.uniforms = uniformArray
        this.attributes.forEach((element, index) => {
            this.bindAttribute(element, index)
        })
        this.uniforms.forEach((element) => {
            this.bindUniform(element)
        })
        this.useProgram()
        //Todo automate
        this.gl.enableVertexAttribArray(this["aPosition"])
        this.gl.enableVertexAttribArray(this["aNormal"])
        this.gl.enableVertexAttribArray(this["aTextureCoord"])
        this.gl.enableVertexAttribArray(this["aTangent"])
    }
    contextSetup(){
        this.gl.enable(gl.CULL_FACE)
        this.gl.enable(gl.DEPTH_TEST)
        this.gl.clearColor(0.0,0.0,0.0,0.8)
        this.gl.clear(gl.COLOR_BUFFER_BIT,gl.DEPTH_BUFFER_BIT)
    }
    drawDrawable(toDraw){
        var context = this.gl
        if(!(Shader.id_last_material === toDraw.material.getId())){
            //Fix here for deactivating material
            toDraw.material.activateMaterial(this)
            Shader.id_last_material = toDraw.material.getId()
        }
        if(!(Shader.id_last_draw === toDraw.shape.id)) {
            context.bindBuffer(context.ARRAY_BUFFER, toDraw.shape.vBuffer)
            context.vertexAttribPointer(this["aPosition"],3,context.FLOAT,false,0,0)

            context.bindBuffer(context.ARRAY_BUFFER, toDraw.shape.nBuffer)
            context.vertexAttribPointer(this["aNormal"],3,context.FLOAT,false,0,0)

            context.bindBuffer(context.ARRAY_BUFFER,toDraw.shape.tBuffer)
            context.vertexAttribPointer(this["aTangent"],3,context.FLOAT,false,0,0)



            context.bindBuffer(context.ARRAY_BUFFER, toDraw.shape.texCoordBuffer)
            context.vertexAttribPointer(this["aTextureCoord"],2,context.FLOAT,false,0,0)
            context.bindBuffer(context.ELEMENT_ARRAY_BUFFER,toDraw.shape.iBuffer)

            Shader.id_last_draw = toDraw.shape.id
        }
        this.setMatrixUniform("uM",toDraw.frame)
        context.uniformMatrix4fv(this['uInvTransGeoMatrix'],false,toDraw.inverseTransposeMatrix)
        context.drawElements(context[toDraw.shape.drawType],toDraw.shape.indices.length,context.UNSIGNED_SHORT,0)

    }
    loadElement(toLoad){
        var context = this.gl
        //Normals
        toLoad.nBuffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER,toLoad.nBuffer)
        context.bufferData(context.ARRAY_BUFFER,toLoad.normals,context.STATIC_DRAW)
        context.bindBuffer(context.ARRAY_BUFFER,null)
        //Tangent
        toLoad.tBuffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER,toLoad.tBuffer)
        context.bufferData(context.ARRAY_BUFFER,toLoad.tangents,context.STATIC_DRAW)
        context.bindBuffer(context.ARRAY_BUFFER,null)
        //TexCoords
        toLoad.texCoordBuffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER,toLoad.texCoordBuffer)
        context.bufferData(context.ARRAY_BUFFER,toLoad.texCoords,context.STATIC_DRAW)
        context.bindBuffer(context.ARRAY_BUFFER,null)
        //Vertices
        toLoad.vBuffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER,toLoad.vBuffer)
        context.bufferData(context.ARRAY_BUFFER,toLoad.vertices,context.STATIC_DRAW)
        context.bindBuffer(context.ARRAY_BUFFER,null)
        //Indices
        toLoad.iBuffer = context.createBuffer()
        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER,toLoad.iBuffer)
        context.bufferData(context.ELEMENT_ARRAY_BUFFER,toLoad.indices,context.STATIC_DRAW)
        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER,null)
    }/*
    loadTexture(path){
        var context = this.gl
        var texture = context.createTexture()
        this.textureArray.push(texture)
       // context.bindTexture(context.TEXTURE_2D,texture)
        //Thanks to mozilla WebDev for code
        //context.texImage2D(context.TEXTURE_2D,0,context.RGBA,1,1,0,context.RGBA,context.UNSIGNED_BYTE,[0,0,255,255])
        const image = new Image()
        image.onload = function(){
            context.bindTexture(context.TEXTURE_2D,texture)
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
        //To remove
        context.activeTexture(context.TEXTURE0)
        context.bindTexture(context.TEXTURE_2D,this.textureArray[0])
        this.setUniform1Int("uSampler",0)
    }*/

    getContext(){
        return this.gl
    }

    bindAttribute(id, number) {
        this[id] = number
        this.gl.bindAttribLocation(this.program, this[id], id)
    }

    bindUniform(id) {
        this.uniforms.push(id) //Utilizzato per mettere i nomi degli uniform che non vengono parsati dentro lo shader, guarda sun in fsShaderBase
        this[id] = this.gl.getUniformLocation(this.program, id)
        if(this[id] == null){
            this.uniLog += `Error uniform id: ${id} does not exist`
        }
    }

    static parseShaders(vsSource, fsSource) {
        let attrParser = /(?<=attribute\s\w+\s)\w+(?=;)/g
        let unifParser = /(?<=uniform\s\w+\s)\w+(?=;)/g

        let attributes = vsSource.match(attrParser)
        let uniforms = vsSource.match(unifParser).concat(fsSource.match(unifParser))
        return [attributes, uniforms]
    }

    setMatrixUniform(uniformName, data, transpose=false){
        if(!this.hasOwnProperty(uniformName)){
            this.uniLog+=`Error: ${uniformName} does not exist|`
            return
        }
        this.gl.uniformMatrix4fv(this[uniformName], transpose, data)
    }

    setVectorUniform(uniformName, data){
        if(!this.hasOwnProperty(uniformName)){
            this.uniLog+=`Error: ${uniformName} does not exist|`
            return
        }
        this.gl.uniform3fv(this[uniformName],data)
    }
    getUniformValue(uniformName){
        return this.gl.getUniform(this.program,this[uniformName])
    }
    useProgram(){
        this.gl.useProgram(this.program)
    }
    setUniform1Float(uniformName,data){
        if(!this.hasOwnProperty(uniformName)){
            this.uniLog+=`Error: ${uniformName} does not exist|`
            return
        }
        this.gl.uniform1f(this[uniformName],data)
    }
    setUniform1Int(uniformName,data){
        if(!this.hasOwnProperty(uniformName)){
            this.uniLog+=`Error: ${uniformName} does not exist|`
            return
        }
        this.gl.uniform1i(this[uniformName],data)
    }
}