本文参考[Tile Base Render (Forward+) - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/553907076)，学习Forward+
# Forward+管线
Deferred Render具有难以解决的问题，例如难以使用硬件MSAA，限制了材质的多样性，并且对带宽，显存要求高，同时MRT支持需要OpenGL|ES3.0，在老设备上具有局限性。


GPU硬件的能力得到了很大提升，具备了更加通用的计算能力(Compter Shader)。这使得Forward Render支持多光源有了基础。但是Forward每个光源会对每个物体渲染一遍，效率还是过低。

Forward+在**Light Shading之前利用深度对Tile内的无关光源进行剔除，只对Tile有影响的光源进行光照计算**。

**Forward+渲染管线包含3个阶段：Depth PrePass、Light Culling、Final Shading**
流程伪代码为：
```

foreach object in sceen
        get depth
foreach tile in screen:
        get max min depth
        Frustum  Intersection test
        Generate a list of light 
foreach pixel in screen:
    foreach light in light_list_of_this_tile:
        pixelLighting += light_contribution_to_pixel(light,pixel)

```

## **Depth PrePass**
Forward +的Depth PrePass只使用了深度缓冲，要比Geometry-Pass的计算代价小。注意这个Depth PrePass在Forward+中是必须做的。因为后续的Light Cull需要用到Depth信息。

## Light Culling
将屏幕划分为16X16(在这里大多数项目都是使用的16X16)。在每个Tile当中寻找各自影响该Tile的光源。形成一个Light List，后续在该Tile中的Pixel只需要计算在Light List中的光源对该Pixel贡献即可。
![](https://pic1.zhimg.com/80/v2-733780069f45ba49c4b14acd728c4df0_720w.webp)

Light Culling需要一个Compute Shader来计算，依据是当前Tile的Screen Position和Depth Bound(基于这两个信息可以计算出view frustum)。基于这些信息可以构建出一个属于该Tile的Frustum，通常这个Frustum是在View Space当中构建的。如下图所示：
![](https://pic1.zhimg.com/80/v2-a992c74d6992d4ba2976ede26c3dedc0_720w.webp)

![](https://pic1.zhimg.com/80/v2-c8685d220c99b6cb16560c1eb6e9ab2c_720w.webp)

