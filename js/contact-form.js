// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    const subjectSelect = document.getElementById('subject');
    const productGroup = document.getElementById('productGroup');
    const businessStatus = document.getElementById('businessStatus');

    // Character Counter
    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', function() {
            charCount.textContent = this.value.length;
            if (this.value.length > 1900) {
                charCount.style.color = '#E63946';
            } else {
                charCount.style.color = '#6C757D';
            }
        });
    }

    // Show product field for relevant subjects
    if (subjectSelect) {
        subjectSelect.addEventListener('change', function() {
            const showProductFor = ['Request Quote', 'Product Information', 'Sample Request'];
            if (showProductFor.includes(this.value)) {
                productGroup.style.display = 'block';
            } else {
                productGroup.style.display = 'none';
            }
        });
    }

    // Business Hours Check
    function checkBusinessHours() {
        const now = new Date();
        const brusselsTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Brussels"}));
        const day = brusselsTime.getDay();
        const hour = brusselsTime.getHours();

        const isOpen = day >= 1 && day <= 5 && hour >= 8 && hour < 18;

        if (businessStatus) {
            if (isOpen) {
                businessStatus.innerHTML = '<i class="fas fa-circle" style="color: #28a745;"></i> We\'re Open';
            } else {
                businessStatus.innerHTML = '<i class="fas fa-circle" style="color: #dc3545;"></i> We\'re Closed';
            }
        }
    }

    checkBusinessHours();
    setInterval(checkBusinessHours, 60000); // Update every minute

    // Form Submission Handler
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Clear previous errors
            clearErrors();

            // Validate form
            if (!validateForm()) {
                return false;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            const formData = new FormData(this);

            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            try {
                const response = await fetch('php/contact-handler.php', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    showMessage('success', data.success);
                    contactForm.reset();

                    // Reset character counter
                    if (charCount) {
                        charCount.textContent = '0';
                    }

                    // Hide product field
                    if (productGroup) {
                        productGroup.style.display = 'none';
                    }

                    // Track successful submission
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submit', {
                            'event_category': 'contact',
                            'event_label': formData.get('subject')
                        });
                    }
                } else {
                    showMessage('error', data.error || 'An error occurred. Please try again.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showMessage('error', 'Connection error. Please check your internet connection and try again.');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    // Form Validation
    function validateForm() {
        let isValid = true;

        // Name validation
        const nameInput = document.getElementById('full_name');
        if (nameInput && nameInput.value.trim().length < 2) {
            showError(nameInput, 'Please enter your full name (minimum 2 characters)');
            isValid = false;
        }

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput && !isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        // Subject validation
        const subjectInput = document.getElementById('subject');
        if (subjectInput && !subjectInput.value) {
            showError(subjectInput, 'Please select a subject');
            isValid = false;
        }

        // Message validation
        const messageInput = document.getElementById('message');
        if (messageInput && messageInput.value.trim().length < 10) {
            showError(messageInput, 'Please enter a message (minimum 10 characters)');
            isValid = false;
        }

        // GDPR consent validation
        const gdprConsent = document.getElementById('gdpr_consent');
        if (gdprConsent && !gdprConsent.checked) {
            showError(gdprConsent.closest('.checkbox-group'), 'You must agree to the privacy policy');
            isValid = false;
        }

        return isValid;
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show error message for input
    function showError(element, message) {
        const errorElement = element.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        element.classList.add('error');
    }

    // Clear all error messages
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
        document.querySelectorAll('.error').forEach(element => {
            element.classList.remove('error');
        });
    }

    // Show success/error message
    function showMessage(type, text) {
        const messageDiv = document.getElementById('formMessage');
        if (messageDiv) {
            messageDiv.className = `alert alert-${type}`;
            messageDiv.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                ${text}
            `;
            messageDiv.style.display = 'block';

            // Scroll to message
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            if (type === 'success') {
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 5000);
            }
        }
    }

    // Newsletter Form Handler
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[name="newsletter_email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            if (!isValidEmail(emailInput.value)) {
                alert('Please enter a valid email address');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            try {
                const response = await fetch('php/newsletter-handler.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: emailInput.value })
                });

                const data = await response.json();

                if (data.success) {
                    submitBtn.textContent = 'Subscribed!';
                    emailInput.value = '';

                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                    }, 3000);
                } else {
                    alert(data.error || 'Subscription failed. Please try again.');
                    submitBtn.textContent = originalText;
                }
            } catch (error) {
                alert('Connection error. Please try again.');
                submitBtn.textContent = originalText;
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // Request Callback Function
    window.requestCallback = function() {
        const subject = document.getElementById('subject');
        if (subject) {
            subject.value = 'Other';
            const message = document.getElementById('message');
            if (message) {
                message.value = 'Please call me back at your earliest convenience.\n\nBest time to call: ';
                message.focus();
            }
        }
    };

    // Check for URL parameters (for quote requests from products)
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubject = urlParams.get('subject');
    const urlProduct = urlParams.get('product');

    if (urlSubject === 'quote' && subjectSelect) {
        subjectSelect.value = 'Request Quote';
        subjectSelect.dispatchEvent(new Event('change'));

        if (urlProduct) {
            const productSelect = document.getElementById('product');
            if (productSelect) {
                productSelect.value = urlProduct;
            }

            const message = document.getElementById('message');
            if (message) {
                message.value = `I would like to request a quote for: ${urlProduct}\n\nQuantity needed: \nDelivery location: \nProject timeline: `;
            }
        }
    }

    // Input field animations
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        // Check initial values
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
});

// Export functions for use in other scripts
window.contactFormHelpers = {
    requestQuote: function(product) {
        window.location.href = `/contact.html?subject=quote&product=${encodeURIComponent(product)}`;
    },

    trackFormInteraction: function(action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'contact_form',
                'event_label': label
            });
        }
    }
};