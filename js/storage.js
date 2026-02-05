// 数据持久化模块
export const Storage = {
    STORAGE_KEY: 'hangzhou_mahjong_game',

    // 保存游戏状态
    saveGame(gameState) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gameState));
            return true;
        } catch (error) {
            console.error('保存游戏失败:', error);
            return false;
        }
    },

    // 加载游戏状态
    loadGame() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('加载游戏失败:', error);
            return null;
        }
    },

    // 删除游戏状态
    clearGame() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('清除游戏失败:', error);
            return false;
        }
    },

    // 检查是否有存档
    hasSaveGame() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    },

    // 导出游戏数据为 JSON 文件
    exportGame(gameState) {
        const dataStr = JSON.stringify(gameState, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mahjong-game-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 导入游戏数据
    importGame(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const gameState = JSON.parse(e.target.result);
                    resolve(gameState);
                } catch (error) {
                    reject(new Error('文件格式错误'));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }
};
