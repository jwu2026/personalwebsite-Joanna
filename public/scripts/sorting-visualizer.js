// Sorting Visualizer Widget
class SortingVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.array = [];
        this.arraySize = 20;
        this.sortingSpeed = 50; // milliseconds
        this.isSorting = false;
        this.isShuffling = false;
        this.shouldStopShuffle = false;
        this.shouldStopSorting = false;
        this.isPaused = false;
        this.shouldPause = false;
        this.animations = [];
        this.currentAnimation = 0;
        this.sortOrder = 'ascending'; // 'ascending' or 'descending'
        
        this.init();
    }
    
    init() {
        this.generateArray();
        this.render();
        this.setupEventListeners();
        // Set initial speed display
        const speedValue = this.container.querySelector('.speed-value');
        if (speedValue) {
            speedValue.textContent = `${this.sortingSpeed}ms`;
        }
        // Set initial size display
        const sizeValue = this.container.querySelector('.size-value');
        if (sizeValue) {
            sizeValue.textContent = `${this.arraySize}`;
        }
    }
    
    generateArray() {
        this.array = [];
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push(Math.floor(Math.random() * 100) + 10);
        }
    }
    
    render() {
        const maxValue = Math.max(...this.array);
        const container = this.container.querySelector('.bars-container');
        container.innerHTML = '';
        
        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'sort-bar';
            bar.style.height = `${(value / maxValue) * 100}%`;
            bar.style.width = `${100 / this.arraySize}%`;
            bar.setAttribute('data-value', value);
            bar.setAttribute('data-index', index);
            container.appendChild(bar);
        });
    }
    
    setupEventListeners() {
        const shuffleBtn = this.container.querySelector('.shuffle-btn');
        const startBtn = this.container.querySelector('.start-btn');
        const pauseBtn = this.container.querySelector('.pause-btn');
        const sortOrderBtn = this.container.querySelector('.sort-order-btn');
        const speedSlider = this.container.querySelector('.speed-slider');
        const sizeSlider = this.container.querySelector('.size-slider');
        const algorithmSelect = this.container.querySelector('.algorithm-select');
        
        shuffleBtn.addEventListener('click', () => {
            if (this.isSorting) {
                // Stop ongoing sorting first
                this.stopSorting();
            }
            if (!this.isShuffling) {
                this.animatedShuffle();
            }
        });
        
        startBtn.addEventListener('click', () => {
            if (!this.isSorting && !this.isShuffling) {
                const algorithm = algorithmSelect.value;
                this.startSorting(algorithm);
            }
        });
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this.isSorting) {
                    if (this.isPaused) {
                        this.resumeSorting();
                    } else {
                        this.pauseSorting();
                    }
                }
            });
            // Initially disable the pause button
            pauseBtn.disabled = true;
        }
        
        if (sortOrderBtn) {
            sortOrderBtn.addEventListener('click', () => {
                if (!this.isSorting && !this.isShuffling) {
                    this.toggleSortOrder();
                }
            });
        }
        
        speedSlider.addEventListener('input', (e) => {
            this.sortingSpeed = parseInt(e.target.value);
            const speedValue = this.container.querySelector('.speed-value');
            speedValue.textContent = `${this.sortingSpeed}ms`;
        });
        
        sizeSlider.addEventListener('input', (e) => {
            const newSize = parseInt(e.target.value);
            this.arraySize = newSize;
            const sizeValue = this.container.querySelector('.size-value');
            sizeValue.textContent = `${this.arraySize}`;
            
            // Stop any ongoing operations
            if (this.isSorting) {
                this.stopSorting();
            }
            if (this.isShuffling) {
                this.stopShuffle();
            }
            
            // Regenerate and re-render with new size
            this.generateArray();
            this.render();
        });
        
        algorithmSelect.addEventListener('change', () => {
            // If sorting is in progress, stop it immediately
            if (this.isSorting) {
                this.stopSorting();
            }
            // Reshuffle the array
            if (!this.isShuffling) {
                this.animatedShuffle();
            }
        });
    }
    
    async animatedShuffle() {
        this.isShuffling = true;
        this.shouldStopShuffle = false;
        
        const shuffleBtn = this.container.querySelector('.shuffle-btn');
        const startBtn = this.container.querySelector('.start-btn');
        const sortOrderBtn = this.container.querySelector('.sort-order-btn');
        
        // Disable buttons during shuffle
        shuffleBtn.disabled = true;
        startBtn.disabled = true;
        if (sortOrderBtn) sortOrderBtn.disabled = true;
        
        // Perform Fisher-Yates shuffle with animations
        const n = this.array.length;
        for (let i = n - 1; i > 0; i--) {
            if (this.shouldStopShuffle) {
                break;
            }
            
            // Pick a random index from 0 to i
            const j = Math.floor(Math.random() * (i + 1));
            
            // Swap elements
            if (i !== j) {
                this.swapBars(i, j);
                await this.sleep(10); // Always use fastest speed (10ms) for shuffle
            }
        }
        
        // Clear highlights
        this.clearHighlights();
        
        // Reset UI
        this.isShuffling = false;
        shuffleBtn.disabled = false;
        startBtn.disabled = false;
        if (sortOrderBtn) sortOrderBtn.disabled = false;
    }
    
    stopShuffle() {
        this.shouldStopShuffle = true;
    }
    
    stopSorting() {
        this.shouldStopSorting = true;
        this.isPaused = false;
        this.shouldPause = false;
        
        const startBtn = this.container.querySelector('.start-btn');
        const pauseBtn = this.container.querySelector('.pause-btn');
        const sortOrderBtn = this.container.querySelector('.sort-order-btn');
        
        // Reset UI state
        this.isSorting = false;
        startBtn.disabled = false;
        startBtn.textContent = 'Start Sorting';
        if (pauseBtn) {
            pauseBtn.disabled = true;
            pauseBtn.textContent = 'Pause';
        }
        if (sortOrderBtn) sortOrderBtn.disabled = false;
        
        // Clear highlights
        this.clearHighlights();
    }
    
    async startSorting(algorithm) {
        // Clear any previous sorted state (green bars)
        this.clearHighlights();
        
        this.isSorting = true;
        this.isPaused = false;
        this.shouldPause = false;
        this.shouldStopSorting = false;
        this.animations = [];
        this.currentAnimation = 0;
        
        const startBtn = this.container.querySelector('.start-btn');
        const pauseBtn = this.container.querySelector('.pause-btn');
        const sortOrderBtn = this.container.querySelector('.sort-order-btn');
        
        startBtn.disabled = true;
        startBtn.textContent = 'Sorting...';
        if (pauseBtn) {
            pauseBtn.disabled = false;
            pauseBtn.textContent = 'Pause';
        }
        if (sortOrderBtn) sortOrderBtn.disabled = true;
        
        // Generate animations based on algorithm
        const arrayCopy = [...this.array];
        switch(algorithm) {
            case 'bubble':
                this.bubbleSort(arrayCopy);
                break;
            case 'selection':
                this.selectionSort(arrayCopy);
                break;
            case 'insertion':
                this.insertionSort(arrayCopy);
                break;
            case 'merge':
                this.mergeSort(arrayCopy, 0, arrayCopy.length - 1);
                break;
            case 'quick':
                this.quickSort(arrayCopy, 0, arrayCopy.length - 1);
                break;
        }
        
        // Play animations
        await this.playAnimations();
        
        // Only do final highlight if sorting completed normally
        if (!this.shouldStopSorting) {
            // Final highlight
            this.highlightAll();
        }
        
        // Reset state only if we're still in sorting state (wasn't already reset by stopSorting)
        if (this.isSorting) {
            this.isSorting = false;
            this.isPaused = false;
            startBtn.disabled = false;
            startBtn.textContent = 'Start Sorting';
            if (pauseBtn) {
                pauseBtn.disabled = true;
                pauseBtn.textContent = 'Pause';
            }
            const sortOrderBtn = this.container.querySelector('.sort-order-btn');
            if (sortOrderBtn) sortOrderBtn.disabled = false;
        }
    }
    
    pauseSorting() {
        this.isPaused = true;
        this.shouldPause = true;
        const pauseBtn = this.container.querySelector('.pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = 'Resume';
        }
    }
    
    resumeSorting() {
        this.isPaused = false;
        this.shouldPause = false;
        const pauseBtn = this.container.querySelector('.pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = 'Pause';
        }
    }
    
    async playAnimations() {
        for (let i = 0; i < this.animations.length; i++) {
            if (this.shouldStopShuffle || this.shouldStopSorting) {
                break;
            }
            
            // Wait if paused
            while (this.isPaused && !this.shouldStopSorting) {
                await this.sleep(100);
            }
            
            if (this.shouldStopSorting) {
                break;
            }
            
            const animation = this.animations[i];
            
            // Clear previous comparisons
            this.clearHighlights();
            
            if (animation.type === 'compare') {
                this.highlightBars(animation.indices, 'comparing');
            } else if (animation.type === 'swap') {
                this.swapBars(animation.indices[0], animation.indices[1]);
            } else if (animation.type === 'set') {
                this.setBar(animation.index, animation.value);
            }
            
            await this.sleep(this.sortingSpeed);
        }
        
        // Clear all highlights at the end
        this.clearHighlights();
    }
    
    clearHighlights() {
        const bars = this.container.querySelectorAll('.sort-bar');
        bars.forEach(bar => {
            bar.classList.remove('comparing', 'swapping', 'sorted');
        });
    }
    
    highlightBars(indices, className) {
        const bars = this.container.querySelectorAll('.sort-bar');
        bars.forEach((bar, i) => {
            bar.classList.remove('comparing', 'swapping', 'sorted');
            if (indices.includes(i)) {
                bar.classList.add(className);
            }
        });
    }
    
    swapBars(i, j) {
        const bars = this.container.querySelectorAll('.sort-bar');
        const temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
        
        // Swap heights
        const barI = bars[i];
        const barJ = bars[j];
        const tempHeight = barI.style.height;
        barI.style.height = barJ.style.height;
        barJ.style.height = tempHeight;
        
        // Update data attributes
        barI.setAttribute('data-value', this.array[i]);
        barJ.setAttribute('data-value', this.array[j]);
        
        bars[i].classList.add('swapping');
        bars[j].classList.add('swapping');
        
        setTimeout(() => {
            bars[i].classList.remove('swapping');
            bars[j].classList.remove('swapping');
        }, this.sortingSpeed);
    }
    
    setBar(index, value) {
        const bars = this.container.querySelectorAll('.sort-bar');
        const maxValue = Math.max(...this.array);
        this.array[index] = value;
        bars[index].style.height = `${(value / maxValue) * 100}%`;
        bars[index].setAttribute('data-value', value);
    }
    
    highlightAll() {
        const bars = this.container.querySelectorAll('.sort-bar');
        bars.forEach(bar => {
            bar.classList.add('sorted');
        });
    }
    
    // Sorting Algorithms
    
    bubbleSort(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                this.animations.push({ type: 'compare', indices: [j, j + 1] });
                if (this.compare(arr[j], arr[j + 1])) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    this.animations.push({ type: 'swap', indices: [j, j + 1] });
                }
            }
        }
    }
    
    selectionSort(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let targetIdx = i;
            for (let j = i + 1; j < n; j++) {
                this.animations.push({ type: 'compare', indices: [targetIdx, j] });
                if (this.compare(arr[targetIdx], arr[j])) {
                    targetIdx = j;
                }
            }
            if (targetIdx !== i) {
                [arr[i], arr[targetIdx]] = [arr[targetIdx], arr[i]];
                this.animations.push({ type: 'swap', indices: [i, targetIdx] });
            }
        }
    }
    
    insertionSort(arr) {
        const n = arr.length;
        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            
            this.animations.push({ type: 'compare', indices: [i, j] });
            
            while (j >= 0 && this.compare(arr[j], key)) {
                arr[j + 1] = arr[j];
                this.animations.push({ type: 'set', index: j + 1, value: arr[j] });
                j--;
                if (j >= 0) {
                    this.animations.push({ type: 'compare', indices: [j, i] });
                }
            }
            arr[j + 1] = key;
            this.animations.push({ type: 'set', index: j + 1, value: key });
        }
    }
    
    mergeSort(arr, left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            this.mergeSort(arr, left, mid);
            this.mergeSort(arr, mid + 1, right);
            this.merge(arr, left, mid, right);
        }
    }
    
    merge(arr, left, mid, right) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            this.animations.push({ type: 'compare', indices: [left + i, mid + 1 + j] });
            if (!this.compare(leftArr[i], rightArr[j])) {
                arr[k] = leftArr[i];
                this.animations.push({ type: 'set', index: k, value: leftArr[i] });
                i++;
            } else {
                arr[k] = rightArr[j];
                this.animations.push({ type: 'set', index: k, value: rightArr[j] });
                j++;
            }
            k++;
        }
        
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            this.animations.push({ type: 'set', index: k, value: leftArr[i] });
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            this.animations.push({ type: 'set', index: k, value: rightArr[j] });
            j++;
            k++;
        }
    }
    
    quickSort(arr, low, high) {
        if (low < high) {
            const pi = this.partition(arr, low, high);
            this.quickSort(arr, low, pi - 1);
            this.quickSort(arr, pi + 1, high);
        }
    }
    
    partition(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            this.animations.push({ type: 'compare', indices: [j, high] });
            if (this.compare(pivot, arr[j])) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                if (i !== j) {
                    this.animations.push({ type: 'swap', indices: [i, j] });
                }
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        if (i + 1 !== high) {
            this.animations.push({ type: 'swap', indices: [i + 1, high] });
        }
        return i + 1;
    }
    
    async toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'ascending' ? 'descending' : 'ascending';
        const sortOrderBtn = this.container.querySelector('.sort-order-btn');
        if (sortOrderBtn) {
            sortOrderBtn.textContent = `Sort: ${this.sortOrder === 'ascending' ? 'Ascending' : 'Descending'}`;
        }
        // Shuffle the array when switching sort order
        if (!this.isShuffling) {
            await this.animatedShuffle();
        }
    }
    
    compare(a, b) {
        if (this.sortOrder === 'ascending') {
            return a > b;
        } else {
            return a < b;
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sorting-visualizer')) {
        new SortingVisualizer('sorting-visualizer');
    }
});