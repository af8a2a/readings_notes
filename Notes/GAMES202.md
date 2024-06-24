本篇记录我学习GAMES202的过程，主要学习参考了[DrFlower/GAMES_101_202_Homework: GAMES101、GAMES202作业全解 (github.com)](https://github.com/DrFlower/GAMES_101_202_Homework)的实现。

本文记录我感兴趣的代码片段与相关原理，不会覆盖完整的代码与操作步骤。
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

## Checkpoint: PCSS
 补全PCSS函数,在PCF基础上，增加对滤波半径的控制，根据物体在shadowmap中周围平均深度控制半影区。
![](https://s3.bmp.ovh/imgs/2024/06/23/028b9aac67d337db.png)

利用findBlock,获取周围的平均遮挡深度
```glsl
float findBlocker(sampler2D shadowMap, vec2 uv, float zReceiver) {

    const int radius = 40;

    const vec2 texelSize = vec2(1.0 / 2048.0, 1.0 / 2048.0);

    float cnt = 0.0, blockerDepth = 0.0;

    int flag = 0;

    for(int ns = 0; ns < BLOCKER_SEARCH_NUM_SAMPLES; ++ns) {

        vec2 sampleCoord = (vec2(radius) * poissonDisk[ns]) * texelSize + uv;

        float cloestDepth = unpack(texture2D(shadowMap, sampleCoord));

        if(zReceiver - 0.002 > cloestDepth) {

            blockerDepth += cloestDepth;

            cnt += 1.0;

            flag = 1;

        }

    }

    if(flag == 1) {

        return blockerDepth / cnt;

    }

    return 1.0;

}
float PCSS(sampler2D shadowMap, vec4 coords) {

  

  // STEP 1: avgblocker depth

    float avgBlockerDepth = findBlocker(shadowMap, coords.xy, coords.z);  

  // STEP 2: penumbra size

    const float lightWidth = 100.0;

    float penumbraSize = max(coords.z - avgBlockerDepth, 0.0) / avgBlockerDepth * lightWidth;

  // STEP 3: filtering

    return PCF(shadowMap, coords, penumbraSize);

  

}


```

[hw1代码仓库]([af8a2a/games202_hw1 (github.com)](https://github.com/af8a2a/games202_hw1))


# hw2

## C++端编译问题
在我的机器上，使用Clang+MSVC后端编译时，无法通过编译，而切换至MSVC工具链时，需要在CMakeList.txt中的112行插入
```cmake
target_compile_options(nori PUBLIC /utf-8) # MSVC unicode support
```

## Checkpoint:PrecomputeCubemapSH

为给定的立方体贴图（cubemap）图像计算球谐系数（Spherical Harmonics, SH）以便进行光照预计算。
将环境光投影到球谐函数上来 得到对应的系数，即：
$$
 SH_{coeff} = \int_S L_{env}(\omega_i) \cdot SH(\omega_i) \, d\omega_i 
$$
黎曼积分计算：
$$
 \hat{SH}_{coeff} = \sum_{i} L_{env}(\omega_i) \cdot SH(\omega_o) \Delta \omega_i 
$$
	球谐函数在[Real Time Rendering](https://github.com/Morakito/Real-Time-Rendering-4th-CN?tab=readme-ov-file)第十章与第十一章中同样有较为简明的介绍与计算方法


对应代码如下：
```cpp
        for (int i = 0; i < 6; i++)
        {
            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    // TODO: here you need to compute light sh of each face of cubemap of each pixel
                    // TODO: 此处你需要计算每个像素下cubemap某个面的球谐系数

                    Eigen::Vector3f dir = cubemapDirs[i * width * height + y * width + x];
                    int index = (y * width + x) * channel;
                    Eigen::Array3f Le(images[i][index + 0], images[i][index + 1],
                                      images[i][index + 2]);
                    auto delta_w= CalcArea(x,y,width, height);
                    for(int l=0;l<=SHOrder;l++){
                        for(int m=-l;m<=l;m++){
                            auto basicT_sh_proj = sh::EvalSH(l, m, Eigen::Vector3d(dir.x(), dir.y(), dir.z()).normalized());
                            SHCoeffiecents[sh::GetIndex(l, m)] += Le * basicT_sh_proj * delta_w;
                        }
                    }
                }
            }
        }
```

delta_w调用CalcArea(x,y,width, height);计算对应立体角面积，调用EvalSH求出基函数在某一方向上的值。

## CheckPoint:传输项球谐系数
补全shFunc传输函数。


在shFunc中，首先补全传输函数项，在漫反射表面简化为
$$
L_{DU} = \frac{\rho}{\pi} \int_{S} L_{i}(x, \omega_{i}) \max(N_{x} \cdot \omega_{i}, 0) \, d\omega_{i}
$$

Unshadowed时，无需考虑可见性，只需要预计算dot(n,i)
```cpp
if (m_Type == Type::Unshadowed)  
{  
// TODO: here you need to calculate unshadowed transport term of a given direction  
// TODO: 此处你需要计算给定方向下的unshadowed传输项球谐函数值  
return std::max(H,0.0);  
}
```

Shadow条件下，考虑可见性，需要将光线与场景进行相交检测
```cpp
if(H>0.0&&!scene->rayIntersect(Ray3f(v,wi.normalized()))){  
return H;  
}  
return 0;
```

考虑间接光照，光线可能发生多次反射被接收，使用递归的光线追踪方法预计算
$$
L_{DI} = L_{DS} + \frac{\rho}{\pi} \int_{S} \hat{L}(x', \omega_{i})(1 - V(\omega_{i})) \max(N_{x} \cdot \omega_{i}, 0) \, d\omega_{i}
$$

## Checkpoint:PRT Material
将预计算的环境光球谐系数和传输项球谐系数复制到实时渲染端cubemap对应的文件夹中

全局光照计算依赖于以下方法
$$
L(o) = \rho \int_{\Omega} L(i) V(i) \max(0, n \cdot i) \, d i 
$$
其中，环境光球谐系数L(i)与传输项已经在前面预计算得到
$$
T(i)=V(i) \max(0, n \cdot i) 
$$
实时渲染端只需要加载预计算数据，并在顶点着色器中点乘L与T获取全局光照颜色。


由于离线计算端将颜色映射至SRGB空间，在片段着色器中可以进行色调映射转为与离线计算端相同的颜色空间
```cpp
Color3f Color3f::toSRGB() const {
    Color3f result;

    for (int i=0; i<3; ++i) {
        float value = coeff(i);

        if (value <= 0.0031308f)
            result[i] = 12.92f * value;
        else
            result[i] = (1.0f + 0.055f)
                * std::pow(value, 1.0f/2.4f) -  0.055f;
    }

    return result;
}
```

结果图：
![](https://s3.bmp.ovh/imgs/2024/06/24/7976d65491d51c14.png)
![](https://s3.bmp.ovh/imgs/2024/06/24/7c4865cced0b7e5a.png)