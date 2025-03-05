<!DOCTYPE html>
<html>
<head>
    <title>智能象棋 - GitHub Pages版</title>
    <style>
        #chessboard {
            width: 560px;
            height: 620px;
            margin: 20px auto;
            border: 2px solid #333;
        }
        .cell {
            width: 60px;
            height: 60px;
            float: left;
            border: 1px solid #ddd;
            position: relative;
        }
        .black { background: #999; }
        .piece {
            width: 50px;
            height: 50px;
            margin: 5px;
            border-radius: 50%;
            position: absolute;
            cursor: pointer;
            font-size: 40px;
            text-align: center;
            line-height: 50px;
        }
        .red { color: #c00; }
        .black-piece { color: #000; }
    </style>
</head>
<body>
    <div id="chessboard"></div>
    <script>
        // 初始化棋盘
        const board = document.getElementById('chessboard');
        const pieces = [];
        let selectedPiece = null;

        // 棋盘初始化
        function initBoard() {
            const initialLayout = [
                ['车','马','象','士','将','士','象','马','车'],
                ['','','','','','','','',''],
                ['','炮','','','','','','炮',''],
                ['卒','','卒','','卒','','卒','','卒'],
                ['','','','','','','','',''],
                ['','','','','','','','',''],
                ['兵','','兵','','兵','','兵','','兵'],
                ['','炮','','','','','','炮',''],
                ['','','','','','','','',''],
                ['俥','馬','相','仕','帥','仕','相','馬','俥']
            ];

            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 9; col++) {
                    const cell = document.createElement('div');
                    cell.className = `cell ${(row + col) % 2 ? 'black' : ''}`;
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    
                    if (initialLayout[row][col]) {
                        const piece = createPiece(initialLayout[row][col], row < 5);
                        cell.appendChild(piece);
                        pieces.push({
                            element: piece,
                            row,
                            col,
                            type: initialLayout[row][col]
                        });
                    }
                    
                    cell.addEventListener('click', handleClick);
                    board.appendChild(cell);
                }
            }
        }

        // 创建棋子
        function createPiece(type, isBlack) {
            const piece = document.createElement('div');
            piece.className = `piece ${isBlack ? 'black-piece' : 'red'}`;
            piece.textContent = type;
            return piece;
        }

        // AI决策核心（简化版）
        function aiMove() {
            const possibleMoves = [];
            
            // 获取所有合法移动
            pieces.forEach(p => {
                if (p.element.classList.contains('black-piece')) {
                    getValidMoves(p).forEach(move => {
                        possibleMoves.push({ piece: p, ...move });
                    });
                }
            });

            // 简单随机选择（可扩展为Minimax算法）
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                movePiece(randomMove.piece, randomMove.row, randomMove.col);
            }
        }

        // 移动棋子
        function movePiece(piece, newRow, newCol) {
            const oldCell = document.querySelector(`[data-row="${piece.row}"][data-col="${piece.col}"]`);
            const newCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
            
            // 执行移动
            oldCell.removeChild(piece.element);
            newCell.appendChild(piece.element);
            
            // 更新数据
            piece.row = newRow;
            piece.col = newCol;
        }

        // 点击处理
        function handleClick(e) {
            const cell = e.currentTarget;
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (selectedPiece) {
                // 执行移动
                movePiece(selectedPiece, row, col);
                selectedPiece = null;
                setTimeout(aiMove, 500); // AI回应
            } else {
                // 选择棋子
                if (cell.children.length > 0 && 
                    !cell.children[0].classList.contains('black-piece')) {
                    selectedPiece = pieces.find(p => 
                        p.row === row && p.col === col);
                    highlightValidMoves(selectedPiece);
                }
            }
        }

        // 棋子移动规则（示例：兵/卒）
        function getValidMoves(piece) {
            const moves = [];
            // 此处添加完整的象棋规则逻辑
            // 示例：红方兵的移动规则
            if (piece.type === '兵') {
                if (piece.row > 0) moves.push({row: piece.row-1, col: piece.col});
                if (piece.row <= 4) {
                    if (piece.col > 0) moves.push({row: piece.row, col: piece.col-1});
                    if (piece.col < 8) moves.push({row: piece.row, col: piece.col+1});
                }
            }
            return moves;
        }

        initBoard();
    </script>
</body>
</html>
