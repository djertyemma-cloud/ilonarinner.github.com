/* ==========================================================================
   1. GESTION DU TIMECODE / CHRONOMÈTRE DE VISITE (24 FPS)
   ========================================================================== */
const startTime = Date.now();
const fps = 24; 

function updateTimecode() {
    const elapsedTime = Date.now() - startTime;
    
    let totalSeconds = Math.floor(elapsedTime / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    
    let milliseconds = elapsedTime % 1000;
    let frames = Math.floor((milliseconds / 1000) * fps);

    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    seconds = seconds.toString().padStart(2, '0');
    frames = frames.toString().padStart(2, '0');

    const timecodeString = `${hours}:${minutes}:${seconds}:${frames}`;

    const mainTimecodeEl = document.getElementById('main-timecode');
    if (mainTimecodeEl) {
        mainTimecodeEl.textContent = timecodeString;
    }

    const navCounterEl = document.getElementById('nav-counter');
    if (navCounterEl) {
        navCounterEl.textContent = timecodeString;
    }
}

// Mise à jour continue du timecode
setInterval(updateTimecode, 1000 / fps);


/* ==========================================================================
   2. INTERACTION TIMELINE & TÊTE DE LECTURE (SCRUBBING & DEPLACEMENT)
   ========================================================================== */
const timelineArea = document.getElementById('timeline-area');
const playhead = document.getElementById('playhead');
const tracksContainer = document.getElementById('tracks-container');

let isDragging = false;

// Fonction pour mettre à jour la position de la barre rouge selon X
function updatePlayheadPosition(e) {
    if (!tracksContainer || !playhead) return;

    // Récupérer le rectangle des pistes
    const rect = tracksContainer.getBoundingClientRect();
    
    // Décalage dû aux labels de pistes ("V1", "V2", etc. ~ 30px + padding)
    const labelOffset = 42; 
    const trackWidth = rect.width - labelOffset;

    // Position X du curseur par rapport au début des pistes
    let clickX = e.clientX - rect.left - labelOffset;

    // Limiter entre 0% et 100% de la zone utile
    if (clickX < 0) clickX = 0;
    if (clickX > trackWidth) clickX = trackWidth;

    // Calcul du pourcentage
    const percentage = (clickX / trackWidth) * 100;

    // Déplacement de la tête de lecture (en tenant compte de l'offset du label)
    playhead.style.left = `calc(${labelOffset}px + ${percentage}%)`;
}

// Début du clic/glisser
if (timelineArea) {
    timelineArea.addEventListener('mousedown', (e) => {
        isDragging = true;
        updatePlayheadPosition(e);
    });
}

// Déplacement de la souris sur toute la fenêtre pendant le glissement
window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updatePlayheadPosition(e);
    }
});

// Relâchement du clic
window.addEventListener('mouseup', () => {
    isDragging = false;
});


/* ==========================================================================
   3. DEFILEMENT VERS LES PROJETS AU CLIC SUR LES CLIPS V1
   ========================================================================== */
function scrollToProject(event, projectId) {
    // Empêche de déclencher le scrubbing lors du clic sur le clip
    event.stopPropagation();
    
    const targetElement = document.getElementById(projectId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Mise à jour de l'état actif visuel
        document.querySelectorAll('.project-card').forEach(card => card.classList.remove('active'));
        targetElement.classList.add('active');
    }
}