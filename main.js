const handler = new Input()
const scemoShader = new Shader(gl,vsShaderBaseline,fsShaderBase)
const shapeCube = new Element("cube",
    cube.vertices[0].values,
    cube.vertices[1].values,
    cube.connectivity[0].indices,
    generateTexCoords(cube.vertices[0].values.length),Element.ElementType.SHAPE,"TRIANGLES")
const shapeCrate = new Element("crate",crateWTexture.vertices[0].values,
    crateWTexture.vertices[1].values,crateWTexture.connectivity[0].indices,crateWTexture.vertices[3].values,Element.ElementType.SHAPE,"TRIANGLES")
const shapeSphere = new Element("sphere",sphere.vertices[0].values, sphere.vertices[1].values,sphere.connectivity[0].indices,generateTexCoords(sphere.vertices[0].values.length),Element.ElementType.SHAPE,"TRIANGLES")


function setup(shader){
    var camera = new Camera([0,0,50])
    var projMatrix = glMatrix.mat4.create()
    glMatrix.mat4.perspective(projMatrix,3.14/4,1300/720,0.15,1500)
    shader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
    shader.setMatrixUniform("uProjMatrix",projMatrix)
    shader.contextSetup()
    return camera
}

function createScene(shader){
    Texture.loadTexture(shader,"texture/bricks.jpg")
    Texture.loadTexture(shader,"texture/textureBox.png")
    Texture.loadTexture(shader, "texture/heightmaps/brickheight.jpg")
    var randomMaterial = new Material("random","texture/bricks.jpg","texture/heightmaps/brickheight.jpg")
    var boxMaterial = new Material("Brick","texture/textureBox.png")
    shapeCube.loadTexCoords(LazyUVMappingMatrix(shapeCube,1024,1024))
    shader.loadElement(shapeCube)
    shader.loadElement(shapeCrate)
    shader.loadElement(shapeSphere)
    //var textureHandler = new Texture()
    var directional = new DirectionalLight("Test",0.7,1,[-1,-1,0],[1,1,1])
    //directional.translate([0,0,0])
    DirectionalLight.bindLights(shader)
    DirectionalLight.loadLights(shader)
    var aaa = new sceneNode(new Drawable(Transformations.gimbalT.XYZ,shapeCube,randomMaterial))
    aaa.drawab.scale([10,10,10])
    var bbb = new sceneNode(new Drawable(Transformations.gimbalT.XYZ,shapeCube,boxMaterial))
    bbb.drawab.translate([2,0,0])
    aaa.addSubTree(bbb)

    //node.drawab.lRotateAlpha(80)

    return aaa
}

function drawEl(){
    //oof.drawab.lRotateGamma(0.01)
    //oof.drawab.wRotateZ(0.001)
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
