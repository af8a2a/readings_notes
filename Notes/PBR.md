
要点
- 基于微平面(Microfacet)的表面模型
- 能量守恒
- 应用基于物理的BRDF

# PBR相比传统渲染有什么区别
基于物理，辐射度量学，材质表征更为细腻和真实，传统的模型只是一个特化和近似  
标准化了程序和美术的制作流程，提供了方便美术调整的参数。
PBR需要贴图中包含哪些内容 abeldo，法线，粗糙度，金属度，自发光等 

# 微表面
roughness 粗糙度，描述微平面中，朝向方向沿着某个向量ℎ(半程向量)方向的比例
![](https://learnopengl-cn.github.io/img/07/01/ndf.png)

# 能量守恒
```glsl
float kS = calculateSpecularComponent(...); // 反射/镜面 部分
float kD = 1.0 - ks;                        // 折射/漫反射 部分
```

# 渲染方程
p 点在 wo 方向的 radiance，只需要知道所有 wi 方向来的 radiance，与物体表面进行交互（有一个衰减），再算上一个 cos 衰减，全部加起来就是答案。
从摄像机向每一个像素发射射线”就是最开始递归的 L(wo) ，每当落到一个物体表面时，都要**递归**计算 L(wi) ，算好答案之后回来计算积分，然后返回
$$
L_o(p,\omega_o) = \int\limits_{\Omega} f_r(p,\omega_i,\omega_o) L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

# BRDF
表示了当给定一条入射光的时候，某一条特定的出射光线的性质
出射光辐射率(Radiance)的微分和入射光辐照度(Irradiance)的微分之比

## Cook-Torrance BRDF

$$
f_r = k_d f_{lambert} +  k_s f_{cook-torrance}
$$
$$f_{lambert} = \frac{c}{\pi}$$
$$f_{cook-torrance} = \frac{DFG}{4(\omega_o \cdot n)(\omega_i \cdot n)}$$
求解：
$$L_o(p,\omega_o) = \int\limits_{\Omega} (k_d\frac{c}{\pi} + k_s\frac{DFG}{4(\omega_o \cdot n)(\omega_i \cdot n)})L_i(p,\omega_i) n \cdot \omega_i  d\omega_i$$

## Kulla-Conty BRDF
Cook-Torrance 微表面BRDF不考虑从微表面多次反射(“反弹”)的光。 这种简化会导致一些能量损失和过度暗化，特别是对于粗糙金属
引入一个微表面 BRDF 的补偿项，来补偿光线的多次弹射，使得材质的渲染结果可以近似保持能量守恒
$$
f_r = f_{micro} +  f_{add}*f_{ms}
$$
$$
f_{add}=\frac{F_{avg}E_{avg}}{1-F_{avg}(1-E_{avg})}
$$
$$
f_{ms}=\frac{(1-E_{μ_O})(1-E_{μ_i})}{\pi(1-E_{avg})}
$$
$$
	F_{avg}=2\int_{0}^{1} F(μ)μ dμ
$$
### fms的形式
fms仅关注积分结果为1-E(μ),计算不是重点
E(μ)=BRDF一次弹射输出的总能量

### 为什么损失能量
G项只考虑了光线一次弹射，没考虑多次弹射,表面粗糙度的增大，物体表面反射的总能量越来越少，这导致渲染出来的物体表面越来越暗![](https://cdn.jsdelivr.net/gh/ZeusYang/CDN-for-yangwc.com@1.1.45/blog/PBRM/11.jpg)

# **D** 
aka NDF(法线分布函数)
法线等于h的微表面比例
表示反射光强度在法线附件的分布，微平面向量和面法向越接近，强度越大。通过粗糙度改变lobe形状
e.g. 如果我们的微平面中有35%与向量取向一致，则法线分布函数或者说NDF将会返回0.35
```glsl
float DistributionGGX(vec3 N, vec3 H, float roughness)
{

   // TODO: To calculate GGX NDF here
    float a = roughness*roughness;

    float a2 = a*a;

    float NdotH = max(dot(N, H), 0.0);

    float NdotH2 = NdotH*NdotH;

  

    float nom   = a2;

    float denom = (NdotH2 * (a2 - 1.0) + 1.0);

    denom = PI * denom * denom;

    return nom / max(denom, 0.0001);

}
```

# **F**

表示菲涅尔效应，掠视金属时反射较多的光而俯视时反射光较少
```glsl
vec3 fresnelSchlick(vec3 F0, vec3 V, vec3 H)
{
    // TODO: To calculate Schlick F here
    return F0 + (1.0 - F0) * pow(clamp(1.0 - max(dot(H, V), 0.0), 0.0, 1.0), 5.0);
}
```

# G
微平面间相互遮蔽的比率，这种相互遮蔽会损耗光线的能量。几何函数是一个值域为[0.0, 1.0]的乘数，其中白色或者说1.0表示没有微平面阴影，而黑色或者说0.0则表示微平面彻底被遮蔽。
![](https://learnopengl-cn.github.io/img/07/01/geometry.png)

```glsl
float GeometrySchlickGGX(float NdotV, float roughness)
{
    // TODO: To calculate Smith G1 here
    float a = roughness+1.0;
    float k = (a * a) / 8.0;
    float nom = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    return nom / denom;
}
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    // TODO: To calculate Smith G here
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);
    return ggx1 * ggx2;
}
```

# IBL
从周围的环境中获取光源信息，通常使用hdr格式的cubemap，将cubemap的每个pixel看作光源，在渲染方程中使用，将环境光这一部分考虑进去后使得物体看起来更加正确。

# 环境光
天空盒产生的光照，由diffuse和specular两部分组成的，将cubemap的每个pixel视为一个光源。使用一个方向向量 wi 对此立方体贴图进行采样，我们就可以获取该方向上的光照强度。

# 重要性采样

todo
