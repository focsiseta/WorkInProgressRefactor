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
        this.tangents = []
        this.calculateTBN()
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
    calculateTBN(){
        var tangent = []
        var vertices = divideIntoPoints3D(this.vertices)
        var uvs = divideIntoPoints2D(this.texCoords)
        for(var i = 0; i < this.indices.length;i += 3){
            var v1 = vertices[this.indices[i]]
            var v2 = vertices[this.indices[i+1]]
            var v3 = vertices[this.indices[i+2]]

            var uv1 = uvs[this.indices[i]]
            var uv2 = uvs[this.indices[i+1]]
            var uv3 = uvs[this.indices[i+2]]
            //console.log("UVs :",uv1,uv2,uv3)
            var deltaP1 = glMatrix.vec3.sub(glMatrix.vec3.create(),v2,v1)
            var deltaP2 = glMatrix.vec3.sub(glMatrix.vec3.create(),v3,v1)
            var deltaUV1 = glMatrix.vec2.sub(glMatrix.vec2.create(),uv2,uv1)
            var deltaUV2 =  glMatrix.vec2.sub(glMatrix.vec2.create(),uv3,uv1)
            let f = 1 / (deltaUV1[0]*deltaUV2[1] - deltaUV1[1]*deltaUV2[0])
            //console.log("fractional part ",(deltaUV1[0]*deltaUV2[1] - deltaUV1[1]*deltaUV2[0]),deltaUV1,deltaUV2)
            var x = f * (deltaUV2[1] * deltaP1[0] - deltaUV1[1] * deltaP2[0])
            var y = f * (deltaUV2[1] * deltaP1[1] - deltaUV1[1] * deltaP2[1])
            var z = f * (deltaUV2[1] * deltaP1[2] - deltaUV1[1] * deltaP2[2])

            //console.log(x + "  " + y + "  " + z)
            var tan = [x,y,z]
            console.log(tan)
            tangent.push(tan)
            tangent.push(tan)
            tangent.push(tan)
            console.log(tangent)

        }
        var flattenedTangents = []
        for(var i = 0; i < tangent.length;i++){
            tangent[i].forEach((value) =>{
                flattenedTangents.push(value)
            })
        }
        this.tangents = new Float32Array(flattenedTangents)
        //this.bitangents = new Float32Array(bitangent)

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
