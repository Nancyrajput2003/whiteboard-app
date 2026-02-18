// ===== CANVAS SETUP =====
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ===== STATE =====
const state = {
    tool: 'draw',
    color: '#000000',
    brushSize: 3,
    eraserSize: 10,
    opacity: 1,
    brushStyle: 'smooth',
    isDrawing: false,
    history: [],
    historyStep: 0,
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    showGrid: localStorage.getItem('showGrid') === 'true',
    zoom: 1,
    colorHistory: JSON.parse(localStorage.getItem('colorHistory') || '[]'),
};

// ===== CANVAS INITIALIZATION =====
function resizeCanvas() {
    const width = parseInt(document.getElementById('canvasWidth').value);
    const height = parseInt(document.getElementById('canvasHeight').value);
    canvas.width = width;
    canvas.height = height;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    redrawFromHistory();
}

resizeCanvas();

// ===== DOM ELEMENTS =====
const drawBtn = document.getElementById('drawBtn');
const eraserBtn = document.getElementById('eraserBtn');
const rectBtn = document.getElementById('rectBtn');
const circleBtn = document.getElementById('circleBtn');
const lineBtn = document.getElementById('lineBtn');
const triangleBtn = document.getElementById('triangleBtn');
const textBtn = document.getElementById('textBtn');
const fillBtn = document.getElementById('fillBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const clearBtn = document.getElementById('clearBtn');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const eraserSize = document.getElementById('eraserSize');
const eraserSizeValue = document.getElementById('eraserSizeValue');
const opacity = document.getElementById('opacity');
const opacityValue = document.getElementById('opacityValue');
const brushStyle = document.getElementById('brushStyle');
const statusText = document.getElementById('statusText');
const darkModeBtn = document.getElementById('darkModeBtn');
const gridToggleBtn = document.getElementById('gridToggleBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const saveLocalBtn = document.getElementById('saveLocalBtn');
const loadLocalBtn = document.getElementById('loadLocalBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomLevel = document.getElementById('zoomLevel');
const textModal = document.getElementById('textModal');
const textInput = document.getElementById('textInput');
const textSize = document.getElementById('textSize');
const textConfirmBtn = document.getElementById('textConfirmBtn');
const textCancelBtn = document.getElementById('textCancelBtn');
const resizeCanvasBtn = document.getElementById('resizeCanvasBtn');

// ===== TOOL SELECTION =====
function selectTool(tool) {
    state.tool = tool;
    
    // Remove active class from all tool buttons
    document.querySelectorAll('.btn-tool').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected button
    const buttonMap = {
        'draw': drawBtn,
        'eraser': eraserBtn,
        'rect': rectBtn,
        'circle': circleBtn,
        'line': lineBtn,
        'triangle': triangleBtn,
        'text': textBtn,
        'fill': fillBtn
    };
    
    if (buttonMap[tool]) {
        buttonMap[tool].classList.add('active');
    }
    
    updateStatus(`Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`);
}

// ===== BUTTON LISTENERS =====
if (drawBtn) drawBtn.addEventListener('click', () => selectTool('draw'));
if (eraserBtn) eraserBtn.addEventListener('click', () => selectTool('eraser'));
if (rectBtn) rectBtn.addEventListener('click', () => selectTool('rect'));
if (circleBtn) circleBtn.addEventListener('click', () => selectTool('circle'));
if (lineBtn) lineBtn.addEventListener('click', () => selectTool('line'));
if (triangleBtn) triangleBtn.addEventListener('click', () => selectTool('triangle'));
if (textBtn) textBtn.addEventListener('click', () => selectTool('text'));
if (fillBtn) fillBtn.addEventListener('click', () => selectTool('fill'));

// ===== HISTORY MANAGEMENT =====
function saveToHistory() {
    state.history = state.history.slice(0, state.historyStep + 1);
    state.history.push(canvas.toDataURL());
    state.historyStep++;
    updateHistoryButtons();
}

function undo() {
    if (state.historyStep > 0) {
        state.historyStep--;
        loadFromHistory();
    }
}

function redo() {
    if (state.historyStep < state.history.length - 1) {
        state.historyStep++;
        loadFromHistory();
    }
}

function loadFromHistory() {
    if (state.history[state.historyStep]) {
        const img = new Image();
        img.src = state.history[state.historyStep];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            updateHistoryButtons();
        };
    }
}

function redrawFromHistory() {
    if (state.history.length > 0) {
        loadFromHistory();
    }
}

function updateHistoryButtons() {
    if (undoBtn) undoBtn.disabled = state.historyStep <= 0;
    if (redoBtn) redoBtn.disabled = state.historyStep >= state.history.length - 1;
}

if (undoBtn) undoBtn.addEventListener('click', undo);
if (redoBtn) redoBtn.addEventListener('click', redo);
if (clearBtn) clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
});

