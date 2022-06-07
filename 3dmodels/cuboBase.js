const cube={
    "version" : "0.1.0",

    "comment" : "Generated by MeshLab JSON Exporter",

    "id"      : 1,
    "name"    : "mesh",

    "vertices" :
        [
            {
                "name"       : "position_buffer",
                "size"       : 3,
                "type"       : "float32",
                "normalized" : false,
                "values"     :
                    [
                        1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1,
                        -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
                        -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1
                    ]
            },

            {
                "name"       : "normal_buffer",
                "size"       : 3,
                "type"       : "float32",
                "normalized" : false,
                "values"     :
                    [
                        0.333333, 0.666667, -0.666667, 0.816497, -0.408248, -0.408248, 0.816497, 0.408248, 0.408248, 0.333333, -0.666667, 0.666667, -0.816497, 0.408248, -0.408248, -0.333333, -0.666667, -0.666667, -0.333333, 0.666667, 0.666667, -0.816497, -0.408248, 0.408248, 0.816497, 0.408248, 0.408248, -0.333333, 0.666667, 0.666667,
                        -0.816497, -0.408248, 0.408248, -0.333333, 0.666667, 0.666667, -0.816497, 0.408248, -0.408248, -0.333333, -0.666667, -0.666667, 0.333333, -0.666667, 0.666667, -0.816497, -0.408248, 0.408248, 0.816497, -0.408248, -0.408248, 0.333333, 0.666667, -0.666667, 0.816497, 0.408248, 0.408248, 0.333333, -0.666667, 0.666667,
                        -0.333333, -0.666667, -0.666667, -0.816497, 0.408248, -0.408248, 0.333333, 0.666667, -0.666667, 0.816497, -0.408248, -0.408248
                    ]
            },

            {
                "name"       : "texcoord_buffer",
                "size"       : 2,
                "type"       : "float32",
                "normalized" : false,
                "values"     :
                    [
                        0.696309, 0.622466, 0.943922, 0.620915, 0.696309, 0.872465, 0.695891, 0.622884, 0.946309, 0.622466, 0.697441, 0.870079, 0.946309, 0.872465, 0.695891, 0.872884, 0.945891, 0.622884, 0.945891, 0.872884,
                        0.697441, 0.620079, 0.947441, 0.620079, 0.947441, 0.870079, 0.693922, 0.620915, 0.943922, 0.870915, 0.693922, 0.870915, 0.695891, 0.619365, 0.945891, 0.619365, 0.945891, 0.869365, 0.695891, 0.869365,
                        0.697441, 0.623597, 0.947441, 0.623597, 0.947441, 0.873597, 0.697441, 0.873597
                    ]
            }
        ],

    "connectivity" :
        [
            {
                "name"      : "triangles",
                "mode"      : "triangles_list",
                "indexed"   : true,
                "indexType" : "uint32",
                "indices"   :
                    [
                        0, 4, 6, 0, 6, 2, 3, 8, 9, 3, 9, 7, 10, 11, 12, 10, 12, 5, 13, 1, 14, 13, 14, 15, 16, 17, 18, 16, 18, 19,
                        20, 21, 22, 20, 22, 23
                    ]
            }
        ],

    "mapping" :
        [
            {
                "name"       : "standard",
                "primitives" : "triangles",
                "attributes" :
                    [
                        {
                            "source"   : "position_buffer",
                            "semantic" : "position",
                            "set"      : 0
                        },
                        {
                            "source"   : "normal_buffer",
                            "semantic" : "normal",
                            "set"      : 0
                        },
                        {
                            "source"   : "texcoord_buffer",
                            "semantic" : "texcoord",
                            "set"      : 0
                        }
                    ]
            }
        ],

    "custom" : null
}
