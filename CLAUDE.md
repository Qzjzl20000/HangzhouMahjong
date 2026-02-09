# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个纯前端杭州麻将计分器，采用 ES6 模块化设计，无需构建工具即可运行。所有数据通过 LocalStorage 本地持久化。

## 运行项目

```bash
# 使用 Python 启动本地服务器（推荐）
python -m http.server 8000

# 或使用 Node.js
npx http-server
```

然后访问 `http://localhost:8000`。也可以直接用浏览器打开 `index.html` 文件运行。

## 代码架构

项目采用经典的 MVC 模式，模块职责清晰分离：

### 核心模块

- **js/app.js** - 主应用控制器，协调各模块交互，处理主要业务流程
- **js/game.js** - 游戏状态管理，维护玩家、轮次、庄家等核心状态
- **js/score.js** - 计分算法核心，实现杭州麻将计分公式：`2^胡牌番数 × 2^庄家番数`
- **js/ui.js** - 界面渲染和交互，管理 DOM 操作和用户输入
- **js/storage.js** - 数据持久化，使用 LocalStorage 保存游戏状态
- **js/dice.js** - 骰子功能，独立的投掷骰子工具

### 数据流

```
用户操作 → UI → App → Game状态管理
                ↓
         ScoreCalculator计算得分
                ↓
         Storage保存数据
                ↓
         UI更新界面
```

### 配置驱动设计

所有胡牌类型、番数、计分规则都在 `config/rules.json` 中配置。修改规则无需改动代码，便于自定义。

**规则配置结构：**
- `winTypes.基础番型` - 基础胡牌类型（平胡、爆头、杠开、七对等）
- `winTypes.叠加番型` - 组合番型（杠爆、飘爆、杠飘等）
- `bankerLevels` - 庄家等级（闲家、一老庄、二老庄、三老庄）
- `scoring` - 计分参数（最大番数限制、计分公式）

## 关键业务逻辑

### 庄家系统

- 庄家胡牌：继续坐庄，连庄数+1，老庄状态提升（最多到三老庄）
- 闲家胡牌：下家坐庄，连庄数归零，老庄状态归零
- 庄家 ID 为 0-3，对应玩家索引，下家计算为 `(current + 1) % 4`

### 计分规则

- **胡牌番数**：最大 4 番，根据胡牌类型确定
- **庄家番数**：最大 3 番（三老庄），闲家为 0 番
- **计分公式**：`最终得分 = 2^胡牌番数 × 2^庄家番数`
- **盈亏分配**：
  - 胡牌玩家从每个闲家收取基础分
  - 庄家番数只影响闲家与庄家之间的盈亏（翻倍）
  - 闲家之间的盈亏不翻倍

### 状态持久化

游戏状态每次变更后自动保存到 LocalStorage，包含：
- 玩家信息（姓名、积分、角色、连庄数、老庄状态）
- 历史对局记录
- 当前庄家 ID

## 开发注意事项

### 模块依赖关系

App 是顶层控制器，其他模块相互独立：
- App 依赖所有模块
- Game/Score/UI/Storage/Dice 之间不相互依赖
- 修改单个模块不影响其他模块

### ES6 模块版本

项目提供两种运行方式：
1. **ES6 模块版本**（推荐开发时使用）：`js/*.js` 独立文件，便于调试
2. **bundle.js 合并版本**：所有模块合并到单个文件，便于部署

### 事件处理

UI 事件通过回调函数传递给 App 处理：
- `onStartGame` - 开始游戏
- `onConfirmScore` - 确认计分
- `onRollDice` - 投掷骰子
- `onRestart` - 重新开始
- `onWinnerChange/onWinTypeChange` - 选择变化触发预览计算

### 浏览器兼容性

- 使用 ES6 模块语法（import/export）
- 使用 async/await
- 要求现代浏览器（Chrome 60+、Firefox 60+、Safari 12+）

## 常见任务

### 修改计分规则

直接编辑 `config/rules.json`，无需修改代码：
- 添加/删除胡牌类型
- 调整番数
- 修改最大番数限制

### 添加新功能

1. 在对应模块添加方法
2. 在 App 中调用并协调
3. 在 UI 中添加界面元素和事件绑定

### 调试

- ES6 模块版本可直接在浏览器 DevTools 中调试
- 使用 console.log 输出调试信息
- LocalStorage 数据可在 Application 面板查看
