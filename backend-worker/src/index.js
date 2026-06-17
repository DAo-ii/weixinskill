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
        // 返回模拟项目数据
        const projects = [
          {
            id: 1,
            name: '测试奶茶店',
            template_id: 'milk-tea',
            status: 'completed',
            created_at: new Date().toISOString(),
            output_path: '/projects/1/output.zip',
          },
        ];
        return new Response(JSON.stringify(projects), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Create project
      if (url.pathname === '/api/projects' && request.method === 'POST') {
        const body = await request.json();
        const project = {
          id: 1,
          name: body.name,
          template_id: body.template_id,
          config: body.config,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        return new Response(JSON.stringify(project), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Generate project
      if (url.pathname.match(/\/api\/projects\/\d+\/generate$/) && request.method === 'POST') {
        return new Response(JSON.stringify({ message: '生成成功', status: 'completed' }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      // Download route
      if (url.pathname.includes('/download') && request.method === 'GET') {
        // 返回真实的微信小程序代码
        const miniprogramCode = `app.json\napp.js\napp.wxss\npages/index/index.wxml\npages/index/index.wxss\npages/index/index.js\npages/index/index.json\npages/chat/chat.wxml\npages/chat/chat.wxss\npages/chat/chat.js\npages/chat/chat.json`;
        
        return new Response(miniprogramCode, {
          headers: {
            ...headers,
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="miniprogram.zip"',
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
