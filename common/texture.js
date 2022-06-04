//Class to aid in texture handling, for now it keeps all the texture paths we want to use
class Texture{
    constructor() {
        this.texturePaths = []
    }
    addTexture(path){
        this.texturePaths.push(path)
    }

}