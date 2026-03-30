// ========================================
// GAMELOGGER - Interactive Functions
// ========================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initRatingSlider();
    initGameCards();
    initModals();
    initAnimations();
    initFormHandlers();
});

// Form handlers for AJAX submission
function initFormHandlers() {
    // Add Game form submission
    document.addEventListener('submit', function(e) {
        const form = e.target.closest('.game-form');
        if (form) {
            e.preventDefault();
            handleFormSubmit(form);
        }
    });
}

function handleFormSubmit(form) {
    const formData = new FormData(form);
    const isEdit = form.id === 'editGameForm';
    const action = isEdit ? '/Home/EditGame' : '/Home/AddGame';

    fetch(action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(isEdit ? 'Gra zaktualizowana!' : 'Gra dodana!', 'success');
            closeModal('gameModal');
            setTimeout(() => location.reload(), 500);
        } else {
            showNotification('Błąd podczas zapisu', 'error');
            console.error('Errors:', data.errors);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Błąd podczas zapisu', 'error');
    });
}

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // If it's a regular link (href starts with /), let it navigate normally
            if (this.getAttribute('href')?.startsWith('/')) {
                return;
            }

            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const section = this.dataset.section;
            if (section === 'add') {
                resetFormToNew();
                openModal('gameModal');
            } else if (section === 'stats') {
                loadStats();
            }
        });
    });
}

// Rating slider
function initRatingSlider() {
    document.querySelectorAll('.rating-slider-form').forEach(slider => {
        const valueDisplay = slider.nextElementSibling;
        if (slider && valueDisplay && valueDisplay.classList.contains('rating-value')) {
            slider.addEventListener('input', function () {
                valueDisplay.textContent = this.value;
                updateRatingColor(this.value);
            });
        }
    });
}

function updateRatingColor(value) {
    const valueDisplay = document.querySelector('#ratingValue');
    if (!valueDisplay) return;

    const colors = {
        low: '#ff4757',
        medium: '#ffa502',
        high: '#ffd700',
        excellent: '#00ff88'
    };

    let color;
    if (value <= 3) color = colors.low;
    else if (value <= 5) color = colors.medium;
    else if (value <= 7) color = colors.high;
    else color = colors.excellent;

    valueDisplay.style.color = color;
}

// Game card interactions
function initGameCards() {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.game-actions')) return;

            const gameId = this.dataset.gameId;
            if (gameId) {
                showGameDetails(gameId);
            }
        });
    });
}

// Modal functions
function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Reset form to add new game
function resetFormToNew() {
    const container = document.getElementById('gameFormContainer');
    const modalTitle = document.getElementById('modalTitle');

    if (container && modalTitle) {
        modalTitle.textContent = 'Dodaj Nową Grę';

        // Reset to empty form
        fetch('/Home/EditGame?id=0')
            .then(response => response.text())
            .then(html => {
                container.innerHTML = html;
            });
    }
}

// Open edit modal with game data
function openEditModal(gameId) {
    const container = document.getElementById('gameFormContainer');
    const modalTitle = document.getElementById('modalTitle');

    if (container && modalTitle) {
        modalTitle.textContent = 'Edytuj Grę';

        fetch(`/Home/EditGame?id=${gameId}`)
            .then(response => response.text())
            .then(html => {
                container.innerHTML = html;
                openModal('gameModal');
            })
            .catch(error => {
                console.error('Error loading game data:', error);
                showNotification('Błąd podczas ładowania danych', 'error');
            });
    }
}

