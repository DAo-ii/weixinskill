/**
 * 奶茶店原子组件库
 * Milk Tea Shop Atomic Components Library
 * 
 * 版本: 1.0.0
 * 日期: 2024-01-01
 */

// ==================== 产品卡片组件 ====================

/**
 * 产品卡片组件
 * 展示单个产品的基本信息
 */
const ProductCard = {
    name: 'ProductCard',
    template: `
        <view class="product-card" bindtap="onTap">
            <image class="product-image" src="{{image}}" mode="aspectFill" />
            <view class="product-info">
                <text class="product-name">{{name}}</text>
                <text class="product-desc">{{description}}</text>
                <view class="product-bottom">
                    <text class="product-price">¥{{price}}</text>
                    <view class="product-tags">
                        <text wx:for="{{tags}}" wx:key="index" class="tag">{{item}}</text>
                    </view>
                </view>
                <view class="add-btn">
                    <text>+</text>
                </view>
            </view>
        </view>
    `,
    style: `
        .product-card {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .product-image {
            width: 100%;
            height: 160px;
        }
        .product-info {
            padding: 12px;
        }
        .product-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        .product-desc {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
            display: block;
        }
        .product-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
        }
        .product-price {
            font-size: 18px;
            font-weight: 600;
            color: #07C160;
        }
        .product-tags {
            display: flex;
            gap: 4px;
        }
        .tag {
            font-size: 10px;
            padding: 2px 6px;
            background: #FFF5E6;
            color: #FF6600;
            border-radius: 4px;
        }
        .add-btn {
            position: absolute;
            right: 12px;
            bottom: 12px;
            width: 24px;
            height: 24px;
            background: #07C160;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
    `
};

// ==================== 分类标签组件 ====================

/**
 * 分类标签组件
 * 支持横向滚动的分类切换
 */
const CategoryTabs = {
    name: 'CategoryTabs',
    template: `
        <scroll-view class="category-scroll" scroll-x enable-flex>
            <view class="category-list">
                <view 
                    wx:for="{{categories}}" 
                    wx:key="id"
                    class="category-item {{activeId === item.id ? 'active' : ''}}"
                    bindtap="onTabChange"
                    data-id="{{item.id}}"
                >
                    <text class="category-icon">{{item.icon}}</text>
                    <text class="category-name">{{item.name}}</text>
                </view>
            </view>
        </scroll-view>
    `,
    style: `
        .category-scroll {
            height: 80px;
            white-space: nowrap;
        }
        .category-list {
            display: inline-flex;
            padding: 12px 16px;
            gap: 16px;
        }
        .category-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 60px;
            padding: 8px 12px;
            border-radius: 12px;
            transition: all 0.3s;
        }
        .category-item.active {
            background: #07C160;
            color: #fff;
        }
        .category-icon {
            font-size: 24px;
            margin-bottom: 4px;
        }
        .category-name {
            font-size: 12px;
        }
    `
};

// ==================== 购物车组件 ====================

/**
 * 购物车抽屉组件
 */
const CartDrawer = {
    name: 'CartDrawer',
    template: `
        <view class="cart-drawer {{show ? 'show' : ''}}">
            <view class="cart-mask" bindtap="onClose"></view>
            <view class="cart-content">
                <view class="cart-header">
                    <text class="cart-title">购物车</text>
                    <text class="cart-clear" bindtap="onClear">清空</text>
                </view>
                <view class="cart-list">
                    <view wx:for="{{items}}" wx:key="id" class="cart-item">
                        <text class="item-name">{{item.name}}</text>
                        <text class="item-price">¥{{item.price}}</text>
                        <view class="quantity-control">
                            <text bindtap="onDecrease" data-id="{{item.id}}">-</text>
                            <text class="quantity">{{item.quantity}}</text>
                            <text bindtap="onIncrease" data-id="{{item.id}}">+</text>
                        </view>
                    </view>
                </view>
                <view class="cart-footer">
                    <view class="total-info">
                        <text>共{{totalCount}}件</text>
                        <text class="total-price">¥{{totalPrice}}</text>
                    </view>
                    <button class="checkout-btn" bindtap="onCheckout">去结算</button>
                </view>
            </view>
        </view>
    `,
    style: `
        .cart-drawer {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            visibility: hidden;
            transition: visibility 0.3s;
        }
        .cart-drawer.show {
            visibility: visible;
        }
        .cart-mask {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
        }
        .cart-content {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: #fff;
            border-radius: 16px 16px 0 0;
            max-height: 60%;
            overflow: hidden;
        }
        .cart-header {
            display: flex;
            justify-content: space-between;
            padding: 16px;
            border-bottom: 1px solid #eee;
        }
        .cart-title {
            font-size: 16px;
            font-weight: 600;
        }
        .cart-clear {
            color: #999;
            font-size: 14px;
        }
        .cart-list {
            max-height: 300px;
            overflow-y: auto;
        }
        .cart-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #f5f5f5;
        }
        .item-name {
            flex: 1;
            font-size: 14px;
        }
        .item-price {
            color: #07C160;
            margin-right: 16px;
        }
        .quantity-control {
            display: flex;
            align-items: center;
        }
        .quantity-control text {
            width: 24px;
            height: 24px;
            text-align: center;
            line-height: 24px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .quantity {
            margin: 0 8px;
        }
        .cart-footer {
            display: flex;
            align-items: center;
            padding: 16px;
            background: #f9f9f9;
        }
        .total-info {
            flex: 1;
        }
        .total-price {
            font-size: 20px;
            font-weight: 600;
            color: #07C160;
        }
        .checkout-btn {
            background: #07C160;
            color: #fff;
            padding: 12px 32px;
            border-radius: 24px;
            border: none;
        }
    `
};

