// Brochure Page Enhancements
document.addEventListener('DOMContentLoaded', function() {

    // Initialize all brochure functionality
    initBrochureFilters();
    initViewToggle();
    initDownloadTracking();
    initBrochurePreview();
    initSearchFunctionality();
    updateResultCount();

    // Search functionality
    function initSearchFunctionality() {
        const searchInput = document.getElementById('brochureSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const searchTerm = e.target.value.toLowerCase();
                    filterBrochures(searchTerm);
                }, 300);
            });

            // Clear search
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    filterBrochures('');
                }
            });
        }
    }

    // Category filter tabs
    function initBrochureFilters() {
        const categoryTabs = document.querySelectorAll('.category-tab');

        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();

                // Update active tab
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Get category
                const category = this.dataset.category;

                // Filter cards
                filterByCategory(category);

                // Track filter usage
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'filter_brochures', {
                        'event_category': 'brochure_interaction',
                        'event_label': category
                    });
                }
            });
        });
    }

    // Filter brochures by search term
    function filterBrochures(searchTerm) {
        const cards = document.querySelectorAll('.brochure-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const name = card.dataset.name.toLowerCase();
            const description = card.querySelector('.brochure-description').textContent.toLowerCase();
            const certifications = card.querySelector('.iso-info span').textContent.toLowerCase();

            if (name.includes(searchTerm) ||
                description.includes(searchTerm) ||
                certifications.includes(searchTerm)) {
                card.classList.remove('hidden');
                card.style.display = '';
                visibleCount++;
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
            }
        });

        updateResultCount(visibleCount);
    }

    // Filter by category
    function filterByCategory(category) {
        const cards = document.querySelectorAll('.brochure-card');
        let visibleCount = 0;

        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.classList.remove('hidden');
                card.style.display = '';
                visibleCount++;
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
            }
        });

        updateResultCount(visibleCount);

        // Clear search when changing category
        const searchInput = document.getElementById('brochureSearch');
        if (searchInput) {
            searchInput.value = '';
        }
    }

    // Update result count
    function updateResultCount(count) {
        const resultCountElement = document.querySelector('#resultCount span');
        if (resultCountElement) {
            if (count === undefined) {
                // Count visible cards
                count = document.querySelectorAll('.brochure-card:not(.hidden)').length;
            }
            resultCountElement.textContent = count;

            // Update text based on count
            const resultText = document.getElementById('resultCount');
            if (resultText) {
                if (count === 0) {
                    resultText.innerHTML = 'No products found';
                } else if (count === 1) {
                    resultText.innerHTML = 'Showing <span>1</span> product';
                } else {
                    resultText.innerHTML = `Showing <span>${count}</span> products`;
                }
            }
        }
    }

    // View toggle (Grid/List)
    function initViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const brochureGrid = document.getElementById('brochureGrid');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const view = this.dataset.view;

                // Update active button
                viewBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Toggle view
                if (brochureGrid) {
                    if (view === 'list') {
                        brochureGrid.classList.add('list-view');
                    } else {
                        brochureGrid.classList.remove('list-view');
                    }
                }

                // Save preference
                localStorage.setItem('brochureView', view);
            });
        });

        // Load saved preference
        const savedView = localStorage.getItem('brochureView');
        if (savedView === 'list') {
            document.querySelector('[data-view="list"]')?.click();
        }
    }

    // Download tracking
    function initDownloadTracking() {
        const downloadLinks = document.querySelectorAll('[data-track]');

        downloadLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const brochureName = this.dataset.track;

                // Track download
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'download', {
                        'event_category': 'brochure',
                        'event_label': brochureName,
                        'value': 1
                    });
                }

                // Visual feedback
                const originalContent = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
                this.disabled = true;

                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                    this.classList.add('btn-success');

                    setTimeout(() => {
                        this.innerHTML = originalContent;
                        this.disabled = false;
                        this.classList.remove('btn-success');
                    }, 2000);
                }, 1500);

                // Log to backend (optional)
                fetch('/api/track-download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        brochure: brochureName,
                        timestamp: new Date().toISOString()
                    })
                }).catch(err => console.log('Download tracking failed:', err));
            });
        });
    }

    // PDF Preview functionality
    function initBrochurePreview() {
        const previewBtns = document.querySelectorAll('.btn-preview');

        previewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const pdfUrl = this.dataset.pdf;

                // Create modal
                const modal = createPreviewModal(pdfUrl);
                document.body.appendChild(modal);

                // Track preview
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'preview', {
                        'event_category': 'brochure',
                        'event_label': pdfUrl.split('/').pop()
                    });
                }

                // Close modal handlers
                modal.querySelector('.modal-close').addEventListener('click', () => {
                    modal.remove();
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                    }
                });

                // Escape key to close
                document.addEventListener('keydown', function closeOnEscape(e) {
                    if (e.key === 'Escape') {
                        modal.remove();
                        document.removeEventListener('keydown', closeOnEscape);
                    }
                });
            });
        });
    }

    // Create preview modal
    function createPreviewModal(pdfUrl) {
        const modal = document.createElement('div');
        modal.className = 'pdf-preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Document Preview</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <iframe src="${pdfUrl}#view=FitH"
                            type="application/pdf"
                            width="100%"
                            height="600px">
                        <p>Your browser does not support PDF preview.
                           <a href="${pdfUrl}" download>Download the PDF</a> instead.</p>
                    </iframe>
                </div>
                <div class="modal-footer">
                    <a href="${pdfUrl}" download class="btn btn-primary">
                        <i class="fas fa-download"></i> Download Full Document
                    </a>
                    <button class="btn btn-secondary" onclick="this.closest('.pdf-preview-modal').remove()">
                        Close Preview
                    </button>
                </div>
            </div>
        `;

        // Add styles if not already present
        if (!document.getElementById('modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.innerHTML = `
                .pdf-preview-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s;
                }

                .pdf-preview-modal .modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 1000px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    animation: slideIn 0.3s;
                }

                .pdf-preview-modal .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #E8EDF2;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .pdf-preview-modal .modal-header h3 {
                    margin: 0;
                    color: var(--color-primary);
                }

                .pdf-preview-modal .modal-close {
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s;
                }

                .pdf-preview-modal .modal-close:hover {
                    background: #f5f5f5;
                    color: #333;
                }

                .pdf-preview-modal .modal-body {
                    flex: 1;
                    padding: 20px;
                    overflow: auto;
                }

                .pdf-preview-modal .modal-body iframe {
                    border: 1px solid #E8EDF2;
                    border-radius: 8px;
                }

                .pdf-preview-modal .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #E8EDF2;
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideIn {
                    from {
                        transform: translateY(-50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .pdf-preview-modal .modal-content {
                        width: 95%;
                        max-height: 95vh;
                    }

                    .pdf-preview-modal .modal-body iframe {
                        height: 400px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        return modal;
    }

    // Preload PDFs on hover
    document.querySelectorAll('.btn-preview, .btn-primary[download]').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            const pdf = this.dataset.pdf || this.href;
            if (pdf && pdf.endsWith('.pdf')) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = pdf;
                link.as = 'document';
                document.head.appendChild(link);
            }
        });
    });

    // Smooth scroll to sections when using nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation to certification cards
    const certCards = document.querySelectorAll('.cert-card');
    if (certCards.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const certObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.5s ease forwards';
                    certObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        certCards.forEach(card => {
            certObserver.observe(card);
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('brochureSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

});

// Export utilities for use in other scripts
window.brochureHelpers = {
    filterByCategory: function(category) {
        document.querySelector(`[data-category="${category}"]`)?.click();
    },

    searchBrochures: function(term) {
        const searchInput = document.getElementById('brochureSearch');
        if (searchInput) {
            searchInput.value = term;
            searchInput.dispatchEvent(new Event('input'));
        }
    },

    downloadBrochure: function(brochureName) {
        const downloadBtn = document.querySelector(`[data-track="${brochureName}"]`);
        if (downloadBtn) {
            downloadBtn.click();
        }
    }
};