<?php
/**
 * Contact Form Handler for Hydro Benelux
 * Handles form submissions with rate limiting and email delivery
 */

session_start();
header('Content-Type: application/json');

// Configuration
define('CONTACT_EMAIL', 'info@hydrobenelux.eu');
define('FROM_EMAIL', 'noreply@hydrobenelux.eu');
define('COMPANY_NAME', 'Hydro Benelux');
define('MAX_SUBMISSIONS_PER_HOUR', 3);
define('RATE_LIMIT_WINDOW', 3600); // 1 hour in seconds

// Enable error reporting for debugging (disable in production)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

/**
 * Rate limiting function
 */
function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $rate_limit_key = 'contact_' . md5($ip);

    if (isset($_SESSION[$rate_limit_key])) {
        $attempts = $_SESSION[$rate_limit_key]['attempts'];
        $first_attempt = $_SESSION[$rate_limit_key]['first_attempt'];

        // Reset if time window has passed
        if (time() - $first_attempt >= RATE_LIMIT_WINDOW) {
            $_SESSION[$rate_limit_key] = [
                'attempts' => 1,
                'first_attempt' => time()
            ];
            return true;
        }

        // Check if limit exceeded
        if ($attempts >= MAX_SUBMISSIONS_PER_HOUR) {
            return false;
        }

        // Increment attempts
        $_SESSION[$rate_limit_key]['attempts']++;
        return true;
    } else {
        // First attempt
        $_SESSION[$rate_limit_key] = [
            'attempts' => 1,
            'first_attempt' => time()
        ];
        return true;
    }
}

/**
 * Validate email address
 */
function validateEmail($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    // Check for business email (optional - uncomment to enforce)
    // $freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    // $domain = substr(strrchr($email, "@"), 1);
    // if (in_array(strtolower($domain), $freeEmailDomains)) {
    //     return false;
    // }

    return true;
}

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Main processing
 */
try {
    // Check request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Check rate limit
    if (!checkRateLimit()) {
        throw new Exception('Too many submissions. Please try again in an hour.');
    }

    // Get and sanitize form data
    $full_name = isset($_POST['full_name']) ? sanitizeInput($_POST['full_name']) : '';
    $company = isset($_POST['company']) ? sanitizeInput($_POST['company']) : 'Not provided';
    $email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? sanitizeInput($_POST['phone']) : 'Not provided';
    $subject = isset($_POST['subject']) ? sanitizeInput($_POST['subject']) : '';
    $product = isset($_POST['product']) ? sanitizeInput($_POST['product']) : 'Not specified';
    $message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';
    $newsletter = isset($_POST['newsletter']) ? 'Yes' : 'No';
    $gdpr_consent = isset($_POST['gdpr_consent']) ? 'Yes' : 'No';

    // Validation
    $errors = [];

    if (strlen($full_name) < 2) {
        $errors[] = 'Name must be at least 2 characters';
    }

    if (!validateEmail($email)) {
        $errors[] = 'Please provide a valid email address';
    }

    if (empty($subject)) {
        $errors[] = 'Please select a subject';
    }

    if (strlen($message) < 10) {
        $errors[] = 'Message must be at least 10 characters';
    }

    if ($gdpr_consent !== 'Yes') {
        $errors[] = 'You must agree to the privacy policy';
    }

    if (!empty($errors)) {
        throw new Exception(implode('. ', $errors));
    }

    // Prepare email content
    $email_subject = "Website Contact: $subject - $full_name";

    $email_body = "
=================================================
NEW CONTACT FORM SUBMISSION
=================================================

CONTACT INFORMATION:
--------------------
Name: $full_name
Company: $company
Email: $email
Phone: $phone

INQUIRY DETAILS:
----------------
Subject: $subject
Product of Interest: $product
Newsletter Subscription: $newsletter

MESSAGE:
--------
$message

ADDITIONAL INFORMATION:
-----------------------
Date/Time: " . date('Y-m-d H:i:s') . " (CET)
IP Address: " . $_SERVER['REMOTE_ADDR'] . "
User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "
GDPR Consent: $gdpr_consent

=================================================
This message was sent from the Hydro Benelux website contact form.
=================================================
";

    // Email headers
    $headers = "From: " . COMPANY_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "X-Priority: 3\r\n"; // Normal priority
    $headers .= "X-Originating-IP: " . $_SERVER['REMOTE_ADDR'] . "\r\n";

    // Send email
    $mail_sent = mail(CONTACT_EMAIL, $email_subject, $email_body, $headers);

    if (!$mail_sent) {
        // Try alternative method or log error
        error_log("Failed to send contact form email to " . CONTACT_EMAIL);
        throw new Exception('Failed to send message. Please try again or contact us directly.');
    }

    // Send auto-reply to user (optional)
    $auto_reply_subject = "Thank you for contacting Hydro Benelux";
    $auto_reply_body = "
Dear $full_name,

Thank you for contacting Hydro Benelux. We have received your inquiry regarding \"$subject\" and will respond within 24 business hours.

Your Message:
-------------
$message

If you have any urgent matters, please call us at +32 2 555 1234 during business hours (Monday-Friday, 8:00 AM - 6:00 PM CET).

Best regards,
The Hydro Benelux Team

---
Hydro Benelux
Leading PE & PP Pipeline Manufacturer
Avenue de l'Industrie 12
1000 Brussels, Belgium
Tel: +32 2 555 1234
Email: info@hydrobenelux.eu
Web: www.hydrobenelux.eu

This is an automated response. Please do not reply to this email.
";

    $auto_reply_headers = "From: " . COMPANY_NAME . " <" . FROM_EMAIL . ">\r\n";
    $auto_reply_headers .= "MIME-Version: 1.0\r\n";
    $auto_reply_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Send auto-reply (optional - uncomment if desired)
    // mail($email, $auto_reply_subject, $auto_reply_body, $auto_reply_headers);

    // Log submission (optional - for analytics)
    $log_entry = date('Y-m-d H:i:s') . " | $email | $subject | " . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents('../logs/contact_submissions.log', $log_entry, FILE_APPEND | LOCK_EX);

    // Return success response
    echo json_encode([
        'success' => 'Thank you for your message! We will get back to you within 24 business hours.',
        'reference' => 'REF-' . date('Ymd') . '-' . substr(md5($email . time()), 0, 6)
    ]);

} catch (Exception $e) {
    // Return error response
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}

// Close session
session_write_close();
?>