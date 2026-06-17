/**
 * 创建订单
 * @param {Object} params
 * @param {Array} params.items - 订单商品列表
 * @param {string} params.delivery_type - 取餐方式: pickup | delivery
 * @param {string} [params.remarks] - 订单备注
 * @returns {Promise<Object>}
 */
async function createOrder(params = {}) {
  const { items, delivery_type, remarks } = params;

  if (!items || items.length === 0) {
    return { success: false, error: '订单商品不能为空' };
  }

  // 计算总价
  let totalAmount = 0;
  const orderItems = items.map(item => {
    const price = getProductPrice(item.product_name);
    const subtotal = price * item.quantity;
    totalAmount += subtotal;

    return {
      ...item,
      unit_price: price,
      subtotal: subtotal
    };
  });

  // 生成订单号
  const orderId = 'ORD' + Date.now().toString(36).toUpperCase();

  // 这里应该调用实际的下单接口
  // 示例：return await wx.cloud.callFunction({ name: 'createOrder', data: { items, delivery_type, remarks } });

  return {
    success: true,
    order_id: orderId,
    items: orderItems,
    total_amount: totalAmount,
    delivery_type: delivery_type,
    status: 'pending',
    estimated_time: '15-20分钟',
    remarks: remarks || ''
  };
}

/**
 * 获取产品价格（模拟）
 */
function getProductPrice(productName) {
  const priceMap = {
    {% for product in products %}
    '{{ product.name }}': {{ product.price }}{% if not loop.last %},{% endif %}
    {% endfor %}
  };

  return priceMap[productName] || 15;
}

module.exports = createOrder;
