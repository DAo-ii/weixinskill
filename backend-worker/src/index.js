export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'healthy', service: 'weixinskill-backend' }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Auth routes
      if (url.pathname === '/api/auth/register' && request.method === 'POST') {
        const body = await request.json();
        return new Response(JSON.stringify({ 
          message: '注册成功',
          user: { phone: body.phone, id: 1 },
          token: 'mock-jwt-token'
        }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        const body = await request.json();
        return new Response(JSON.stringify({ 
          message: '登录成功',
          user: { phone: body.phone, id: 1 },
          token: 'mock-jwt-token'
        }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Templates routes
      if (url.pathname === '/api/templates') {
        return new Response(JSON.stringify([
          { id: 'milk-tea', name: '奶茶店', icon: '🧋', description: '适合奶茶、果茶、咖啡等饮品店', features: ['点餐下单', '产品推荐', '优惠活动'] },
          { id: 'fast-food', name: '快餐店', icon: '🍔', description: '适合汉堡、炸鸡、披萨等快餐店', features: ['快速点餐', '套餐推荐', '外卖对接'] },
          { id: 'convenience', name: '便利店', icon: '🏪', description: '适合便利店、超市、小卖部', features: ['商品查询', '库存提醒', '促销通知'] },
        ]), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Projects routes
      if (url.pathname === '/api/projects' && request.method === 'GET') {
        return new Response(JSON.stringify([]), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Download route
      if (url.pathname.match(/\/api\/projects\/\d+\/download$/) && request.method === 'GET') {
        // Mock download - return a simple ZIP file
        const zipContent = 'PK\x03\x04'; // Minimal ZIP header
        return new Response(zipContent, {
          headers: {
            ...headers,
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="skill.zip"',
          },
        });
      }

      // Default API response
      return new Response(JSON.stringify({ message: 'API endpoint' }), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // Default response
    return new Response(JSON.stringify({ 
      name: '码上未来 - AI 技能包生成平台',
      version: '0.1.0',
      docs: '/api/docs'
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  },
};
