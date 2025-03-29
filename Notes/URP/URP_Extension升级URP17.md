本文记录了
- URP14与URP17中典型需求的不同做法
- 将URP14的后处理Feature升级为URP17

# ScriptableRenderPass
URP17将RenderGraph API正式转正，原有的Execute标记为过时API，并且在URP中大量基于Execute的接口实现已被移除。
项目中原有基于URP14相关的做法需要重构。
## 接口
Renderpass最引人注目的改动：
已弃用
```c#
public override void Execute(ScriptableRenderContext context, ref RenderingData renderingData)
```
替换为：
```c#
public override void RecordRenderGraph(RenderGraph renderGraph, ContextContainer frameData)
```

原来，我们从`ScriptableRenderContext` ,  `RenderingData` 中获取描述符，camera，等信息，现在我们要通过`ContextContainer frameData`来获取。
在URP14及以前，我们可以这么做
```c#
RenderTextureDescriptor descriptor = renderingData.cameraData.cameraTargetDescriptor;  
descriptor.msaaSamples = 1;  
descriptor.depthBufferBits = 0;  
Vector2 renderSize = new Vector2(descriptor.width, descriptor.height);  
  
var outputSize = new Vector2(descriptor.width, descriptor.height);  
descriptor.width = Mathf.RoundToInt(descriptor.width / upscaledRatio);  
descriptor.height = Mathf.RoundToInt(descriptor.height / upscaledRatio);  
RenderingUtils.ReAllocateIfNeeded(ref outputRT[0], descriptor, name: "outputRT_0");  
RenderingUtils.ReAllocateIfNeeded(ref outputRT[1], descriptor, name: "outputRT_1");
```

现在需要这样做
```c#
UniversalCameraData cameraData = frameData.Get<UniversalCameraData>();  
UniversalResourceData resourceData = frameData.Get<UniversalResourceData
  
TextureDescriptor.width = cameraData.cameraTargetDescriptor.width;  
TextureDescriptor.height = cameraData.cameraTargetDescriptor.height;  
TextureDescriptor.depthBufferBits = 0;  
  
TextureHandle cameraColor = resourceData.activeColorTexture;  
TextureHandle blurTextureH =  
    UniversalRenderer.CreateRenderGraphTexture(renderGraph, TextureDescriptor, "_Horizon", false);  
TextureHandle blurTextureV =  
    UniversalRenderer.CreateRenderGraphTexture(renderGraph, TextureDescriptor, "_Vertical", false);
```
同时，原有基于CommandBuffer的绘制工作流也发生了重大变化
在URP14中，我们可以这样实现一个绘制过程
```c#

using (new ProfilingScope(cmd, data.m_ProfilingSampler))
{
	//draw prepare
	context.DrawRenderers(renderingData.cullResults, ref drawSettings, ref filterSettings, ref data.m_RenderStateBlock);
}
context.ExecuteCommandBuffer(cmd);


```
现在，RDG API需要我们做更多的事情，对渲染流程必须更加明确
- 由于RDG需要知道资源的使用情况，我们必须明确这个注入RDG的Pass的类型，以及资源的使用标记
- `SetRenderFunc((PassData data, UnsafeGraphContext rgContext)`的函数签名，表示RDG绘制运行时需要的资源必须以PassData形式传递，在实际绘制前，我们要准备好使用的PassData
```c#
using (var builder =  
       renderGraph.AddUnsafePass<PassData>("Diffusion", out var passData, profilingSampler))  
{  
    builder.AllowGlobalStateModification(true);  
    builder.AllowPassCulling(false);  
    // passData.sourceTexture = cameraColor;  
    passData.blurHTexture = blurTextureH;  
    passData.blurVTexture = blurTextureV;  
    passData.material = DiffusionMaterial;  
    passData.cameraColor = resourceData.cameraColor;  
  
    builder.UseTexture(passData.cameraColor, AccessFlags.ReadWrite);  
    builder.UseTexture(passData.blurHTexture, AccessFlags.ReadWrite);  
    builder.UseTexture(passData.blurVTexture, AccessFlags.ReadWrite);  
  
  
    builder.SetRenderFunc((PassData data, UnsafeGraphContext rgContext) =>  
    {  
		//do something.....
    });}
```
并且，原有的CommandBuffer已被标记为Native&Unsafe。Unity为我们准备了它的更多派生，通过`CommandBufferHelpers`获取这些CommandBuffer的派生对象：
`RasterCommandBuffer`
`ComputeCommandBuffer`
`UnsafeCommandBuffer



# 升级
现在，将URP_Extension中一个简单的后处理功能升级适配RDG工作流。

URP17为后处理Feature开了后门，我们只需要`AddBlitPass`即可规避复杂的重复代码，像URP14一样直接Blitter API一把写。
```c#
public override void RecordRenderGraph(RenderGraph renderGraph, ContextContainer frameData)  
{  
    var volume = VolumeManager.instance.stack.GetComponent<WhiteNoiseVolume>();  
  
  
    UniversalResourceData resourceData = frameData.Get<UniversalResourceData>();  
    WhiteNoiseMaterial.SetFloat(ShaderConstants._Intensity, volume.Intensity.value);  
  
    TextureHandle source = resourceData.activeColorTexture;  
    var destinationDesc = renderGraph.GetTextureDesc(source);  
    destinationDesc.name = $"CameraColor-{nameof(WhiteNoiseRenderPass)}";  
    destinationDesc.clearBuffer = false;  
  
    TextureHandle destination = renderGraph.CreateTexture(destinationDesc);  
  
    RenderGraphUtils.BlitMaterialParameters para = new(source, destination, whiteNoiseMaterial,  
        0);  
    renderGraph.AddBlitPass(para, passName: nameof(WhiteNoiseRenderPass));  
    resourceData.cameraColor = destination;  
  
}
```
