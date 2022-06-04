class sceneNode{
    constructor(element = null) {
        this.element = element
        this.branches = []
    }
    addSon(element){
        var newTree = new sceneNode(element)
        this.branches.push(newTree)
    }
    addSubTree(tree){
        this.branches.push(tree)
    }
    changeElement(element){
        this.element = element
    }
    calcScene(){
        sceneNode.recCalcScene(this,identity())
    }
    static recCalcScene(sNode,acc){
        if(sNode.element == null){
            sNode.branches.forEach((branch)=>{
                sceneNode.recCalcScene(branch,acc)
            })
            return
        }
        sNode.element.setFatherFrame(acc)
        sNode.branches.forEach((branch) =>{
            sceneNode.recCalcScene(branch,sNode.element.getFrame())
        })
    }
    calcSceneDraw(shader){ //useful when you want perpetual movement
        sceneNode.recCalcSceneDraw(this,glMatrix.mat4.create(),shader)
    }
    static recCalcSceneDraw(sNode,acc,shader){
        if(sNode.element == null){
            sNode.branches.forEach((branch)=>{
                sceneNode.recCalcSceneDraw(branch,acc,shader)
            })
            return
        }
        sNode.element.setFatherFrame(acc)
        if(sNode.element.elementType !== Element.ElementType.LIGHT)
            shader.drawDrawable(sNode.element)


        sNode.branches.forEach((branch) =>{
            sceneNode.recCalcSceneDraw(branch,sNode.element.getFrame(),shader)
        })
    }
    drawScene(shader){
        sceneNode.recDrawScene(this,shader)
    }
    static recDrawScene(sNode,shader){
        if(sNode.element == null){
            sNode.branches.forEach((branch)=>{
                sceneNode.recDrawScene(branch,shader)
            })
            return
        }

        if(sNode.element.elementType !== Element.ElementType.LIGHT)
            shader.drawDrawable(sNode.element)

        sNode.branches.forEach((branch) =>{
            sceneNode.recDrawScene(branch,shader)
        })
    }


}