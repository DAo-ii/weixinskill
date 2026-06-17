export async function onRequestPost(context) {
  const { request } = context;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { phone, password } = body;
    
    // Mock register
    const response = {
      message: '注册成功',
      user: { phone, id: 1 },
      token: 'mock-jwt-token'
    };
    
    return new Response(JSON.stringify(response), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: '注册失败' }), {
      status: 400,
      headers,
    });
  }
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
