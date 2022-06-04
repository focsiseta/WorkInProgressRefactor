//Class that will act as a container for all the type of buffers
class Element {
    static ElementType = {
        LIGHT : 0,
        SHAPE : 1,
}
    constructor(
                vertexArray,normalArray,indexArray,texCoordArray,elementType = Element.ElementType.SHAPE,drawType = "TRIANGLES",) {

        this.vertices = new Float32Array(vertexArray)
        this.normals = new Float32Array(normalArray)
        this.indices = new Uint16Array(indexArray)
        this.texCoords = new Float32Array(texCoordArray)
        this.elementType = elementType
        this.drawType = drawType
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

}

class Drawable extends Transformations{
    constructor(gimbalType = Transformations.gimbalT.XYZ,
                shape = null) {
        super(gimbalType)
        this.shape = shape
    }
}

