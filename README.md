# Simple Graphics Engine

I've been more fun developing this than anything else and it's only to get better from here

Only real bad part is that it's in Javascript and let's just say that static types for this kind of project can be quite useful

# What has been done for now as optimization

Dirty bit : if a Drawable isn't transformed, no need to recalculate his frame



# What needs to be done

A LOT of things

Height map

Spotlight

Deferred shading

Fix : If we use local rotation, global rotations get overwritten and this is because the way local rotation are applied. Needless to say this isn't a feature

Ordering of objects to render : 
    
    The idea is to render first same Elements with the same Material
    then only same Texture different elements
    Only after that different Material with different Element
    
 
 Post-processing : Shadow Map
 
 and other stuff

# Already Done
 
 Directional Light 
 
 Point Light

 Local and Global rotations
 

# Goal
 
 I hope to make something more general purpose, not as powerful as unity, but at least something easy to use for our uni assignment
 
 # Problems
 
 If you don't open index.html with support from a webserver, textures won't load (At least, I think. For now it seems like it, but I'm not entirely sure)

