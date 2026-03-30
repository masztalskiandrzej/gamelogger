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
});

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Remove active from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked link
            this.classList.add('active');

            const section = this.dataset.section;
            if (section === 'add') {
                openModal('gameModal');
            } else if (section === 'stats') {
                loadStats();
            }
        });
    });
}

// Rating slider
function initRatingSlider() {
    const slider = document.getElementById('ratingSlider');
    const valueDisplay = document.getElementById('ratingValue');

    if (slider && valueDisplay) {
        slider.addEventListener('input', function () {
            valueDisplay.textContent = this.value;
            updateRatingColor(this.value);
        });
    }
}

function updateRatingColor(value) {
    const valueDisplay = document.getElementById('ratingValue');
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
            // Don't trigger if clicking action buttons
            if (e.target.closest('.game-actions')) return;

            const gameId = this.dataset.gameId;
            if (gameId) {
                showGameDetails(gameId);
            }
        });

        // Add hover sound effect simulation (visual feedback)
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// Modal functions
function initModals() {
    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Close modal on Escape key
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

// Show game details
function showGameDetails(gameId) {
    // This would normally fetch data from the server
    // For now, we'll show a placeholder
    const content = document.getElementById('detailContent');
    const title = document.getElementById('detailTitle');

    if (content) {
        // Find game data from page
        const gameCard = document.querySelector(`[data-game-id="${gameId}"]`);
        if (gameCard) {
            const gameTitle = gameCard.querySelector('.game-title')?.textContent;
            title.textContent = gameTitle || 'Szczegóły Gry';

            content.innerHTML = `
                <div class="game-detail">
                    <p>Loading game details...</p>
                    <p>This feature will be fully implemented in the next update.</p>
                </div>
            `;
        }
    }

    openModal('detailModal');
}

// Load stats via AJAX
function loadStats() {
    fetch('/Home/Stats')
        .then(response => response.text())
        .then(html => {
            // Show stats in a modal or dedicated section
            console.log('Stats loaded:', html);
        })
        .catch(error => console.error('Error loading stats:', error));
}

// Delete game with confirmation
function deleteGame(gameId, gameTitle) {
    if (confirm(`Czy na pewno chcesz usunąć "${gameTitle}" z biblioteki?`)) {
        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/Home/DeleteGame';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'id';
        input.value = gameId;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    }
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

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles dynamically
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: var(--bg-card);
        border: 1px solid var(--${type === 'success' ? 'accent-primary' : type === 'error' ? 'accent-pink' : 'accent-secondary'});
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

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add keyframe animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
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

    // Observe game cards and stat cards
    document.querySelectorAll('.game-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('.game-card').forEach(card => {
                    const title = card.querySelector('.game-title')?.textContent.toLowerCase() || '';
                    const matches = title.includes(searchTerm);
                    card.style.display = matches ? '' : 'none';
                });
            }, 300);
        });
    }
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

// Quick rating buttons on game cards
function initQuickRating() {
    document.querySelectorAll('.quick-rating').forEach(container => {
        const buttons = container.querySelectorAll('.rating-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const gameId = this.closest('.game-card').dataset.gameId;
                const rating = this.dataset.rating;
                updateRating(gameId, rating);
            });
        });
    });
}

// Initialize all on load
window.addEventListener('load', function () {
    initSearch();
    initQuickRating();
});

// Export functions for global access
window.openModal = openModal;
window.closeModal = closeModal;
window.deleteGame = deleteGame;
window.updateRating = updateRating;
window.showNotification = showNotification;
window.filterByGenre = filterByGenre;
window.sortGames = sortGames;
