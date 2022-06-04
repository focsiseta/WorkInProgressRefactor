class Transformations {
    static gimbalT = {
        XYZ:0,
        XZY:1,
        YXZ:2,
        YZX:3,
        ZXY:4,
        ZYX:5,
    }

    constructor(gimbalType = Transformations.gimbalT.XYZ){
        //rotation in radians of local x,y,z axis

        this.alpha = 0
        this.beta = 0
        this.gamma = 0
        //Local right, up, front vectors
        this.right = glMatrix.vec3.fromValues(1,0,0)
        this.up = glMatrix.vec3.fromValues(0,1,0)
        this.front = glMatrix.vec3.fromValues(0,0,1)

        this.type = gimbalType

        this.rotationMatrix = glMatrix.mat4.create()
        this.scaleMatrix = glMatrix.mat4.create()
        this.translationMatrix = glMatrix.mat4.create()
        //Father frame
        this.fMatrix = glMatrix.mat4.create()

    }
    //this method is for keeping normal consistency in the shaders. If we have to draw an object with normals, we also need the inverse transposed transf matrix
    getInverseTranspose(){
        let tmp = glMatrix.mat4.create()
        glMatrix.mat4.transpose(tmp,glMatrix.mat4.invert(tmp,this.getTransformation()))
        return tmp
    }
    rotationCalc(){

        //BUG gimbal selection doesn't work as intended,rotation don't change
        let tmp1 = glMatrix.mat4.create()
        let rotX = glMatrix.mat4.fromXRotation(glMatrix.mat4.create(),this.alpha)
        let rotY = glMatrix.mat4.fromYRotation(glMatrix.mat4.create(),this.beta)
        let rotZ = glMatrix.mat4.fromZRotation(glMatrix.mat4.create(),this.gamma)
        //Type of gimbal we want gives us different formulas
        switch(this.type) {
            case 0://XYZ
                glMatrix.mat4.multiply(tmp1, rotY, rotX)
                glMatrix.mat4.multiply(tmp1, rotZ, tmp1)
                break
            case 1://XZY
                glMatrix.mat4.multiply(tmp1, rotZ, rotX)
                glMatrix.mat4.multiply(tmp1, rotY, tmp1)
                break
            case 2://YXZ
                glMatrix.mat4.multiply(tmp1, rotX, rotY)
                glMatrix.mat4.multiply(tmp1, rotZ, tmp1)
                break
            case 3://YZX
                glMatrix.mat4.multiply(tmp1, rotZ, rotY)
                glMatrix.mat4.multiply(tmp1, rotX, tmp1)
                break
            case 4://ZXY
                glMatrix.mat4.multiply(tmp1, rotX, rotZ)
                glMatrix.mat4.multiply(tmp1, rotY, tmp1)
                break
            case 5://ZYX
                glMatrix.mat4.multiply(tmp1, rotY, rotZ)
                glMatrix.mat4.multiply(tmp1, rotX, tmp1)
                break
            default:
            //return identity
        }

        this.rotationMatrix = tmp1
    }
    //Set of functions to brutally set angles
    setAlpha(alpha) { this.alpha = alpha % (Math.PI*2) }
    setBeta(beta) { this.beta = beta % (Math.PI*2) }
    setGamma(gamma) { this.gamma = gamma % (Math.PI*2) }
    //If we use this functions with glMatrix.mat4.mul(this.rotationMatrix,this.rotationMatrix,tmp1) it becomes increasingly faster

    addAlpha(alpha) { this.alpha = (this.alpha + alpha) % (Math.PI*2) }
    addBeta(beta) { this.beta = (this.beta + beta) % (Math.PI*2) }
    addGamma(gamma){ this.gamma = (this.gamma + gamma) % (Math.PI*2) }

    lRotateAlpha(alpha){
        this.addAlpha(alpha)
        this.rotationCalc()
    }
    lRotateBeta(beta){
        this.addBeta(beta)
        this.rotationCalc()
    }
    lRotateGamma(gamma){
        this.addGamma(gamma)
        this.rotationCalc()
    }

    //wRotate* are rotations methods that can be applied to rotate around "real" axis (not relative ones)
    wRotateX(angle){
        glMatrix.mat4.rotateX(this.rotationMatrix,this.rotationMatrix,angle)
    }
    wRotateY(angle){
        glMatrix.mat4.rotateY(this.rotationMatrix,this.rotationMatrix,angle)
    }
    wRotateZ(angle){
        glMatrix.mat4.rotateZ(this.rotationMatrix,this.rotationMatrix,angle)
    }
    translate(translationVector){
        glMatrix.mat4.translate(this.translationMatrix,this.translationMatrix,translationVector)
    }
    scale(scaleVector){
        glMatrix.mat4.scale(this.scaleMatrix,this.scaleMatrix,scaleVector)
    }
    getFrame(){
        var tmp = glMatrix.mat4.create()
        //TransScalRot (TSR) Matrix composition -> father matrix * son matrix * vertex
        // We express points in father's perspective so we can have global coordinates
        // as father matrix * son matrix * vertex and that's basically it

        // tmp = T * S
        glMatrix.mat4.mul(tmp,this.translationMatrix,this.scaleMatrix)
        //(T * S) = T * S * R
        glMatrix.mat4.mul(tmp,tmp,this.rotationMatrix)
        glMatrix.mat4.mul(tmp,this.fMatrix,tmp)
        return tmp
    }
    getTransformation(){
        var tmp = glMatrix.mat4.create()
        glMatrix.mat4.mul(tmp,this.translationMatrix,this.scaleMatrix)
        //(T * S) = T * S * R
        glMatrix.mat4.mul(tmp,tmp,this.rotationMatrix)
        return tmp
    }
    setFatherFrame(frame){
        glMatrix.mat4.copy(this.fMatrix,frame)
    }

}