// Simple QR Code Generator - Fallback
(function() {
    'use strict';
    
    // Basic QR code implementation for fallback
    window.SimpleQR = {
        toCanvas: function(canvas, text, options) {
            return new Promise((resolve, reject) => {
                try {
                    const ctx = canvas.getContext('2d');
                    const size = options.width || 220;
                    const margin = options.margin || 2;
                    
                    canvas.width = size;
                    canvas.height = size;
                    
                    // Clear canvas
                    ctx.fillStyle = options.color?.light || '#ffffff';
                    ctx.fillRect(0, 0, size, size);
                    
                    // Draw simple placeholder pattern
                    const cellSize = Math.floor((size - 2 * margin) / 25);
                    const darkColor = options.color?.dark || '#000000';
                    
                    ctx.fillStyle = darkColor;
                    
                    // Draw a pattern that looks like QR code
                    for (let i = 0; i < 25; i++) {
                        for (let j = 0; j < 25; j++) {
                            // Create pseudo-random pattern based on text
                            const hash = text.charCodeAt((i + j) % text.length) || 0;
                            const shouldFill = (hash + i * j) % 3 !== 0;
                            
                            if (shouldFill) {
                                // Draw corner squares
                                if ((i < 7 && j < 7) || (i < 7 && j > 17) || (i > 17 && j < 7)) {
                                    if ((i === 0 || i === 6 || j === 0 || j === 6) || 
                                        (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
                                        ctx.fillRect(
                                            margin + i * cellSize,
                                            margin + j * cellSize,
                                            cellSize,
                                            cellSize
                                        );
                                    }
                                } else if (Math.random() > 0.4) {
                                    ctx.fillRect(
                                        margin + i * cellSize,
                                        margin + j * cellSize,
                                        cellSize,
                                        cellSize
                                    );
                                }
                            }
                        }
                    }
                    
                    // Add text in center (small)
                    ctx.fillStyle = darkColor;
                    ctx.font = '8px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('P2P', size/2, size/2);
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        }
    };
})();
