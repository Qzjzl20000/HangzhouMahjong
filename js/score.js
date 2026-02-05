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

        // 基础分数 = 2^胡牌番数
        const baseScore = Math.pow(2, fan);

        // 庄家需支付的分数 = 基础分数 × 2^庄家番数
        const bankerPayment = baseScore * Math.pow(2, bankerFan);

        // 闲家需支付的分数 = 基础分数（庄家番数不影响闲家之间的结算）
        const playerPayment = baseScore;

        const scoreChanges = [];
        const winner = players.find(p => p.id === parseInt(winnerId));
        const isWinnerBanker = winner.role === 'banker';

        // 先计算胡家总得分
        let totalGain = 0;
        players.forEach(player => {
            if (player.id !== parseInt(winnerId)) {
                if (isWinnerBanker) {
                    // 胡家是庄家，所有输家都支付bankerPayment（含连庄番数）
                    totalGain += bankerPayment;
                } else {
                    // 胡家是闲家，庄家支付bankerPayment，其他闲家支付playerPayment
                    if (player.role === 'banker') {
                        totalGain += bankerPayment;
                    } else {
                        totalGain += playerPayment;
                    }
                }
            }
        });

        // 计算各玩家积分变化
        players.forEach(player => {
            if (player.id === parseInt(winnerId)) {
                // 胡家得分
                scoreChanges.push({
                    playerId: player.id,
                    change: totalGain
                });
            } else {
                // 输家得分
                let loss;
                if (isWinnerBanker) {
                    // 胡家是庄家，所有输家都支付bankerPayment
                    loss = -bankerPayment;
                } else {
                    // 胡家是闲家，庄家支付bankerPayment，其他闲家支付playerPayment
                    loss = (player.role === 'banker') ? -bankerPayment : -playerPayment;
                }
                scoreChanges.push({
                    playerId: player.id,
                    change: loss
                });
            }
        });

        return {
            baseScore,
            bankerPayment,
            playerPayment,
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
