const handler = new Input()
const scemoShader = new Shader(gl,vsShaderBaseline,fsShaderBase)
const shapeCube = new Element("cube",
    cube.vertices[0].values,
    cube.vertices[1].values,
    cube.connectivity[0].indices,
    generateTexCoords(cube.vertices[0].values.length),Element.ElementType.SHAPE,"TRIANGLES")
const shapeCrate = new Element("crate",crateWTexture.vertices[0].values,
    crateWTexture.vertices[1].values,crateWTexture.connectivity[0].indices,crateWTexture.vertices[3].values,Element.ElementType.SHAPE,"TRIANGLES")

function setup(shader){
    var camera = new Camera([0,0,5])
    var projMatrix = glMatrix.mat4.create()
    glMatrix.mat4.perspective(projMatrix,3.14/4,1300/720,0.15,50)
    shader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
    shader.setMatrixUniform("uProjMatrix",projMatrix)
    shader.contextSetup()
    return camera
}

function createScene(shader){
    shader.loadTexture("texture/textureBox.png")
    shader.loadElement(shapeCube)
    shader.loadElement(shapeCrate)
    var directional = new DirectionalLight("Test",0.7,0.3,[-1,0,0],[1,1,1])

    DirectionalLight.bindLights(shader)
    DirectionalLight.loadLights(shader)
    var aaa = new sceneNode(new Drawable(Transformations.gimbalT.XYZ,shapeCube))
    var node = aaa
    for(var i = 1;i < 60;i++){
        var d = new Drawable(Transformations.gimbalT.XYZ,shapeCrate)
        d.translate([0,0,-i*5])
        d.lRotateBeta(Math.random())
        d.lRotateAlpha(Math.random())
        node = node.addSon(d)
    }
    node.drawab.lRotateAlpha(80)

    return aaa
}

function drawEl(){
    //oof.drawab.lRotateBeta(0.01)
    //oof.element.lRotateAlpha(0.001)
    cam.processInput(handler)
    scemoShader.setMatrixUniform("uViewMatrix",cam.getViewMatrix())
    scemoShader.setVectorUniform('uEyePosition',cam.getCameraPosition())
    oof.calcSceneDraw(scemoShader)
    window.requestAnimationFrame(drawEl)

}

cam = setup(scemoShader)
oof = createScene(scemoShader)
//drawEl()
window.requestAnimationFrame(drawEl)
