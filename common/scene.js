class sceneNode{

    constructor(drawab = null) {
        this.drawab = drawab
        this.lights = []
        this.branches = []
        this.sortedDrawables = []
    }
    static drawOrder(node){
        /*
        *trees = A series of node that when asked to render will just be rendered as one
        *
        * This code for now will be simple but the idea is that as trees get constructed a list where things will already
        * be sorted
        * I need to find a way to keep or update the list when inserting, or I can just call this function once because for now
        * nothing gets added in the scene in real time
        *
        * High order policy, I'll write some just to have default choices
        *
        * First same material and same element
        * Second same material and different element
        * Third different material and different
        * */

        var ofcHashmap = new Map()
        sceneNode.recDrawOrder(node,ofcHashmap)
        console.log(ofcHashmap)
        ofcHashmap.forEach((value) =>{
        })

    }
    static recDrawOrder(sNode,acc){
        if(sNode.drawab != null && sNode.drawab.material != null ){
            var key = sNode.drawab.shape.getId() + sNode.drawab.material.getId()
            var exists = acc.has(key) //If pair already exists
            if(exists){
                var array = acc.get(key)
                array.push(sNode.drawab)
            }else{
                acc.set(key,[sNode.drawab])
            }
        }
        sNode.branches.forEach((branch) => {
            sceneNode.recDrawOrder(branch,acc)
        })
    }
    attachLight(light){
        this.lights.push(light)
    }
    addSon(element){
        var newTree = new sceneNode(element)
        this.branches.push(newTree)
        return newTree
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
            sNode.lights.forEach((light) =>{
                light.setFatherFrame(acc)
            })
        }
        sNode.branches.forEach((branch) =>{
            sceneNode.recCalcScene(branch,sNode.drawab.frame,dirty)
        })
    }
    calcSceneDraw(shader){ //useful when you want perpetual movement
        if(this.drawab != null) {
            sceneNode.recCalcSceneDraw(this, glMatrix.mat4.create(), shader, this.drawab.getDirty())
        }else{
            sceneNode.recCalcSceneDraw(this, glMatrix.mat4.create(), shader, true)
        }
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
            var thisFrame = sNode.drawab.frame
            sNode.lights.forEach((light) =>{
                light.setFatherFrame(thisFrame)
                light.updateLight(shader)
            })
        }
        shader.drawDrawable(sNode.drawab)



        sNode.branches.forEach((branch) =>{
            //console.log(branch.drawab.shape.getId())
            if(!branch.drawab.getDirty()) {
                sceneNode.recCalcSceneDraw(branch, sNode.drawab.frame, shader, dirty)
            }else{
                sceneNode.recCalcSceneDraw(branch, sNode.drawab.frame, shader, branch.drawab.getDirty())

            }
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
        sNode.lights.forEach((light) =>{
            light.updateLight(shader)
        })
        if(sNode.drawab.elementType !== Element.ElementType.LIGHT)
            shader.drawDrawable(sNode.drawab)

        sNode.branches.forEach((branch) =>{
            sceneNode.recDrawScene(branch,shader)
        })
    }


}