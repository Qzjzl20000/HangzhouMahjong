// 杭州麻将计分器 - 合并版本
// 不使用 ES6 模块，直接用浏览器打开即可使用

// ==================== 数据持久化模块 ====================
const Storage = {
    STORAGE_KEY: 'hangzhou_mahjong_game',

    saveGame(gameState) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gameState));
            return true;
        } catch (error) {
            console.error('保存游戏失败:', error);
            return false;
        }
    },

    loadGame() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('加载游戏失败:', error);
            return null;
        }
    },

    clearGame() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('清除游戏失败:', error);
            return false;
        }
    },

    hasSaveGame() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
};

// ==================== 游戏规则配置 ====================
const RULES = {
    "winTypes": {
        "基础番型": [
            { "id": "pinghu", "name": "平胡", "fan": 0, "label": "自摸（含财神）", "description": "胡牌牌型包含财神，最基本的胡牌方式" },
            { "id": "wucai_pinghu", "name": "无财平胡", "fan": 1, "label": "自摸（不含财神）", "description": "胡牌牌型完全不包含财神" },
            { "id": "baotou", "name": "爆头", "fan": 1, "label": "财神+自摸任意单张", "description": "财神搭配任意自摸单张成对" },
            { "id": "gangkai", "name": "杠开", "fan": 1, "label": "杠开（含财神）", "description": "杠上开花自摸胡，胡牌牌型包含财神" },
            { "id": "wucai_gangkai", "name": "无财杠开", "fan": 2, "label": "杠开自摸胡（不含财神）", "description": "杠上开花自摸胡，胡牌牌型不包含财神" },
            { "id": "shuang_gangkai", "name": "双杠开", "fan": 2, "label": "双杠开自摸胡", "description": "开杠2次后杠上开花自摸胡" },
            { "id": "san_gangkai", "name": "三杠开", "fan": 3, "label": "三杠开自摸胡", "description": "开杠3次后杠上开花自摸胡" },
            { "id": "caipiao", "name": "财飘", "fan": 2, "label": "单飘财神", "description": "打出一张财神（财神作为单张打出）" },
            { "id": "shuang_caipiao", "name": "双财飘", "fan": 3, "label": "双飘财神", "description": "打出两张财神（两张财神作为单张打出）" },
            { "id": "san_caipiao", "name": "三财飘", "fan": 4, "label": "三飘财神", "description": "打出三张财神（三张财神作为单张打出）" },
            { "id": "qidui", "name": "七对", "fan": 2, "label": "七个对子（含财神）", "description": "七个对子胡牌，包含财神" },
            { "id": "wucai_qidui", "name": "无财七对", "fan": 3, "label": "七个对子（不含财神）", "description": "七个对子胡牌，不包含财神" },
            { "id": "haohua_qidui", "name": "豪华七对", "fan": 4, "label": "豪华七对（含财神）", "description": "含杠七对，包含财神" },
            { "id": "wucai_haoqi", "name": "无财豪七", "fan": 4, "label": "豪华七对（不含财神）", "description": "含杠七对，不包含财神" },
            { "id": "shifeng", "name": "十风", "fan": 3, "label": "连打十风（不含财神）", "description": "东西南北中发六类中打10张，中间不能吃、碰、杠等操作。" },
            { "id": "shifeng_youcai", "name": "十风有财", "fan": 4, "label": "连打十风（含财神）", "description": "东西南北中发白七类中打10张，中间不能吃、碰、杠等操作。" }
        ],
        "叠加番型": [
            { "id": "gangbao", "name": "杠爆", "fan": 2, "label": "杠开+爆头", "description": "杠开(1) + 爆头(1) = 2番" },
            { "id": "shuang_gangbao", "name": "双杠爆", "fan": 3, "label": "双杠+爆头", "description": "双杠开(2) + 爆头(1) = 3番" },
            { "id": "san_gangbao", "name": "三杠爆", "fan": 4, "label": "三杠+爆头", "description": "三杠开(3) + 爆头(1) = 4番" },
            { "id": "piaobao", "name": "飘爆", "fan": 3, "label": "财飘+爆头", "description": "财飘(2) + 爆头(1) = 3番" },
            { "id": "shuang_piaobao", "name": "双飘爆", "fan": 4, "label": "双财飘+爆头", "description": "双财飘(3) + 爆头(1) = 4番" },
            { "id": "san_piaobao", "name": "三飘爆", "fan": 4, "label": "三财飘+爆头（4番封顶）", "description": "三财飘(4) + 爆头(1) = 5番，4番封顶" },
            { "id": "gangpiao", "name": "杠飘", "fan": 3, "label": "杠开+财飘", "description": "杠开(1) + 财飘(2) = 3番" },
            { "id": "shuang_gangpiao", "name": "双杠飘", "fan": 4, "label": "双杠+财飘", "description": "双杠开(2) + 财飘(2) = 4番" },
            { "id": "san_gangpiao", "name": "三杠飘", "fan": 4, "label": "三杠+财飘（4番封顶）", "description": "三杠开(3) + 财飘(2) = 5番，4番封顶" },
            { "id": "piaogang", "name": "飘杠", "fan": 3, "label": "财飘+杠开", "description": "财飘(2) + 杠开(1) = 3番（同杠飘，顺序不同）" },
            { "id": "shuang_piaogang", "name": "双飘杠", "fan": 4, "label": "双财飘+杠开", "description": "双财飘(3) + 杠开(1) = 4番" },
            { "id": "san_piaogang", "name": "三飘杠", "fan": 4, "label": "三财飘+杠开（4番封顶）", "description": "三财飘(4) + 杠开(1) = 5番，4番封顶" },
            { "id": "qidui_baotou", "name": "七对爆头", "fan": 3, "label": "七对+爆头", "description": "七对(2) + 爆头(1) = 3番" },
            { "id": "qidui_caipiao", "name": "七对财飘", "fan": 4, "label": "七对+飘财", "description": "七对(2) + 财飘(2) = 4番" },
            { "id": "haoqi_baotou", "name": "豪七爆头", "fan": 4, "label": "豪华七对+爆头（4番封顶）", "description": "豪华七对(4)已封顶，叠加爆头仍为4番" },
            { "id": "haoqi_caipiao", "name": "豪七财飘", "fan": 4, "label": "豪华七对+财飘（4番封顶）", "description": "豪华七对(4)已封顶，叠加财飘仍为4番" }
        ]
    },
    "bankerLevels": [
        { "level": 0, "name": "闲家", "fan": 0 },
        { "level": 1, "name": "一老庄", "fan": 1 },
        { "level": 2, "name": "二老庄", "fan": 2 },
        { "level": 3, "name": "三老庄", "fan": 3 }
    ]
};

