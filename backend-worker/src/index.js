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
        // 返回真实的微信小程序代码 ZIP 文件（base64 编码）
        const zipBase64 = 'UEsDBBQAAAAIAMgd0lzntgP7QAAAAEgAAAAGAAAAYXBwLmpze797v2NBgUY1l4JCfp5PYmlecoaVQhqQKsnMz9PQVABJKCgk5+cV5+ek6uXkp2uoA9UrQFSqawJla7lqNXm5AFBLAwQUAAAACADIHdJcMUAzjp8AAAAEAQAACAAAAGFwcC5qc29ue797fzWXgoJSQWJ6arGSlUI0kAPj6mfmpaRWQEglHWSJ5IzEEjChBBSNBUkplQOV5ZcDTaiGKExKTM5OL8ovzUsJSa0oCS6pzEkFSirlZKZnlMAMy0ssy0xPLMnMz3NKLHKCa3DOz8kvAilWNjBPNjQzwKo8JLMkJxVkNEiho+ezmbteNO99um7Rszm92NUju6I8I7MkFeT2Wq5aXi4AUEsDBBQAAAAIAMgd0ly4xKdHKgAAACoAAAAIAAAAYXBwLnd4c3N7v3t/QWJ6qkI1l4JCUmJydnpRfmleim5yfk5+kZWCcpoZCFpz1fJyAQBQSwMEFAAAAAgAyB3SXGZmQlIzAQAAHwIAABIAAABwYWdlcy9jaGF0L2NoYXQuanN9UT9Lw0AU3wt+h+eUBEK6BxwElw6Ck4s4HM2rDcRLyF0EKQEVB/8gugkqFsFCXXRVUvHL5OKYr+BdrrUXEOGGd7/37vfnXl18bZE9tEcdgIBw4oOqAEKaZHybRBn6YFlug+0jY3KW+bCzK4FcofLEtKeGfRhktM/DmNrozFn4MGQeQ74hme1RixS9ADkJI+9A3SF3DEaGNNjUYgbrgrQfU8bBZHN/rUEOa1pVhdFJBmCvLmcdSJFnKW16rVhekrGhdJnGkQqdMUwtV6lxpDLdkkKbnb/udqGaPlWX4/WeuH8Uz1cNGiGXOkl0KO1Y1clUTD7r2XH1cF4WR+XHmbh+K4uJeH8VFy+y+313Km5u69nY+s8QYSxknFBuutIipqH2nzfQ3+s0F7qomobeRSd3Vjo/UEsDBBQAAAAIAMgd0lzwyVgkIgAAACAAAAAUAAAAcGFnZXMvY2hhdC9jaGF0Lmpzb257v3t/NZeCglJpcWZeunN+bkF+XmpeSbGSlUJ1LVctLxcAUEsDBBQAAAAIAMgd0lyO67gE/AAAALQBAAAUAAAAcGFnZXMvY2hhdC9jaGF0Lnd4bWxdj71KxEAUhfsF32G4fZJekvQWtvaT5OoOZmdC5mY3EgIKWotYKFYi2PoCor6Mi6byFTbzo5hUM3POnXO/8/P6Ea8Fblhecq0TyJUkLiTWkC4Ym1pLTgGvkVtrZq5Qa36CrOsE4SqsVYl9D2zT7h+rOoGu8wPaq6d4loCQBbY+bcwjbGmWFxgNUp9q4FBS38eR0T1GZDgs7d9tji5k1UzZrTKxgVUlz3GpygJH4u/32+3V8+fb49fD5XD3Mjzdh2EILBuZ7XgCSh64f2teNmg6WuPIvEzLyK/KGiIlf3dplEWQkXRRxCsnHbq+kG6vb4bzizhyv/7X8ufeYgdQSwMEFAAAAAgAyB3SXDxk5tkyAQAA3gIAABQAAABwYWdlcy9jaGF0L2NoYXQud3hzc5WRTWrDMBCF94HeQRC6VFAaaINzmrGl2ENljZHGSUrJybrokXqFSq4TK3+LrgzPo/dmvvfz9b2oyDGgM158zoTQGDoLH4XYWnPYRCF9pUZvKkZyhajI9q1LfxqDdcOFWCq1a5LQgdbo6kK8KN/Fx8fZomqAJXgDg3nyivNplnbGby3tZYyCnil7L0tipja3aU0IUJvBpAVfo7seuk0XoiSvjZceNPYh7TnqLRzkHjU3hVir5zxg0YeRQwnVe+2pd1rGi8kXYq7equWrSgajsm+QzWZayZotT9ewOcTTLdYRmk+kLoIgBAwMjh+knb1P6avVajBA1/UZ0pu+LjEIlYFg6iKFpAayqMVcaz15Xjd0qnd9ifOOw2PS52VUVmYw8cySXd7mH7qpuf/Qvx9+fJr9AlBLAwQUAAAACADIHdJc1nzVYgwCAAC4AwAAFAAAAHBhZ2VzL2luZGV4L2luZGV4LmpzjZPRa9NAHMffC/4P51MSqFmpTwZ8GPjSB8EnX8SH0N5cIKaldxFkBFqnmMzVbquzcxbbDiNVutaH0FXTsj/G3DV96r/gJVmbFDYRwnG5/PL9fr5391u4l4/kZ5DfSQFQkLEsgWAGgKKVdPxYVnUoAY5Lh2vPIUKsFkngyVO2YASr7ClquaBYAlu6lsdKUeOhcKWCtxUkIogfMGV+Z00UigWIZUUVXwTvwBASighqhYeRWUJ1KZovagiDpFp6hQYMcD9yDcJESbYAfzuuFUAZYr2shd/CYWMD0AuX7HVmH3rUvKAjk1aHa4HFko62GX+5qAbboSNY5tIBB4Yayx2LRzESur0ufdfezJHPX8jXWriqQswISupLBsrRVz1iTxeTKjUP6clwM0c//fZ3p2RwRlu1xWSftizPrXi/TFIfeq5NxgOy9539NDt9TQ6ai0mbW0WMIURFy6t6ASKe8w9sb3xKm6N50+GE5QaCBIB56Ll9JpesZCTgnpTJ3Mlm2Rhg9M/8y/fkjeWNHQYbmRoAqgje7O1NTuhu51pXMm0Qq8bCUbebzZC39buMIKqnDjuJHml8+28fv94iteN/pAt82h36o09/On8qVWKP/P1RMDn6SI67s3Nrbg9Io7rKOa9YvnMe+8cnesN9kBFSEJY1nLwUEUTyPqw3wxXrdX2W7LTlLEIJmyRlCLdSfwFQSwMEFAAAAAgAyB3SXPDJWCQiAAAAIAAAABYAAABwYWdlcy9pbmRleC9pbmRleC5qc29ue797fzWXgoJSaXFmXrpzfm5Bfl5qXkmxkpVCdS1XLS8XAFBLAwQUAAAACADIHdJc+JeDlTwBAABCAgAAFgAAAHBhZ2VzL2luZGV4L2luZGV4Lnd4bWx9Uk1Lw0AQvRf8D8vek9wlCXjswav3TTKaYLop2U0bKQFFBT2IFA9+UFAKvRa9VqN/xsTm1L9gNtlUU8TTzr73ZubNzq5eP/SBB0Nk+4QxA9sB5cSjEGKzg1CLcoE4Ei8ZDjFvGO5xH7C5083vF8vTNJtP88mVrgnJH2oWWTIhn1wWt/Nierd6eyyD/GKcPb9ks/QnVdeEAxFtuvFoP+IKCYE0jiqkRWPU94kNbuCXxg28fL/Jzmef6dPXw1ndV1VVjCyPOpXcwAHt1nkD4kdg4NGoIvbELUkw0mQrK+I8oOuBgDqKxWldipN+De0CY+SgHDO7HhfHJ7pWZ/0/lu2S9lS/yV5dEZW2OPTUMPArV8N4ez8IhVspYBI9hCPxEg7EstrGJqRcERg2ZVXxA4DyJGktcG24ieS51fkGUEsDBBQAAAAIAMgd0lxFjY8/QwEAAA0DAAAWAAAAcGFnZXMvaW5kZXgvaW5kZXgud3hzc5WSQU7DMBBF95G4g6WKZaq0RdAmp5nE02SEY0f2RA0gTsaCI3EFnNQJbqELtp75/818z9fH57oymoE0WvGWCNGBlKTrXGwz2w1F8p6sGwQZqowDp6Co1rmoUDPaItY8jBqRTSomVjiJjh6QOnpF37CfTMPbCaluOBelUXJ8rIwyNher7KnaPJ5dXF/+abSdjWbN4XCYBKS73o9oESaJJNcpeMnFUeFQ/NovzDqJzgjflovN2NmE6fZZQJXG+hx8dRQ6o0iKlZTyp5RakNQ73zFLFloW5elQy7RkPQFbsDXpVOGRl8y9H1TPtTW9b7wOZVn51BDjbbgHVQ1EUQQSmy7+3BadgxrjjtIwmzaa5vombu/bwpCeSHIzxnYfA9a9Czf0r90u4oGeTXF1hXb8pAsQOEeOQfMN2uI903e7nTe4S74BUEsBAhQAFAAAAAgAyB3SXOe2A/tAAAAASAAAAAYAAAAAAAAAAAAAALaBAAAAAGFwcC5qc1BLAQIUABQAAAAIAMgd0lwxQDOOnwAAAAQBAAAIAAAAAAAAAAAAAAC2gWQAAABhcHAuanNvblBLAQIUABQAAAAIAMgd0ly4xKdHKgAAACoAAAAIAAAAAAAAAAAAAAC2gSkBAABhcHAud3hzc1BLAQIUABQAAAAIAMgd0lxmZkJSMwEAAB8CAAASAAAAAAAAAAAAAAC2gXkBAABwYWdlcy9jaGF0L2NoYXQuanNQSwECFAAUAAAACADIHdJc8MlYJCIAAAAgAAAAFAAAAAAAAAAAAAAAtoHcAgAAcGFnZXMvY2hhdC9jaGF0Lmpzb25QSwECFAAUAAAACADIHdJcjuu4BPwAAAC0AQAAFAAAAAAAAAAAAAAAtoEwAwAAcGFnZXMvY2hhdC9jaGF0Lnd4bWxQSwECFAAUAAAACADIHdJcPGTm2TIBAADeAgAAFAAAAAAAAAAAAAAAtoFeBAAAcGFnZXMvY2hhdC9jaGF0Lnd4c3NQSwECFAAUAAAACADIHdJc1nzVYgwCAAC4AwAAFAAAAAAAAAAAAAAAtoHCBQAAcGFnZXMvaW5kZXgvaW5kZXguanNQSwECFAAUAAAACADIHdJc8MlYJCIAAAAgAAAAFgAAAAAAAAAAAAAAtoEACAAAcGFnZXMvaW5kZXgvaW5kZXguanNvblBLAQIUABQAAAAIAMgd0lz4l4OVPAEAAEICAAAWAAAAAAAAAAAAAAC2gVYIAABwYWdlcy9pbmRleC9pbmRleC53eG1sUEsBAhQAFAAAAAgAyB3SXEWNjz9DAQAADQMAABYAAAAAAAAAAAAAALaBxgkAAHBhZ2VzL2luZGV4L2luZGV4Lnd4c3NQSwUGAAAAAAsACwC0AgAAPQsAAAAA';
        
        // 将 base64 转换为二进制
        const binaryString = atob(zipBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        return new Response(bytes, {
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