// ===== COLOR MANAGEMENT =====
function addColorToHistory(color) {
    if (!state.colorHistory.includes(color)) {
        state.colorHistory.unshift(color);
        if (state.colorHistory.length > 10) {
            state.colorHistory.pop();
        }
        localStorage.setItem('colorHistory', JSON.stringify(state.colorHistory));
    }
}

if (colorPicker) {
    colorPicker.addEventListener('change', (e) => {
        state.color = e.target.value;
        addColorToHistory(e.target.value);
    });
}

// ===== BRUSH SIZE =====
if (brushSize) {
    brushSize.addEventListener('input', (e) => {
        state.brushSize = parseInt(e.target.value);
        if (brushSizeValue) brushSizeValue.textContent = e.target.value;
    });
}

if (eraserSize) {
    eraserSize.addEventListener('input', (e) => {
        state.eraserSize = parseInt(e.target.value);
        if (eraserSizeValue) eraserSizeValue.textContent = e.target.value;
    });
}

if (opacity) {
    opacity.addEventListener('input', (e) => {
        state.opacity = parseFloat(e.target.value);
        if (opacityValue) opacityValue.textContent = Math.round(e.target.value * 100);
    });
}

if (brushStyle) {
    brushStyle.addEventListener('change', (e) => {
        state.brushStyle = e.target.value;
    });
}

// ===== DRAWING FUNCTIONS =====
let startX = 0;
let startY = 0;

function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.brushSize;
    ctx.globalAlpha = state.opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (state.brushStyle === 'rough') {
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x1 + Math.random() * 2, y1 + Math.random() * 2);
            ctx.lineTo(x2 + Math.random() * 2, y2 + Math.random() * 2);
            ctx.stroke();
        }
    } else {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
}

function drawRect(x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.brushSize;
    ctx.globalAlpha = state.opacity;
    ctx.strokeRect(x1, y1, width, height);
    ctx.globalAlpha = 1;
}

function drawCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.brushSize;
    ctx.globalAlpha = state.opacity;
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawTriangle(x1, y1, x2, y2) {
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.brushSize;
    ctx.globalAlpha = state.opacity;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1 - (x2 - x1), y2);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function eraseArea(x, y) {
    ctx.clearRect(x - state.eraserSize / 2, y - state.eraserSize / 2, state.eraserSize, state.eraserSize);
}

// ===== CANVAS EVENTS =====
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = (e.clientX - rect.left) / state.zoom;
    startY = (e.clientY - rect.top) / state.zoom;
    
    state.isDrawing = true;
    
    if (state.tool === 'text') {
        showTextModal(startX, startY);
        state.isDrawing = false;
        return;
    }
    
    if (state.tool === 'fill') {
        floodFill(startX, startY);
        saveToHistory();
        state.isDrawing = false;
        return;
    }
    
    if (state.tool === 'draw') {
        drawLine(startX, startY, startX, startY);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!state.isDrawing || state.tool === 'text' || state.tool === 'fill') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    
    if (state.tool === 'draw') {
        drawLine(startX, startY, x, y);
        startX = x;
        startY = y;
    } else if (state.tool === 'eraser') {
        eraseArea(x, y);
    } else {
        redrawFromHistory();
        switch (state.tool) {
            case 'rect':
                drawRect(startX, startY, x, y);
                break;
            case 'circle':
                drawCircle(startX, startY, x, y);
                break;
            case 'line':
                drawLine(startX, startY, x, y);
                break;
            case 'triangle':
                drawTriangle(startX, startY, x, y);
                break;
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (state.isDrawing) {
        state.isDrawing = false;
        saveToHistory();
    }
});

canvas.addEventListener('mouseleave', () => {
    state.isDrawing = false;
});

// ===== TEXT TOOL =====
function showTextModal(x, y) {
    const fontSize = textSize ? textSize.value : 20;
    if (textModal) textModal.style.display = 'flex';
    if (textInput) textInput.focus();
    
    function insertText() {
        const text = textInput ? textInput.value : '';
        if (text) {
            ctx.fillStyle = state.color;
            ctx.font = `${fontSize}px Arial`;
            ctx.globalAlpha = state.opacity;
            ctx.fillText(text, x, y);
            ctx.globalAlpha = 1;
            saveToHistory();
        }
        if (textModal) textModal.style.display = 'none';
        if (textInput) textInput.value = '';
    }
    
    if (textConfirmBtn) {
        textConfirmBtn.onclick = insertText;
    }
    
    if (textCancelBtn) {
        textCancelBtn.onclick = () => {
            if (textModal) textModal.style.display = 'none';
            if (textInput) textInput.value = '';
        };
    }
    
    if (textInput) {
        textInput.onkeypress = (e) => {
            if (e.key === 'Enter') insertText();
        };
    }
}