// ==================== 订单状态组件 ====================

/**
 * 订单状态组件
 * 展示订单进度和状态
 */
const OrderStatus = {
    name: 'OrderStatus',
    template: `
        <view class="order-status">
            <view class="status-header">
                <text class="status-icon">{{statusIcon}}</text>
                <text class="status-text">{{statusText}}</text>
            </view>
            <view class="status-progress">
                <view wx:for="{{steps}}" wx:key="index" class="progress-item">
                    <view class="progress-dot {{index <= currentStep ? 'active' : ''}}"></view>
                    <text class="progress-label">{{item}}</text>
                </view>
            </view>
            <view class="status-info">
                <text class="info-text">{{estimatedTime}}</text>
            </view>
        </view>
    `,
    style: `
        .order-status {
            background: linear-gradient(135deg, #07C160, #06AD56);
            padding: 24px;
            border-radius: 16px;
            color: #fff;
        }
        .status-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .status-icon {
            font-size: 32px;
            margin-right: 12px;
        }
        .status-text {
            font-size: 20px;
            font-weight: 600;
        }
        .status-progress {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        .progress-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
        }
        .progress-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            margin-bottom: 8px;
        }
        .progress-dot.active {
            background: #fff;
        }
        .progress-label {
            font-size: 12px;
            opacity: 0.8;
        }
        .status-info {
            text-align: center;
            font-size: 14px;
            opacity: 0.9;
        }
    `
};

// ==================== 优惠券组件 ====================

/**
 * 优惠券组件
 */
const CouponCard = {
    name: 'CouponCard',
    template: `
        <view class="coupon-card {{disabled ? 'disabled' : ''}}" bindtap="onSelect">
            <view class="coupon-left">
                <text class="coupon-value">{{value}}</text>
                <text class="coupon-desc">{{description}}</text>
            </view>
            <view class="coupon-right">
                <text class="coupon-name">{{name}}</text>
                <text class="coupon-condition">{{condition}}</text>
                <text class="coupon-expire">有效期至 {{expireDate}}</text>
            </view>
            <view class="coupon-action">
                <text wx:if="{{disabled}}">不可用</text>
                <text wx:else>立即领取</text>
            </view>
        </view>
    `,
    style: `
        .coupon-card {
            display: flex;
            background: #FFF5E6;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #FFD700;
        }
        .coupon-card.disabled {
            opacity: 0.5;
            border-color: #ddd;
            background: #f5f5f5;
        }
        .coupon-left {
            background: linear-gradient(135deg, #FF6600, #FF8533);
            color: #fff;
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 80px;
        }
        .coupon-value {
            font-size: 24px;
            font-weight: 700;
        }
        .coupon-desc {
            font-size: 10px;
            margin-top: 4px;
        }
        .coupon-right {
            flex: 1;
            padding: 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .coupon-name {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
        .coupon-condition {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        .coupon-expire {
            font-size: 10px;
            color: #999;
            margin-top: 4px;
        }
        .coupon-action {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 16px;
            color: #FF6600;
            font-size: 14px;
            font-weight: 500;
        }
        .coupon-card.disabled .coupon-action {
            color: #999;
        }
    `
};

// ==================== 排队组件 ====================

/**
 * 排队显示组件
 */
const QueueDisplay = {
    name: 'QueueDisplay',
    template: `
        <view class="queue-display">
            <view class="queue-number">
                <text class="number-label">当前叫号</text>
                <text class="number-value">{{currentNumber}}</text>
            </view>
            <view class="queue-info">
                <view class="info-item">
                    <text class="info-value">{{waitingCount}}</text>
                    <text class="info-label">等待人数</text>
                </view>
                <view class="info-item">
                    <text class="info-value">{{estimatedWait}}</text>
                    <text class="info-label">预计等待(分钟)</text>
                </view>
            </view>
            <view class="queue-status">
                <text class="status-text">您的排队号：</text>
                <text class="your-number">{{yourNumber}}</text>
            </view>
        </view>
    `,
    style: `
        .queue-display {
            background: linear-gradient(135deg, #667EEA, #764BA2);
            padding: 24px;
            border-radius: 16px;
            color: #fff;
            text-align: center;
        }
        .queue-number {
            margin-bottom: 20px;
        }
        .number-label {
            font-size: 14px;
            opacity: 0.8;
        }
        .number-value {
            font-size: 64px;
            font-weight: 700;
            display: block;
        }
        .queue-info {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 20px;
        }
        .info-value {
            font-size: 24px;
            font-weight: 600;
            display: block;
        }
        .info-label {
            font-size: 12px;
            opacity: 0.7;
        }
        .queue-status {
            background: rgba(255,255,255,0.2);
            padding: 12px;
            border-radius: 8px;
        }
        .your-number {
            font-size: 28px;
            font-weight: 700;
            margin-left: 8px;
        }
    `
};

// ==================== 评价组件 ====================

/**
 * 评价星级组件
 */
const StarRating = {
    name: 'StarRating',
    template: `
        <view class="star-rating">
            <block wx:for="{{5}}" wx:key="index">
                <text 
                    class="star {{index < rating ? 'active' : ''}}"
                    bindtap="onRate"
                    data-index="{{index + 1}}"
                >★</text>
            </block>
        </view>
    `,
    style: `
        .star-rating {
            display: inline-flex;
        }
        .star {
            font-size: 24px;
            color: #ddd;
            margin-right: 4px;
        }
        .star.active {
            color: #FFD700;
        }
    `
};

// 导出所有组件
module.exports = {
    ProductCard,
    CategoryTabs,
    CartDrawer,
    OrderStatus,
    CouponCard,
    QueueDisplay,
    StarRating
};