// Search for game cover using IGDB
let searchDebounceTimer;
function searchGameCover() {
    const titleInput = document.getElementById('gameTitleInput');
    const coverInput = document.getElementById('coverImageUrlInput');
    const coverPreview = document.querySelector('#coverPreview img');

    if (!titleInput || !titleInput.value.trim()) {
        showNotification('Wprowadź tytuł gry przed wyszukaniem okładki', 'error');
        return;
    }

    const title = titleInput.value.trim();
    const searchBtn = document.querySelector('button[onclick="searchGameCover()"]');

    // Show loading state
    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    // Clear previous debounce
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(() => {
        fetch(`/Home/FetchCover?title=${encodeURIComponent(title)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.coverUrl) {
                    if (coverInput) coverInput.value = data.coverUrl;
                    if (coverPreview) coverPreview.src = data.coverUrl;
                    if (document.getElementById('coverPreview')) {
                        document.getElementById('coverPreview').style.display = 'block';
                    }
                    showNotification('Okładka pobrana!', 'success');
                } else {
                    showNotification('Nie znaleziono okładki. Sprawdź IGDB config lub wpisz URL ręcznie.', 'error');
                }
            })
            .catch(error => {
                console.error('Error fetching cover:', error);
                showNotification('Błąd podczas pobierania okładki', 'error');
            })
            .finally(() => {
                if (searchBtn) {
                    searchBtn.disabled = false;
                    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
                }
            });
    }, 500);
}

// Show game details
function showGameDetails(gameId) {
    const content = document.getElementById('detailContent');
    const title = document.getElementById('detailTitle');

    if (content) {
        const gameCard = document.querySelector(`[data-game-id="${gameId}"]`);
        if (gameCard) {
            const gameTitle = gameCard.querySelector('.game-title')?.textContent;
            title.textContent = gameTitle || 'Szczegóły Gry';

            const statusBadge = gameCard.querySelector('.status-badge');
            const statusText = statusBadge?.textContent || 'Brak statusu';
            const statusClass = statusBadge?.classList[1] || '';

            content.innerHTML = `
                <div style="text-align: center;">
                    <div style="display: inline-block; padding: 0.5rem 1rem; border-radius: 20px; margin-bottom: 1rem;
                        background: ${getStatusColor(statusClass)};
                        font-weight: 600; font-size: 0.85rem;">
                        ${statusText}
                    </div>
                </div>
                <p>Szczegóły gry będą dostępne w przyszłej wersji.</p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">ID: ${gameId}</p>
            `;
        }
    }

    openModal('detailModal');
}

function getStatusColor(statusClass) {
    switch (statusClass) {
        case 'backlog': return 'rgba(0, 212, 255, 0.2)';
        case 'playing': return 'rgba(139, 92, 246, 0.2)';
        case 'completed': return 'rgba(0, 255, 136, 0.2)';
        default: return 'rgba(100, 116, 139, 0.2)';
    }
}

// Load stats via AJAX
function loadStats() {
    fetch('/Home/Stats')
        .then(response => response.text())
        .then(html => {
            console.log('Stats loaded:', html);
        })
        .catch(error => console.error('Error loading stats:', error));
}

// Delete game with confirmation
function deleteGame(gameId, gameTitle) {
    if (confirm(`Czy na pewno chcesz usunąć "${gameTitle}"?`)) {
        fetch('/Home/DeleteGame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${gameId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Gra usunięta!', 'success');
                setTimeout(() => location.reload(), 500);
            }
        })
        .catch(error => {
            console.error('Error deleting game:', error);
            showNotification('Błąd podczas usuwania', 'error');
        });
    }
}

// Toggle game backlog status
function toggleBacklog(gameId) {
    fetch('/Home/ToggleBacklog', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${gameId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`Status zmieniony na: ${data.newStatus}`, 'success');
            setTimeout(() => location.reload(), 500);
        }
    })
    .catch(error => {
        console.error('Error toggling backlog:', error);
        showNotification('Błąd podczas zmiany statusu', 'error');
    });
}

// Update rating via AJAX
function updateRating(gameId, rating) {
    fetch('/Home/UpdateRating', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${gameId}&rating=${rating}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Ocena zaktualizowana!', 'success');
        }
    })
    .catch(error => {
        console.error('Error updating rating:', error);
        showNotification('Błąd podczas aktualizacji oceny', 'error');
    });
}

// Change game status
function changeGameStatus(gameId, newStatus, event) {
    if (event) event.stopPropagation();

    fetch('/Home/ChangeStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${gameId}&newStatus=${newStatus}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Status zmieniony!', 'success');
            setTimeout(() => location.reload(), 500);
        }
    })
    .catch(error => {
        console.error('Error changing status:', error);
        showNotification('Błąd podczas zmiany statusu', 'error');
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: var(--bg-card);
        border: 1px solid ${type === 'success' ? 'var(--accent-primary)' : type === 'error' ? 'var(--accent-pink)' : 'var(--accent-secondary)'};
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-primary);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add keyframe animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);

// Animations on scroll
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.game-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Filter by genre
function filterByGenre(genre) {
    document.querySelectorAll('.game-card').forEach(card => {
        const cardGenre = card.dataset.genre;
        const matches = !genre || cardGenre === genre;
        card.style.display = matches ? '' : 'none';
    });
}

// Sort games
function sortGames(sortBy) {
    const grid = document.querySelector('.games-grid');
    const cards = Array.from(grid.querySelectorAll('.game-card'));

    cards.sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.querySelector('.game-title').textContent.localeCompare(
                    b.querySelector('.game-title').textContent
                );
            case 'rating':
                return (parseFloat(b.dataset.rating) || 0) - (parseFloat(a.dataset.rating) || 0);
            case 'date':
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            default:
                return 0;
        }
    });

    cards.forEach(card => grid.appendChild(card));
}

// Export functions for global access
window.openModal = openModal;
window.closeModal = closeModal;
window.deleteGame = deleteGame;
window.updateRating = updateRating;
window.showNotification = showNotification;
window.filterByGenre = filterByGenre;
window.sortGames = sortGames;
window.openEditModal = openEditModal;
window.searchGameCover = searchGameCover;
window.toggleBacklog = toggleBacklog;
window.changeGameStatus = changeGameStatus;
window.resetFormToNew = resetFormToNew;
