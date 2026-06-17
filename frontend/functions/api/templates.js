export async function onRequestGet() {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  const templates = [
    { id: 'milk-tea', name: '奶茶店', icon: '🧋', description: '适合奶茶、果茶、咖啡等饮品店' },
    { id: 'fast-food', name: '快餐店', icon: '🍔', description: '适合汉堡、炸鸡、披萨等快餐店' },
    { id: 'convenience', name: '便利店', icon: '🏪', description: '适合便利店、超市、小卖部' },
  ];

  return new Response(JSON.stringify(templates), { headers });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
