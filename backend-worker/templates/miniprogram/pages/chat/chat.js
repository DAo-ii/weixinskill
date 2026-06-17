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
    
    messages.push({ role: 'user', content: inputValue })
    
    // 模拟AI回复
    let reply = '您好！有什么可以帮助您的吗？'
    messages.push({ role: 'assistant', content: reply })
    
    this.setData({
      inputValue: '',
      messages: messages
    })
  }
})
