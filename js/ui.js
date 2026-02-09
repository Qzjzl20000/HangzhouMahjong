// UI 渲染模块
export class UI {
    constructor() {
        this.elements = {
            setupScreen: document.getElementById('setup-screen'),
            gameScreen: document.getElementById('game-screen'),
            confirmModal: document.getElementById('confirm-modal'),

            // 设置界面元素
            playerNames: [
                document.getElementById('player0-name'),
                document.getElementById('player1-name'),
                document.getElementById('player2-name'),
                document.getElementById('player3-name')
            ],
            playerScores: [
                document.getElementById('player0-score'),
                document.getElementById('player1-score'),
                document.getElementById('player2-score'),
                document.getElementById('player3-score')
            ],
            bankerSelectBtns: document.querySelectorAll('.banker-select-btn'),
            consecutiveCount: document.getElementById('consecutive-count'),
            firstBankerRadios: document.querySelectorAll('input[name="first-banker"]'),
            initialScore: document.getElementById('initial-score'),
            startGameBtn: document.getElementById('start-game-btn'),

            // 游戏界面元素
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

            // 骰子元素
            dice1: document.getElementById('dice1'),
            dice2: document.getElementById('dice2'),
            diceTotal: document.getElementById('dice-total'),
            rollDiceBtn: document.getElementById('roll-dice-btn')
        };

        // 当前选中的庄家
        this.currentBankerId = 0;
    }

    // 显示设置界面
    showSetupScreen() {
        this.elements.setupScreen.classList.remove('hidden');
        this.elements.gameScreen.classList.add('hidden');
    }

    // 显示游戏界面
    showGameScreen() {
        this.elements.setupScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');
    }

    // 显示确认对话框
    showConfirmModal() {
        this.elements.confirmModal.classList.remove('hidden');
    }

    // 隐藏确认对话框
    hideConfirmModal() {
        this.elements.confirmModal.classList.add('hidden');
    }

    // 更新玩家卡片
    updatePlayerCards(players) {
        players.forEach(player => {
            const card = this.elements.playerCards[player.id];
            const bankerLevelNames = ['闲家', '一老庄', '二老庄', '三老庄'];

            card.querySelector('.player-name').textContent = player.name;
            card.querySelector('.player-score .score').textContent = player.score;
            card.querySelector('.player-role').textContent = player.role === 'banker' ? '🎲 庄家' : '闲家';
            card.querySelector('.player-consecutive span').textContent =
                player.role === 'banker' ? `${player.consecutiveWins}次` : '--';
            card.querySelector('.player-banker-level').textContent =
                player.role === 'banker' ? bankerLevelNames[player.bankerLevel] : '';

            // 更新庄家样式
            if (player.role === 'banker') {
                card.classList.add('banker');
            } else {
                card.classList.remove('banker');
            }
        });
    }

    // 更新胡牌玩家下拉选项
    updateWinnerSelect(players) {
        this.elements.winnerSelect.innerHTML = '<option value="">请选择</option>';
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            this.elements.winnerSelect.appendChild(option);
        });
    }

    // 更新胡牌类型下拉选项
    updateWinTypeSelect(winTypes) {
        // 先按类别分组
        const grouped = {};
        winTypes.forEach(type => {
            if (!grouped[type.category]) {
                grouped[type.category] = [];
            }
            grouped[type.category].push(type);
        });

        this.elements.winTypeSelect.innerHTML = '<option value="">请选择</option>';

        // 创建optgroup
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
    }

    // 更新积分预览
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
    }

    // 清除积分预览
    clearScorePreview() {
        this.elements.scorePreviewContent.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">请选择胡牌玩家和胡牌类型</p>';
    }

    // 添加历史记录
    addHistoryItem(round, players) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(round.timestamp);
        const dateStr = `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

        const winner = players.find(p => p.id === round.winnerId);
        const banker = players.find(p => p.id === round.bankerId);

        let scoresHtml = '';
        round.scoreChanges.forEach(change => {
            const player = players.find(p => p.id === change.playerId);
            scoresHtml += `<span class="history-item-score ${change.change >= 0 ? 'positive' : 'negative'}">${player.name}: ${change.change >= 0 ? '+' : ''}${change.change}</span>`;
        });

        item.innerHTML = `
            <div class="history-item-header">
                <span>第 ${round.roundId} 局 - ${dateStr}</span>
            </div>
            <div class="history-item-winner">胡家: ${winner.name} (${round.winTypeName})</div>
            <div class="history-item-scores">${scoresHtml}</div>
        `;

        this.elements.historyList.insertBefore(item, this.elements.historyList.firstChild);
    }

    // 清空历史记录
    clearHistory() {
        this.elements.historyList.innerHTML = '';
    }

    // 更新骰子显示
    updateDice(dice1, dice2, total) {
        // 更新骰子面
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

        this.elements.diceTotal.textContent = total;
    }

    // 获取设置界面的值
    getSetupValues() {
        const playerNames = this.elements.playerNames.map(input => input.value || `玩家${parseInt(input.id.slice(-1)) + 1}`);
        const playerScores = this.elements.playerScores.map(input => parseInt(input.value) || 100);
        const firstBankerId = this.currentBankerId;
        const consecutiveWins = parseInt(this.elements.consecutiveCount.value) || 0;
        const initialScore = parseInt(this.elements.initialScore.value) || 100;

        return { playerNames, playerScores, firstBankerId, consecutiveWins, initialScore };
    }

    // 设置设置界面的值
    setSetupValues(playerNames, firstBankerId, initialScore) {
        this.elements.playerNames.forEach((input, index) => {
            input.value = playerNames[index] || '';
        });

        // 设置庄家选择
        this.setBankerSelection(firstBankerId);

        this.elements.initialScore.value = initialScore;
    }

    // 设置庄家选择
    setBankerSelection(bankerId) {
        this.currentBankerId = parseInt(bankerId);
        this.elements.bankerSelectBtns.forEach(btn => {
            const playerId = parseInt(btn.dataset.player);
            if (playerId === this.currentBankerId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 绑定庄家选择事件
    bindBankerSelection(callback) {
        this.elements.bankerSelectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const playerId = parseInt(btn.dataset.player);
                this.setBankerSelection(playerId);
                if (callback) {
                    callback(playerId);
                }
            });
        });
    }

    // 绑定事件监听器
    bindEventListeners(handlers) {
        if (handlers.onStartGame) {
            this.elements.startGameBtn.addEventListener('click', handlers.onStartGame);
        }

        if (handlers.onConfirmScore) {
            this.elements.confirmScoreBtn.addEventListener('click', handlers.onConfirmScore);
        }

        if (handlers.onRollDice) {
            this.elements.rollDiceBtn.addEventListener('click', handlers.onRollDice);
        }

        if (handlers.onRestart) {
            this.elements.restartBtn.addEventListener('click', handlers.onRestart);
        }

        if (handlers.onCancelRestart) {
            this.elements.cancelRestartBtn.addEventListener('click', handlers.onCancelRestart);
        }

        if (handlers.onConfirmRestart) {
            this.elements.confirmRestartBtn.addEventListener('click', handlers.onConfirmRestart);
        }

        if (handlers.onWinnerChange) {
            this.elements.winnerSelect.addEventListener('change', handlers.onWinnerChange);
        }

        if (handlers.onWinTypeChange) {
            this.elements.winTypeSelect.addEventListener('change', handlers.onWinTypeChange);
        }
    }
}
