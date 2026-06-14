/**
 * Demo Registry
 * 每个 demo 导出 { name, desc, tag, init(canvas), dispose() }
 * init 接收 canvas 元素，返回 dispose 函数（或在对象上挂 dispose）
 */

export { default as particleGalaxy } from './particleGalaxy.js';
export { default as morphingSphere }  from './morphingSphere.js';
export { default as neonGrid }        from './neonGrid.js';
