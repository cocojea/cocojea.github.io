// 获取所有按钮元素
const buttons = document.querySelectorAll('button');
// 获取显示区域元素
const display = document.getElementById('display');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent;
        if (/\d/.test(buttonText)) {
            // 数字按钮，追加到显示区域
            display.value += buttonText;
        } else if (['+', '-', '×', '÷', '%', '.'].includes(buttonText)) {
            // 运算符按钮，追加运算符到显示区域
            display.value += buttonText;
        } else if (buttonText === 'AC') {
            // 全清按钮，清空显示区域
            display.value = '';
        } else if (buttonText === 'CE') {
            // 清除最后一位按钮，删除显示区域最后一个字符
            display.value = display.value.slice(0, -1);
        } else if (buttonText === '=') {
            // 等号按钮，计算并显示结果
            try {
                display.value = eval(display.value);
            } catch (error) {
                display.value = 'Error';
            }
        } else if (buttonText === '±') {
            // 正负号切换按钮
            if (display.value[0] === '-') {
                display.value = display.value.slice(1);
            } else {
                display.value = '-' + display.value;
            }
        } else if (buttonText === '√') {
            // 平方根计算
            display.value = Math.sqrt(parseFloat(display.value)).toString();
        } else if (buttonText === '^') {
            // 指数计算，先获取底数和指数
            const [base, exponent] = display.value.split('^');
            display.value = Math.pow(parseFloat(base), parseFloat(exponent)).toString();
        } else if (['sin', 'cos', 'tan', 'ln', 'log'].includes(buttonText)) {
            // 三角函数和对数函数计算
            const num = parseFloat(display.value);
            if (buttonText === 'sin') {
                display.value = Math.sin(num).toString();
            } else if (buttonText === 'cos') {
                display.value = Math.cos(num).toString();
            } else if (buttonText === 'tan') {
                display.value = Math.tan(num).toString();
            } else if (buttonText === 'ln') {
                display.value = Math.log(num).toString();
            } else if (buttonText === 'log') {
                display.value = Math.log10(num).toString();
            }
        }
    });
});
