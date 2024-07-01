本文不对GPU内部具体机制进行具体分析，同时我并不熟悉CUDA等相关并行计算原理。仅作为经验记录。

CPU有复杂的硬件设计可以很好的做分支预测，即预测应用程序会走哪个path。如果预测正确，那么CPU只会有很小的消耗。

和CPU对比来说，GPU就没那么复杂的分支预测。GPU处理分支计算（条件语句如 `if`）的方式主要依赖于其架构和执行模型。

在 GPU 中，线程被组织成“warp”（通常为 32 个线程）来执行相同的指令。如果 warp 中的线程遇到分支语句（如 `if`），且不同线程的条件判断结果不同，就会发生“线程发散”（thread divergence）。

![](https://pic2.zhimg.com/80/v2-2308f5ad5a377072bdb07c93543bf661_720w.webp)


GPU分配线程来执行代码，线程是同时开始同时结束，意味着if-else会有大量的浪费
解决方法：
if后的放在一起执行，else后的放在一起执行


shader是gpu大量并行执行的代码，避免使用`if`判断可以有效提高效率。
经典手法:
数学方法代替条件判断:
```glsl
if(dot(input.worldNormal,worldLightDir)<0)
{
    return col * _Darklight;
}
return col;
```
可以替代为
```glsl
float isShadow = step(dot(input.worldNormal,worldLightDir),0);

return lerp(col ,col * _Darklight,isShadow);
```
通过step,小于0时返回1，否则返回0，并通过isShadow使用lerp插值代替if判断。

