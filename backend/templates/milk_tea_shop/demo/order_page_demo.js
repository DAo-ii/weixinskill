/**
 * 奶茶店下单页面示例
 * 使用原子组件搭建完整下单流程
 */

// ============================================
// 页面结构：组合原子组件
// ============================================

/*
页面布局：
┌─────────────────────────────────────┐
│         CategoryTabs (分类标签)       │
│  [奶茶] [果茶] [特调] [新品]          │
├─────────────────────────────────────┤
│                                     │
│    ProductCard (产品卡片) x N        │
│    ┌─────────┐  ┌─────────┐         │
│    │ 图片    │  │ 图片    │         │
│    │ 名称    │  │ 名称    │         │
│    │ 价格    │  │ 价格    │         │
│    │ [加入]  │  │ [加入]  │         │
│    └─────────┘  └─────────┘         │
│                                     │
├─────────────────────────────────────┤
│         CartDrawer (购物车)          │
│  🛒 已选 3 件  ¥45.00  [结算]        │
└─────────────────────────────────────┘
*/

// ============================================
// 1. 使用 CategoryTabs 组件
// ============================================

// WXML:
/*
<view class="order-page">
  <!-- 分类标签 -->
  <category-tabs 
    categories="{{categories}}"
    active="{{activeCategory}}"
    bind:change="onCategoryChange"
  />
</view>
*/

// JS:
Page({
  data: {
    categories: ['奶茶', '果茶', '特调', '新品'],
    activeCategory: '奶茶'
  },
  
  onCategoryChange(e) {
    this.setData({ activeCategory: e.detail.category })
    this.loadProducts(e.detail.category)
  },
  
  loadProducts(category) {
    // 调用原子接口：queryProductList
    const products = queryProductList({ category })
    this.setData({ products })
  }
})

// ============================================
// 2. 使用 ProductCard 组件
// ============================================

// WXML:
/*
<view class="products-grid">
  <block wx:for="{{products}}" wx:key="id">
    <product-card 
      product="{{item}}"
      bind:add="onAddToCart"
    />
  </block>
</view>
*/

// JS:
Page({
  onAddToCart(e) {
    const product = e.detail.product
    // 添加到购物车
    this.addToCart(product)
  },
  
  addToCart(product) {
    let cart = this.data.cart || []
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    })
    this.setData({ cart })
    this.updateCartTotal()
  }
})

// ============================================
// 3. 使用 CartDrawer 组件
// ============================================

// WXML:
/*
<cart-drawer 
  items="{{cart}}"
  total="{{cartTotal}}"
  visible="{{cartVisible}}"
  bind:checkout="onCheckout"
  bind:remove="onRemoveItem"
/>
*/

// JS:
Page({
  data: {
    cart: [],
    cartTotal: 0,
    cartVisible: false
  },
  
  updateCartTotal() {
    const total = this.data.cart.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
    this.setData({ cartTotal: total })
  },
  
  onCheckout() {
    // 调用原子接口：createOrder
    const order = createOrder({
      items: this.data.cart,
      total: this.data.cartTotal,
      userId: this.data.userId
    })
    
    // 显示订单状态
    this.setData({ 
      orderId: order.id,
      orderStatus: 'pending'
    })
    
    // 跳转到订单详情页
    wx.navigateTo({
      url: `/pages/order/detail?id=${order.id}`
    })
  }
})

// ============================================
// 4. 使用 OrderStatus 组件
// ============================================

// WXML (订单详情页):
/*
<view class="order-detail">
  <order-status 
    status="{{orderStatus}}"
    steps="{{orderSteps}}"
  />
  
  <view class="order-items">
    <block wx:for="{{orderItems}}" wx:key="id">
      <view class="item">{{item.name}} x{{item.quantity}}</view>
    </block>
  </view>
</view>
*/

// JS:
Page({
  data: {
    orderStatus: 'preparing',
    orderSteps: [
      { status: 'pending', label: '待制作', completed: true },
      { status: 'preparing', label: '制作中', completed: false },
      { status: 'ready', label: '待取餐', completed: false },
      { status: 'completed', label: '已完成', completed: false }
    ]
  },
  
  onLoad(options) {
    const orderId = options.id
    
    // 调用原子接口：queryOrderStatus
    this.pollOrderStatus(orderId)
  },
  
  pollOrderStatus(orderId) {
    setInterval(() => {
      const status = queryOrderStatus(orderId)
      this.updateOrderSteps(status.status)
    }, 5000)
  },
  
  updateOrderSteps(status) {
    const steps = this.data.orderSteps.map(step => {
      return {
        ...step,
        completed: step.status === status || 
                   this.isStepCompleted(step.status, status)
      }
    })
    this.setData({ orderStatus: status, orderSteps: steps })
  }
})

// ============================================
// 5. 使用 CouponCard 组件
// ============================================

