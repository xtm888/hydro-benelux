/* ===================================
   HYDRO BENELUX - MAIN JAVASCRIPT
   All interactive functionality
   =================================== */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // ===== STICKY HEADER =====
    const header = document.getElementById('header');
    let lastScrollTop = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add shadow when scrolled
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide/show header on scroll
        if (scrollTop > scrollThreshold) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down
                header.classList.add('hidden');
            } else {
                // Scrolling up
                header.classList.remove('hidden');
            }
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // ===== MOBILE MENU TOGGLE =====
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 767) {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnToggle = mobileMenuToggle.contains(event.target);

        if (!isClickInsideNav && !isClickOnToggle && mainNav.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        }
    });

    // ===== DROPDOWN MENU (MOBILE) =====
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 767) {
                e.preventDefault();
                const dropdown = this.closest('.dropdown');
                dropdown.classList.toggle('active');
            }
        });
    });

    // ===== BACK TO TOP BUTTON =====
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===== TESTIMONIAL SLIDER =====
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    let currentSlide = 0;
    let testimonialInterval;

    function showTestimonialSlide(index) {
        // Hide all slides
        testimonialSlides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Remove active class from all dots
        testimonialDots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show current slide and activate dot
        if (testimonialSlides[index]) {
            testimonialSlides[index].classList.add('active');
        }
        if (testimonialDots[index]) {
            testimonialDots[index].classList.add('active');
        }
    }

    function nextTestimonialSlide() {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showTestimonialSlide(currentSlide);
    }

    function startTestimonialAutoplay() {
        testimonialInterval = setInterval(nextTestimonialSlide, 5000);
    }

    function stopTestimonialAutoplay() {
        clearInterval(testimonialInterval);
    }

    // Dot click handlers
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentSlide = index;
            showTestimonialSlide(currentSlide);
            stopTestimonialAutoplay();
            startTestimonialAutoplay();
        });
    });

    // Start autoplay if slides exist
    if (testimonialSlides.length > 0) {
        startTestimonialAutoplay();

        // Pause on hover
        const testimonialSection = document.querySelector('.testimonials-slider');
        if (testimonialSection) {
            testimonialSection.addEventListener('mouseenter', stopTestimonialAutoplay);
            testimonialSection.addEventListener('mouseleave', startTestimonialAutoplay);
        }
    }

    // ===== STATISTICS COUNTER ANIMATION =====
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target + '+';
                }
            };

            updateCounter();
        });

        statsAnimated = true;
    }

    // Trigger animation when stats section is visible
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    // ===== SCROLL ANIMATIONS (FADE IN) =====
    const fadeElements = document.querySelectorAll('.card, .news-card, .product-card');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);

                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===== TABS FUNCTIONALITY =====
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ===== LANGUAGE SELECTOR =====
    const langLinks = document.querySelectorAll('.lang-link');
    langLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default for the active language (href="#")
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }

            // Store language preference
            const lang = this.textContent.trim();
            localStorage.setItem('preferredLanguage', lang);

            // Allow navigation to language-specific pages
            console.log('Language changed to: ' + lang);
        });
    });

    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        langLinks.forEach(link => {
            if (link.textContent.trim() === savedLang) {
                langLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }

    // ===== FORM VALIDATION =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Clear previous errors
            const errorMessages = document.querySelectorAll('.form-error');
            errorMessages.forEach(msg => msg.remove());

            let isValid = true;

            // Get form fields
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            const subjectField = document.getElementById('subject');
            const messageField = document.getElementById('message');

            // Validate name
            if (!nameField.value.trim()) {
                showError(nameField, 'Name is required');
                isValid = false;
            }

            // Validate email
            if (!emailField.value.trim()) {
                showError(emailField, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(emailField.value)) {
                showError(emailField, 'Please enter a valid email');
                isValid = false;
            }

            // Validate subject
            if (!subjectField.value.trim()) {
                showError(subjectField, 'Subject is required');
                isValid = false;
            }

            // Validate message
            if (!messageField.value.trim()) {
                showError(messageField, 'Message is required');
                isValid = false;
            } else if (messageField.value.trim().length < 10) {
                showError(messageField, 'Message must be at least 10 characters');
                isValid = false;
            }

            if (isValid) {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success';
                successMessage.textContent = 'Thank you! Your message has been sent successfully.';
                contactForm.insertBefore(successMessage, contactForm.firstChild);

                // Reset form
                contactForm.reset();

                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }
        });
    }

    function showError(field, message) {
        const error = document.createElement('div');
        error.className = 'form-error';
        error.textContent = message;
        field.parentElement.appendChild(error);
        field.style.borderColor = '#E63946';
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===== LAZY LOADING IMAGES =====
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    // ===== CONSOLE LOG (Optional) =====
    console.log('%c Hydro Benelux ', 'background: #2C3E50; color: #fff; padding: 10px 20px; font-size: 16px; font-weight: bold;');
    console.log('%c Website fully loaded and interactive ', 'background: #E63946; color: #fff; padding: 5px 10px;');

});
