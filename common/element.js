//Class that will act as a container for all the type of buffers
class Element {
    static ElementType = {
        LIGHT : 0,
        SHAPE : 1,
}

    constructor(
                id,vertexArray,normalArray,indexArray,texCoordArray,elementType = Element.ElementType.SHAPE,drawType = "TRIANGLES",) {

        this.vertices = new Float32Array(vertexArray)
        this.normals = new Float32Array(normalArray)
        this.indices = new Uint16Array(indexArray)
        this.texCoords = new Float32Array(texCoordArray)
        this.elementType = elementType
        this.drawType = drawType
        this.id = id
    }
    loadVertices(vertexArray){
        this.vertices = new Float32Array(vertexArray)
    }
    loadNormals(normalArray){
        this.normals = new Float32Array(normalArray)
    }
    loadIndices(indexArray){
        this.indices = new Uint16Array(indexArray)
    }
    loadTexCoords(texCoordArray){
        this.texCoords = new Float32Array(texCoordArray)
    }
    getId(){
        return this.id
    }

}

class Drawable extends Transformations{
    constructor(gimbalType = Transformations.gimbalT.XYZ,
                shape = null,material = null) {
        super(gimbalType)
        this.shape = shape
        this.material = material
    }
}


function LazyUVMappingMatrixSetup(element,width,height){
    var shortCut = Math.floor(element.vertices.length / 2)
    var isEven = (element.vertices.length % 2) === 0
    var x_step = 1/shortCut
    var y_step = isEven ? x_step : 1/(element.vertices.length - shortCut)

    return [x_step,y_step]

}
// I was high
function LazyUVMappingMatrix(element,width,height){

    var [x_step,y_step] = LazyUVMappingMatrixSetup(element,width,height)
    var texCoordValues = []
    for (var i = 0, j = 0; i <= 1 && j <= 1;i += x_step,j += y_step){
            texCoordValues.push(i)
            texCoordValues.push(j)
    }
    return texCoordValues

}
