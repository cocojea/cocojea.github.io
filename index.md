<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>项目人员评分系统</title>
    <style>
        body {
            font-family: '微软雅黑', sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: #f0f3f9;
        }
        .input-group {
            margin-bottom: 15px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input, select {
            padding: 8px;
            margin: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            width: 200px;
        }
        button {
            background: #2196F3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            transition: opacity 0.3s;
        }
        button:hover {
            opacity: 0.8;
        }
        #history {
            margin-top: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
        }
        .record {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="input-group">
        <h2>评分计算器</h2>
        <input type="text" id="name" placeholder="输入姓名">
        <input type="number" id="projectNum" placeholder="负责项目数量" min="0">
        <input type="number" id="projectWeight" placeholder="项目比重(%)" min="0" max="100">
        <button onclick="calculateScore()">计算评分</button>
        <button onclick="clearAll()" style="background:#f44336">清除记录</button>
        <p>当前评分：<span id="scoreResult">0</span> 分</p>
    </div>

    <div id="history">
        <h3>历史记录（自动保存）</h3>
        <div id="records"></div>
    </div>

    <script>
        // 初始化本地存储[8](@ref)
        let records = JSON.parse(localStorage.getItem('scoreRecords')) || [];

        // 计算评分（核心算法）[6,9](@ref)
        function calculateScore() {
            const name = document.getElementById('name').value;
            const projectNum = parseInt(document.getElementById('projectNum').value) || 0;
            const weight = parseInt(document.getElementById('projectWeight').value) || 0;

            // 验证权重总和（扩展时可添加多项目验证）
            if(weight < 0 || weight > 100) {
                alert("比重需在0-100%之间");
                return;
            }

            // 评分算法：项目数×比重×难度系数[6,10](@ref)
            const baseScore = projectNum * (weight/100);
            const difficultyFactor = Math.log(projectNum + 1); // 对数难度系数
            const finalScore = Math.round(baseScore * difficultyFactor * 10);

            // 显示结果
            document.getElementById('scoreResult').textContent = finalScore;

            // 存储记录
            const newRecord = {
                name,
                projectNum,
                weight,
                score: finalScore,
                timestamp: new Date().toLocaleString()
            };
            records.push(newRecord);
            localStorage.setItem('scoreRecords', JSON.stringify(records));

            renderHistory();
        }
