Page({
  data: {
    inputValue: '',
    messages: []
  },
  
  onInput: function(e) {
    this.setData({ inputValue: e.detail.value })
  },
  
  sendMessage: function() {
    const { inputValue, messages } = this.data
    if (!inputValue) return
    
    // 添加用户消息
    messages.push({ role: 'user', content: inputValue })
    
    // 模拟AI回复
    let reply = '您好！我是AI智能客服，有什么可以帮助您的吗？'
    if (inputValue.includes('营业时间')) {
      reply = '我们的营业时间是 9:00-22:00，欢迎光临！'
    } else if (inputValue.includes('优惠')) {
      reply = '当前有满20减3的优惠活动哦！'
    } else if (inputValue.includes('菜单')) {
      reply = '我们有柠檬水、奶茶、咖啡等饮品，欢迎选购！'
    }
    
    messages.push({ role: 'assistant', content: reply })
    
    this.setData({
      inputValue: '',
      messages: messages
    })
  }
})
