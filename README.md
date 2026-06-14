# 3D Gallery

左侧缩略图 + 右侧全屏 viewer 的 Three.js Demo 展示站。

## 项目结构

```
threejs-gallery/
├── index.html          # 布局 + 样式
├── main.js             # 核心编排器（sidebar + viewer 切换）
├── demos/
│   ├── index.js        # Demo 注册表（import 所有 demo）
│   ├── particleGalaxy.js
│   ├── morphingSphere.js
│   └── neonGrid.js
└── README.md
```

## 本地运行

```bash
# 用 Vite（推荐）
npm create vite@latest my-gallery -- --template vanilla
# 把文件复制进去，改 main.js 引用即可

# 或者直接用 serve（因为用了 ES module CDN 导入 Three.js）
npx serve .
```

> 不能直接双击 index.html，浏览器会拦截 ES module。

## 添加新 Demo

1. 在 `demos/` 下新建 `myDemo.js`，导出以下结构：

```js
export default {
  name: 'My Demo',        // 展示名
  desc: '一句话描述',
  tag: 'SHADER',          // 小标签

  init(canvas) {
    // 在 canvas 上初始化 Three.js
    // canvas 会同时用于：缩略图(小) 和 viewer(大)
    // ResizeObserver canvas.parentElement 即可自适应

    // ... Three.js 代码 ...

    // 必须返回 dispose 函数，防止内存泄漏
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      // 清理所有 geometry/material
    };
  }
};
```

2. 在 `demos/index.js` 中添加一行：

```js
export { default as myDemo } from './myDemo.js';
```

完成，自动出现在侧边栏。

## 技术要点

| 问题 | 方案 |
|------|------|
| 缩略图和主 viewer 共用同一个 demo 实例 | 每次都新建，dispose 旧的 |
| 切换时内存泄漏 | `dispose()` 清理 renderer/geo/mat |
| 响应式 resize | `ResizeObserver` 监听 `canvas.parentElement` |
| 切换动画 | CSS `opacity` 过渡 + `switching` class |
| 缩略图加载闪烁 | shimmer 骨架屏，loaded 后淡出 |
