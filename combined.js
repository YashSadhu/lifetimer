document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);

    function toggleTheme() {
        document.body.dataset.theme = document.body.dataset.theme === 'light' ? '' : 'light';
        localStorage.setItem('theme', document.body.dataset.theme);
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
    }

    // Navigation functionality
    const navButtons = document.querySelectorAll('.nav-btn');
    const timerViews = document.querySelectorAll('.timer-view');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // For the Timer button, open timer.html
            if (button.id === 'timer-btn') {
                window.open('timer.html', '_blank');
                return;
            }
            
            const targetView = button.dataset.view;
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show selected view, hide others
            timerViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetView) {
                    view.classList.add('active');
                }
            });
        });
    });

    // Initialize ChronoFlame Timer
    initChronoFlame();
    
    // Initialize Chronovisor (Life Grid)
    initChronovisor();
});

// ChronoFlame Timer Functionality
function initChronoFlame() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timeDisplay = document.querySelector('.time-display');
    const progressRing = document.querySelector('.progress-ring-circle');
    const timerOptions = document.querySelectorAll('.timer-option');
    const customTimeContainer = document.querySelector('.custom-time-container');
    const customMinutesInput = document.getElementById('customMinutes');
    const setCustomTimeBtn = document.getElementById('setCustomTime');
    
    let timerDuration = 25 * 60; // Default: 25 minutes in seconds
    let timeRemaining = timerDuration;
    let timerInterval;
    let isRunning = false;
    
    const circumference = progressRing.r.baseVal.value * 2 * Math.PI;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = circumference;
    
    // Timer Option Selection
    timerOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (isRunning) return; // Don't change timer while running
            
            // Update active state
            timerOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Handle custom time option
            if (option.dataset.duration === 'custom') {
                customTimeContainer.classList.add('active');
                return;
            }
            
            // Hide custom time input if not selected
            customTimeContainer.classList.remove('active');
            
            // Set timer duration
            timerDuration = parseInt(option.dataset.duration);
            timeRemaining = timerDuration;
            updateDisplay();
        });
    });
    
    // Custom Time Setting
    setCustomTimeBtn.addEventListener('click', () => {
        const minutes = parseInt(customMinutesInput.value);
        if (isNaN(minutes) || minutes < 1 || minutes > 180) {
            alert('Please enter a valid time between 1 and 180 minutes');
            return;
        }
        
        timerDuration = minutes * 60;
        timeRemaining = timerDuration;
        updateDisplay();
    });
    
    function setProgress(percent) {
        const offset = circumference - (percent / 100 * circumference);
        progressRing.style.strokeDashoffset = offset;
    }
    
    function updateDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const percentComplete = ((timerDuration - timeRemaining) / timerDuration) * 100;
        setProgress(percentComplete);
    }
    
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        // Disable timer options while running
        timerOptions.forEach(option => {
            option.style.pointerEvents = 'none';
            option.style.opacity = '0.5';
        });
        
        timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateDisplay();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                
                // Re-enable timer options
                timerOptions.forEach(option => {
                    option.style.pointerEvents = 'auto';
                    option.style.opacity = '1';
                });
                
                // Play sound or notification
                playTimerCompleteSound();
                alert('Timer complete!');
            }
        }, 1000);
    }
    
    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        // Re-enable timer options
        timerOptions.forEach(option => {
            option.style.pointerEvents = 'auto';
            option.style.opacity = '1';
        });
    }
    
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        timeRemaining = timerDuration;
        updateDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        // Re-enable timer options
        timerOptions.forEach(option => {
            option.style.pointerEvents = 'auto';
            option.style.opacity = '1';
        });
    }
    
    function playTimerCompleteSound() {
        // Create and play a brief notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.5;
        
        oscillator.start();
        
        // Fade out
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
        
        // Stop after fade
        setTimeout(() => {
            oscillator.stop();
        }, 1000);
    }
    
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Initialize display
    updateDisplay();
}

