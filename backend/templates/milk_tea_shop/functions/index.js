/**
 * 奶茶店原子接口库
 * Milk Tea Shop Atomic Functions Library
 * 
 * 版本: 1.0.0
 * 日期: 2024-01-01
 */

// ==================== 产品查询接口 ====================

/**
 * 查询产品列表
 * @param {Object} params - 查询参数
 * @param {string} params.category - 产品分类（奶茶/果茶/咖啡/小吃）
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise<Object>} 产品列表
 */
async function queryProductList(params = {}) {
    const { category, page = 1, pageSize = 20 } = params;
    
    const allProducts = [
        { id: 1, name: '珍珠奶茶', price: 12, category: '奶茶', stock: 100, image: 'https://...', description: '经典奶茶' },
        { id: 2, name: '椰果奶茶', price: 14, category: '奶茶', stock: 80, image: 'https://...', description: '椰果奶茶' },
        { id: 3, name: '芋泥波波', price: 18, category: '奶茶', stock: 50, image: 'https://...', description: '芋泥奶茶' },
        { id: 4, name: '杨枝甘露', price: 22, category: '果茶', stock: 60, image: 'https://...', description: '芒果饮品' },
        { id: 5, name: '柠檬水', price: 10, category: '果茶', stock: 120, image: 'https://...', description: '柠檬饮品' },
        { id: 6, name: '生椰拿铁', price: 20, category: '咖啡', stock: 40, image: 'https://...', description: '咖啡饮品' },
        { id: 7, name: '鸡米花', price: 15, category: '小吃', stock: 30, image: 'https://...', description: '炸鸡小吃' },
    ];
    
    let filtered = category ? allProducts.filter(p => p.category === category) : allProducts;
    
    return {
        success: true,
        data: {
            list: filtered.slice((page - 1) * pageSize, page * pageSize),
            total: filtered.length,
            page,
            pageSize
        }
    };
}

/**
 * 查询产品详情
 * @param {number} productId - 产品ID
 * @returns {Promise<Object>} 产品详情
 */
async function queryProductDetail(productId) {
    const products = await queryProductList();
    const product = products.data.list.find(p => p.id === productId);
    
    if (!product) {
        return { success: false, error: '产品不存在' };
    }
    
    return {
        success: true,
        data: {
            ...product,
            nutritionalInfo: {
                calories: 250,
                sugar: 30,
                fat: 10
            },
            reviews: [
                { user: '用户A', rating: 5, comment: '很好喝' },
                { user: '用户B', rating: 4, comment: '不错' }
            ]
        }
    };
}

// ==================== 订单接口 ====================

/**
 * 创建订单
 * @param {Object} orderInfo - 订单信息
 * @param {Array} orderInfo.items - 订单项
 * @param {Object} orderInfo.customer - 顾客信息
 * @param {string} orderInfo.deliveryAddress - 配送地址
 * @returns {Promise<Object>} 订单结果
 */
async function createOrder(orderInfo) {
    const { items, customer, deliveryAddress } = orderInfo;
    
    // 计算总价
    const products = await queryProductList();
    let totalPrice = 0;
    
    const orderItems = items.map(item => {
        const product = products.data.list.find(p => p.id === item.id);
        if (product) {
            totalPrice += product.price * item.quantity;
            return {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: product.price * item.quantity
            };
        }
        return null;
    }).filter(Boolean);
    
    const orderId = 'ORD' + Date.now();
    
    return {
        success: true,
        data: {
            orderId,
            orderNo: `MX${Date.now()}`,
            items: orderItems,
            totalPrice,
            originalPrice: totalPrice,
            discountPrice: 0,
            status: 'pending_payment',
            createdAt: new Date().toISOString(),
            estimatedTime: '15-20分钟',
            customer,
            deliveryAddress
        }
    };
}

/**
 * 查询订单状态
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 订单状态
 */
async function queryOrderStatus(orderId) {
    const statusList = [
        { status: 'pending_payment', desc: '待支付', progress: 10 },
        { status: 'paid', desc: '已支付', progress: 25 },
        { status: 'preparing', desc: '制作中', progress: 50 },
        { status: 'ready', desc: '待取餐', progress: 75 },
        { status: 'completed', desc: '已完成', progress: 100 }
    ];
    
    return {
        success: true,
        data: {
            orderId,
            status: 'preparing',
            statusDesc: '制作中',
            progress: 50,
            estimatedTime: '10分钟',
            lastUpdate: new Date().toISOString()
        }
    };
}

/**
 * 取消订单
 * @param {string} orderId - 订单ID
 * @param {string} reason - 取消原因
 * @returns {Promise<Object>} 取消结果
 */
async function cancelOrder(orderId, reason) {
    const order = await queryOrderStatus(orderId);
    
    if (order.data.status === 'preparing' || order.data.status === 'ready') {
        return {
            success: false,
            error: '订单已开始制作，无法取消'
        };
    }
    
    return {
        success: true,
        data: {
            orderId,
            refundAmount: 0,
            refundStatus: 'not_required'
        }
    };
}

// ==================== 优惠券接口 ====================

/**
 * 查询可用优惠券
 * @param {Object} params - 查询参数
 * @param {number} params.userId - 用户ID
 * @param {number} params.orderAmount - 订单金额
 * @returns {Promise<Object>} 优惠券列表
 */