// WXML:
/*
<view class="coupons-section">
  <block wx:for="{{availableCoupons}}" wx:key="id">
    <coupon-card 
      coupon="{{item}}"
      bind:apply="onApplyCoupon"
    />
  </block>
</view>
*/

// JS:
Page({
  onLoad() {
    // 调用原子接口：queryAvailableCoupons
    const coupons = queryAvailableCoupons(this.data.userId)
    this.setData({ availableCoupons: coupons })
  },
  
  onApplyCoupon(e) {
    const couponId = e.detail.couponId
    
    // 调用原子接口：applyCoupon
    const result = applyCoupon({
      orderId: this.data.orderId,
      couponId: couponId
    })
    
    if (result.success) {
      this.setData({ 
        appliedCoupon: result.coupon,
        discountedTotal: result.newTotal
      })
      wx.showToast({ title: '优惠券已应用' })
    }
  }
})

// ============================================
// 6. 使用 QueueDisplay 组件
// ============================================

// WXML:
/*
<view class="queue-section">
  <queue-display 
    queueNumber="{{queueNumber}}"
    waitTime="{{waitTime}}"
    currentNumber="{{currentNumber}}"
  />
</view>
*/

// JS:
Page({
  onLoad() {
    // 调用原子接口：getQueueNumber
    const queue = getQueueNumber({ userId: this.data.userId })
    this.setData({ 
      queueNumber: queue.number,
      waitTime: queue.waitTime
    })
    
    // 调用原子接口：queryQueueStatus（轮询）
    this.pollQueueStatus()
  },
  
  pollQueueStatus() {
    setInterval(() => {
      const status = queryQueueStatus()
      this.setData({ currentNumber: status.currentNumber })
    }, 10000)
  }
})

// ============================================
// 7. 使用 StarRating 组件
// ============================================

// WXML:
/*
<view class="review-section">
  <star-rating 
    rating="{{rating}}"
    bind:change="onRatingChange"
  />
  <textarea 
    placeholder="请输入评价内容"
    bindinput="onReviewInput"
  />
  <button bindtap="submitReview">提交评价</button>
</view>
*/

// JS:
Page({
  data: {
    rating: 5,
    reviewContent: ''
  },
  
  onRatingChange(e) {
    this.setData({ rating: e.detail.rating })
  },
  
  onReviewInput(e) {
    this.setData({ reviewContent: e.detail.value })
  },
  
  submitReview() {
    // 调用原子接口：submitReview
    submitReview({
      orderId: this.data.orderId,
      rating: this.data.rating,
      content: this.data.reviewContent
    })
    
    wx.showToast({ title: '评价已提交' })
    wx.navigateBack()
  }
})

// ============================================
// 完整页面示例：下单流程
// ============================================

// pages/order/index.js
Page({
  data: {
    // 分类数据
    categories: ['奶茶', '果茶', '特调', '新品'],
    activeCategory: '奶茶',
    
    // 产品列表
    products: [],
    
    // 购物车
    cart: [],
    cartTotal: 0,
    cartVisible: false,
    
    // 用户信息
    userId: null,
    
    // 优惠券
    availableCoupons: [],
    appliedCoupon: null
  },
  
  onLoad() {
    // 获取用户信息
    this.getUserId()
    
    // 加载产品
    this.loadProducts('奶茶')
    
    // 加载优惠券
    this.loadCoupons()
  },
  
  getUserId() {
    // 从本地存储获取用户ID
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userId: userInfo.id })
  },
  
  loadProducts(category) {
    // 调用原子接口
    const products = queryProductList({ category })
    this.setData({ products })
  },
  
  loadCoupons() {
    // 调用原子接口
    const coupons = queryAvailableCoupons(this.data.userId)
    this.setData({ availableCoupons: coupons })
  },
  
  // 分类切换
  onCategoryChange(e) {
    this.setData({ activeCategory: e.detail.category })
    this.loadProducts(e.detail.category)
  },
  
  // 添加到购物车
  onAddToCart(e) {
    const product = e.detail.product
    let cart = this.data.cart
    
    // 检查是否已存在
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    
    this.setData({ cart })
    this.updateCartTotal()
  },
  
  updateCartTotal() {
    const total = this.data.cart.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
    this.setData({ cartTotal: total })
  },
  
  // 显示购物车
  showCart() {
    this.setData({ cartVisible: true })
  },
  
  // 结算
  onCheckout() {
    // 调用原子接口：createOrder
    const order = createOrder({
      items: this.data.cart,
      total: this.data.cartTotal,
      userId: this.data.userId,
      couponId: this.data.appliedCoupon?.id
    })
    
    // 清空购物车
    this.setData({ cart: [], cartTotal: 0, cartVisible: false })
    
    // 跳转到订单详情
    wx.navigateTo({
      url: `/pages/order/detail?id=${order.id}`
    })
  }
})