// ==================== 计分算法模块 ====================
const ScoreCalculator = {
    winTypeMap: null,

    init() {
        this.buildWinTypeMap();
    },

    buildWinTypeMap() {
        this.winTypeMap = new Map();
        for (const category of Object.keys(RULES.winTypes)) {
            const types = RULES.winTypes[category];
            types.forEach(type => {
                this.winTypeMap.set(type.id, type);
            });
        }
    },

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

        // 先计算胡家总得分
        let totalGain = 0;
        players.forEach(player => {
            if (player.id !== parseInt(winnerId)) {
                if (player.role === 'banker') {
                    totalGain += bankerPayment;
                } else {
                    totalGain += playerPayment;
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
                let loss = (player.role === 'banker') ? -bankerPayment : -playerPayment;
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
    },

    getAllWinTypes() {
        const result = [];
        for (const category of Object.keys(RULES.winTypes)) {
            const types = RULES.winTypes[category];
            types.forEach(type => {
                result.push({
                    value: type.id,
                    label: type.label,
                    category: category,
                    fan: type.fan
                });
            });
        }
        return result;
    },

    getBankerLevelName(level) {
        const bankerLevel = RULES.bankerLevels.find(b => b.level === level);
        return bankerLevel ? bankerLevel.name : '闲家';
    }
};

// ==================== 游戏状态管理模块 ====================
const Game = {
    state: null,

    initNewGame(playerNames, initialScore, firstBankerId) {
        const players = playerNames.map((name, id) => ({
            id,
            name,
            score: initialScore,
            initialScore,
            role: id === parseInt(firstBankerId) ? 'banker' : 'player',
            consecutiveWins: id === parseInt(firstBankerId) ? 1 : 0,
            bankerLevel: id === parseInt(firstBankerId) ? 1 : 0
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
    },

    loadState(gameState) {
        this.state = gameState;
        return this.state;
    },

    getState() {
        return this.state;
    },

    getPlayer(playerId) {
        return this.state.players.find(p => p.id === parseInt(playerId));
    },

    getCurrentBanker() {
        return this.state.players.find(p => p.role === 'banker');
    },

    getNextBanker(winnerId) {
        const currentBanker = this.getCurrentBanker();
        const currentBankerId = currentBanker.id;

        // 谁赢谁做庄
        if (currentBankerId === winnerId) {
            // 庄家继续赢，连庄数+1
            const newConsecutiveWins = currentBanker.consecutiveWins + 1;
            const newBankerLevel = Math.min(newConsecutiveWins, 3);
            return {
                bankerId: currentBankerId,
                consecutiveWins: newConsecutiveWins,
                bankerLevel: newBankerLevel
            };
        } else {
            // 闲家赢，成为新庄家，从1连庄/一老庄开始
            return {
                bankerId: winnerId,
                consecutiveWins: 1,
                bankerLevel: 1
            };
        }
    },

    updateBankerStatus(nextBanker) {
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
    },

    addRound(roundData) {
        this.state.currentRound++;
        const round = {
            roundId: this.state.currentRound,
            ...roundData,
            timestamp: new Date().toISOString()
        };
        this.state.rounds.push(round);
        return round;
    },

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

// ==================== 骰子功能模块 ====================
const Dice = {
    dice1: 1,
    dice2: 1,
    isRolling: false,

    roll() {
        if (this.isRolling) return null;

        this.isRolling = true;
        this.dice1 = Math.floor(Math.random() * 6) + 1;
        this.dice2 = Math.floor(Math.random() * 6) + 1;

        return new Promise((resolve) => {
            setTimeout(() => {
                this.isRolling = false;
                resolve({
                    dice1: this.dice1,
                    dice2: this.dice2,
                    total: this.dice1 + this.dice2
                });
            }, 500);
        });
    },

    getValues() {
        return {
            dice1: this.dice1,
            dice2: this.dice2,
            total: this.dice1 + this.dice2
        };
    }
};

// ==================== UI 模块 ====================
const UI = {
    elements: {},

    init() {
        this.elements = {
            setupScreen: document.getElementById('setup-screen'),
            gameScreen: document.getElementById('game-screen'),
            confirmModal: document.getElementById('confirm-modal'),
            playerNames: [
                document.getElementById('player0-name'),
                document.getElementById('player1-name'),
                document.getElementById('player2-name'),
                document.getElementById('player3-name')
            ],
            initialScore: document.getElementById('initial-score'),
            startGameBtn: document.getElementById('start-game-btn'),
            playerCards: [
                document.getElementById('player0-card'),
                document.getElementById('player1-card'),
                document.getElementById('player2-card'),
                document.getElementById('player3-card')
            ],
            winnerSelect: document.getElementById('winner-select'),
            winTypeSelect: document.getElementById('win-type-select'),
            scorePreviewContent: document.getElementById('score-preview-content'),
            confirmScoreBtn: document.getElementById('confirm-score-btn'),
            historyList: document.getElementById('history-list'),
            restartBtn: document.getElementById('restart-btn'),
            cancelRestartBtn: document.getElementById('cancel-restart-btn'),
            confirmRestartBtn: document.getElementById('confirm-restart-btn'),
            dice1: document.getElementById('dice1'),
            dice2: document.getElementById('dice2'),
            dice1Value: document.getElementById('dice1-value'),
            dice2Value: document.getElementById('dice2-value'),
            diceTotal: document.getElementById('dice-total'),
            rollDiceBtn: document.getElementById('roll-dice-btn')
        };
    },

    showSetupScreen() {
        this.elements.setupScreen.classList.remove('hidden');
        this.elements.gameScreen.classList.add('hidden');
    },

    showGameScreen() {
        this.elements.setupScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');
    },

    showConfirmModal() {
        this.elements.confirmModal.classList.remove('hidden');
    },

    hideConfirmModal() {
        this.elements.confirmModal.classList.add('hidden');
    },

    updatePlayerCards(players) {
        const bankerLevelNames = ['闲家', '一老庄', '二老庄', '三老庄'];

        players.forEach(player => {
            const card = this.elements.playerCards[player.id];
            card.querySelector('.player-name').textContent = player.name;
            card.querySelector('.player-score .score').textContent = player.score;
            card.querySelector('.player-role').textContent = player.role === 'banker' ? '🎲 庄家' : '闲家';
            card.querySelector('.player-consecutive span').textContent =
                player.role === 'banker' ? `${player.consecutiveWins}次` : '--';
            card.querySelector('.player-banker-level').textContent =
                player.role === 'banker' ? bankerLevelNames[player.bankerLevel] : '';

            if (player.role === 'banker') {
                card.classList.add('banker');
            } else {
                card.classList.remove('banker');
            }
        });
    },

    updateWinnerSelect(players) {
        this.elements.winnerSelect.innerHTML = '<option value="">请选择</option>';
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            this.elements.winnerSelect.appendChild(option);
        });
    },

    updateWinTypeSelect(winTypes) {
        const grouped = {};
        winTypes.forEach(type => {
            if (!grouped[type.category]) {
                grouped[type.category] = [];
            }
            grouped[type.category].push(type);
        });

        this.elements.winTypeSelect.innerHTML = '<option value="">请选择</option>';

        for (const [category, types] of Object.entries(grouped)) {
            const group = document.createElement('optgroup');
            group.label = category;
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.value;
                option.textContent = `${type.label} (${type.fan}番)`;
                group.appendChild(option);
            });
            this.elements.winTypeSelect.appendChild(group);
        }
    },

    updateScorePreview(scoreChanges, players) {
        this.elements.scorePreviewContent.innerHTML = '';

        scoreChanges.forEach(change => {
            const player = players.find(p => p.id === change.playerId);
            const item = document.createElement('div');
            item.className = 'score-preview-item';
            item.textContent = `${player.name}: ${change.change >= 0 ? '+' : ''}${change.change} 分`;
            item.classList.add(change.change >= 0 ? 'positive' : 'negative');
            this.elements.scorePreviewContent.appendChild(item);
        });
    },

    clearScorePreview() {
        this.elements.scorePreviewContent.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">请选择胡牌玩家和胡牌类型</p>';
    },

    addHistoryItem(round, players) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(round.timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const winner = players.find(p => p.id === round.winnerId);

        // 显示分数变化：新分数（旧分数 ± 变化）
        let scoresHtml = '';
        if (round.playersAfter && round.playersBefore) {
            round.playersAfter.forEach(playerAfter => {
                const playerBefore = round.playersBefore.find(p => p.id === playerAfter.id);
                const change = round.scoreChanges.find(c => c.playerId === playerAfter.id);
                const changeText = change ? (change.change >= 0 ? `+${change.change}` : `${change.change}`) : '0';
                scoresHtml += `<span class="history-item-score ${change && change.change >= 0 ? 'positive' : 'negative'}">${playerAfter.name}: ${playerAfter.score} (${playerBefore.score}${changeText})</span>`;
            });
        } else if (round.playersAfter) {
            // 兼容旧数据（有playersAfter但没有playersBefore）
            round.playersAfter.forEach(playerAfter => {
                const change = round.scoreChanges.find(c => c.playerId === playerAfter.id);
                scoresHtml += `<span class="history-item-score ${change && change.change >= 0 ? 'positive' : 'negative'}">${playerAfter.name}: ${playerAfter.score}</span>`;
            });
        } else {
            // 兼容更旧的数据（没有playersAfter字段）
            round.scoreChanges.forEach(change => {
                const player = players.find(p => p.id === change.playerId);
                scoresHtml += `<span class="history-item-score ${change.change >= 0 ? 'positive' : 'negative'}">${player.name}: ${change.change >= 0 ? '+' : ''}${change.change}</span>`;
            });
        }

        item.innerHTML = `
            <div class="history-item-header">
                <span>第 ${round.roundId} 局 - ${dateStr}</span>
            </div>
            <div class="history-item-winner">胡家: ${winner.name} (${round.winTypeName})</div>
            <div class="history-item-scores">${scoresHtml}</div>
        `;

        this.elements.historyList.insertBefore(item, this.elements.historyList.firstChild);
    },

    clearHistory() {
        this.elements.historyList.innerHTML = '';
    },

    updateDice(dice1, dice2, total) {
        const dice1Faces = this.elements.dice1.querySelectorAll('.dice-face');
        const dice2Faces = this.elements.dice2.querySelectorAll('.dice-face');

        dice1Faces.forEach(face => {
            face.classList.remove('active');
            if (parseInt(face.dataset.value) === dice1) {
                face.classList.add('active');
            }
        });

        dice2Faces.forEach(face => {
            face.classList.remove('active');
            if (parseInt(face.dataset.value) === dice2) {
                face.classList.add('active');
            }
        });

        this.elements.dice1Value.textContent = dice1;
        this.elements.dice2Value.textContent = dice2;
        this.elements.diceTotal.textContent = total;
    },

    getSetupValues() {
        const playerNames = this.elements.playerNames.map(input => input.value || `玩家${parseInt(input.id.slice(-1)) + 1}`);
        const firstBankerId = document.querySelector('input[name="first-banker"]:checked').value;
        const initialScore = parseInt(this.elements.initialScore.value) || 100;

        return { playerNames, firstBankerId, initialScore };
    }
};

// ==================== 主应用模块 ====================
const App = {
    currentScorePreview: null,

    init() {
        UI.init();
        ScoreCalculator.init();
        UI.updateWinTypeSelect(ScoreCalculator.getAllWinTypes());

        // 绑定事件
        UI.elements.startGameBtn.addEventListener('click', () => this.handleStartGame());
        UI.elements.confirmScoreBtn.addEventListener('click', () => this.handleConfirmScore());
        UI.elements.rollDiceBtn.addEventListener('click', () => this.handleRollDice());
        UI.elements.restartBtn.addEventListener('click', () => UI.showConfirmModal());
        UI.elements.cancelRestartBtn.addEventListener('click', () => UI.hideConfirmModal());
        UI.elements.confirmRestartBtn.addEventListener('click', () => this.handleConfirmRestart());
        UI.elements.winnerSelect.addEventListener('change', () => this.handlePlayerSelect());
        UI.elements.winTypeSelect.addEventListener('change', () => this.handlePlayerSelect());

        // 检查存档
        if (Storage.hasSaveGame()) {
            const savedGame = Storage.loadGame();
            if (savedGame && confirm('检测到存档，是否继续游戏？')) {
                Game.loadState(savedGame);
                this.showGameScreen();
            } else {
                UI.showSetupScreen();
            }
        } else {
            UI.showSetupScreen();
        }
    },

    handleStartGame() {
        const { playerNames, firstBankerId, initialScore } = UI.getSetupValues();

        if (playerNames.some(name => !name.trim())) {
            alert('请填写所有玩家名称');
            return;
        }

        if (initialScore < 0) {
            alert('初始积分必须大于等于0');
            return;
        }

        Game.initNewGame(playerNames, initialScore, firstBankerId);
        this.saveGame();
        this.showGameScreen();
    },

    handlePlayerSelect() {
        const winnerId = UI.elements.winnerSelect.value;
        const winTypeId = UI.elements.winTypeSelect.value;

        if (!winnerId || !winTypeId) {
            UI.clearScorePreview();
            this.currentScorePreview = null;
            return;
        }

        const gameState = Game.getState();
        const banker = Game.getCurrentBanker();

        try {
            const result = ScoreCalculator.calculate(
                winnerId,
                winTypeId,
                banker.bankerLevel,
                gameState.players
            );
            UI.updateScorePreview(result.scoreChanges, gameState.players);
            this.currentScorePreview = {
                winnerId: parseInt(winnerId),
                winTypeId,
                ...result
            };
        } catch (error) {
            console.error('计算得分失败:', error);
        }
    },

    handleConfirmScore() {
        if (!this.currentScorePreview) {
            alert('请先选择胡牌玩家和胡牌类型');
            return;
        }

        const gameState = Game.getState();
        const banker = Game.getCurrentBanker();

        // 保存变化前的玩家分数
        const playersBefore = gameState.players.map(p => ({
            id: p.id,
            name: p.name,
            score: p.score
        }));

        // 更新玩家积分
        this.currentScorePreview.scoreChanges.forEach(change => {
            const player = Game.getPlayer(change.playerId);
            player.score = Math.round((player.score + change.change) * 100) / 100;
        });

        // 计算下一任庄家
        const nextBanker = Game.getNextBanker(this.currentScorePreview.winnerId);
        Game.updateBankerStatus(nextBanker);

        // 添加局数记录
        const winType = ScoreCalculator.winTypeMap.get(this.currentScorePreview.winTypeId);
        const round = Game.addRound({
            winnerId: this.currentScorePreview.winnerId,
            winTypeId: this.currentScorePreview.winTypeId,
            winTypeName: winType.name,
            bankerId: banker.id,
            baseScore: 1,
            multiplier: Math.pow(2, this.currentScorePreview.bankerFan),
            scoreChanges: this.currentScorePreview.scoreChanges,
            fan: this.currentScorePreview.fan,
            bankerFan: this.currentScorePreview.bankerFan,
            // 保存变化前后的玩家分数
            playersBefore,
            playersAfter: gameState.players.map(p => ({
                id: p.id,
                name: p.name,
                score: p.score
            }))
        });

        UI.updatePlayerCards(gameState.players);
        UI.addHistoryItem(round, gameState.players);

        UI.elements.winnerSelect.value = '';
        UI.elements.winTypeSelect.value = '';
        UI.clearScorePreview();
        this.currentScorePreview = null;

        this.saveGame();
    },

    async handleRollDice() {
        const result = await Dice.roll();
        if (result) {
            UI.updateDice(result.dice1, result.dice2, result.total);
        }
    },

    handleConfirmRestart() {
        Storage.clearGame();
        UI.clearHistory();
        UI.showSetupScreen();
        UI.hideConfirmModal();
    },

    showGameScreen() {
        const gameState = Game.getState();
        UI.updatePlayerCards(gameState.players);
        UI.updateWinnerSelect(gameState.players);
        gameState.rounds.forEach(round => {
            UI.addHistoryItem(round, gameState.players);
        });
        UI.showGameScreen();
    },

    saveGame() {
        Storage.saveGame(Game.getState());
    }
};

// ==================== 启动应用 ====================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
