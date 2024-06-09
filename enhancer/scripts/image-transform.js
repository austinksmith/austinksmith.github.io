document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('renderCanvas');
    const ctx = canvas.getContext('2d');
    let img = new Image();
    let originalImageData;

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
    
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Save original image data
            };
            img.src = event.target.result;
        };
    
        reader.readAsDataURL(file);
    });

    function showSpinner(show) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (show) {
            loadingSpinner.classList.remove('d-none');
            loadingOverlay.style.display = 'block';
        } else {
            loadingSpinner.classList.add('d-none');
            loadingOverlay.style.display = 'none';
        }
    }    

    function resetImage() {
        if (originalImageData) {
            canvas.width = originalImageData.width;
            canvas.height = originalImageData.height;
            ctx.putImageData(originalImageData, 0, 0);
        }
    }    
    
    function processImage(processFunc) {
        return () => {
            showSpinner(true);
            setTimeout(() => {
                processFunc();
                showSpinner(false);
            }, 100);
        };
    }

    function applyGrayscale() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function applySepia() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = r * 0.393 + g * 0.769 + b * 0.189;
            data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
            data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function applyInvert() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function applyBrightness() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const brightness = 50; // Brightness level from -255 to 255

        for (let i = 0; i < data.length; i += 4) {
            data[i] += brightness;
            data[i + 1] += brightness;
            data[i + 2] += brightness;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function applyBlur() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const kernelSize = 5;
        const weights = Array.from({ length: kernelSize }, () => Array(kernelSize).fill(1 / (kernelSize ** 2)));

        // Apply convolution
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let red = 0, green = 0, blue = 0;
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const pixelX = x + kx - Math.floor(kernelSize / 2);
                        const pixelY = y + ky - Math.floor(kernelSize / 2);
                        if (pixelX >= 0 && pixelX < canvas.width && pixelY >= 0 && pixelY < canvas.height) {
                            const idx = (pixelY * canvas.width + pixelX) * 4;
                            red += data[idx] * weights[ky][kx];
                            green += data[idx + 1] * weights[ky][kx];
                            blue += data[idx + 2] * weights[ky][kx];
                        }
                    }
                }
                const idx = (y * canvas.width + x) * 4;
                data[idx] = Math.round(red);
                data[idx + 1] = Math.round(green);
                data[idx + 2] = Math.round(blue);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function applyEdgeDetection() {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
    
        // Create a new array to store the edge-detected data
        const edgeData = new Uint8ClampedArray(data.length);
    
        // Sobel kernels for edge detection
        const kernelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
    
        const kernelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
    
        // Convolution function
        function convolution(x, y, kernel) {
            let sum = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const pixelX = x + i;
                    const pixelY = y + j;
                    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                        const index = (pixelY * width + pixelX) * 4;
                        const gray = 0.3 * data[index] + 0.59 * data[index + 1] + 0.11 * data[index + 2];
                        sum += gray * kernel[i + 1][j + 1];
                    }
                }
            }
            return sum;
        }
    
        // Apply Sobel operator to each pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const gradientX = convolution(x, y, kernelX);
                const gradientY = convolution(x, y, kernelY);
                const magnitude = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
                edgeData[index] = edgeData[index + 1] = edgeData[index + 2] = magnitude;
                edgeData[index + 3] = 255; // Set alpha to fully opaque
            }
        }
    
        // Put the edge-detected data back on the canvas
        ctx.putImageData(new ImageData(edgeData, width, height), 0, 0);
    }
    

    function applyAutoEnhance() {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        // Adjust brightness, contrast, and saturation
        const brightness = 20; // Increase brightness by 20
        const contrast = 1.2;  // Increase contrast by 20%
        const saturation = 1.2; // Increase saturation by 20%
    
        for (let i = 0; i < data.length; i += 4) {
            // Adjust brightness
            data[i] += brightness;     // Red
            data[i + 1] += brightness; // Green
            data[i + 2] += brightness; // Blue
    
            // Adjust contrast
            data[i] = ((data[i] - 128) * contrast) + 128;
            data[i + 1] = ((data[i + 1] - 128) * contrast) + 128;
            data[i + 2] = ((data[i + 2] - 128) * contrast) + 128;
    
            // Adjust saturation
            const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            data[i] = gray + (data[i] - gray) * saturation;
            data[i + 1] = gray + (data[i + 1] - gray) * saturation;
            data[i + 2] = gray + (data[i + 2] - gray) * saturation;
        }
    
        // Put the adjusted image data back on the canvas
        ctx.putImageData(imageData, 0, 0);
    }
    
    function upscaleTo4K() {
        const targetWidth = 3840;
        const targetHeight = 2160;
    
        // Determine the aspect ratio of the original image
        const aspectRatio = canvas.width / canvas.height;
    
        // Calculate dimensions to fit the image within the 4K canvas while maintaining aspect ratio
        let newWidth = targetWidth;
        let newHeight = targetWidth / aspectRatio;
    
        // If the calculated height exceeds the target height, recalculate based on height
        if (newHeight > targetHeight) {
            newHeight = targetHeight;
            newWidth = targetHeight * aspectRatio;
        }
    
        // Create a new off-screen canvas with 4K resolution
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = targetWidth;
        offscreenCanvas.height = targetHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d');
    
        // Draw the image on the off-screen canvas centered
        const offsetX = (targetWidth - newWidth) / 2;
        const offsetY = (targetHeight - newHeight) / 2;
        offscreenCtx.drawImage(canvas, offsetX, offsetY, newWidth, newHeight);
    
        // Clear main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Update main canvas size to 4K resolution
        canvas.width = targetWidth;
        canvas.height = targetHeight;
    
        // Draw the upscaled image onto the main canvas
        ctx.drawImage(offscreenCanvas, 0, 0);
    }    

    function applySharpen() {
        const kernel = [
            [0, -0.5, 0],
            [-0.5, 3, -0.5],
            [0, -0.5, 0]
        ];
    
        applyConvolutionFilter(kernel);
    }
    
    function applySaturate(amount) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        const factor = (259 * (amount + 255)) / (255 * (259 - amount));
    
        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp(factor * (data[i] - 128) + 128, 0, 255);     // Red
            data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128, 0, 255); // Green
            data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128, 0, 255); // Blue
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyNoiseReduction() {
        const kernelSize = 3;
        const weights = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ];
    
        applyConvolutionFilter(weights);
    }
    
    function applyHueRotate(degrees) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const angle = degrees * Math.PI / 180;
    
        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    
            // Convert RGB to HSL
            const hsl = rgbToHsl(r, g, b);
    
            // Rotate Hue
            hsl[0] += angle;
            hsl[0] = (hsl[0] + 1) % 1; // Wrap around if needed
    
            // Convert back to RGB
            const [newR, newG, newB] = hslToRgb(hsl[0], hsl[1], hsl[2]);
    
            // Update pixel values
            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyContrast() {
        const factor = 1.2; // Adjust this factor as needed
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const avgGray = calculateAverageGray(data);
    
        for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp((data[i] - avgGray) * factor + avgGray, 0, 255); // Red
            data[i + 1] = clamp((data[i + 1] - avgGray) * factor + avgGray, 0, 255); // Green
            data[i + 2] = clamp((data[i + 2] - avgGray) * factor + avgGray, 0, 255); // Blue
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function calculateAverageGray(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            sum += gray;
        }
        return sum / (data.length / 4);
    }
    
    function applyThreshold(threshold) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const value = avg > threshold ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = value;
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyConvolutionFilter(kernel) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const kernelSize = kernel.length;
        const halfKernelSize = Math.floor(kernelSize / 2);
        let sum = 0;
    
        // Calculate the sum of all kernel values
        for (let i = 0; i < kernelSize; i++) {
            for (let j = 0; j < kernelSize; j++) {
                sum += kernel[i][j];
            }
        }
    
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let red = 0, green = 0, blue = 0;
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const pixelX = x + kx - halfKernelSize;
                        const pixelY = y + ky - halfKernelSize;
                        if (pixelX >= 0 && pixelX < canvas.width && pixelY >= 0 && pixelY < canvas.height) {
                            const idx = (pixelY * canvas.width + pixelX) * 4;
                            const weight = kernel[ky][kx] / sum; // Normalize the kernel weight
                            red += data[idx] * weight;
                            green += data[idx + 1] * weight;
                            blue += data[idx + 2] * weight;
                        }
                    }
                }
                const idx = (y * canvas.width + x) * 4;
                data[idx] = clamp(red, 0, 255);
                data[idx + 1] = clamp(green, 0, 255);
                data[idx + 2] = clamp(blue, 0, 255);
            }
        }
    
        ctx.putImageData(imageData, 0, 0);
    }    
    
    // Helper function to convert RGB to HSL
    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
    
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
    
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
    
        return [h, s, l];
    }
    
    // Helper function to convert HSL to RGB
    function hslToRgb(h, s, l) {
        let r, g, b;
    
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
    
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
    
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    // Save image function
    function saveImage() {
        const link = document.createElement('a');
        
        // Create a temporary canvas for saving
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Set the temporary canvas size to the current canvas size
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        // Draw the current canvas content onto the temporary canvas
        tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);

        link.download = (canvas.width >= 3840 && canvas.height >= 2160) ? 'transformed_image_4k.png' : 'transformed_image.png';
        link.href = tempCanvas.toDataURL('image/png');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Clamp function to limit values between min and max
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function applyVignette() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const vignette = 1 - distance / maxDistance;
                data[index] *= vignette;
                data[index + 1] *= vignette;
                data[index + 2] *= vignette;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyPosterize() {
        const levels = 10; // Number of color levels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const factor = 255 / (levels - 1);
    
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.round(data[i] / factor) * factor;
            data[i + 1] = Math.round(data[i + 1] / factor) * factor;
            data[i + 2] = Math.round(data[i + 2] / factor) * factor;
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyOilPaint() {
        const radius = 3; // Pixel radius for oil paint effect
        const intensityLevels = 20; // Intensity levels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
    
        // Create a new ImageData object to store the oil paint effect
        const outputData = new Uint8ClampedArray(data);
    
        // Helper function to get pixel color
        function getPixel(x, y) {
            const index = (y * width + x) * 4;
            return {
                r: data[index],
                g: data[index + 1],
                b: data[index + 2],
                a: data[index + 3]
            };
        }
    
        // Oil paint effect
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const intensityBins = new Array(intensityLevels).fill(0).map(() => ({
                    r: 0,
                    g: 0,
                    b: 0,
                    count: 0
                }));
    
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
    
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const pixel = getPixel(nx, ny);
                            const intensity = Math.floor((pixel.r + pixel.g + pixel.b) / 3 * intensityLevels / 256);
                            intensityBins[intensity].r += pixel.r;
                            intensityBins[intensity].g += pixel.g;
                            intensityBins[intensity].b += pixel.b;
                            intensityBins[intensity].count++;
                        }
                    }
                }
    
                let maxBin = intensityBins[0];
                for (let i = 1; i < intensityLevels; i++) {
                    if (intensityBins[i].count > maxBin.count) {
                        maxBin = intensityBins[i];
                    }
                }
    
                const index = (y * width + x) * 4;
                outputData[index] = maxBin.r / maxBin.count;
                outputData[index + 1] = maxBin.g / maxBin.count;
                outputData[index + 2] = maxBin.b / maxBin.count;
            }
        }
    
        ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
    }
    
    // Helper function for Oil Paint effect
    function getOilPaintPixel(x, y, radius, imageData) {
        const data = imageData.data;
        const intensityCounts = {};
        let maxIntensity = 0;
        let dominantColor;
    
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = clamp(x + dx, 0, canvas.width - 1);
                const ny = clamp(y + dy, 0, canvas.height - 1);
                const index = (ny * canvas.width + nx) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const intensity = (r + g + b) / 3;
                
                if (!intensityCounts[intensity]) {
                    intensityCounts[intensity] = 0;
                }
                intensityCounts[intensity]++;
                
                if (intensityCounts[intensity] > maxIntensity) {
                    maxIntensity = intensityCounts[intensity];
                    dominantColor = { r, g, b };
                }
            }
        }
    
        return dominantColor;
    }
    
    function applySaturation() {
        const saturation = 1.5; // Saturation adjustment factor (1.0 is no change)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            data[i] = gray + (data[i] - gray) * saturation;
            data[i + 1] = gray + (data[i + 1] - gray) * saturation;
            data[i + 2] = gray + (data[i + 2] - gray) * saturation;
        }
    
        ctx.putImageData(imageData, 0, 0);
    }

    function applyHueRotation() {
        const angle = 45; // Rotation angle in degrees
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const cosA = Math.cos(angle * Math.PI / 180);
        const sinA = Math.sin(angle * Math.PI / 180);
    
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
    
            data[i] = cosA * r + (1 - cosA) / 3 + sinA * ((b - g) / 3);
            data[i + 1] = cosA * g + (1 - cosA) / 3 + sinA * ((r - b) / 3);
            data[i + 2] = cosA * b + (1 - cosA) / 3 + sinA * ((g - r) / 3);
        }
    
        ctx.putImageData(imageData, 0, 0);
    }

    function applyGammaCorrection() {
        const gamma = 2.2; // Gamma correction factor
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const invGamma = 1.0 / gamma;
    
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 * Math.pow(data[i] / 255, invGamma);
            data[i + 1] = 255 * Math.pow(data[i + 1] / 255, invGamma);
            data[i + 2] = 255 * Math.pow(data[i + 2] / 255, invGamma);
        }
    
        ctx.putImageData(imageData, 0, 0);
    }

    function applyPixelate() {
        const pixelSize = 10; // Size of each pixel block
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
    
        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                const red = data[((width * y) + x) * 4];
                const green = data[((width * y) + x) * 4 + 1];
                const blue = data[((width * y) + x) * 4 + 2];
    
                for (let n = 0; n < pixelSize; n++) {
                    for (let m = 0; m < pixelSize; m++) {
                        const pixelIndex = ((width * (y + n)) + (x + m)) * 4;
                        if (x + m < width && y + n < height) {
                            data[pixelIndex] = red;
                            data[pixelIndex + 1] = green;
                            data[pixelIndex + 2] = blue;
                        }
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }    

    function applyGaussianBlur() {
        const sigma = 1.0; // Standard deviation for Gaussian blur
        const kernelSize = 5;
        const kernel = [];
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
    
        // Generate Gaussian kernel
        const halfSize = Math.floor(kernelSize / 2);
        let sum = 0;
        for (let y = -halfSize; y <= halfSize; y++) {
            for (let x = -halfSize; x <= halfSize; x++) {
                const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                kernel.push(value);
                sum += value;
            }
        }
    
        // Normalize the kernel
        for (let i = 0; i < kernel.length; i++) {
            kernel[i] /= sum;
        }
    
        // Apply Gaussian blur
        const outputData = new Uint8ClampedArray(data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let ky = -halfSize; ky <= halfSize; ky++) {
                    for (let kx = -halfSize; kx <= halfSize; kx++) {
                        const nx = Math.min(width - 1, Math.max(0, x + kx));
                        const ny = Math.min(height - 1, Math.max(0, y + ky));
                        const weight = kernel[(ky + halfSize) * kernelSize + (kx + halfSize)];
                        const index = (ny * width + nx) * 4;
                        r += data[index] * weight;
                        g += data[index + 1] * weight;
                        b += data[index + 2] * weight;
                    }
                }
                const index = (y * width + x) * 4;
                outputData[index] = r;
                outputData[index + 1] = g;
                outputData[index + 2] = b;
            }
        }
    
        // Put the blurred image data back to the canvas
        ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
    }

    function applySolarize() {
        const threshold = 128; // Adjust this threshold as needed
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Ensure threshold is within valid range
        const clampedThreshold = Math.min(255, Math.max(0, threshold));

        for (let i = 0; i < data.length; i += 4) {
            // Apply solarization to each color channel separately
            data[i] = data[i] > clampedThreshold ? 255 - data[i] : data[i]; // Red
            data[i + 1] = data[i + 1] > clampedThreshold ? 255 - data[i + 1] : data[i + 1]; // Green
            data[i + 2] = data[i + 2] > clampedThreshold ? 255 - data[i + 2] : data[i + 2]; // Blue
        }

        ctx.putImageData(imageData, 0, 0);
    }

    

    function applyEmboss() {
        const kernel = [
            [-2, -1, 0],
            [-1, 1, 1],
            [0, 1, 2]
        ];
    
        applyConvolutionFilter(kernel);
    }

    // Thresholding filter
    function applyThresholding() {
        const threshold = 128; // Adjust this threshold as needed
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const average = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const newValue = average > threshold ? 255 : 0;
            data[i] = newValue;
            data[i + 1] = newValue;
            data[i + 2] = newValue;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Colorize filter
    function applyColorize() {
        const color = { r: 255, g: 0, b: 0 }; // Adjust the color values as needed
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] += color.r;
            data[i + 1] += color.g;
            data[i + 2] += color.b;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function applyThresholdBlur() {
        const threshold = 128; // Adjust this threshold as needed
        const sigma = 1.0; // Standard deviation for Gaussian blur
        const kernelSize = 5;
        const kernel = [];
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
    
        // Generate Gaussian kernel
        const halfSize = Math.floor(kernelSize / 2);
        let sum = 0;
        for (let y = -halfSize; y <= halfSize; y++) {
            for (let x = -halfSize; x <= halfSize; x++) {
                const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                kernel.push(value);
                sum += value;
            }
        }
    
        // Normalize the kernel
        for (let i = 0; i < kernel.length; i++) {
            kernel[i] /= sum;
        }
    
        // Apply Gaussian blur and thresholding
        const outputData = new Uint8ClampedArray(data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let ky = -halfSize; ky <= halfSize; ky++) {
                    for (let kx = -halfSize; kx <= halfSize; kx++) {
                        const nx = Math.min(width - 1, Math.max(0, x + kx));
                        const ny = Math.min(height - 1, Math.max(0, y + ky));
                        const weight = kernel[(ky + halfSize) * kernelSize + (kx + halfSize)];
                        const index = (ny * width + nx) * 4;
                        r += data[index] * weight;
                        g += data[index + 1] * weight;
                        b += data[index + 2] * weight;
                    }
                }
                const index = (y * width + x) * 4;
                outputData[index] = r;
                outputData[index + 1] = g;
                outputData[index + 2] = b;
    
                // Apply thresholding
                const average = (r + g + b) / 3;
                if (average > threshold) {
                    data[index] = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                }
            }
        }
    
        ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
    }    
    

    // Edge Enhance filter
    function applyEdgeEnhance() {
        const kernel = [
            [-1, -1, -1],
            [-1, 4, -1],
            [-1, -1, -1]
        ];

        applyConvolutionFilter(kernel);
    }

    // Emphasize Channel filter
    function applyEmphasizeChannel(channel) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const channelIndex = { red: 0, green: 1, blue: 2 };

        for (let i = 0; i < data.length; i += 4) {
            const value = data[i + channelIndex[channel]];
            // Set the selected channel to its original value, others to 0
            data[i] = channel === 'red' ? value : 0;
            data[i + 1] = channel === 'green' ? value : 0;
            data[i + 2] = channel === 'blue' ? value : 0;
        }

        ctx.putImageData(imageData, 0, 0);
    }


    // Smooth filter
    function applySmooth() {
        const kernel = [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ];

        applyConvolutionFilter(kernel);
    }

    // Additional filter functions
    // Noise Reduction
    function applyNoiseReduction() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const kernelSize = 3; // Kernel size for noise reduction
        const halfKernelSize = Math.floor(kernelSize / 2);
        const threshold = 30; // Adjust this threshold as needed

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let sumR = 0, sumG = 0, sumB = 0, count = 0;

                for (let ky = -halfKernelSize; ky <= halfKernelSize; ky++) {
                    for (let kx = -halfKernelSize; kx <= halfKernelSize; kx++) {
                        const pixelX = x + kx;
                        const pixelY = y + ky;

                        if (pixelX >= 0 && pixelX < canvas.width && pixelY >= 0 && pixelY < canvas.height) {
                            const idx = (pixelY * canvas.width + pixelX) * 4;
                            sumR += data[idx];
                            sumG += data[idx + 1];
                            sumB += data[idx + 2];
                            count++;
                        }
                    }
                }

                const avgR = sumR / count;
                const avgG = sumG / count;
                const avgB = sumB / count;

                const idx = (y * canvas.width + x) * 4;
                const diffR = Math.abs(data[idx] - avgR);
                const diffG = Math.abs(data[idx + 1] - avgG);
                const diffB = Math.abs(data[idx + 2] - avgB);

                // Apply noise reduction if pixel color difference is below threshold
                if (diffR < threshold && diffG < threshold && diffB < threshold) {
                    data[idx] = avgR;
                    data[idx + 1] = avgG;
                    data[idx + 2] = avgB;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Histogram Equalization
    function applyHistogramEqualization() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const pixelCount = canvas.width * canvas.height;
        const intensityLevels = 256; // Assuming 8-bit grayscale image

        // Calculate histogram
        const histogram = new Array(intensityLevels).fill(0);
        for (let i = 0; i < data.length; i += 4) {
            const intensity = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
            histogram[intensity]++;
        }

        // Calculate cumulative histogram
        const cumulativeHistogram = new Array(intensityLevels).fill(0);
        cumulativeHistogram[0] = histogram[0];
        for (let i = 1; i < intensityLevels; i++) {
            cumulativeHistogram[i] = cumulativeHistogram[i - 1] + histogram[i];
        }

        // Normalize cumulative histogram
        const normalizedHistogram = cumulativeHistogram.map(value => Math.round((value / pixelCount) * intensityLevels));

        // Apply histogram equalization
        for (let i = 0; i < data.length; i += 4) {
            const intensity = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
            const mappedIntensity = normalizedHistogram[intensity];
            data[i] = data[i + 1] = data[i + 2] = mappedIntensity;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Gradient Map
    function applyGradientMap() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Define gradient map colors (black to white gradient)
        const gradientMapColors = [
            { r: 0, g: 0, b: 0 }, // Black
            { r: 255, g: 255, b: 255 } // White
        ];

        // Apply gradient map effect
        for (let i = 0; i < data.length; i += 4) {
            // Convert pixel to grayscale
            const intensity = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Map intensity to gradient color
            const colorIndex = Math.round((intensity / 255) * (gradientMapColors.length - 1));
            data[i] = gradientMapColors[colorIndex].r;
            data[i + 1] = gradientMapColors[colorIndex].g;
            data[i + 2] = gradientMapColors[colorIndex].b;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function applyWatercolor() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const radius = 2; // Adjust the radius for the effect
    
        // Apply watercolor effect
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let r = 0, g = 0, b = 0, count = 0;
    
                // Introduce some randomness by selecting random samples within the radius
                const randomX = x + Math.floor(Math.random() * radius * 2) - radius;
                const randomY = y + Math.floor(Math.random() * radius * 2) - radius;
    
                const nx = Math.min(canvas.width - 1, Math.max(0, randomX));
                const ny = Math.min(canvas.height - 1, Math.max(0, randomY));
                const index = (ny * canvas.width + nx) * 4;
                r = data[index];
                g = data[index + 1];
                b = data[index + 2];
                count++;
    
                const currentIndex = (y * canvas.width + x) * 4;
                data[currentIndex] = r; // Assign red value
                data[currentIndex + 1] = g; // Assign green value
                data[currentIndex + 2] = b; // Assign blue value
            }
        }
    
        ctx.putImageData(imageData, 0, 0);
    }    

    // Cartoonize
    function applyCartoonize() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const threshold = 50; // Adjust the threshold value for edge detection
        const edgeColor = { r: 0, g: 0, b: 0 }; // Color for detected edges
        const quantizationLevels = 4; // Number of color levels for quantization

        // Step 1: Apply edge detection
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3; // Convert to grayscale
                const edge = gray < threshold ? 0 : 255; // Detect edges based on threshold
                data[idx] = edgeColor.r; // Set red channel
                data[idx + 1] = edgeColor.g; // Set green channel
                data[idx + 2] = edgeColor.b; // Set blue channel
            }
        }

        // Step 2: Apply color quantization
        for (let i = 0; i < data.length; i += 4) {
            // Quantize color levels for each channel
            data[i] = Math.round(data[i] / 255) * (255 / quantizationLevels); // Red channel
            data[i + 1] = Math.round(data[i + 1] / 255) * (255 / quantizationLevels); // Green channel
            data[i + 2] = Math.round(data[i + 2] / 255) * (255 / quantizationLevels); // Blue channel
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Denoising
    function applyDenoising() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const windowSize = 3; // Size of the denoising window

        // Iterate through each pixel
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let sumRed = 0, sumGreen = 0, sumBlue = 0;
                let count = 0;

                // Iterate through the pixels in the window
                for (let dy = -windowSize; dy <= windowSize; dy++) {
                    for (let dx = -windowSize; dx <= windowSize; dx++) {
                        const nx = Math.min(canvas.width - 1, Math.max(0, x + dx));
                        const ny = Math.min(canvas.height - 1, Math.max(0, y + dy));
                        const idx = (ny * canvas.width + nx) * 4;

                        sumRed += data[idx];
                        sumGreen += data[idx + 1];
                        sumBlue += data[idx + 2];
                        count++;
                    }
                }

                // Average the pixel values in the window
                const avgRed = sumRed / count;
                const avgGreen = sumGreen / count;
                const avgBlue = sumBlue / count;

                // Update pixel with averaged color
                const idx = (y * canvas.width + x) * 4;
                data[idx] = avgRed;
                data[idx + 1] = avgGreen;
                data[idx + 2] = avgBlue;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Lens Blur
    function applyLensBlur() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const radius = 5; // Radius of the blur effect
        const centerX = canvas.width / 2; // X coordinate of the center of the blur
        const centerY = canvas.height / 2; // Y coordinate of the center of the blur

        // Iterate through each pixel
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let totalRed = 0, totalGreen = 0, totalBlue = 0, totalAlpha = 0;
                let count = 0;

                // Iterate through pixels in the circular kernel
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const nx = x + kx;
                        const ny = y + ky;

                        // Check if the pixel is within the canvas bounds
                        if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                            const distance = Math.sqrt((nx - centerX) ** 2 + (ny - centerY) ** 2);

                            // Apply blur only within the radius
                            if (distance <= radius) {
                                const idx = (ny * canvas.width + nx) * 4;
                                totalRed += data[idx];
                                totalGreen += data[idx + 1];
                                totalBlue += data[idx + 2];
                                totalAlpha += data[idx + 3];
                                count++;
                            }
                        }
                    }
                }

                // Average the pixel values within the circular kernel
                const avgRed = totalRed / count;
                const avgGreen = totalGreen / count;
                const avgBlue = totalBlue / count;
                const avgAlpha = totalAlpha / count;

                // Update pixel with averaged color
                const idx = (y * canvas.width + x) * 4;
                data[idx] = avgRed;
                data[idx + 1] = avgGreen;
                data[idx + 2] = avgBlue;
                data[idx + 3] = avgAlpha;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }


    // Motion Blur
    function applyMotionBlur() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const blurStrength = 10; // Strength of the blur effect
        const angle = Math.PI / 4; // Angle of motion blur (45 degrees in this example)

        // Calculate blur offsets
        const offsetX = Math.round(blurStrength * Math.cos(angle));
        const offsetY = Math.round(blurStrength * Math.sin(angle));

        // Iterate through each pixel
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let totalRed = 0, totalGreen = 0, totalBlue = 0, totalAlpha = 0;
                let count = 0;

                // Iterate through pixels in the blur path
                for (let i = 0; i < blurStrength; i++) {
                    const nx = x + offsetX * i;
                    const ny = y + offsetY * i;

                    // Check if the pixel is within the canvas bounds
                    if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                        const idx = (ny * canvas.width + nx) * 4;
                        totalRed += data[idx];
                        totalGreen += data[idx + 1];
                        totalBlue += data[idx + 2];
                        totalAlpha += data[idx + 3];
                        count++;
                    }
                }

                // Average the pixel values along the blur path
                const avgRed = totalRed / count;
                const avgGreen = totalGreen / count;
                const avgBlue = totalBlue / count;
                const avgAlpha = totalAlpha / count;

                // Update pixel with averaged color
                const idx = (y * canvas.width + x) * 4;
                data[idx] = avgRed;
                data[idx + 1] = avgGreen;
                data[idx + 2] = avgBlue;
                data[idx + 3] = avgAlpha;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Halftone Effect
    function applyHalftoneEffect() {
        const dotSize = 4; // Size of the halftone dots
        const dotSpacing = 8; // Spacing between halftone dots
        const threshold = 128; // Threshold for converting to black and white

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert image to grayscale
        for (let i = 0; i < data.length; i += 4) {
            const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = grayscale;
            data[i + 1] = grayscale;
            data[i + 2] = grayscale;
        }

        // Apply halftone effect
        for (let y = 0; y < canvas.height; y += dotSpacing) {
            for (let x = 0; x < canvas.width; x += dotSpacing) {
                let total = 0;
                let count = 0;

                // Calculate average grayscale value in the dot area
                for (let dy = 0; dy < dotSize; dy++) {
                    for (let dx = 0; dx < dotSize; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;

                        // Check if the pixel is within the canvas bounds
                        if (nx < canvas.width && ny < canvas.height) {
                            const idx = (ny * canvas.width + nx) * 4;
                            total += data[idx];
                            count++;
                        }
                    }
                }

                // Calculate average grayscale value
                const average = total / count;

                // Determine if the dot should be black or white based on the threshold
                const color = average > threshold ? 255 : 0;

                // Set color for the dot area
                for (let dy = 0; dy < dotSize; dy++) {
                    for (let dx = 0; dx < dotSize; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;

                        // Check if the pixel is within the canvas bounds
                        if (nx < canvas.width && ny < canvas.height) {
                            const idx = (ny * canvas.width + nx) * 4;
                            data[idx] = color;
                            data[idx + 1] = color;
                            data[idx + 2] = color;
                        }
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Texture Synthesis
    function applyTextureSynthesis() {
        const blockSize = 5; // Size of the blocks for synthesis

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Implement texture synthesis logic here
        // Placeholder logic: Copy random blocks from the image to create a texture

        for (let y = 0; y < canvas.height; y += blockSize) {
            for (let x = 0; x < canvas.width; x += blockSize) {
                // Get a random block from the image
                const randomX = Math.floor(Math.random() * canvas.width);
                const randomY = Math.floor(Math.random() * canvas.height);

                // Copy the block to the current position
                for (let dy = 0; dy < blockSize; dy++) {
                    for (let dx = 0; dx < blockSize; dx++) {
                        const srcIdx = ((randomY + dy) * canvas.width + (randomX + dx)) * 4;
                        const destIdx = ((y + dy) * canvas.width + (x + dx)) * 4;

                        // Check if the pixels are within the canvas bounds
                        if (
                            randomX + dx < canvas.width &&
                            randomY + dy < canvas.height &&
                            x + dx < canvas.width &&
                            y + dy < canvas.height
                        ) {
                            data[destIdx] = data[srcIdx];
                            data[destIdx + 1] = data[srcIdx + 1];
                            data[destIdx + 2] = data[srcIdx + 2];
                        }
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Color Temperature Adjustment
    function applyColorTemperature() {
        const temperature = 5000; // Adjust temperature value (in Kelvin)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Implement color temperature adjustment logic here
        // Placeholder logic: Adjust color temperature by changing RGB values

        for (let i = 0; i < data.length; i += 4) {
            // Get RGB values
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Adjust color temperature
            r = r * (temperature / 5000);
            g = g * (temperature / 5000);
            b = b * (temperature / 5000);

            // Clamp values to ensure they are within the valid range (0 - 255)
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));

            // Set new RGB values
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Gradient Overlay
    function applyGradientOverlay() {
        const gradientColor = { r: 255, g: 0, b: 0 }; // Adjust gradient color (red in this example)
        const opacity = 0.5; // Adjust opacity of the gradient overlay

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Interpolate between the original pixel color and the gradient color based on opacity
            data[i] = Math.round(gradientColor.r * opacity + data[i] * (1 - opacity)); // Red
            data[i + 1] = Math.round(gradientColor.g * opacity + data[i + 1] * (1 - opacity)); // Green
            data[i + 2] = Math.round(gradientColor.b * opacity + data[i + 2] * (1 - opacity)); // Blue
            // Alpha channel remains unchanged
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Retro Film Effect
    function applyRetroFilmEffect() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply color grading
        applyColorGrading(data);

        // Add noise
        applyNoise(data);

        // Apply vignetting
        applyVignette(data);

        // Apply light leaks
        applyLightLeaks(data);

        ctx.putImageData(imageData, 0, 0);
    }

    // Apply color grading
    function applyColorGrading(data) {
        for (let i = 0; i < data.length; i += 4) {
            // Apply color shifts for vintage look
            data[i] += 10; // Red
            data[i + 1] -= 5; // Green
            data[i + 2] -= 10; // Blue
        }
    }

    // Add noise
    function applyNoise(data) {
        const noiseIntensity = 20; // Adjust noise intensity
        for (let i = 0; i < data.length; i += 4) {
            const randomOffset = noiseIntensity * (Math.random() - 0.5);
            data[i] += randomOffset; // Red channel
            data[i + 1] += randomOffset; // Green channel
            data[i + 2] += randomOffset; // Blue channel
        }
    }

    // Apply vignetting
    function applyVignette(data) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const vignette = 1 - distance / maxDistance; // Linear falloff
                data[idx] *= vignette; // Red channel
                data[idx + 1] *= vignette; // Green channel
                data[idx + 2] *= vignette; // Blue channel
            }
        }
    }

    // Apply light leaks
    function applyLightLeaks(data) {
        const leakIntensity = 40; // Adjust intensity of light leaks
        const leakColor = { r: 255, g: 218, b: 185 }; // Light leak color (peach)
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                const leakAmount = Math.random() * leakIntensity;
                data[idx] += leakAmount * leakColor.r / 255; // Red channel
                data[idx + 1] += leakAmount * leakColor.g / 255; // Green channel
                data[idx + 2] += leakAmount * leakColor.b / 255; // Blue channel
            }
        }
    }

    function applyUnderwaterEffect() {
        const radius = 2; // Radius of the blur effect
        const sigma = 1.0; // Standard deviation for Gaussian blur
    
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Apply Gaussian blur
        const outputData = new Uint8ClampedArray(data);
        const halfSize = Math.floor(radius / 2);
        let sum = 0;
        for (let y = -halfSize; y <= halfSize; y++) {
            for (let x = -halfSize; x <= halfSize; x++) {
                const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                sum += value;
            }
        }
    
        // Normalize the kernel
        const kernel = new Array(radius * radius).fill(0).map((_, index) => {
            const y = Math.floor(index / radius) - halfSize;
            const x = (index % radius) - halfSize;
            const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
            return value / sum;
        });
    
        // Apply Gaussian blur
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let ky = -halfSize; ky <= halfSize; ky++) {
                    for (let kx = -halfSize; kx <= halfSize; kx++) {
                        const nx = Math.min(width - 1, Math.max(0, x + kx));
                        const ny = Math.min(height - 1, Math.max(0, y + ky));
                        const weight = kernel[(ky + halfSize) * radius + (kx + halfSize)];
                        const index = (ny * width + nx) * 4;
                        r += data[index];
                        g += data[index + 1];
                        b += data[index + 2];
                    }
                }
                const index = (y * width + x) * 4;
                outputData[index] = r / (radius * radius);
                outputData[index + 1] = g / (radius * radius);
                outputData[index + 2] = b / (radius * radius);
                outputData[index + 3] = data[index + 3]; // Keep alpha channel unchanged
            }
        }
    
        // Update image data with blurred data
        for (let i = 0; i < data.length; i += 4) {
            data[i] = outputData[i];
            data[i + 1] = outputData[i + 1];
            data[i + 2] = outputData[i + 2];
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyFisheye() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.sqrt(centerX * centerX + centerY * centerY);
    
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                const normalizedRadius = Math.pow(distance / radius, 2);
    
                const nx = Math.round(centerX + Math.cos(angle) * normalizedRadius * radius);
                const ny = Math.round(centerY + Math.sin(angle) * normalizedRadius * radius);
    
                // Check if the new coordinates are within the bounds of the canvas
                if (nx >= 0 && ny >= 0 && nx < canvas.width && ny < canvas.height) {
                    const idx = (ny * canvas.width + nx) * 4;
                    const srcIdx = (y * canvas.width + x) * 4;
                    data[srcIdx] = data[idx];
                    data[srcIdx + 1] = data[idx + 1];
                    data[srcIdx + 2] = data[idx + 2];
                }
            }
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyDreamyEffect() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const amount = 0.1; // Adjust the amount of dreaminess
    
        // Apply dreamy effect logic
        for (let i = 0; i < data.length; i += 4) {
            // Apply softening effect by blending nearby pixels
            const averageR = (data[i - 4] + data[i] + data[i + 4]) / 3;
            const averageG = (data[i - 3] + data[i + 1] + data[i + 5]) / 3;
            const averageB = (data[i - 2] + data[i + 2] + data[i + 6]) / 3;
    
            // Apply the dreamy effect by blending colors
            data[i] += (averageR - data[i]) * amount;
            data[i + 1] += (averageG - data[i + 1]) * amount;
            data[i + 2] += (averageB - data[i + 2]) * amount;
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyDuotoneEffect(color1, color2) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = (gray * (color1[0] / 255)) + ((255 - gray) * (color2[0] / 255));
            data[i + 1] = (gray * (color1[1] / 255)) + ((255 - gray) * (color2[1] / 255));
            data[i + 2] = (gray * (color1[2] / 255)) + ((255 - gray) * (color2[2] / 255));
        }
    
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applyGlitchEffect() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
    
        // Apply glitch effect logic
        for (let y = 0; y < height; y++) {
            if (Math.random() > 0.9) { // Randomly decide to glitch this row
                const offset = Math.floor(Math.random() * 40) - 20; // Random horizontal shift
    
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;
                    const shiftedIndex = (y * width + ((x + offset + width) % width)) * 4;
    
                    data[pixelIndex] = data[shiftedIndex];
                    data[pixelIndex + 1] = data[shiftedIndex + 1];
                    data[pixelIndex + 2] = data[shiftedIndex + 2];
                }
            }
        }
    
        ctx.putImageData(imageData, 0, 0);
    }    

    // Button click event listeners
    document.getElementById('grayscaleBtn').onclick = processImage(applyGrayscale);
    document.getElementById('sepiaBtn').onclick = processImage(applySepia);
    document.getElementById('invertBtn').onclick = processImage(applyInvert);
    document.getElementById('brightnessBtn').onclick = processImage(applyBrightness);
    document.getElementById('blurBtn').onclick = processImage(applyBlur);
    document.getElementById('edgeDetectionBtn').onclick = processImage(applyEdgeDetection);
    document.getElementById('autoEnhanceBtn').onclick = processImage(applyAutoEnhance);
    document.getElementById('upscaleBtn').onclick = processImage(upscaleTo4K);
    document.getElementById('sharpenBtn').onclick = processImage(applySharpen);
    document.getElementById('vignetteBtn').onclick = processImage(applyVignette);
    document.getElementById('posterizeBtn').onclick = processImage(applyPosterize);
    document.getElementById('oilPaintBtn').onclick = processImage(applyOilPaint);
    document.getElementById('saveBtn').onclick = saveImage;
    document.getElementById('resetBtn').onclick = resetImage;
    document.getElementById('saturationBtn').onclick = processImage(applySaturation);
    document.getElementById('hueRotationBtn').onclick = processImage(applyHueRotation);
    document.getElementById('gammaCorrectionBtn').onclick = processImage(applyGammaCorrection);
    document.getElementById('pixelateBtn').onclick = processImage(applyPixelate);
    document.getElementById('gaussianBlurBtn').onclick = processImage(applyGaussianBlur);
    document.getElementById('contrastBtn').onclick = processImage(applyContrast);
    document.getElementById('solarizeBtn').onclick = processImage(applySolarize);
    // Add event listeners for additional filters
    document.getElementById('embossBtn').onclick = processImage(applyEmboss);
    document.getElementById('thresholdingBtn').onclick = processImage(applyThresholding);
    document.getElementById('colorizeBtn').onclick = processImage(applyColorize);
    document.getElementById('thresholdBlurBtn').onclick = processImage(applyThresholdBlur);
    document.getElementById('edgeEnhanceBtn').onclick = processImage(applyEdgeEnhance);
    document.getElementById('redChannelBtn').onclick = processImage(() => applyEmphasizeChannel('red'));
    document.getElementById('greenChannelBtn').onclick = processImage(() => applyEmphasizeChannel('green'));
    document.getElementById('blueChannelBtn').onclick = processImage(() => applyEmphasizeChannel('blue'));
    document.getElementById('smoothBtn').onclick = processImage(applySmooth);
    // Button click event listeners for additional filters
    document.getElementById('noiseReductionBtn').onclick = processImage(applyNoiseReduction);
    document.getElementById('histogramEqualizationBtn').onclick = processImage(applyHistogramEqualization);
    document.getElementById('gradientMapBtn').onclick = processImage(applyGradientMap);
    document.getElementById('watercolorBtn').onclick = processImage(applyWatercolor);
    document.getElementById('cartoonizeBtn').onclick = processImage(applyCartoonize);
    document.getElementById('denoiseBtn').onclick = processImage(applyDenoising);
    document.getElementById('lensBlurBtn').onclick = processImage(applyLensBlur);
    document.getElementById('motionBlurBtn').onclick = processImage(applyMotionBlur);
    document.getElementById('halftoneBtn').onclick = processImage(applyHalftoneEffect);
    document.getElementById('textureSynthesisBtn').onclick = processImage(applyTextureSynthesis);
    document.getElementById('colorTemperatureBtn').onclick = processImage(applyColorTemperature);
    document.getElementById('gradientOverlayBtn').onclick = processImage(applyGradientOverlay);
    document.getElementById('retroFilmBtn').onclick = processImage(applyRetroFilmEffect);
    document.getElementById('underwaterEffectBtn').onclick = applyUnderwaterEffect;
    // New filters and buttons
    document.getElementById('dreamyEffectBtn').onclick = processImage(applyDreamyEffect);
    document.getElementById('glitchEffectBtn').onclick = processImage(applyGlitchEffect);
    document.getElementById('fisheyeBtn').onclick = processImage(applyFisheye);

});

