function SpiralPattern(){
    var aaa = new sceneNode(new Drawable(Transformations.gimbalT.XYZ,shapeCube))
    aaa.drawab.lRotateAlpha(1)
    var node = aaa
    for(var i = 1;i < 60;i++){
        var d = new Drawable(Transformations.gimbalT.XYZ,shapeCube)
        d.translate([0,0,-2.5*i/20])
        d.lRotateBeta(300)
        node = node.addSon(d)
    }
    //node.drawab.lRotateAlpha(80)

    return aaa
}