// ========================================
// 迪士尼邮轮数据 - 行程、待办、预订、SOS
// ========================================

const cruiseData = {
    // 成员配置
    members: [
        { id: 'userZ', name: 'Z', role: 'member', emoji: '👤' },
        { id: 'userW', name: 'W', role: 'member', emoji: '👤' },
        { id: 'userY', name: 'Y', role: 'member', emoji: '👤' }
    ],

    // 航班信息（不同出发地）
    flights: {
        chongqing: {
            from: '重庆',
            airport: '江北国际机场',
            outbound: { date: '6月18日', time: '02:35', arrival: '07:30', flightNo: '待定' },
            return: { date: '6月22日', time: '20:05', arrival: '01:15(+1)', flightNo: '待定' }
        },
        shenzhen: {
            from: '深圳',
            airport: '宝安国际机场',
            outbound: { date: '6月18日', time: '02:05', arrival: '06:10', flightNo: '待定' },
            return: { date: '6月22日', time: '20:45', arrival: '01:00(+1)', flightNo: '待定' }
        }
    },
    cruiseInfo: {
        name: "迪士尼探险号",
        route: "新加坡 - 槟城 - 普吉岛 - 新加坡",
        departure: "2026-06-18",
        return: "2026-06-22",
        duration: "5天4晚",
        roomType: "礼宾套房 4D",
        passengers: 3,
        port: "新加坡滨海湾邮轮中心"
    },

    // 5天详细行程
    itinerary: [
        {
            day: 1,
            date: "6月18日",
            weekday: "周四",
            title: "启程 + 登船日",
            location: "重庆/深圳 → 新加坡",
            emoji: "🛫",
            activities: [
                { time: "全天", title: "📸 Photo Unlimited Package", desc: "全天无限拍照套餐，捕捉每个魔法瞬间", confirmed: true, highlight: true },
                { time: "02:05", title: "深圳出发", desc: "宝安国际机场起飞（成员1）", group: "shenzhen" },
                { time: "02:35", title: "重庆出发", desc: "江北国际机场起飞（成员2人）", group: "chongqing" },
                { time: "06:10", title: "抵达新加坡（深圳）", desc: "樟宜国际机场T3", group: "shenzhen", highlight: true },
                { time: "07:30", title: "抵达新加坡（重庆）", desc: "樟宜国际机场", group: "chongqing", highlight: true },
                { time: "08:30", title: "🤝 机场集合", desc: "樟宜机场星巴克集合点汇合", mustDo: true, highlight: true },
                { time: "09:30", title: "早餐 @ 樟宜机场", desc: "jewel 星耀樟宜或机场餐厅" },
                { time: "10:30", title: "前往滨海湾邮轮中心", desc: "打车约30分钟", highlight: true },
                { time: "11:00", title: "到达邮轮中心", desc: "前往迪士尼探险号专用登船大厅" },
                { time: "11:30", title: "礼宾专属休息室", desc: "享受优先登船特权，香槟欢迎", highlight: true },
                { time: "12:30", title: "登船入住", desc: "进入礼宾套房4D，熟悉房间设施" },
                { time: "13:30", title: "午餐 @ Marceline Market", desc: "迪士尼主题自助餐厅" },
                { time: "15:00", title: "安全演习", desc: "必须参加的救生演习", mustDo: true },
                { time: "16:00", title: "探索邮轮主题区", desc: "漫威世界、冰雪奇缘王国、皮克斯广场等" },
                { time: "17:00", title: "礼宾欢迎酒会", desc: "专属甲板，认识礼宾团队", highlight: true },
                { time: "18:00", title: "甲板日落时光", desc: "礼宾专属区域拍照打卡" },
                { time: "19:00", title: "晚餐 @ Enchanted Sword Cafe", desc: "礼宾专属座位预订" },
                { time: "21:00", title: "启航派对", desc: "甲板烟花秀和欢迎派对" },
                { time: "22:00", title: "成人专属酒吧", desc: "The Rose酒吧小酌" },
                { time: "16:00", title: "🚢 Ship Departure", desc: "邮轮启航，开始魔法之旅", confirmed: true, highlight: true }
            ]
        },
        {
            day: 2,
            date: "6月19日",
            weekday: "周五",
            title: "海上巡航日",
            location: "海上",
            emoji: "🌊",
            activities: [
                { time: "08:00", title: "礼宾专属早餐", desc: "客房服务或礼宾餐厅" },
                { time: "09:30", title: "👑 Royal Gathering", desc: "角色见面会 - LUWEN ZHANG, XIAO YANG, HANZHANG WEN", confirmed: true, highlight: true },
                { time: "11:00", title: "🍝 Palo Trattoria Brunch", desc: "意大利餐厅早午餐（3人）", confirmed: true, highlight: true },
                { time: "13:00", title: "💆 SPA Consultation", desc: "LUWEN ZHANG - Rejuvenation Spa", confirmed: true },
                { time: "14:00", title: "💆 SPA Consultation", desc: "XIAO YANG - Rejuvenation Spa", confirmed: true },
                { time: "15:00", title: "💆 SPA Consultation", desc: "HANZHANG WEN - Rejuvenation Spa", confirmed: true },
                { time: "16:00", title: "探索邮轮主题区", desc: "漫威世界、冰雪奇缘王国、皮克斯广场等" },
                { time: "17:30", title: "Palo Steakhouse", desc: "成人专属餐厅晚餐（18+）", highlight: true },
                { time: "20:00", title: "百老汇演出", desc: "迪士尼经典音乐剧", highlight: true },
                { time: "22:00", title: "成人甲板派对", desc: "3人闺蜜夜生活时光" }
            ]
        },
        {
            day: 3,
            date: "6月20日",
            weekday: "周六",
            title: "海上巡航日",
            location: "海上",
            emoji: "🌊",
            activities: [
                { time: "08:00", title: "礼宾专属早餐", desc: "在礼宾休息室享用" },
                { time: "09:30", title: "🏊 水上乐园", desc: "AquaMouse水上过山车、游泳池", highlight: true },
                { time: "11:00", title: "🎭 冰雪奇缘演出", desc: "安娜和艾莎舞台表演", highlight: true },
                { time: "12:30", title: "午餐 @ Arendelle", desc: "冰雪奇缘主题餐厅", confirmed: true },
                { time: "14:00", title: "🎬 电影院", desc: "迪士尼最新电影放映" },
                { time: "15:30", title: "🎮 游戏厅", desc: "海上电子游戏中心" },
                { time: "17:00", title: "🍹 礼宾甲板时光", desc: "私人甲板享受日落", highlight: true },
                { time: "19:00", title: "晚餐 @  Animator's Palate", desc: "动画师主题餐厅" },
                { time: "21:00", title: "🎆 甲板烟花秀", desc: "海上烟花表演", highlight: true },
                { time: "22:00", title: "🎵 现场音乐", desc: "成人专属酒吧Live Music" }
            ]
        },
        {
            day: 4,
            date: "6月21日",
            weekday: "周日",
            title: "海上巡航日",
            location: "海上",
            emoji: "⚓",
            activities: [
                { time: "08:00", title: "客房服务早餐", desc: "礼宾房免费服务" },
                { time: "09:30", title: "🏋️ 健身房", desc: "海景健身房锻炼" },
                { time: "11:00", title: "🎨 绘画课程", desc: "迪士尼角色绘画教学", highlight: true },
                { time: "12:30", title: "午餐 @ Palo Trattoria", desc: "意大利餐厅（如已预约）", confirmed: true },
                { time: "14:00", title: "💆 SPA体验", desc: "水疗中心放松（如已预约）", confirmed: true },
                { time: "15:30", title: "🛍️ 免税店购物", desc: "船上商店购物时光" },
                { time: "17:00", title: "📸 专业拍照", desc: "使用Photo Package拍摄", confirmed: true },
                { time: "19:00", title: "正装晚宴", desc: "船长晚宴（Gala Night）", mustDo: true, highlight: true },
                { time: "21:00", title: "告别派对", desc: "邮轮最后一晚庆祝", highlight: true },
                { time: "22:30", title: "深夜披萨", desc: "甲板免费披萨" }
            ]
        },
        {
            day: 5,
            date: "6月22日",
            weekday: "周一",
            title: "离船日 + 环球影城",
            location: "新加坡·圣淘沙",
            emoji: "🎢",
            activities: [
                { time: "07:00", title: "最后早餐", desc: "客房服务或Enchanted Sword" },
                { time: "08:30", title: "礼宾快速离船", desc: "优先下船，避开人群", highlight: true },
                { time: "10:00", title: "前往圣淘沙", desc: "打车或缆车前往圣淘沙岛", highlight: true },
                { time: "10:30", title: "抵达新加坡环球影城", desc: "开启魔法之旅！", highlight: true },
                { time: "11:00", title: "🧙 哈利波特魔法世界", desc: "霍格沃茨城堡、禁忌之旅、黄油啤酒", mustDo: true, highlight: true },
                { time: "13:00", title: "午餐 @ 三把扫帚酒吧", desc: "哈利波特主题餐厅，品尝英式美食" },
                { time: "14:30", title: "奥利凡德魔杖店", desc: "魔杖选择巫师体验", highlight: true },
                { time: "15:30", title: "其他园区游玩", desc: "变形金刚、侏罗纪公园、木乃伊复仇记" },
                { time: "18:00", title: "离开环球影城", desc: "结束魔法之旅" },
                { time: "18:30", title: "前往樟宜机场", desc: "打车约30分钟，建议提前2-3小时到达", mustDo: true, highlight: true },
                { time: "20:05", title: "✈️ 返程航班（重庆）", desc: "2人：樟宜T3 → 江北机场，次日01:15抵达", mustDo: true, confirmed: true, highlight: true },
                { time: "20:45", title: "✈️ 返程航班（深圳）", desc: "1人：樟宜T3 → 宝安机场，次日01:00抵达", mustDo: true, confirmed: true, highlight: true }
            ]
        }
    ],

    // 默认待办清单
    defaultTodos: {
        before: [
            { id: 'b1', text: '检查护照有效期（6个月以上）', completed: false },
            { id: 'b2', text: '申请新加坡签证/过境签', completed: false },
            { id: 'b3', text: '预订往返新加坡机票', completed: false },
            { id: 'b4', text: '购买旅行保险', completed: false },
            { id: 'b5', text: '下载迪士尼邮轮App并完成Online Check-in', completed: false },
            { id: 'b6', text: '预订Palo Steakhouse成人餐厅', completed: false },
            { id: 'b7', text: '预约水疗SPA时间', completed: false },
            { id: 'b8', text: '准备正装晚宴服装', completed: false },
            { id: 'b9', text: '兑换新币现金', completed: false },
            { id: 'b10', text: '准备防晒用品和泳衣', completed: false }
        ],
        boarding: [
            { id: 'bd1', text: '提前3小时到达邮轮中心', completed: false },
            { id: 'bd2', text: '携带护照和邮轮预订单', completed: false },
            { id: 'bd3', text: '行李托运（可选）', completed: false },
            { id: 'bd4', text: '礼宾休息室登记', completed: false }
        ],
        onboard: [
            { id: 'o1', text: '参加安全演习', completed: false },
            { id: 'o2', text: '下载船上WiFi（礼宾房免费）', completed: false },
            { id: 'o3', text: '预约角色见面会', completed: false },
            { id: 'o4', text: '探索邮轮7大主题区', completed: false },
            { id: 'o5', text: '享受礼宾专属甲板', completed: false },
            { id: 'o6', text: '体验AquaMouse水上过山车', completed: false },
            { id: 'o7', text: '观看百老汇演出', completed: false },
            { id: 'o8', text: '购买Photo Unlimited Package', completed: false }
        ],
        shore: [
            { id: 's1', text: 'Day 5：离船前往环球影城', completed: false },
            { id: 's2', text: 'Day 5：哈利波特魔法世界', completed: false },
            { id: 's3', text: 'Day 5：三把扫帚酒吧午餐', completed: false },
            { id: 's4', text: 'Day 5：奥利凡德魔杖店', completed: false }
        ]
    },

    // 默认预订信息
    defaultBookings: [
        {
            id: 'bk1',
            type: 'cruise',
            typeName: '邮轮',
            icon: '🚢',
            itemName: '迪士尼探险号 5天4晚',
            details: [
                { label: '房型', value: '礼宾套房 4D' },
                { label: '出发日期', value: '2026年6月18日' },
                { label: '人数', value: '3人' }
            ],
            price: 45800,
            status: 'confirmed',
            orderNumber: 'DC-2026-0618-4D'
        },
        {
            id: 'bk2',
            type: 'flight',
            typeName: '机票',
            icon: '✈️',
            itemName: '重庆↔新加坡（2人）',
            details: [
                { label: '去程', value: '6/18 02:35→07:30' },
                { label: '返程', value: '6/22 20:05→01:15+1' },
                { label: '机场', value: '江北国际机场' }
            ],
            price: 3696,
            status: 'confirmed',
            orderNumber: 'F9GXXV'
        },
        {
            id: 'bk3',
            type: 'flight',
            typeName: '机票',
            icon: '✈️',
            itemName: '深圳↔新加坡（1人）',
            details: [
                { label: '去程', value: '6/18 02:05→06:10' },
                { label: '返程', value: '6/22 20:45→01:00+1' },
                { label: '机场', value: '宝安国际机场' }
            ],
            price: 1847,
            status: 'confirmed',
            orderNumber: '待定'
        },
        {
            id: 'bk4',
            type: 'tour',
            typeName: '门票',
            icon: '🎢',
            itemName: '新加坡环球影城',
            details: [
                { label: '日期', value: '6月22日（离船后）' },
                { label: '包含', value: '哈利波特魔法世界' },
                { label: '人数', value: '3人' }
            ],
            price: 1200,
            status: 'pending',
            orderNumber: '待定'
        }
    ],

    // SOS紧急联系电话
    sosContacts: [
        {
            id: 'sos1',
            category: 'embassy',
            title: '中国驻新加坡大使馆',
            subtitle: '领事保护热线',
            number: '+65-64750165',
            icon: '🇨🇳',
            urgent: true
        },
        {
            id: 'sos2',
            category: 'global',
            title: '中国外交部全球领保',
            subtitle: '24小时热线',
            number: '+86-10-12308',
            icon: '🆘',
            urgent: true
        },
        {
            id: 'sos3',
            category: 'police',
            title: '新加坡报警',
            subtitle: '警察',
            number: '999',
            icon: '🚔',
            urgent: false
        },
        {
            id: 'sos4',
            category: 'medical',
            title: '新加坡急救',
            subtitle: '救护车',
            number: '995',
            icon: '🚑',
            urgent: false
        },
        {
            id: 'sos5',
            category: 'fire',
            title: '新加坡消防',
            subtitle: '火警',
            number: '995',
            icon: '🚒',
            urgent: false
        },
        {
            id: 'sos6',
            category: 'tourist',
            title: '新加坡旅游热线',
            subtitle: '英语服务',
            number: '1800-7362000',
            icon: 'ℹ️',
            urgent: false
        },
        {
            id: 'sos7',
            category: 'cruise',
            title: '迪士尼邮轮客服',
            subtitle: '24小时热线',
            number: '+1-800-951-3532',
            icon: '🚢',
            urgent: false
        },
        {
            id: 'sos8',
            category: 'medical',
            title: '邮轮医疗中心',
            subtitle: '船上拨打 911',
            number: '911',
            icon: '🏥',
            urgent: false
        }
    ],

    // 支出分类
    expenseCategories: {
        cruise: { name: '邮轮费用', icon: '🚢', color: '#ffd700' },
        flight: { name: '机票', icon: '✈️', color: '#40e0d0' },
        hotel: { name: '酒店', icon: '🏨', color: '#ff7f7f' },
        food: { name: '餐饮', icon: '🍽️', color: '#f4d03f' },
        shopping: { name: '购物', icon: '🛍️', color: '#9b59b6' },
        other: { name: '其他', icon: '📦', color: '#95a5a6' }
    }
};
