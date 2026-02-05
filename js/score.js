// 计分算法模块
export class ScoreCalculator {
    constructor(rules) {
        this.rules = rules;
        this.buildWinTypeMap();
    }

    // 构建胡牌类型映射
    buildWinTypeMap() {
        this.winTypeMap = new Map();
        for (const category of this.rules.winTypes) {
            if (Array.isArray(category)) {
                category.forEach(type => {
                    this.winTypeMap.set(type.id, type);
                });
            }
        }
    }

    // 根据胡牌类型和庄家状态计算得分
    calculate(winnerId, winTypeId, bankerLevel, players) {
        const winType = this.winTypeMap.get(winTypeId);
        if (!winType) {
            throw new Error(`未知的胡牌类型: ${winTypeId}`);
        }

        const fan = winType.fan;
        const bankerFan = bankerLevel;

        // 根据计分公式: 最终得分 = 2^胡牌番数 × 2^庄家番数
        const winnerScore = Math.pow(2, fan) * Math.pow(2, bankerFan);

        // 计算各玩家积分变化
        const scoreChanges = [];
        const bankerId = players.find(p => p.role === 'banker').id;

        players.forEach(player => {
            if (player.id === parseInt(winnerId)) {
                // 胡家得分
                scoreChanges.push({
                    playerId: player.id,
                    change: winnerScore
                });
            } else {
                // 闲家得分
                // 庄家番数只计算闲家与庄家的盈亏
                let loserScore = -winnerScore / 3;

                // 如果当前玩家是庄家，需要考虑庄家番数
                if (player.id === bankerId && bankerId !== parseInt(winnerId)) {
                    // 庄家输给胡家，需要按庄家番数计算
                    // 但这里简化处理，因为已经在winnerScore中包含了庄家番数
                }

                scoreChanges.push({
                    playerId: player.id,
                    change: Math.round(loserScore * 100) / 100 // 保留两位小数
                });
            }
        });

        return {
            winnerScore,
            scoreChanges,
            fan,
            bankerFan
        };
    }

    // 获取所有胡牌类型（用于下拉菜单）
    getAllWinTypes() {
        const result = [];
        for (const category of Object.keys(this.rules.winTypes)) {
            const types = this.rules.winTypes[category];
            if (Array.isArray(types)) {
                types.forEach(type => {
                    result.push({
                        value: type.id,
                        label: type.label,
                        category: category,
                        fan: type.fan
                    });
                });
            }
        }
        return result;
    }

    // 获取庄家级别列表
    getBankerLevels() {
        return this.rules.bankerLevels;
    }

    // 获取庄家级别名称
    getBankerLevelName(level) {
        const bankerLevel = this.rules.bankerLevels.find(b => b.level === level);
        return bankerLevel ? bankerLevel.name : '闲家';
    }
}
