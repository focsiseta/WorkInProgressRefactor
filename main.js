const handler = new Input()
const scemoShader = new Shader(gl,vsShaderBaseline,fsShaderBase)
const shapeCube = new Element("cube",
    cube.vertices[0].values,
    cube.vertices[1].values,
    cube.connectivity[0].indices,
    cube.vertices[3].values,Element.ElementType.SHAPE,"TRIANGLES")
const shapeCrate = new Element("crate",crateWTexture.vertices[0].values,
    crateWTexture.vertices[1].values,crateWTexture.connectivity[0].indices,crateWTexture.vertices[3].values,Element.ElementType.SHAPE,"TRIANGLES")
const shapeSphere = new Element("sphere",sphere.vertices[0].values, sphere.vertices[1].values,sphere.connectivity[0].indices,generateTexCoords(sphere.vertices[0].values.length),Element.ElementType.SHAPE,"TRIANGLES")
const shapeQuad = new Element("quad",cube.vertices[0].values,
    cube.vertices[1].values,
    cube.connectivity[0].indices,
    cube.vertices[3].values,Element.ElementType.SHAPE,"TRIANGLES")
const shapQuad = new Element("rightQuad",[-1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, 1],
    [0,1,0,0,1,0,0,1,0,0,1,0],
    [0, 2, 1, 1, 2, 3],
    [0, 0, 0, 1, 1, 0, 1, 1],Element.ElementType.SHAPE,"TRIANGLES")
const teaPot = new Element("teapot",teapot.vertices[0].values,teapot.vertices[1].values,teapot.connectivity[0].indices,generateTexCoords(teapot.vertices[0].values.length),Element.ElementType.SHAPE,"TRIANGLES")
console.log(shapQuad.tangents)

function setup(shader){
    var camera = new Camera([0,5,5])
    var projMatrix = glMatrix.mat4.create()
    glMatrix.mat4.perspective(projMatrix,3.14/4,1300/720,0.15,1500)
    shader.setMatrixUniform("uViewMatrix",camera.getViewMatrix())
    shader.setMatrixUniform("uProjMatrix",projMatrix)
    shader.contextSetup()
    return camera
}

function createScene(shader){
    Texture.loadTexture(shader,"texture/heightmaps/step.jpg")
    Texture.loadTexture(shader,"texture/bricks.jpg")
    shader.loadElement(shapeCube)
    shader.loadElement(shapeCrate)
    shader.loadElement(shapeSphere)
    shader.loadElement(shapeQuad)
    shader.loadElement(shapQuad)
    shader.loadElement(teaPot)
    //var randomMaterial = new Material("random","texture/bricks.jpg","texture/heightmaps/brickheight.jpg")
    var boxMaterial = new Material("Brick","texture/bricks.jpg","texture/heightmaps/step.jpg")
    //pointLight = new PointLight("pointLight",0.7,0.5,[1,1,1],[0,0,0])

    directionalLight = new DirectionalLight("Directional",0.7,0.5,[0,0,-1],[1,1,1])
    var wall = new Drawable(Transformations.gimbalT.XYZ,shapQuad,boxMaterial)
    var wall2 = new Drawable(Transformations.gimbalT.XYZ,teaPot,boxMaterial)
    var wall3 = new Drawable(Transformations.gimbalT.XYZ,shapeCube,boxMaterial)
    //wall2.scale([30,1,30])
    //wall2.wRotateZ(90)
    //wall2.lRotateGamma(90)
    //wall2.translate([0,1,0])
    var aaa = new sceneNode(null)
    //wall.scale([0.01,0.01,0.01])
    //wall.scale([0.01,0.01,0.01])
    wall4 = aaa.addSon(wall2)
    bbb = new sceneNode(wall)
    //wall.translate([0,0,0])
    wall.scale([100,100,100])

    //wall2.scale([1,1,1])
   // aaa.calcSceneDraw(scemoShader)




    //node.drawab.lRotateAlpha(80)

    PointLight.bindLights(shader)
    PointLight.loadLights(shader)
    DirectionalLight.bindLights(shader)
    DirectionalLight.loadLights(shader)

    return aaa
}
randomCounter = 0
randomFlag = false
function drawEl(){
    cam.processInput(handler)
    scemoShader.setMatrixUniform("uViewMatrix",cam.getViewMatrix())
    scemoShader.setVectorUniform('uEyePosition',cam.getCameraPosition())
    //wallW2.drawab.lRotateGamma(1)
    //wallW2.calcSceneDraw(scemoShader)
    //oof.drawab.lRotateGamma(0.007)
    wall4.drawab.translate([0.01,0,0])
    wall4.calcSceneDraw(scemoShader)
    bbb.calcSceneDraw(scemoShader)
    //oof.calcSceneDraw(scemoShader)
    window.requestAnimationFrame(drawEl)

}

cam = setup(scemoShader)
oof = createScene(scemoShader)
//drawEl()
window.requestAnimationFrame(drawEl)
