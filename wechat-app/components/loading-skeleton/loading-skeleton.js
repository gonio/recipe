/**
 * 骨架屏加载组件
 * 提供加载状态的占位展示
 */

Component({
  /**
   * 组件属性
   */
  properties: {
    // 骨架屏类型：list（列表）、detail（详情）、rows（行）
    type: {
      type: String,
      value: 'list'
    },
    // 数量
    count: {
      type: Number,
      value: 3
    }
  }
});
