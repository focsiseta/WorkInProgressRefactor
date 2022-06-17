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
    shader.loadElement(shapeCube)
    shader.loadElement(shapeCrate)
    shader.loadElement(shapeSphere)
    shader.loadElement(shapeQuad)
    var randomMaterial = new Material("random","texture/bricks.jpg","texture/heightmaps/brickheight.jpg")
    var boxMaterial = new Material("Brick","texture/textureBox.png")
    spotLight = new SpotLight("TestPoint",0.7,5,[1,1,1],[0,10,0],[0,-1,0],30)
    spotLight.translate([50,0,0])

    var land = new Drawable(Transformations.gimbalT.XYZ,shapeQuad,randomMaterial)
    //land.translate([0,-110,0])
    land.scale([100,1,100])
    land.translate([0,-10,0])
    terrain = new sceneNode(land)

    var sphere = new Drawable(Transformations.gimbalT.XYZ,shapeSphere,randomMaterial)
    sphere.scale([3,3,3])
    var aaa = new sceneNode(sphere)
    aaa.attachLight(spotLight)
    sphere.scale([0.1,0.1,0.1])


    //node.drawab.lRotateAlpha(80)

    SpotLight.bindLights(shader)
    SpotLight.loadLights(shader)
    PointLight.bindLights(shader)
    PointLight.loadLights(shader)
    DirectionalLight.bindLights(shader)
    DirectionalLight.loadLights(shader)

    return aaa
}
randomCounter = 0
randomFlag = false
function drawEl(){
    //oof.drawab.lRotateGamma(0.01)
    //oof.drawab.wRotateZ(0.001)
    cam.processInput(handler)
    scemoShader.setMatrixUniform("uViewMatrix",cam.getViewMatrix())
    scemoShader.setVectorUniform('uEyePosition',cam.getCameraPosition())
    oof.drawab.lRotateBeta(0.01)
//    console.log(cam.getCameraPosition())
    if(randomFlag && randomCounter <  300){
        oof.drawab.translate([0,-0.1,0])

        //pointLight.lRotateAlpha(0.1)
        //pointLight.updatePosition()
        //SpotLight.updateLights(scemoShader)
    }else{
        oof.drawab.translate([0,0.1,0])
        //pointLight.updatePosition()
        //SpotLight.updateLights(scemoShader)
    }
    randomCounter++
    if(randomCounter > 300){
        randomFlag = !randomFlag
        randomCounter = 0
    }


    oof.calcSceneDraw(scemoShader)
    terrain.calcSceneDraw(scemoShader)
    window.requestAnimationFrame(drawEl)

}

cam = setup(scemoShader)
oof = createScene(scemoShader)
//drawEl()
window.requestAnimationFrame(drawEl)
