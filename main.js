const handler = new Input()
const scemoShader = new Shader(gl,vsShaderBaseline,fsShaderBase,"normalShader")
const outliningShader = new Shader(gl,vsOutline,fsOutline,"outlineShader")
const shapeCube = new Element("cube",
    cube.vertices[0].values,
    cube.vertices[0].values,
    cube.connectivity[0].indices,
    cube.vertices[2].values,"TRIANGLES")
const shapeCrate = new Element("crate",crateWTexture.vertices[0].values,
    crateWTexture.vertices[1].values,crateWTexture.connectivity[0].indices,crateWTexture.vertices[3].values,Element.ElementType.SHAPE,"TRIANGLES")
const shapeSphere = new Element("sphere",sphere.vertices[0].values, sphere.vertices[1].values,sphere.connectivity[0].indices,generateTexCoords(sphere.vertices[0].values.length),Element.ElementType.SHAPE,"TRIANGLES")
const shapeQuad = new Element("quad",cube.vertices[0].values,
    cube.vertices[0].values,
    cube.connectivity[0].indices,
    cube.vertices[2].values,Element.ElementType.SHAPE,"TRIANGLES")
const shapQuad = new Element("rightQuad",[-1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, 1],
    [0,1,0,0,1,0,0,1,0,0,1,0],
    [0, 2, 1, 1, 2, 3],
    [0, 0, 0, 1, 1, 0, 1, 1],Element.ElementType.SHAPE,"TRIANGLES")
const teaPot = new Element("teapot",teapot.vertices[0].values,teapot.vertices[1].values,teapot.connectivity[0].indices,generateTexCoords(teapot.vertices[0].values.length),Element.ElementType.SHAPE,"TRIANGLES")

function setupContextProjAndCamera(){
    //per il momento bisogna far cosi'
    //perche' per il momento il contesto e' uno solo
    var context = scemoShader.getContext()
    Texture.loadTexture(scemoShader,"texture/heightmaps/brickheight.jpg")
    Texture.loadTexture(scemoShader,"texture/bricks.jpg")

    scemoShader.loadElement(shapQuad)
    scemoShader.loadElement(teaPot)
    scemoShader.contextSetup(() =>{
        var GL = scemoShader.getContext()
        GL.enable(GL.DEPTH_TEST)
        GL.enable(GL.STENCIL_TEST)
        GL.clearColor(0,0,0,0.8)
    })
    projectionMatrix = glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14/4,1300/720,0.15,200)
    camera = new Camera([0,1,3])
}
function normalSetUniform(){
    scemoShader.setMatrixUniform("uProjMatrix",projectionMatrix)
    scemoShader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
    scemoShader.setVectorUniform("uEyePosition",camera.getCameraPosition())
    //console.log(camera.getCameraPosition())
    DirectionalLight.bindLights(scemoShader)
    DirectionalLight.loadLights(scemoShader)
}
function useNormalShader(){
    scemoShader.useProgram(() => {
        //console.log("here")
        scemoShader.gl.enableVertexAttribArray(scemoShader["aPosition"])
        scemoShader.gl.enableVertexAttribArray(scemoShader["aNormal"])
        scemoShader.gl.enableVertexAttribArray(scemoShader["aTextureCoord"])
        scemoShader.gl.enableVertexAttribArray(scemoShader["aTangent"])
    })
}
function normalPass(){
    useNormalShader()
    camera.processInput(handler)
    normalSetUniform()
    return scemoShader
}
function outlineSetUniform(){
    outliningShader.setMatrixUniform("uProjMatrix",projectionMatrix)
    outliningShader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
    outliningShader.setVectorUniform("uEyePosition",camera.getCameraPosition())
}
function useOutlineShader(){
    outliningShader.useProgram(() =>{
        outliningShader.gl.enableVertexAttribArray(outliningShader["aPosition"])
        outliningShader.gl.enableVertexAttribArray(outliningShader["aNormal"])
        outliningShader.gl.enableVertexAttribArray(outliningShader["aTextureCoord"])
        outliningShader.gl.enableVertexAttribArray(outliningShader["aTangent"])
    })
}
function outlinePass(){
    var normalShader = normalPass()
    var GL = outliningShader.getContext()
    GL.stencilOp(GL.KEEP,GL.KEEP,GL.REPLACE)
    Node.CalcDraw(tea,normalShader)
    Node.CalcDraw(aet,normalShader)



}

randomCounter = 0
randomFlag = true
function drawLoop(){
    scemoShader.gl.clear(gl.COLOR_BUFFER_BIT,gl.DEPTH_BUFFER_BIT,gl.STENCIL_BUFFER_BIT)
    outlinePass()
    window.requestAnimationFrame(drawLoop)
}
function room(){
    var brickMaterial = new Material("Brick","texture/bricks.jpg","texture/heightmaps/brickheight.jpg")
    var draw = new Drawable(shapQuad,brickMaterial)
    //draw.scale([,5,5])
    var no = new Node(draw)
    return no
}
function teapotNode(){
    var brickMaterial = new Material("Brick","texture/bricks.jpg","texture/heightmaps/brickheight.jpg")
    var draw = new Drawable(teaPot,brickMaterial)
    draw.lRotateBeta(gradToRad(180))
    var no = new Node(draw)
    return no

}
function teapotNode2(){
    var brickMaterial = new Material("Brick","texture/bricks.jpg","texture/heightmaps/brickheight.jpg")
    var draw = new Drawable(teaPot,brickMaterial)
    draw.lRotateAlpha(gradToRad(180))
    //draw.lRotateBeta(gradToRad(180))
    //draw.lRotateBeta(gradToRad(180))
    var no = new Node(draw)
    return no

}
function wall(){
    var brickMaterial = new Material("Brick","texture/bricks.jpg","texture/heightmaps/brickheight.jpg")
    var draw = new Drawable(shapQuad,brickMaterial)
    draw.translate([0,0,10])
    //draw.scale([3,3,3])
    draw.lRotateAlpha(gradToRad(30))
    return new Node(draw)
}
function main(){
    setupContextProjAndCamera()
    directionalLight = new DirectionalLight("lightDir",0.8,0.5,[0,-1,0],[1,1,1])
    tea = teapotNode()
    aet = teapotNode2()
    drawLoop()
}
main()
