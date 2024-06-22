# 色调映射(Tone Mapping)
将浮点颜色值转换到LDR
Reinhard算法,保留更多亮处细节，暗处细节损失较多
```glsl
void main()
{             
    const float gamma = 2.2;
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;

    // Reinhard色调映射
    vec3 mapped = hdrColor / (hdrColor + vec3(1.0));
    // Gamma校正
    mapped = pow(mapped, vec3(1.0 / gamma));

    color = vec4(mapped, 1.0);
}   
```

曝光

```glsl
uniform float exposure;

void main()
{             
    const float gamma = 2.2;
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;

    // 曝光色调映射
    vec3 mapped = vec3(1.0) - exp(-hdrColor * exposure);
    // Gamma校正 
    mapped = pow(mapped, vec3(1.0 / gamma));

    color = vec4(mapped, 1.0);
}  
```

![](https://learnopengl-cn.github.io/img/05/06/hdr_exposure.png)


# 泛光(bloom)
光源附近的光芒，产生光晕
## **Bloom和HDR结合使用。**
先渲染一个有光场景，提取出场景的HDR颜色缓冲以及只有这个场景明亮区域可见的图片。
再将提取的带有亮度的图片模糊处理。
最后将结果添加到HDR场景上面。
![](https://learnopengl-cn.github.io/img/05/07/bloom_example.png)


**HDR 和 Bloom 的关系**
	HDR 的 RT 做 Bloom，单个超亮的像素也能扩出大范围的光晕
	![](https://pic4.zhimg.com/80/v2-8090da61b6ed2c7f9c738b368ae563bf_720w.webp)
	


# 光晕模糊
高斯模糊滤波

```glsl
#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D image;

uniform bool horizontal;

uniform float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

void main()
{             
    vec2 tex_offset = 1.0 / textureSize(image, 0); // gets size of single texel
    vec3 result = texture(image, TexCoords).rgb * weight[0]; // current fragment's contribution
    if(horizontal)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, TexCoords + vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, TexCoords + vec2(0.0, tex_offset.y * i)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(0.0, tex_offset.y * i)).rgb * weight[i];
        }
    }
    FragColor = vec4(result, 1.0);
}
```

## 高斯模糊原理 
用水平权重在整个纹理上进行水平模糊，然后在经改变的纹理上进行垂直模糊
![](https://learnopengl-cn.github.io/img/05/07/bloom_gaussian_two_pass.png)

# 摩尔纹与Mipmap

![](https://pic3.zhimg.com/80/v2-250a678089fc5870d0b540d0e09ccad2_720w.webp)

图片缩小后产生摩尔纹现象，是采样频率跟不上信息频率的结果，即屏幕像素数量低于纹素数量,图片离我们很远时，1个像素几乎包含了12个纹素

当这种1个屏幕像素包含非常多的纹素时，像素如何去对这些纹素进行采样处理，那就由不了我们了。如下图所示，在像素纹素一对多及其严重的区域，像素直接将所包含的纹素全部平均化了。

![](https://img.yousazoe.top/uPic/img/blog/GAMES101-SUM/GAMES101_Lecture_09.pdf_25.jpg)

![](https://pic1.zhimg.com/80/v2-67537b5083a377aab2b06931a3902724_720w.webp)



## 解决方案
解决因采样频率差异而导致的摩尔纹问题,需要mipmap，使得采样频率能尽可能与纹素频率接近
既然屏幕像素在对远处纹理进行采样时，都陷入如何对包含的大量纹素进行合理处理时，那不如让屏幕像素在采集远处纹理时，也能像采集近处纹理一样，一个像素对应一个纹素。这样既能保留我们所指定的信息，又能减少各种纹理过滤插值的计算。**多级渐远纹理 Mipmap** 就是用来实现一个像素采样尽可能少的纹素。
![](https://pic1.zhimg.com/80/v2-40618a0aa446954cdbd57f02f3be61e8_720w.webp)

为不同距离准备不同分辨率的纹理。纹理离视口越远，则mipmap取的层级就越高，mipmap层级越高，纹素就越少，这也就实现了纹素随距离变化，避免了采样频率和纹素频率差别过大的情况出现。
为一张纹理生成mipmap，会增加1/3的显存，但是减轻走样的同时也减少了计算量。
![](https://pic1.zhimg.com/80/v2-284cf9f7a3a29d6f8b9812882e6311b0_720w.webp)

## 过度模糊-各向异性过滤 

只使用Mipmap则远处会出现过度模糊
![](https://pic2.zhimg.com/80/v2-fe1ee2ab387676cb941948171929e7c1_720w.webp)

解决方案:
**各向异性过滤**
