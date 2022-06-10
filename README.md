# Simple Graphics Engine

I've been more fun developing this than anything else and it's only to get better from here

Only real bad part is that it's in Javascript and let's just say that static types for this kind of project can be quite useful

# What has been done for now as optimization

Dirty bit : if a Drawable isn't transformed, no need to recalculate his frame



# What needs to be done

A LOT of things

Point light -> Spotlight

Deferred shading

Ordering of objects to render : 
    
    The idea is to render first same Elements with the same Material
    then only same Texture different elements
    Only after that different Material with different Element
    
 
 Post-processing
 
 and other stuff
 
 I hope to make something more general purpose, not as powerful as unity, but at least something easy to use

