/**
 * 奶茶店原子接口：产品查询
 * 
 * 功能：查询产品列表和详情
 * 
 * 使用场景：
 * - 用户浏览菜单
 * - 产品筛选和搜索
 * - 产品详情展示
 */

'use strict';

/**
 * 查询产品列表
 * 
 * @param {Object} params - 查询参数
 * @param {string} [params.category] - 产品分类（奶茶/果茶/咖啡/小吃）
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.keyword] - 搜索关键词
 * @param {string} [params.sortBy=popular] - 排序方式（popular/new/price）
 * 
 * @example
 * // 查询所有产品
 * const result = await queryProductList();
 * 
 * // 查询奶茶分类
 * const result = await queryProductList({ category: '奶茶' });
 * 
 * // 分页查询
 * const result = await queryProductList({ page: 2, pageSize: 10 });
 */
async function queryProductList(params = {}) {
    const { 
        category, 
        page = 1, 
        pageSize = 20, 
        keyword,
        sortBy = 'popular'
    } = params;
    
    // 模拟产品数据
    const allProducts = [
        {
            id: 1,
            name: '珍珠奶茶',
            price: 12,
            originalPrice: 15,
            category: '奶茶',
            tags: ['招牌', '热销'],
            stock: 100,
            image: '/images/products/bubble-tea.jpg',
            description: '经典港式珍珠奶茶，Q弹珍珠配上香浓奶茶',
            nutrition: { calories: 250, sugar: 30, fat: 8, protein: 5 },
            specifications: { size: '中杯', ice: '正常冰', sugar: '正常糖' },
            salesCount: 15800,
            rating: 4.8,
            isAvailable: true
        },
        {
            id: 2,
            name: '椰果奶茶',
            price: 14,
            category: '奶茶',
            tags: ['新品'],
            stock: 80,
            image: '/images/products/coconut-tea.jpg',
            description: '清爽椰果配上丝滑奶茶',
            nutrition: { calories: 220, sugar: 25, fat: 6, protein: 4 },
            salesCount: 9800,
            rating: 4.6,
            isAvailable: true
        },
        {
            id: 3,
            name: '芋泥波波',
            price: 18,
            category: '奶茶',
            tags: ['招牌', '浓郁'],
            stock: 50,
            image: '/images/products/taro-bobo.jpg',
            description: '香浓芋泥配上Q弹波波',
            nutrition: { calories: 280, sugar: 35, fat: 10, protein: 6 },
            salesCount: 12500,
            rating: 4.9,
            isAvailable: true
        },
        {
            id: 4,
            name: '杨枝甘露',
            price: 22,
            category: '果茶',
            tags: ['招牌', '清爽'],
            stock: 60,
            image: '/images/products/yangzi.jpg',
            description: '芒果西柚甘露，清爽解腻',
            nutrition: { calories: 180, sugar: 22, fat: 2, protein: 3 },
            salesCount: 8900,
            rating: 4.7,
            isAvailable: true
        },
        {
            id: 5,
            name: '柠檬水',
            price: 10,
            category: '果茶',
            tags: ['清爽'],
            stock: 120,
            image: '/images/products/lemon.jpg',
            description: '新鲜柠檬水，清爽解渴',
            nutrition: { calories: 80, sugar: 10, fat: 0, protein: 0 },
            salesCount: 5600,
            rating: 4.5,
            isAvailable: true
        },
        {
            id: 6,
            name: '生椰拿铁',
            price: 20,
            category: '咖啡',
            tags: ['热销'],
            stock: 40,
            image: '/images/products/coconut-latte.jpg',
            description: '生椰乳配上浓缩咖啡',
            nutrition: { calories: 150, sugar: 12, fat: 8, protein: 4 },
            salesCount: 11200,
            rating: 4.8,
            isAvailable: true
        },
        {
            id: 7,
            name: '鸡米花',
            price: 15,
            category: '小吃',
            tags: ['小食'],
            stock: 30,
            image: '/images/products/chicken.jpg',
            description: '香脆鸡米花',
            nutrition: { calories: 320, sugar: 2, fat: 18, protein: 15 },
            salesCount: 4200,
            rating: 4.4,
            isAvailable: true
        }
    ];
    
    // 过滤
    let filtered = [...allProducts];
    
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (keyword) {
        filtered = filtered.filter(p => 
            p.name.includes(keyword) || p.description.includes(keyword)
        );
    }
    
    // 排序
    switch (sortBy) {
        case 'new':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'price':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'popular':
        default:
            filtered.sort((a, b) => b.salesCount - a.salesCount);
    }
    
    // 分页
    const total = filtered.length;
    const list = filtered.slice((page - 1) * pageSize, page * pageSize);
    
    return {
        success: true,
        data: {
            list,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            },
            categories: ['奶茶', '果茶', '咖啡', '小吃']
        }
    };
}

/**
 * 查询产品详情
 * 
 * @param {number} productId - 产品ID
 * 
 * @example
 * const result = await queryProductDetail(1);
 */
async function queryProductDetail(productId) {
    const result = await queryProductList();
    const product = result.data.list.find(p => p.id === productId);
    
    if (!product) {
        return {
            success: false,
            error: '产品不存在或已下架'
        };
    }
    
    // 获取更多详情
    const detail = {
        ...product,
        gallery: [
            product.image,
            '/images/products/detail-1.jpg',
            '/images/products/detail-2.jpg'
        ],
        reviews: {
            total: 1250,
            rating: product.rating,
            distribution: {
                5: 980,
                4: 180,
                3: 60,
                2: 20,
                1: 10
            },
            list: [
                {
                    id: 1,
                    user: '用户_a***c',
                    avatar: '/images/avatar/1.jpg',
                    rating: 5,
                    content: '非常好喝，会回购！',
                    images: ['/images/review/1.jpg'],
                    createdAt: '2024-01-15 14:30'
                },
                {
                    id: 2,
                    user: '用户_b***d',
                    avatar: '/images/avatar/2.jpg',
                    rating: 4,
                    content: '味道不错，就是有点甜',
                    images: [],
                    createdAt: '2024-01-14 10:20'
                }
            ]
        },
        relatedProducts: result.data.list
            .filter(p => p.category === product.category && p.id !== productId)
            .slice(0, 4)
    };
    
    return {
        success: true,
        data: detail
    };
}

module.exports = {
    queryProductList,
    queryProductDetail
};
