// 游戏状态管理模块
export class Game {
    constructor() {
        this.state = null;
    }

    // 初始化新游戏
    initNewGame(playerNames, initialScore, firstBankerId) {
        const players = playerNames.map((name, id) => ({
            id,
            name,
            score: initialScore,
            initialScore,
            role: id === parseInt(firstBankerId) ? 'banker' : 'player',
            consecutiveWins: id === parseInt(firstBankerId) ? 0 : 0,
            bankerLevel: id === parseInt(firstBankerId) ? 0 : 0
        }));

        this.state = {
            gameId: this.generateUUID(),
            status: 'playing',
            createdAt: new Date().toISOString(),
            players,
            rounds: [],
            currentRound: 0
        };

        return this.state;
    }

    // 加载游戏状态
    loadState(gameState) {
        this.state = gameState;
        return this.state;
    }

    // 获取当前状态
    getState() {
        return this.state;
    }

    // 获取玩家
    getPlayer(playerId) {
        return this.state.players.find(p => p.id === parseInt(playerId));
    }

    // 获取当前庄家
    getCurrentBanker() {
        return this.state.players.find(p => p.role === 'banker');
    }

    // 计算下一任庄家
    getNextBanker(winnerId) {
        const currentBanker = this.getCurrentBanker();
        const currentBankerId = currentBanker.id;
        const currentConsecutiveWins = currentBanker.consecutiveWins;

        if (currentBankerId === winnerId) {
            // 庄家胡牌，继续坐庄
            const newConsecutiveWins = currentConsecutiveWins + 1;
            const newBankerLevel = Math.min(newConsecutiveWins, 3);
            return {
                bankerId: currentBankerId,
                consecutiveWins: newConsecutiveWins,
                bankerLevel: newBankerLevel
            };
        } else {
            // 闲家胡牌，下家坐庄
            return {
                bankerId: (currentBankerId + 1) % 4,
                consecutiveWins: 0,
                bankerLevel: 0
            };
        }
    }

    // 更新庄家状态
    updateBankerStatus(nextBanker) {
        // 更新所有玩家角色
        this.state.players.forEach(player => {
            if (player.id === nextBanker.bankerId) {
                player.role = 'banker';
                player.consecutiveWins = nextBanker.consecutiveWins;
                player.bankerLevel = nextBanker.bankerLevel;
            } else {
                player.role = 'player';
                player.consecutiveWins = 0;
                player.bankerLevel = 0;
            }
        });
    }

    // 添加局数记录
    addRound(roundData) {
        this.state.currentRound++;
        const round = {
            roundId: this.state.currentRound,
            ...roundData,
            timestamp: new Date().toISOString()
        };
        this.state.rounds.push(round);
        return round;
    }

    // 生成UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
