document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('renderCanvas');
    const ctx = canvas.getContext('2d');
    let img = new Image();

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            };
            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    });

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
        // Edge detection logic
        // Implementation...
    }

    function applyAutoEnhance() {
        // Auto enhance logic
        // Implementation...
    }

    function upscaleTo4K() {
        const scale = 2; // Upscale factor
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        canvas.width = originalWidth * scale;
        canvas.height = originalHeight * scale;
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, canvas.width, canvas.height);
    }

    // Save image function
    function saveImage() {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        
        // Create a temporary canvas for saving
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // If upscaled, use the scaled canvas dimensions for saving
        if (canvas.width > img.width || canvas.height > img.height) {
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCtx.drawImage(canvas, 0, 0);
            link.download = 'transformed_image_4k.png';
        } else {
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCtx.drawImage(img, 0, 0);
            link.download = 'transformed_image.png';
        }

        link.href = tempCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    // Clamp function to limit values between min and max
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Button click event listeners
    document.getElementById('grayscaleBtn').onclick = applyGrayscale;
    document.getElementById('sepiaBtn').onclick = applySepia;
    document.getElementById('invertBtn').onclick = applyInvert;
    document.getElementById('brightnessBtn').onclick = applyBrightness;
    document.getElementById('blurBtn').onclick = applyBlur;
    document.getElementById('edgeDetectionBtn').onclick = applyEdgeDetection;
    document.getElementById('autoEnhanceBtn').onclick = applyAutoEnhance;
    document.getElementById('upscaleBtn').onclick = upscaleTo4K;
    document.getElementById('saveBtn').onclick = saveImage;
});

