window.onload = () => {
    // Referensi ke elemen-elemen DOM
    const imageLoader = document.getElementById('image-loader');
    const uploadBtn = document.getElementById('upload-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const canvasWrapper = document.querySelector('.canvas-wrapper');

    // URL bingkai yang disediakan
    const frameImageUrl = 'https://i.ibb.co/L8yD426/frame-MPLS-2025.png';

    let fabricCanvas;
    let userImage;
    let frameImage;

    // Fungsi untuk menginisialisasi kanvas Fabric.js
    function initializeCanvas(width, height) {
        canvasWrapper.style.width = `${width}px`;
        canvasWrapper.style.height = `${height}px`;

        fabricCanvas = new fabric.Canvas('twibbon-canvas', {
            width: width,
            height: height,
            backgroundColor: '#fff',
            selection: false
        });
    }

    // Memuat gambar bingkai untuk mendapatkan dimensinya
    const tempFrame = new Image();
    tempFrame.crossOrigin = 'anonymous';
    tempFrame.onload = () => {
        initializeCanvas(tempFrame.width, tempFrame.height);
        loadFrame();
        setupPanningAndZooming();
        setupDownload();
        setupReset();
    };
    tempFrame.src = frameImageUrl;

    // Fungsi untuk memuat bingkai ke kanvas
    function loadFrame() {
        fabric.Image.fromURL(frameImageUrl, (img) => {
            frameImage = img;
            frameImage.set({
                selectable: false,
                evented: false,
                hoverCursor: 'default'
            });
            fabricCanvas.add(frameImage);
            fabricCanvas.bringToFront(frameImage);
            fabricCanvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    }

    // Event listener untuk tombol unggah
    uploadBtn.addEventListener('click', () => {
        imageLoader.click();
    });

    // Event listener untuk input file
    imageLoader.addEventListener('change', (e) => {
        const file = e.target.files;
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            loadUserImage(event.target.result);
        };
        reader.readAsDataURL(file);
    });

    // Fungsi untuk memuat dan menambahkan foto pengguna
    function loadUserImage(imageUrl) {
        if (userImage) {
            fabricCanvas.remove(userImage);
        }

        fabric.Image.fromURL(imageUrl, (img) => {
            userImage = img;
            userImage.scaleToWidth(fabricCanvas.width);
            userImage.set({
                top: (fabricCanvas.height - userImage.getScaledHeight()) / 2,
                left: (fabricCanvas.width - userImage.getScaledWidth()) / 2,
                originX: 'left',
                originY: 'top',
                selectable: true,
                evented: true,
                hasControls: false,
                hasBorders: false,
            });

            fabricCanvas.add(userImage);
            fabricCanvas.sendToBack(userImage);
            fabricCanvas.renderAll();

            downloadBtn.disabled = false;
            resetBtn.disabled = false;
        }, { crossOrigin: 'anonymous' });
    }

    // Fungsi untuk mengatur pan dan zoom
    function setupPanningAndZooming() {
        fabricCanvas.on('mouse:wheel', function(opt) {
            const delta = opt.e.deltaY;
            let zoom = fabricCanvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.1) zoom = 0.1;
            fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        fabricCanvas.on('mouse:down', function(opt) {
            const evt = opt.e;
            if (evt.altKey === true) {
                this.isDragging = true;
                this.selection = false;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
            }
        });

        fabricCanvas.on('mouse:move', function(opt) {
            if (this.isDragging) {
                const e = opt.e;
                const vpt = this.viewportTransform;
                vpt += e.clientX - this.lastPosX;
                vpt += e.clientY - this.lastPosY;
                this.requestRenderAll();
                this.lastPosX = e.clientX;
                this.lastPosY = e.clientY;
            }
        });

        fabricCanvas.on('mouse:up', function(opt) {
            this.setViewportTransform(this.viewportTransform);
            this.isDragging = false;
            this.selection = true;
        });
    }

    // Fungsi untuk mengatur unduhan
    function setupDownload() {
        downloadBtn.addEventListener('click', () => {
            // Simpan transformasi saat ini
            const originalTransform = fabricCanvas.viewportTransform.slice();

            // Reset viewport untuk ekspor kualitas penuh
            fabricCanvas.setViewportTransform();
            
            const dataURL = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1.0
            });

            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'twibbon-mpls-2025.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Kembalikan transformasi viewport
            fabricCanvas.setViewportTransform(originalTransform);
        });
    }

    // Fungsi untuk mereset kanvas
    function setupReset() {
        resetBtn.addEventListener('click', () => {
            if (userImage) {
                fabricCanvas.remove(userImage);
                userImage = null;
            }
            fabricCanvas.setViewportTransform();
            fabricCanvas.renderAll();
            downloadBtn.disabled = true;
            resetBtn.disabled = true;
            imageLoader.value = '';
        });
    }
};