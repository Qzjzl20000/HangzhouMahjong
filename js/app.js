// 主应用模块
import { Storage } from './storage.js';
import { Game } from './game.js';
import { ScoreCalculator } from './score.js';
import { Dice } from './dice.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.storage = new Storage();
        this.game = new Game();
        this.ui = new UI();
        this.dice = new Dice();
        this.scoreCalculator = null;
        this.currentScorePreview = null;
    }

    async init() {
        // 加载规则配置
        try {
            const rulesResponse = await fetch('config/rules.json');
            const rules = await rulesResponse.json();
            this.scoreCalculator = new ScoreCalculator(rules);
            this.ui.updateWinTypeSelect(this.scoreCalculator.getAllWinTypes());
        } catch (error) {
            console.error('加载规则失败:', error);
            alert('加载游戏规则失败，请检查 config/rules.json 文件');
            return;
        }

        // 绑定事件监听器
        this.ui.bindEventListeners({
            onStartGame: () => this.handleStartGame(),
            onConfirmScore: () => this.handleConfirmScore(),
            onRollDice: () => this.handleRollDice(),
            onRestart: () => this.handleRestart(),
            onCancelRestart: () => this.ui.hideConfirmModal(),
            onConfirmRestart: () => this.handleConfirmRestart(),
            onWinnerChange: () => this.handlePlayerSelect(),
            onWinTypeChange: () => this.handlePlayerSelect()
        });

        // 绑定庄家选择事件
        this.ui.bindBankerSelection((playerId) => {
            // 庄家选择变化时的回调（如果需要）
        });

        // 检查是否有存档
        if (this.storage.hasSaveGame()) {
            const savedGame = this.storage.loadGame();
            if (savedGame && confirm('检测到存档，是否继续游戏？')) {
                this.game.loadState(savedGame);
                this.showGameScreen();
            } else {
                this.ui.showSetupScreen();
            }
        } else {
            this.ui.showSetupScreen();
        }
    }

    handleStartGame() {
        const { playerNames, playerScores, firstBankerId, consecutiveWins, initialScore } = this.ui.getSetupValues();

        // 验证输入
        if (playerNames.some(name => !name.trim())) {
            alert('请填写所有玩家名称');
            return;
        }

        if (initialScore < 0) {
            alert('初始积分必须大于等于0');
            return;
        }

        // 初始化游戏
        this.game.initNewGame(playerNames, playerScores, firstBankerId, consecutiveWins);
        this.saveGame();
        this.showGameScreen();
    }

    handlePlayerSelect() {
        const winnerId = this.ui.elements.winnerSelect.value;
        const winTypeId = this.ui.elements.winTypeSelect.value;

        if (!winnerId || !winTypeId) {
            this.ui.clearScorePreview();
            this.currentScorePreview = null;
            return;
        }

        const gameState = this.game.getState();
        const banker = this.game.getCurrentBanker();

        // 计算得分预览
        try {
            const result = this.scoreCalculator.calculate(
                winnerId,
                winTypeId,
                banker.bankerLevel,
                gameState.players
            );
            this.ui.updateScorePreview(result.scoreChanges, gameState.players);
            this.currentScorePreview = {
                winnerId: parseInt(winnerId),
                winTypeId,
                ...result
            };
        } catch (error) {
            console.error('计算得分失败:', error);
            alert('计算得分失败: ' + error.message);
        }
    }

    handleConfirmScore() {
        if (!this.currentScorePreview) {
            alert('请先选择胡牌玩家和胡牌类型');
            return;
        }

        const gameState = this.game.getState();
        const winner = this.game.getPlayer(this.currentScorePreview.winnerId);
        const banker = this.game.getCurrentBanker();

        // 更新玩家积分
        this.currentScorePreview.scoreChanges.forEach(change => {
            const player = this.game.getPlayer(change.playerId);
            player.score = Math.round((player.score + change.change) * 100) / 100;
        });

        // 计算下一任庄家
        const nextBanker = this.game.getNextBanker(this.currentScorePreview.winnerId);
        this.game.updateBankerStatus(nextBanker);

        // 添加局数记录
        const winType = this.scoreCalculator.winTypeMap.get(this.currentScorePreview.winTypeId);
        const round = this.game.addRound({
            winnerId: this.currentScorePreview.winnerId,
            winTypeId: this.currentScorePreview.winTypeId,
            winTypeName: winType.name,
            bankerId: banker.id,
            baseScore: 1,
            multiplier: Math.pow(2, this.currentScorePreview.bankerFan),
            scoreChanges: this.currentScorePreview.scoreChanges,
            fan: this.currentScorePreview.fan,
            bankerFan: this.currentScorePreview.bankerFan
        });

        // 更新UI
        this.ui.updatePlayerCards(gameState.players);
        this.ui.addHistoryItem(round, gameState.players);

        // 重置选择
        this.ui.elements.winnerSelect.value = '';
        this.ui.elements.winTypeSelect.value = '';
        this.ui.clearScorePreview();
        this.currentScorePreview = null;

        // 保存游戏
        this.saveGame();
    }

    async handleRollDice() {
        const result = await this.dice.roll();
        this.ui.updateDice(result.dice1, result.dice2, result.total);
    }

    handleRestart() {
        this.ui.showConfirmModal();
    }

    handleConfirmRestart() {
        if (confirm('确认要重新开始吗？这将清空所有游戏记录。')) {
            this.storage.clearGame();
            this.ui.clearHistory();
            this.ui.showSetupScreen();
            this.ui.hideConfirmModal();
        }
    }

    showGameScreen() {
        const gameState = this.game.getState();

        // 更新玩家卡片
        this.ui.updatePlayerCards(gameState.players);

        // 更新胡牌玩家下拉选项
        this.ui.updateWinnerSelect(gameState.players);

        // 显示历史记录
        gameState.rounds.forEach(round => {
            this.ui.addHistoryItem(round, gameState.players);
        });

        this.ui.showGameScreen();
    }

    saveGame() {
        this.storage.saveGame(this.game.getState());
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
