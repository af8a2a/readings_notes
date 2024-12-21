接到个z-fighting的bug，基础太差排查半天解决不了疯狂摇人。为避免类似剧情特此记录学习😢。




## 典型场景
z-buffer结果值精确度不够，靠的很近的物体，相机转换不同角度时，会发生像素的“争斗”
几个物体之间的片段值有的时候a通过，有的时候b通过，导致交替显示这几个物体的颜色值，然后就会产生闪烁的现象

![](https://pic4.zhimg.com/80/v2-41df59abca1a8a93d74761fda1ff5533_720w.webp)

## 高发区
模型堆叠做特效，典中典之一层模型，一层特效
znear非常小
在没有**反转深度**的平台如Android OpenGLES3.0
## 为什么会有Z-fighting
**存储深度精度不足**
深度缓冲的精度是有限的，除非你打算爆改
渲染的RT需要有同样尺寸的深度贴图，我们不能无限增大这个精度(并且做不到)。带宽捉襟见肘的移动端为了节约，普通的渲染计算精度还得考虑FP16.....
尤其DepthStencil还需要共用，如Vulkan常见的深度模板缓冲格式：
- D16_UNORM
- X8_D24_UNORM_PACK32
- D32_SFLOAT
- S8_UINT
- D16_UNORM_S8_UINT
- D24_UNORM_S8_UINT
- D32_SFLOAT_S8_UINT
在Unity上，我们可选的精度一般也只能从这些中选择


**透视除法导致深度值的精度不足**
深度缓冲区存储的深度值，是ndc空间中的深度值。而ndc空间的深度值经由透视空间转换过来的，ndc空间的深度值与透视空间的深度值转换需要经过透视除法，这是一个非线性的变换，导致视点越近的物体的片段深度值是越精确的，离视点距离约远的物体的片段的深度值是约不精确的
正交透视矩阵渲染场景，其变换是线性的，不需要透视除法，也就没有z-fighting

# 一些解决方案
## Reversed-Z
实际上，深度缓冲区存储的是世界空间深度的倒数成比例的值：
a,b为与近平面，远平面相关的数值
$$
d=a\frac{1}{z}+b
$$
最重要的原因是：
![](https://d29g4g2dyqv443.cloudfront.net/sites/default/files/akamai/gameworks/blog/Depthprecision/math2.jpg)
这样的形式利于硬件执行光栅化，1/z在屏幕空间中是线性的，在三角形上对d插值，执行Early-Z，深度缓冲区压缩都更方便


不过，这同样导致了场景深度在1/z映射的分布不均匀
![](https://d29g4g2dyqv443.cloudfront.net/sites/default/files/akamai/gameworks/blog/Depthprecision/graph1.jpg)
反比例函数的性质也揭示了znear和zfar对曲线的影响
![](https://d29g4g2dyqv443.cloudfront.net/sites/default/files/akamai/gameworks/blog/Depthprecision/graph3.jpg)

这也是为什么，我们对修改zfar比较无感，但是znear错误设置时，非常容易出现z-fighting。

但是，我们不想精度集中在znear附近，而浮点数越靠近0，精确度越高。我们只需要将深度映射反转，将d=0映射到远平面，d=1映射到近平面即可得到
![](https://d29g4g2dyqv443.cloudfront.net/sites/default/files/akamai/gameworks/blog/Depthprecision/graph5.jpg)
	Reversed-Z对OpenGLES3.0无效，因为OpenGL默认情况下假定投影后深度范围为 [-1, 1]，这个初始映射范围破坏了浮点数的反转的精度，除非OpenGLES3.0支持OpenGL4.5的[glClipControl](http://docs.gl/gl4/glClipControl)

## 避免Z-Fighting
- 适当的减小近平面与远平面的绝对距离
- 翻转深度，让近处的精度精确而远程的精度降低，在远处出现z-fighting我们也不太会注意得到
- 提高深度缓存的精度



ref:
[反向Z(Reversed-Z)的深度缓冲原理 - 知乎](https://zhuanlan.zhihu.com/p/75517534)
[Depth Precision Visualized | NVIDIA Developer](https://developer.nvidia.com/content/depth-precision-visualized)