async function queryAvailableCoupons(params) {
    const { orderAmount } = params;
    
    const coupons = [
        { id: 1, name: '首单立减5元', type: 'fixed', value: 5, minAmount: 20, expDate: '2024-12-31' },
        { id: 2, name: '满30减8', type: 'fixed', value: 8, minAmount: 30, expDate: '2024-12-31' },
        { id: 3, name: '85折', type: 'percent', value: 15, maxDiscount: 10, minAmount: 25, expDate: '2024-12-31' },
        { id: 4, name: '新品尝鲜券', type: 'fixed', value: 3, minAmount: 15, expDate: '2024-06-30' }
    ];
    
    const available = coupons.filter(c => orderAmount >= c.minAmount);
    
    return {
        success: true,
        data: available
    };
}

/**
 * 应用优惠券
 * @param {string} couponId - 优惠券ID
 * @param {number} orderAmount - 订单金额
 * @returns {Promise<Object>} 优惠结果
 */
async function applyCoupon(couponId, orderAmount) {
    const coupons = await queryAvailableCoupons({ orderAmount });
    const coupon = coupons.data.find(c => c.id === parseInt(couponId));
    
    if (!coupon) {
        return { success: false, error: '优惠券不可用' };
    }
    
    let discount = 0;
    if (coupon.type === 'fixed') {
        discount = coupon.value;
    } else if (coupon.type === 'percent') {
        discount = Math.min(orderAmount * coupon.value / 100, coupon.maxDiscount);
    }
    
    return {
        success: true,
        data: {
            couponId,
            couponName: coupon.name,
            discount: Math.floor(discount),
            finalAmount: orderAmount - discount
        }
    };
}

// ==================== 库存接口 ====================

/**
 * 查询库存
 * @param {number} productId - 产品ID
 * @returns {Promise<Object>} 库存信息
 */
async function queryInventory(productId) {
    return {
        success: true,
        data: {
            productId,
            stock: 50,
            status: 'available',
            nextSupply: '明天 10:00'
        }
    };
}

// ==================== 排队接口 ====================

/**
 * 查询排队情况
 * @returns {Promise<Object>} 排队信息
 */
async function queryQueueStatus() {
    return {
        success: true,
        data: {
            currentNumber: 12,
            estimatedWait: 5,
            queueLength: 8,
            status: 'normal'
        }
    };
}

/**
 * 获取排队号码
 * @param {number} personCount - 人数
 * @returns {Promise<Object>} 排队号码
 */
async function getQueueNumber(personCount = 1) {
    return {
        success: true,
        data: {
            queueId: 'Q' + Date.now(),
            queueNumber: 15,
            estimatedWait: 8,
            personCount
        }
    };
}

// ==================== 通知接口 ====================

/**
 * 发送订单通知
 * @param {Object} params - 通知参数
 * @param {string} params.orderId - 订单ID
 * @param {string} params.type - 通知类型
 * @returns {Promise<Object>} 发送结果
 */
async function sendOrderNotification(params) {
    const { orderId, type } = params;
    
    return {
        success: true,
        data: {
            orderId,
            type,
            sentAt: new Date().toISOString(),
            channel: 'wechat'
        }
    };
}

// ==================== 会员接口 ====================

/**
 * 查询会员信息
 * @param {string} memberId - 会员ID
 * @returns {Promise<Object>} 会员信息
 */
async function queryMemberInfo(memberId) {
    return {
        success: true,
        data: {
            memberId,
            name: '张三',
            level: 'gold',
            points: 1250,
            pointsToNext: 250,
            benefits: ['生日双倍积分', '新品优先尝鲜', '专属折扣']
        }
    };
}

/**
 * 查询积分明细
 * @param {string} memberId - 会员ID
 * @returns {Promise<Object>} 积分明细
 */
async function queryPointsHistory(memberId) {
    return {
        success: true,
        data: [
            { date: '2024-01-15', desc: '消费奖励', points: 120, balance: 1250 },
            { date: '2024-01-10', desc: '生日积分', points: 200, balance: 1130 },
            { date: '2024-01-05', desc: '消费奖励', points: 80, balance: 930 }
        ]
    };
}

// ==================== 评价接口 ====================

/**
 * 提交评价
 * @param {Object} params - 评价参数
 * @param {string} params.orderId - 订单ID
 * @param {number} params.rating - 评分 1-5
 * @param {string} params.comment - 评价内容
 * @returns {Promise<Object>} 提交结果
 */
async function submitReview(params) {
    const { orderId, rating, comment } = params;
    
    return {
        success: true,
        data: {
            orderId,
            rating,
            comment,
            createdAt: new Date().toISOString(),
            reward: rating >= 4 ? 10 : 0,
            rewardDesc: '评价奖励积分已到账'
        }
    };
}

// 导出所有接口
module.exports = {
    // 产品接口
    queryProductList,
    queryProductDetail,
    
    // 订单接口
    createOrder,
    queryOrderStatus,
    cancelOrder,
    
    // 优惠券接口
    queryAvailableCoupons,
    applyCoupon,
    
    // 库存接口
    queryInventory,
    
    // 排队接口
    queryQueueStatus,
    getQueueNumber,
    
    // 通知接口
    sendOrderNotification,
    
    // 会员接口
    queryMemberInfo,
    queryPointsHistory,
    
    // 评价接口
    submitReview
};