// ===== FLOOD FILL =====
function floodFill(x, y) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getPixelColor(data, Math.floor(x), Math.floor(y), canvas.width);
    const fillColor = hexToRgb(state.color);
    
    if (targetColor === fillColor) return;
    
    const queue = [[Math.floor(x), Math.floor(y)]];
    const visited = new Set();
    
    while (queue.length > 0) {
        const [px, py] = queue.shift();
        const key = `${px},${py}`;
        
        if (visited.has(key) || px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;
        
        visited.add(key);
        const color = getPixelColor(data, px, py, canvas.width);
        
        if (color !== targetColor) continue;
        
        setPixelColor(data, px, py, fillColor, canvas.width);
        
        queue.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(data, x, y, width) {
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2]];
}

function setPixelColor(data, x, y, color, width) {
    const index = (y * width + x) * 4;
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = 255;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

// ===== DARK MODE =====
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
        state.isDarkMode = !state.isDarkMode;
        document.body.classList.toggle('dark-mode', state.isDarkMode);
        localStorage.setItem('darkMode', state.isDarkMode);
    });
}

if (state.isDarkMode) {
    document.body.classList.add('dark-mode');
}

// ===== GRID =====
if (gridToggleBtn) {
    gridToggleBtn.addEventListener('click', () => {
        state.showGrid = !state.showGrid;
        localStorage.setItem('showGrid', state.showGrid);
        redrawFromHistory();
    });
}

// ===== ZOOM =====
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
        state.zoom = Math.min(state.zoom + 0.2, 3);
        if (zoomLevel) zoomLevel.textContent = Math.round(state.zoom * 100) + '%';
        canvas.style.transform = `scale(${state.zoom})`;
    });
}

if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
        state.zoom = Math.max(state.zoom - 0.2, 0.5);
        if (zoomLevel) zoomLevel.textContent = Math.round(state.zoom * 100) + '%';
        canvas.style.transform = `scale(${state.zoom})`;
    });
}

// ===== EXPORT =====
if (downloadPngBtn) {
    downloadPngBtn.addEventListener('click', () => {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'whiteboard_' + new Date().getTime() + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            updateStatus('PNG downloaded successfully');
        } catch (e) {
            updateStatus('Error downloading PNG: ' + e.message);
        }
    });
}

if (downloadSvgBtn) {
    downloadSvgBtn.addEventListener('click', () => {
        try {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', canvas.width);
            svg.setAttribute('height', canvas.height);
            svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            
            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('width', canvas.width);
            image.setAttribute('height', canvas.height);
            image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', canvas.toDataURL());
            
            svg.appendChild(image);
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'whiteboard_' + new Date().getTime() + '.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            updateStatus('SVG downloaded successfully');
        } catch (e) {
            updateStatus('Error downloading SVG: ' + e.message);
        }
    });
}

// ===== LOCAL STORAGE =====
if (saveLocalBtn) {
    saveLocalBtn.addEventListener('click', () => {
        localStorage.setItem('whiteboard', canvas.toDataURL());
        updateStatus('Drawing saved locally');
    });
}

if (loadLocalBtn) {
    loadLocalBtn.addEventListener('click', () => {
        const saved = localStorage.getItem('whiteboard');
        if (saved) {
            const img = new Image();
            img.src = saved;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                state.history = [saved];
                state.historyStep = 0;
                updateStatus('Drawing loaded');
            };
        } else {
            updateStatus('No saved drawing found');
        }
    });
}

// ===== CANVAS RESIZE =====
if (resizeCanvasBtn) {
    resizeCanvasBtn.addEventListener('click', () => {
        resizeCanvas();
        updateStatus('Canvas resized');
    });
}

// ===== STATUS UPDATE =====
function updateStatus(message) {
    if (statusText) {
        statusText.textContent = message;
    }
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
    } else if (e.key === 'd') {
        selectTool('draw');
    } else if (e.key === 'e') {
        selectTool('eraser');
    } else if (e.key === 'r') {
        selectTool('rect');
    } else if (e.key === 'c') {
        selectTool('circle');
    } else if (e.key === 'l') {
        selectTool('line');
    } else if (e.key === 't') {
        selectTool('triangle');
    }
});

// ===== INITIALIZATION =====
saveToHistory();
selectTool('draw');
updateStatus('Ready to draw');
updateHistoryButtons();
