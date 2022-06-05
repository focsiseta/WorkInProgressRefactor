class sceneNode{
    constructor(drawab = null) {
        this.drawab = drawab
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
        sceneNode.recCalcScene(this,identity(),this.drawab.getDirty())
    }
    static recCalcScene(sNode,acc,dirty){
        if(sNode.drawab == null){
            sNode.branches.forEach((branch)=>{
                sceneNode.recCalcScene(branch,acc,dirty)
            })
            return
        }

        if(dirty){
            sNode.drawab.setFatherFrame(acc)
        }
        sNode.branches.forEach((branch) =>{
            sceneNode.recCalcScene(branch,sNode.drawab.getFrame(),dirty)
        })
    }
    calcSceneDraw(shader){ //useful when you want perpetual movement
        sceneNode.recCalcSceneDraw(this,glMatrix.mat4.create(),shader,this.drawab.getDirty())
    }
    static recCalcSceneDraw(sNode,acc,shader,dirty){
        if(sNode.drawab == null){
            sNode.branches.forEach((branch)=>{
                sceneNode.recCalcSceneDraw(branch,acc,shader,dirty)
            })
            return
        }
        if(dirty){
            sNode.drawab.setFatherFrame(acc)
        }
        if(sNode.drawab.elementType !== Element.ElementType.LIGHT)
            shader.drawDrawable(sNode.drawab)


        sNode.branches.forEach((branch) =>{
            sceneNode.recCalcSceneDraw(branch,sNode.drawab.getFrame(),shader,dirty)
        })
    }
    drawScene(shader){
        sceneNode.recDrawScene(this,shader)
    }
    static recDrawScene(sNode,shader){
        if(sNode.drawab == null){
            sNode.branches.forEach((branch)=>{
                sceneNode.recDrawScene(branch,shader)
            })
            return
        }

        if(sNode.drawab.elementType !== Element.ElementType.LIGHT)
            shader.drawDrawable(sNode.drawab)

        sNode.branches.forEach((branch) =>{
            sceneNode.recDrawScene(branch,shader)
        })
    }


}