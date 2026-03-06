/**
 * 搜索栏组件
 * 提供搜索输入和搜索功能
 */

Component({
  /**
   * 组件属性
   */
  properties: {
    // 占位符文字
    placeholder: {
      type: String,
      value: '搜索菜谱...'
    },
    // 当前值
    value: {
      type: String,
      value: ''
    },
    // 是否自动聚焦
    focus: {
      type: Boolean,
      value: false
    },
    // 是否显示搜索按钮
    showSearchButton: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 输入事件
     */
    onInput(e) {
      const { value } = e.detail;
      this.setData({ value });
      this.triggerEvent('input', { value });
    },

    /**
     * 确认搜索（点击键盘搜索按钮）
     */
    onConfirm(e) {
      const { value } = e.detail;
      this.triggerEvent('search', { value });
    },

    /**
     * 点击搜索按钮
     */
    onSearch() {
      const { value } = this.properties;
      this.triggerEvent('search', { value });
    },

    /**
     * 清除输入
     */
    onClear() {
      this.setData({ value: '' });
      this.triggerEvent('clear');
      this.triggerEvent('input', { value: '' });
    },

    /**
     * 聚焦事件
     */
    onFocus(e) {
      this.triggerEvent('focus', e.detail);
    },

    /**
     * 失焦事件
     */
    onBlur(e) {
      this.triggerEvent('blur', e.detail);
    }
  }
});
