本篇记录我学习GAMES202的过程
# hw1

##  Checkpoint :ShadowMap

首先需要补充DirectionalLight.js中的函数```
```javascript
CalcLightMVP(translate, scale)
```
按照[文档](https://glmatrix.net/docs/module-mat4.html)中的用法，进行变换，同时投影矩阵使用正交矩阵即可。

在phongFragment.glsl中，补全main函数与useShadowMap函数。

main函数中，将顶点着色器中的光源坐标除w深度获得NDC坐标shadowuv,作为参数传入useShadowMap后，采用获取深度值，与shadowuv.z比较即可确定阴影。
```glsl
float useShadowMap(sampler2D shadowMap, vec4 shadowCoord){

    float depth = unpack(texture2D(shadowMap, shadowCoord.xy));

    float cur_depth = shadowCoord.z;

    if(cur_depth > depth + EPS) {

        return 0.;

    } else {

        return 1.0;

    }

  

}
```


 ## Checkpoint : PCF
 补全PCF函数
 PCF即在阴影贴图的基础上，对周围深度进行简单的滤波求均值，生成较为柔软的阴影边缘。
 通过控制penumbraSize设置滤波半径，实现不同采样半径。

```glsl
float PCF(sampler2D shadowMap, vec4 coords, float penumbraSize) {

    poissonDiskSamples(coords.xy);

    const vec2 texelSize = vec2(1.0 / 2048.0, 1.0 / 2048.0);

    float visibility = 0.0, cnt = 0.0;

    for(int ns = 0; ns < PCF_NUM_SAMPLES; ++ns) {

        vec2 sampleCoord = (vec2(penumbraSize) * poissonDisk[ns]) * texelSize + coords.xy;

        float cloestDepth = unpack(texture2D(shadowMap, sampleCoord));

        visibility += ((coords.z - 0.001) > cloestDepth ? 0.0 : 1.0);

        cnt += 1.0;

    }

    return visibility / cnt;

}
```

0.1滤波半径的PCF阴影:
![](https://s3.bmp.ovh/imgs/2024/06/22/9781c933b2b18157.png)
1滤波半径的PCF阴影:
![](https://s3.bmp.ovh/imgs/2024/06/22/54a8744526119e4d.png)


[hw1代码仓库]([af8a2a/games202_hw1 (github.com)](https://github.com/af8a2a/games202_hw1))


