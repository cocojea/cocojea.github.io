<!DOCTYPE html>
<html>
<head>
    <style>
        .container {max-width: 1000px; margin: 20px auto; font-family: Arial;}
        .input-group {margin: 10px 0; padding: 15px; background: #f5f7fa; border-radius: 5px;}
        table {width: 100%; border-collapse: collapse; margin-top: 10px;}
        td, th {padding: 8px; border: 1px solid #ddd;}
        .add-btn {background: #2196F3; color: white; padding: 5px 10px; border: none; cursor: pointer;}
        .calc-btn {background: #4CAF50; margin-top: 10px;}
        .total {color: #2196F3; font-weight: bold;}
    </style>
</head>
<body>
<div class="container">
    <!-- 人员基本信息 -->
    <div class="input-group">
        <input type="text" id="staffName" placeholder="输入姓名">
        <button class="add-btn" onclick="addProject()">+ 添加项目</button>
    </div>

    <!-- 项目输入区 -->
    <div id="projects"></div>

    <!-- 总分展示 -->
    <div class="input-group">
        <button class="calc-btn" onclick="calculateAll()">计算总分</button>
        <span>最终绩效得分：<span id="finalScore" class="total">0</span></span>
    </div>
</div>

<script>
let dataStructure = []; // 存储数据结构：[{project:"", 权重:0, 板块:[{板块名:"",评分:0,权重:0}]}]

// 添加新项目
function addProject() {
    const projectId = Date.now();
    dataStructure.push({id:projectId, 权重:0, 板块:[]});

    const projectHTML = `
    <div class="input-group" data-id="${projectId}">
        <table>
            <tr>
                <td colspan="4">
                    <input type="text" placeholder="项目名称">
                    <input type="number" class="project-weight" placeholder="项目权重%" min="0" max="100">
                    <button class="add-btn" onclick="addSection(${projectId})">+ 添加板块</button>
                    <button class="add-btn" style="background:#ff5722" onclick="removeProject(${projectId})">- 删除项目</button>
                </td>
            </tr>
            <tbody id="sections-${projectId}"></tbody>
            <tr><td colspan="4">项目得分：<span class="project-score">0</span></td></tr>
        </table>
    </div>`;
    document.getElementById('projects').insertAdjacentHTML('beforeend', projectHTML);
}

// 添加板块
function addSection(projectId) {
    const sectionId = Date.now();
    const project = dataStructure.find(p => p.id === projectId);
    project.板块.push({id:sectionId, 评分:0, 权重:0});

    const sectionHTML = `
    <tr data-id="${sectionId}">
        <td><input type="text" placeholder="板块名称"></td>
        <td><input type="number" class="section-score" placeholder="绩效评分(1-5)" min="1" max="5"></td>
        <td><input type="number" class="section-weight" placeholder="板块权重%" min="0" max="100"></td>
        <td><button class="add-btn" style="background:#ff5722" onclick="removeSection(${projectId},${sectionId})">-</button></td>
    </tr>`;
    document.querySelector(`#sections-${projectId}`).insertAdjacentHTML('beforeend', sectionHTML);
}

// 计算逻辑（核心算法）
function calculateAll() {
    let finalScore = 0;

    dataStructure.forEach(project => {
        const projectElem = document.querySelector(`[data-id="${project.id}"]`);
        const projectWeight = parseFloat(projectElem.querySelector('.project-weight').value) || 0;

        let projectScore = 0;
        const sections = projectElem.querySelectorAll('tr[data-id]');
        sections.forEach(section => {
            const score = parseFloat(section.querySelector('.section-score').value) || 0;
            const weight = parseFloat(section.querySelector('.section-weight').value) || 0;
            projectScore += score * (weight/100);
        });

        projectElem.querySelector('.project-score').textContent = projectScore.toFixed(2);
        finalScore += projectScore * (projectWeight/100);
    });

    document.getElementById('finalScore').textContent = finalScore.toFixed(2);
}

// 删除功能
function removeProject(id) {
    dataStructure = dataStructure.filter(p => p.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
}
function removeSection(projectId, sectionId) {
    const project = dataStructure.find(p => p.id === projectId);