// Chronovisor (Life Grid) Functionality
function initChronovisor() {
    const birthDateInput = document.getElementById('birthdate');
    const generateBtn = document.getElementById('generateGrid');
    const lifeGrid = document.getElementById('life-grid');
    const gridContainer = document.getElementById('grid-container');
    const statsCard = document.getElementById('stats-card');
    const yearsLivedEl = document.getElementById('years-lived');
    const weeksLivedEl = document.getElementById('weeks-lived');
    const daysLivedEl = document.getElementById('days-lived');
    const percentageEl = document.getElementById('percentage');
    
    // Create modal elements if they don't exist
    if (!document.getElementById('noteModal')) {
        const modalHTML = `
            <div id="modalBackdrop"></div>
            <div id="noteModal" class="modal">
                <h3 id="modalTitle">Week Note</h3>
                <textarea id="noteTextarea" placeholder="Add your note for this week..."></textarea>
                <div class="modal-actions">
                    <button id="closeModalBtn" class="btn">Cancel</button>
                    <button id="saveNoteBtn" class="btn btn-primary">Save Note</button>
                </div>
            </div>
        `;
        
        // Add the modal HTML to the body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
    }
    
    // Modal elements
    const noteModal = document.getElementById('noteModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalTitle = document.getElementById('modalTitle');
    const noteTextarea = document.getElementById('noteTextarea');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    const WEEKS_PER_YEAR = 52;
    const DAYS_PER_WEEK = 7;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const MS_PER_WEEK = MS_PER_DAY * DAYS_PER_WEEK;
    const MS_PER_YEAR = MS_PER_DAY * 365.25; // Approximate
    const LIFE_EXPECTANCY = 80;
    const TOTAL_EXPECTED_WEEKS = LIFE_EXPECTANCY * WEEKS_PER_YEAR;
    
    let birthDate = null;
    let animationFrameId = null;
    let currentEditingWeek = null; // To store the index of the week being edited
    
    function generateLifeGrid() {
        const birthDate = new Date(birthDateInput.value);
        
        if (isNaN(birthDate.getTime())) {
            alert('Please enter a valid birth date');
            return;
        }
        
        // Clear previous grid and stop previous animation
        lifeGrid.innerHTML = '';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        const totalWeeksToDisplay = LIFE_EXPECTANCY * WEEKS_PER_YEAR;
        for (let i = 0; i < totalWeeksToDisplay; i++) {
            const weekCell = document.createElement('div');
            weekCell.classList.add('week-cell');
            const yearNumber = Math.floor(i / WEEKS_PER_YEAR) + 1;
            const weekOfYearNumber = (i % WEEKS_PER_YEAR) + 1;
            weekCell.title = `Week ${i + 1} (Year ${yearNumber}, Week ${weekOfYearNumber})`;
            lifeGrid.appendChild(weekCell);
        }
        
        gridContainer.style.display = 'block';
        statsCard.style.display = 'flex'; // Ensure stats card is visible
        
        // Start the continuous update animation
        function updateStatsAndGrid() {
            const now = new Date();
            const diffTime = now - birthDate;

            const years = diffTime / MS_PER_YEAR;
            const weeks = diffTime / MS_PER_WEEK;
            const days = diffTime / MS_PER_DAY;
            const percentage = Math.min(100, (years / LIFE_EXPECTANCY) * 100);

            // Update stats display with decimals
            yearsLivedEl.textContent = years.toFixed(8);
            weeksLivedEl.textContent = weeks.toFixed(6);
            daysLivedEl.textContent = days.toFixed(4);
            percentageEl.textContent = `${percentage.toFixed(6)}%`;

            // Update grid visualization
            const currentFullWeeks = Math.floor(weeks);
            for (let i = 0; i < totalWeeksToDisplay; i++) {
                const cell = lifeGrid.children[i];
                if (!cell) continue; 

                if (i < currentFullWeeks) {
                    cell.classList.add('lived');
                    cell.style.background = ''; // Reset background if it had partial fill
                } else if (i === currentFullWeeks) {
                    cell.classList.remove('lived'); // Ensure it's not fully 'lived'
                    const partialWeek = weeks - currentFullWeeks;
                    // Use a gradient to show partial progress within the current week
                    const livedColor = getComputedStyle(document.documentElement).getPropertyValue(document.body.dataset.theme === 'dark' ? '--cv-accent' : '--cf-secondary').trim();
                    const futureColor = getComputedStyle(document.documentElement).getPropertyValue(document.body.dataset.theme === 'dark' ? '--cv-background' : '--cf-background').trim();
                    cell.style.background = `linear-gradient(to right, ${livedColor} ${partialWeek * 100}%, ${futureColor} ${partialWeek * 100}%)`;
                } else {
                    cell.classList.remove('lived');
                    cell.style.background = ''; // Ensure future cells are not colored
                }
            }

            animationFrameId = requestAnimationFrame(updateStatsAndGrid);
        }
        
        // Start the animation loop
        updateStatsAndGrid();

        // --- Attach Cell Click Listener --- 
        // Remove any old listener first to prevent duplicates if regenerated
        const newLifeGrid = lifeGrid.cloneNode(true);
        lifeGrid.parentNode.replaceChild(newLifeGrid, lifeGrid);
        lifeGrid = newLifeGrid; // Update reference

        // Add event listener for clicking on week cells (using event delegation)
        lifeGrid.addEventListener('click', (event) => {
            const cell = event.target.closest('.week-cell'); // Find the closest cell ancestor
            if (cell) {
                // Find the index of the clicked cell
                const clickedCellIndex = Array.from(lifeGrid.children).indexOf(cell);
                if (clickedCellIndex !== -1) {
                    openModal(clickedCellIndex);
                }
            }
        });
        // --- End Attach Cell Click Listener --- 
    }
    
    function openModal(weekIndex) {
        currentEditingWeek = weekIndex;
        const year = Math.floor(weekIndex / WEEKS_PER_YEAR) + 1;
        const weekOfYear = (weekIndex % WEEKS_PER_YEAR) + 1;
        modalTitle.textContent = `Note for Year ${year}, Week ${weekOfYear} (Week ${weekIndex + 1})`;
        
        // Load existing note
        noteTextarea.value = localStorage.getItem(`mortalmap_note_${weekIndex}`) || '';
        
        // Ensure modal elements exist and are properly styled for visibility
        if (noteModal && modalBackdrop) {
            // Force display style to block first to ensure CSS transitions work
            noteModal.style.display = 'block';
            modalBackdrop.style.display = 'block';
            
            // Add active class for transitions
            setTimeout(() => {
                noteModal.classList.add('active');
                modalBackdrop.classList.add('active');
            }, 10);
            
            console.log('Modal opened for week:', weekIndex);
        } else {
            console.error('Modal elements not found:', { noteModal, modalBackdrop });
        }
    }

    function closeModal() {
        if (noteModal && modalBackdrop) {
            noteModal.classList.remove('active');
            modalBackdrop.classList.remove('active');
            
            // Remove display style after transition
            setTimeout(() => {
                noteModal.style.display = '';
                modalBackdrop.style.display = '';
            }, 300); // Match transition time
        }
        currentEditingWeek = null;
    }

    function saveNote() {
        if (currentEditingWeek !== null) {
            const noteText = noteTextarea.value;
            if (noteText.trim()) {
                localStorage.setItem(`mortalmap_note_${currentEditingWeek}`, noteText);
            } else {
                // Remove note if textarea is empty
                localStorage.removeItem(`mortalmap_note_${currentEditingWeek}`);
            }
            // Optionally, add a visual indicator to the cell that has a note
            const cell = lifeGrid.children[currentEditingWeek];
            if(cell) {
                if (noteText.trim()) {
                    cell.classList.add('has-note'); // Add a class if note exists
                } else {
                    cell.classList.remove('has-note'); // Remove class if note is deleted
                }
            }
            closeModal();
        }
    }

    // Event Listeners
    generateBtn.addEventListener('click', generateLifeGrid);

    // Modal control listeners
    closeModalBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    saveNoteBtn.addEventListener('click', saveNote);
}

// Complete the chakra animation by adding missing elements
document.addEventListener('DOMContentLoaded', function() {
    // Add mail button functionality
    const mailButtons = document.querySelectorAll('.mail');
    mailButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = 'mailto:thankful.yash@gmail.com';
        });
    });
    
    // ID Card "Say Hi" button functionality
    const idButtons = document.querySelectorAll('.id-button');
    idButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.open('https://www.linkedin.com/in/yash-sadhu/', '_blank');
        });
    });
    
    // Select icons within *each* ID card container separately
    const idCardContainers = document.querySelectorAll('.id-card-container');
    idCardContainers.forEach(container => {
        const socialIcons = container.querySelectorAll('.social-links-container svg');
        const socialLinks = [
            'https://twitter.com/', // Placeholder for Twitter
            'https://discord.com/', // Placeholder for Discord
            'https://www.youtube.com/@spiritualscientist09' // YouTube Link
        ];
        
        socialIcons.forEach((icon, index) => {
            if (socialLinks[index]) {
                icon.style.cursor = 'pointer';
                icon.addEventListener('click', () => {
                    window.open(socialLinks[index], '_blank');
                });
            }
        });
    });
    
    // Add timer button to FlowState/chronoflame view
    const chronoflameView = document.getElementById('chronoflame');
    if (chronoflameView) {
        // Create timer button
        const timerButton = document.createElement('button');
        timerButton.classList.add('timer-link-button');
        timerButton.textContent = 'Timer';
        timerButton.addEventListener('click', () => {
            window.open('timer.html', '_blank'); // Open timer.html in a new tab
        });
        
        // Add button to chronoflame view
        chronoflameView.style.position = 'relative'; // Ensure positioning context
        chronoflameView.appendChild(timerButton);
    }
    
    // Apply feather icons if the library is loaded
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Ensure initial theme is set correctly if using dark by default
    if (document.body.getAttribute('data-theme') === 'dark') {
        const themeToggle = document.querySelector('.theme-toggle');
        const themeIcon = themeToggle.querySelector('svg');
        // Update icon to moon if dark theme is default
        themeIcon.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        // Apply feather replace again for the new icon
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}); 