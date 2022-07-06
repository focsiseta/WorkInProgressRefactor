class Node{
    constructor(data,branches = [], lights = [], nextNode = null) {
        this.data = data
        this.branches = branches
        this.lights = lights
        this.nextNode = nextNode
    }
    setNext(node){
        this.nextNode = node
    }
    addLight(light){
        this.lights.push(light)
    }
    addNode(node){
        this.branches.push(node)
    }
    addDrawableAsNode(drawable){
        var node = new Node(drawable)
        this.branches.push(node)
        return node
    }
    static CalcDraw(node,shader){
        var wasDirty = node.data.getDirty()
        node.data.update()
        shader.drawDrawable(node.data)
        node.branches.forEach((branch_node) => {
            if(wasDirty){
                branch_node.data.setFatherFrame(node.data.getFrame())
            }
            Node.CalcDraw(branch_node,shader)
        })
        node.lights.forEach((light) => {
            if(wasDirty){
                light.setFatherFrame(node.data.getFrame())
            }
            light.updateLight(shader)
        })
    }

}