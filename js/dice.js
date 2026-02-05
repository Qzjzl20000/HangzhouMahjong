// 骰子功能模块
export class Dice {
    constructor() {
        this.dice1 = 1;
        this.dice2 = 1;
        this.isRolling = false;
    }

    // 投掷骰子
    roll() {
        if (this.isRolling) return;

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
    }

    // 获取骰子Unicode字符
    getDiceFace(value) {
        const faces = {
            1: '⚀',
            2: '⚁',
            3: '⚂',
            4: '⚃',
            5: '⚄',
            6: '⚅'
        };
        return faces[value] || '⚀';
    }

    // 获取当前点数
    getValues() {
        return {
            dice1: this.dice1,
            dice2: this.dice2,
            total: this.dice1 + this.dice2
        };
    }
}
