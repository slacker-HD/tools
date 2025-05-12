// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 定义运势数据，扩展到100条
    const fortunes = [
        {
            title: "超棒",
            description: "今天是你的幸运日！工作效率极高，可能会有意外惊喜或奖励降临。保持积极心态，大胆尝试新事物，成功就在眼前！",
            color: "#22c55e",
            icon: "fa-face-grin-hearts"
        },
        {
            title: "良好",
            description: "今天状态不错，工作进展顺利，与同事关系融洽。适合处理重要任务，但也要注意劳逸结合，别给自己太大压力。",
            color: "#10b981",
            icon: "fa-face-smile"
        },
        {
            title: "普通",
            description: "今天是平淡的一天，没有特别的惊喜，但也不会遇到什么困难。保持平常心，按部就班地完成工作就好。",
            color: "#64748b",
            icon: "fa-face-meh"
        },
        {
            title: "欠佳",
            description: "今天可能会遇到一些小麻烦或挑战，工作效率可能会受到影响。保持耐心，冷静应对，问题总会解决的。",
            color: "#f59e0b",
            icon: "fa-face-frown"
        },
        {
            title: "糟糕",
            description: "今天可能诸事不顺，工作上容易出错，情绪也可能比较低落。建议调整心态，暂时放下工作，做些让自己放松的事情。",
            color: "#ef4444",
            icon: "fa-face-sad-cry"
        },
        {
            title: "极佳",
            description: "今日事业运爆棚，会有贵人相助，工作上的难题将迎刃而解，还可能获得晋升机会。",
            color: "#22c55e",
            icon: "fa-face-laugh-beam"
        },
        {
            title: "尚可",
            description: "工作能稳步推进，有小的进展。与团队成员协作愉快，能共同完成既定目标。",
            color: "#10b981",
            icon: "fa-face-smile-beam"
        },
        {
            title: "平稳",
            description: "一切按部就班，没有大的起伏。认真完成日常工作，积累经验，为未来发展蓄力。",
            color: "#64748b",
            icon: "fa-face-neutral"
        },
        {
            title: "小挫",
            description: "工作中会遇到一些小阻碍，可能是沟通不畅或资源不足。及时调整策略，积极解决问题。",
            color: "#f59e0b",
            icon: "fa-face-confused"
        },
        {
            title: "低迷",
            description: "今日状态不佳，工作效率低下，容易出错。先调整好心态，适当休息，再重新投入工作。",
            color: "#ef4444",
            icon: "fa-face-tired"
        },
        {
            title: "大顺",
            description: "各项工作都顺风顺水，创意灵感不断涌现，能高效完成重要任务，收获满满。",
            color: "#22c55e",
            icon: "fa-face-grin-stars"
        },
        {
            title: "良佳",
            description: "工作状态良好，与同事合作默契，能快速解决遇到的问题，有望提前完成任务。",
            color: "#10b981",
            icon: "fa-face-smile-wink"
        },
        {
            title: "平常",
            description: "和往常一样，按计划开展工作，没有特别的事情发生。保持专注，做好本职工作。",
            color: "#64748b",
            icon: "fa-face-meh-blank"
        },
        {
            title: "微阻",
            description: "工作中会有一些小的干扰因素，如电话、邮件等。合理安排时间，避免被打断。",
            color: "#f59e0b",
            icon: "fa-face-rolling-eyes"
        },
        {
            title: "不佳",
            description: "今日工作进展缓慢，可能会遇到一些人际关系问题。保持冷静，以和为贵。",
            color: "#ef4444",
            icon: "fa-face-sad-tear"
        },
        {
            title: "鸿运",
            description: "事业运极佳，有机会接触到重要项目，展示自己的才能，获得领导的认可。",
            color: "#22c55e",
            icon: "fa-face-grin-hearts"
        },
        {
            title: "尚好",
            description: "工作表现良好，能得到同事的支持和帮助，工作氛围融洽。",
            color: "#10b981",
            icon: "fa-face-smile"
        },
        {
            title: "平淡",
            description: "工作没有波澜，按部就班完成任务即可。可利用空闲时间学习新知识。",
            color: "#64748b",
            icon: "fa-face-meh"
        },
        {
            title: "小坎",
            description: "工作中会遇到一些小困难，如文件丢失、数据错误等。仔细检查，及时纠正。",
            color: "#f59e0b",
            icon: "fa-face-frown-open"
        },
        {
            title: "艰难",
            description: "今日工作困难重重，压力较大。调整心态，寻求他人帮助，共同克服困难。",
            color: "#ef4444",
            icon: "fa-face-sad-cry"
        },
        {
            title: "超旺",
            description: "工作运超级旺盛，有重大突破的可能，会取得意想不到的成果。大胆放手去干！",
            color: "#22c55e",
            icon: "fa-face-laugh-squint"
        },
        {
            title: "优佳",
            description: "工作状态极佳，思维敏捷，能快速准确地完成各项任务，表现出色。",
            color: "#10b981",
            icon: "fa-face-smile-beam"
        },
        {
            title: "一般",
            description: "工作正常推进，没有突出表现也没有明显失误。保持稳定，持续努力。",
            color: "#64748b",
            icon: "fa-face-neutral"
        },
        {
            title: "小难",
            description: "工作中会遇到一些小挑战，如技术难题、客户刁难等。积极应对，提升能力。",
            color: "#f59e0b",
            icon: "fa-face-confounded"
        },
        {
            title: "低落",
            description: "今日工作热情不高，效率低下。先放松一下，调整好状态再投入工作。",
            color: "#ef4444",
            icon: "fa-face-tired"
        },
        {
            title: "大喜",
            description: "工作上有大喜之事降临，可能是项目成功、奖金丰厚等。尽情享受这份喜悦吧！",
            color: "#22c55e",
            icon: "fa-face-grin-wide"
        },
        {
            title: "良好",
            description: "工作进展顺利，与团队配合默契，能高效完成任务。继续保持这种状态！",
            color: "#10b981",
            icon: "fa-face-smile"
        },
        {
            title: "普通",
            description: "今天的工作和往常一样，没有特别的事情发生。按部就班，做好每一件小事。",
            color: "#64748b",
            icon: "fa-face-meh"
        },
        {
            title: "欠佳",
            description: "工作中可能会出现一些小失误，如粗心大意导致的错误。仔细检查，避免再次犯错。",
            color: "#f59e0b",
            icon: "fa-face-frown"
        },
        {
            title: "糟糕",
            description: "今日工作诸事不顺，可能会遇到各种问题。调整心态，冷静应对，总会过去的。",
            color: "#ef4444",
            icon: "fa-face-sad-cry"
        },
        {
            title: "极优",
            description: "事业运达到顶峰，有绝佳的发展机会，能充分发挥自己的才能，取得辉煌成就。",
            color: "#22c55e",
            icon: "fa-face-laugh-beam"
        },
        {
            title: "尚佳",
            description: "工作表现不错，能按时完成任务，还可能得到领导的表扬。继续加油！",
            color: "#10b981",
            icon: "fa-face-smile-beam"
        },
        {
            title: "平稳",
            description: "工作按计划进行，没有大的波动。保持专注，不断提升自己的能力。",
            color: "#64748b",
            icon: "fa-face-neutral"
        },
        {
            title: "小滞",
            description: "工作进展有些缓慢，可能是遇到了一些技术难题或资源限制。耐心解决，逐步推进。",
            color: "#f59e0b",
            icon: "fa-face-confused"
        },
        {
            title: "低迷",
            description: "今日工作状态不佳，效率低下，容易产生消极情绪。调整心态，积极面对。",
            color: "#ef4444",
            icon: "fa-face-tired"
        },
        {
            title: "大旺",
            description: "工作运非常旺盛，会有很多机会和好运降临。抓住机遇，勇往直前！",
            color: "#22c55e",
            icon: "fa-face-grin-hearts"
        },
        {
            title: "良优",
            description: "工作状态良好，与同事合作愉快，能高效完成重要任务。继续保持优势！",
            color: "#10b981",
            icon: "fa-face-smile-wink"
        },
        {
            title: "平常",
            description: "工作和平时一样，没有特别的亮点或难点。做好本职工作，积累经验。",
            color: "#64748b",
            icon: "fa-face-meh-blank"
        },
        {
            title: "微扰",
            description: "工作中会有一些小的干扰，如噪音、同事的打扰等。尽量排除干扰，专注工作。",
            color: "#f59e0b",
            icon: "fa-face-rolling-eyes"
        },
        {
            title: "不佳",
            description: "今日工作可能会遇到一些挫折，如项目失败、被批评等。不要气馁，总结经验教训。",
            color: "#ef4444",
            icon: "fa-face-sad-tear"
        },
        {
            title: "鸿运当头",
            description: "事业运如日中天，会有重大的发展机遇和贵人相助。大胆拼搏，必能成功！",
            color: "#22c55e",
            icon: "fa-face-grin-stars"
        },
        {
            title: "尚好",
            description: "工作表现尚可，能完成基本任务，与同事关系融洽。继续努力，争取更好。",
            color: "#10b981",
            icon: "fa-face-smile"
        },
        {
            title: "平淡无奇",
            description: "工作没有什么特别之处，按部就班完成即可。可思考如何提升工作效率。",
            color: "#64748b",
            icon: "fa-face-meh"
        },
        {
            title: "小波折",
            description: "工作中会遇到一些小的波折，如计划变更、资源调整等。灵活应对，确保工作顺利进行。",
            color: "#f59e0b",
            icon: "fa-face-frown-open"
        },
        {
            title: "艰难时刻",
            description: "今日工作困难重重，压力巨大。保持信心，寻求支持，共同度过难关。",
            color: "#ef4444",
            icon: "fa-face-sad-cry"
        },
        {
            title: "超佳",
            description: "工作运极佳，有机会展现自己的才华，获得他人的认可和赞赏。抓住机会，大放异彩！",
            color: "#22c55e",
            icon: "fa-face-laugh-squint"
        },
        {
            title: "优上",
            description: "工作状态达到上乘，能高效完成复杂任务，为团队做出重要贡献。继续保持优秀！",
            color: "#10b981",
            icon: "fa-face-smile-beam"
        },
        {
            title: "中等",
            description: "工作表现处于中等水平，能完成任务，但还有提升空间。不断学习，争取进步。",
            color: "#64748b",
            icon: "fa-face-neutral"
        },
        {
            title: "小困境",
            description: "工作中会陷入一些小困境，如数据不准确、沟通不畅等。仔细分析，解决问题。",
            color: "#f59e0b",
            icon: "fa-face-confounded"
        },
        {
            title: "消沉",
            description: "今日工作情绪低落，效率低下。先调整心态，做些让自己开心的事情，再投入工作。",
            color: "#ef4444",
            icon: "fa-face-tired"
        },
        {
            title: "大幸",
            description: "工作上有极大的幸运降临，可能是获得重要合同、晋升职位等。珍惜机会，努力前行！",
            color: "#22c55e",
            icon: "fa-face-grin-wide"
        },
        {
            title: "良好态势",
            description: "工作进展呈现良好态势，与团队成员配合默契，各项任务有序推进。继续保持！",
            color: "#10b981",
            icon: "fa-face-smile"
        },
        {
            title: "常规状态",
            description: "工作处于常规状态，没有特别的事情发生。按部就班，做好日常工作。",
            color: "#64748b",
            icon: "fa-face-meh"
        },
        {
            title: "小差错",
            description: "工作中可能会出现一些小差错，如文件格式错误、数据录入失误等。仔细检查，及时纠正。",
            color: "#f59e0b",
            icon: "fa-face-frown"
        },
        {
            title: "艰难处境",
            description: "今日工作陷入艰难处境，可能面临项目危机、客户投诉等。冷静应对，寻找解决方案。",
            color: "#ef4444",
            icon: "fa-face-sad-cry"
        },
        {
            title: "极盛",
            description: "事业运达到极盛，会有突破性的进展和巨大的成功。全力以赴，创造辉煌！",
            color: "#22c55e",
            icon: "fa-face-laugh-beam"
        },
        {
            title: "尚优",
            description: "工作表现优秀，能高效完成任务，还能提出有价值的建议。继续保持领先！",
            color: "#10b981",
            icon: "fa-face-smile-beam"
        },
        {
            title: "平稳过渡",
            description: "工作平稳过渡，没有大的起伏。做好日常积累，为未来发展打下基础。",
            color: "#64748b",
            icon: "fa-face-neutral"
        },
        {
            title: "小阻碍",
            description: "工作中会遇到一些小阻碍，如设备故障、流程繁琐等。积极解决，提高效率。",
            color: "#f59e0b",
            icon: "fa-face-confused"
        },
        {
            title: "低迷期",
            description: "今日工作处于低迷期，效率低下，容易出错。调整状态，重新出发。",
            color: "#ef4444",
            icon: "fa-face-tired"
        },
        {
            title: "旺运连连",
            description: "工作运持续旺盛，会有一连串的好运和机会降临。抓住时机，实现突破！",
            color: "#22c55e",
            icon: "fa-face-grin-hearts"
        },
        {
            title: "良佳表现",
            description: "工作表现良佳，能按时高质量完成任务，得到同事和领导的认可。继续加油！",
            color: "#10b981",
            icon: "fa-face-smile-wink"
        },
        {
            title: "平常工作",
            description: "工作和往常一样，按部就班进行。保持专注，做好每一个细节。",
            color: "#64748b",
            icon: "fa-face-meh-blank"
        },
        {
            title: "微干扰",
            description: "工作中会受到一些微干扰，如电话、信息等。合理安排时间，避免分心。",
            color: "#f59e0b",
            icon: "fa-face-rolling-eyes"
        },
        {
            title: "表现欠佳",
            description: "今日工作表现欠佳，可能会出现一些失误或问题。及时反思，改进方法。",
            color: "#ef4444",
            icon: "fa-face-sad-tear"
        },
        {
            title: "鸿运高照",
            description: "事业运如红日照耀，会有重大的发展和成功。大胆创新，追求卓越！",
            color: "#22c55e",
            icon: "fa-face-grin-stars"
        },
        {
            title: "尚好状态",
            description: "工作处于尚好状态，能完成任务，与团队协作良好。继续保持，争取更上一层楼。",
            color: "#10b981",
            icon: "fa-face-smile"
        },
        {
            title: "平淡工作",
            description: "工作平淡无奇，没有特别的亮点。可尝试寻找新的工作方法，提高效率。",
            color: "#64748b",
            icon: "fa-face-meh"
        },
        {
            title: "小麻烦",
            description: "工作中会遇到一些小麻烦，如文件丢失、网络故障等。及时解决，确保工作正常进行。",
            color: "#f59e0b",
            icon: "fa-face-frown-open"
        },
        {
            title: "艰难挑战",
            description: "今日工作面临艰难挑战，压力巨大。保持冷静，勇敢面对，相信自己能克服困难。",
            color: "#ef4444",
            icon: "fa-face-sad-cry"
        },
        {
            title: "超优",
            description: "工作运超优，有机会取得重大突破和成就。充分发挥自己的能力，创造佳绩！",
            color: "#22c55e",
            icon: "fa-face-laugh-squint"
        },
        {
            title: "优中之优",
            description: "工作状态达到优中之优，能高效完成高难度任务，为团队带来巨大价值。继续保持卓越！",
            color: "#10b981",
            icon: "fa-face-smile-beam"
        },
        {
            title: "中等水平",
            description: "工作表现处于中等水平，能完成基本任务，但需要不断提升自己。加强学习，提高能力。",
            color: "#64748b",
            icon: "fa-face-neutral"
        },
        {
            title: "小困境",
            description: "工作中会陷入一些小困境，如资源不足、时间紧迫等。合理安排，寻求帮助。",
            color: "#f59e0b",
            icon: "fa-face-confounded"
        },
        {
            title: "情绪低落",
            description: "今日工作情绪低落，效率低下。先调整心态，放松一下，再重新投入工作。",
            color: "#ef4444",
            icon: "fa-face-tired"
        },
        {
            title: "大机遇",
            description: "工作上有大机遇降临，可能是参与重要项目、与大客户合作等。抓住机会，实现飞跃！",
            color: "#22c55e",
            icon: "fa-face-grin-wide"
        },
        {
            title: "良好进展",
            description: "工作进展良好，各项任务按计划推进，与团队成员配合默契。继续保持这种势头！",
            color: "#10b981",
            icon: "fa-face-smile"
        },
        {
            title: "常规工作",
            description: "工作处于常规状态，按部就班完成任务。注重细节，提高工作质量。",
            color: "#64748b",
            icon: "fa-face-meh"
        },
        {
            title: "小失误",
            description: "工作中可能会出现一些小失误，如沟通不畅、数据错误等。及时纠正，避免影响工作进度。",
            color: "#f59e0b",
            icon: "fa-face-frown"
        },
        {
            title: "艰难局面",
            description: "今日工作陷入艰难局面，可能面临多个问题和挑战。保持冷静，逐一解决。",
            color: "#ef4444",
            icon: "fa-face-sad-cry"
        },
        {
            title: "极优状态",
            description: "事业运处于极优状态，会有非凡的成就和发展。全力以赴，创造辉煌业绩！",
            color: "#22c55e",
            icon: "fa-face-laugh-beam"
        },
        {
            title: "尚佳水平",
            description: "工作表现尚佳，能高效完成任务，还能为团队提供支持。继续保持优秀！",
            color: "#10b981",
            icon: "fa-face-smile-beam"
        },
        {
            title: "平稳发展",
            description: "工作平稳发展，没有大的波动。持续努力，不断提升自己的竞争力。",
            color: "#64748b",
            icon: "fa-face-neutral"
        },
        {
            title: "小阻碍",
            description: "工作中会遇到一些小阻碍，如流程繁琐、审批缓慢等。积极沟通，加快进度。",
            color: "#f59e0b",
            icon: "fa-face-confused"
        },
        {
            title: "低迷状态",
            description: "今日工作处于低迷状态，效率低下，动力不足。调整心态，重新找回工作热情。",
            color: "#ef4444",
            icon: "fa-face-tired"
        },
        {
            title: "旺势持续",
            description: "工作运旺势持续，会有更多的机会和好运。抓住机遇，不断前进！",
            color: "#22c55e",
            icon: "fa-face-grin-hearts"
        },
        {
            title: "良佳势头",
            description: "工作呈现良佳势头，与团队协作高效，任务推进顺利。继续保持，争取更大成果！",
            color: "#10b981",
            icon: "fa-face-smile-wink"
        },
        {
            title: "平常业务",
            description: "工作是平常业务，按部就班完成即可。注意积累经验，提升自己。",
            color: "#64748b",
            icon: "fa-face-meh-blank"
        },
        {
            title: "微问题",
            description: "工作中会出现一些微问题，如设备老化、软件故障等。及时处理，避免影响工作。",
            color: "#f59e0b",
            icon: "fa-face-rolling-eyes"
        },
        {
            title: "表现不佳",
            description: "今日工作表现不佳，可能会受到批评或指责。认真反思，改进自己的工作方法。",
            color: "#ef4444",
            icon: "fa-face-sad-tear"
        },
        {
            title: "鸿运满盈",
            description: "事业运鸿运满盈，会有巨大的成功和收获。大胆拼搏，实现自己的梦想！",
            color: "#22c55e",
            icon: "fa-face-grin-stars"
        },
        {
            title: "尚好表现",
            description: "工作表现尚好，能完成任务，与同事关系融洽。继续努力，争取更好的成绩。",
            color: "#10b981",
            icon: "fa-face-smile"
        },
        {
            title: "平淡业务",
            description: "工作业务平淡，没有特别的亮点。可尝试创新，提高工作的趣味性和效率。",
            color: "#64748b",
            icon: "fa-face-meh"
        },
        {
            title: "小困扰",
            description: "工作中会遇到一些小困扰，如同事的不合理要求、客户的刁难等。妥善处理，保持良好的工作氛围。",
            color: "#f59e0b",
            icon: "fa-face-frown-open"
        },
        {
            title: "艰难时期",
            description: "今日工作处于艰难时期，压力巨大，挑战重重。保持信心，坚持到底，胜利就在前方！",
            color: "#ef4444",
            icon: "fa-face-sad-cry"
        }
    ];

    // 定义工作建议数据，扩展到100条
    const workAdvices = [
        "今日适合处理复杂任务，思维清晰，效率高。",
        "避免过度劳累，适当休息才能保持良好状态。",
        "团队合作会有不错的效果，多与同事沟通交流。",
        "今日创造力较强，适合开展新项目或提出新想法。",
        "注意细节，避免因粗心而犯错。",
        "今日适合学习新技能或知识，提升自己。",
        "遇到问题不要独自承担，寻求帮助会更有效率。",
        "保持积极心态，困难只是暂时的。",
        "今日适合做一些规划和安排，为未来做准备。",
        "劳逸结合，工作之余也要注意休息和娱乐。",
        "主动与客户沟通，可能会带来新的业务机会。",
        "对工作进行复盘，总结经验教训，避免重复犯错。",
        "尝试新的工作方法，提高工作效率。",
        "多参加行业交流活动，拓展人脉资源。",
        "整理工作文件，保持办公环境整洁有序。",
        "提前做好工作安排，避免手忙脚乱。",
        "学会倾听他人的意见和建议，有助于提升自己。",
        "遇到紧急情况要冷静，迅速采取应对措施。",
        "注重工作质量，不要只追求速度。",
        "与上级保持良好的沟通，及时汇报工作进展。",
        "今日适合展示自己的能力，争取更多的机会。",
        "合理分配时间，确保各项任务都能按时完成。",
        "保持工作热情，积极面对每一项任务。",
        "对工作中的数据进行分析，发现问题并及时解决。",
        "勇于尝试新的领域，拓宽自己的职业道路。",
        "与同事保持良好的关系，营造和谐的工作氛围。",
        "定期锻炼身体，保持良好的身体素质。",
        "今日适合处理一些琐碎的事务，避免拖延。",
        "学会自我激励，提高工作动力。",
        "遇到困难时，换个角度思考，可能会找到更好的解决方案。",
        "关注行业动态，及时了解最新的信息和趋势。",
        "对工作进行优化，提高工作的效益和价值。",
        "培养自己的团队合作精神，共同完成工作目标。",
        "今日适合与领导沟通，表达自己的想法和需求。",
        "保持学习的状态，不断提升自己的专业知识。",
        "合理安排工作和生活，避免工作压力过大。",
        "遇到问题时，不要轻易放弃，坚持就是胜利。",
        "对工作进行总结和反思，不断改进自己的工作方法。",
        "主动承担一些额外的工作，展示自己的能力和责任心。",
        "今日适合与客户建立长期的合作关系。",
        "学会管理时间，提高工作效率。",
        "保持良好的心态，面对工作中的挫折和困难。",
        "对工作中的流程进行优化，提高工作的顺畅度。",
        "积极参与公司的培训和学习活动，提升自己的综合素质。",
        "今日适合处理一些重要但不紧急的任务。",
        "与同事分享自己的经验和知识，共同进步。",
        "注重个人形象和职业素养，给他人留下好印象。",
        "遇到问题时，及时向上级汇报，寻求支持和帮助。",
        "对工作进行规划和预算，确保资源的合理利用。",
        "培养自己的创新能力，为公司带来新的发展机遇。",
        "今日适合与合作伙伴进行沟通和协商。",
        "学会放松自己，缓解工作压力。",
        "保持对工作的热情和好奇心，不断探索新的领域。",
        "对工作中的风险进行评估和防范，避免损失。",
        "积极参与团队活动，增强团队凝聚力。",
        "今日适合处理一些人际关系问题，化解矛盾。",
        "学会自我管理，提高自己的执行力。",
        "遇到问题时，分析原因，制定有效的解决方案。",
        "关注工作中的细节，提高工作的质量和水平。",
        "培养自己的沟通能力，与他人进行有效的交流。",
        "今日适合对工作进行调整和优化，提高工作效率。",
        "与同事建立良好的信任关系，共同完成工作任务。",
        "保持良好的工作习惯，提高工作的规范性。",
        "对工作中的成果进行总结和展示，获得认可和奖励。",
        "积极参与公司的文化建设，增强归属感。",
        "今日适合处理一些复杂的人际关系问题。",
        "学会时间管理，合理安排工作和休息时间。",
        "保持积极乐观的心态，面对工作中的挑战。",
        "对工作中的流程进行梳理和改进，提高工作效率。",
        "培养自己的领导能力，带领团队取得更好的成绩。",
        "今日适合与客户进行深度沟通，了解需求。",
        "学会自我调节，缓解工作中的压力和焦虑。",
        "保持对工作的专注和认真，避免出现失误。",
        "对工作中的资源进行整合和利用，提高效益。",
        "积极参与行业的研讨会和论坛，拓展视野。",
        "今日适合处理一些重要的文件和资料。",
        "与同事进行有效的合作，共同完成工作目标。",
        "保持良好的职业操守，遵守公司的规章制度。",
        "对工作中的项目进行跟踪和评估，确保顺利进行。",
        "培养自己的决策能力，做出明智的选择。",
        "今日适合与上级领导进行汇报和沟通。",
        "学会团队协作，发挥团队的优势。",
        "保持对工作的热情和动力，不断追求进步。",
        "对工作中的问题进行分析和解决，提高工作质量。",
        "积极参与公司的公益活动，提升企业形象。",
        "今日适合处理一些长期的工作任务。",
        "与同事建立良好的沟通机制，提高工作效率。",
        "保持良好的工作态度，认真对待每一项工作。",
        "对工作中的经验进行总结和分享，帮助他人。",
        "培养自己的学习能力，不断更新知识和技能。",
        "今日适合与合作伙伴进行合作洽谈。",
        "学会情绪管理，保持良好的心态。",
        "保持对工作的创新和探索精神，推动工作发展。",
        "对工作中的风险进行预警和处理，保障工作安全。",
        "积极参与团队的培训和学习，提升团队整体水平。",
        "今日适合处理一些敏感的工作问题。",
        "与同事建立良好的竞争合作关系，共同进步。",
        "保持良好的生活习惯，为工作提供保障。",
        "对工作中的成果进行评估和反馈，持续改进。",
        "培养自己的沟通技巧，提高沟通效果。",
        "今日适合对工作进行总结和展望，制定新的计划。",
        "与同事分享自己的工作心得和体会，促进交流。",
        "保持良好的职业形象，展现专业素养。",
        "对工作中的项目进行管理和协调，确保顺利推进。",
        "培养自己的应变能力，应对突发情况。",
        "今日适合与客户进行满意度调查，了解反馈。",
        "学会自我提升，不断完善自己。",
        "保持对工作的责任感和使命感，认真履行职责。",
        "对工作中的资源进行合理配置，提高利用效率。",
        "积极参与行业的交流和合作，拓展业务渠道。"
    ];

    // 显示加载状态
    function showLoading() {
        document.getElementById('placeholder').classList.add('hidden');
        document.getElementById('result').classList.add('hidden');
        document.getElementById('loading').classList.remove('hidden');
    }

    // 隐藏加载状态
    function hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    // 获取随机运势
    function getRandomFortune() {
        // 显示加载状态
        showLoading();

        // 模拟API请求延迟
        setTimeout(() => {
            // 隐藏加载状态
            hideLoading();

            // 使用随机数生成器获取随机运势
            const randomIndex = Math.floor(Math.random() * fortunes.length);

            // 获取运势
            const fortune = fortunes[randomIndex];

            // 获取随机工作建议
            const randomAdviceIndex = Math.floor(Math.random() * workAdvices.length);
            const workAdvice = workAdvices[randomAdviceIndex];

            // 显示运势结果
            const resultContainer = document.getElementById('result');
            resultContainer.classList.remove('hidden');

            const fortuneResult = document.getElementById('fortune-result');
            fortuneResult.textContent = fortune.title;
            fortuneResult.style.color = fortune.color;

            const fortuneDesc = document.getElementById('fortune-desc');
            fortuneDesc.innerHTML = `${fortune.description}<br><br><span class="font-medium">工作建议：</span>${workAdvice}`;

            // 移除之前的图标
            const existingIcon = resultContainer.querySelector('i');
            if (existingIcon) {
                existingIcon.remove();
            }

            // 添加新的图标
            const iconElement = document.createElement('i');
            iconElement.className = `fa-solid ${fortune.icon} text-6xl mb-4`;
            iconElement.style.color = fortune.color;

            // 插入图标到结果容器
            resultContainer.insertBefore(iconElement, fortuneResult);

            // 添加动画效果
            resultContainer.classList.add('animate-fade-in');
        }, 1500);
    }

    // 初始化页面
    function initPage() {
        // 移除自动获取运势的调用
        // getRandomFortune();

        // 添加页面滚动效果
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.classList.add('shadow-md');
                header.classList.remove('shadow-sm');
            } else {
                header.classList.remove('shadow-md');
                header.classList.add('shadow-sm');
            }
        });

        // 为按钮添加点击事件监听器
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', getRandomFortune);
    }

    // 初始化页面
    initPage();
});