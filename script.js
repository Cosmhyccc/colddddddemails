document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const recipientInput = document.getElementById('recipient');
    const ideaInput = document.getElementById('idea');
    const generateBtn = document.getElementById('generate-btn');
    const generateNewBtn = document.getElementById('generate-new-btn');
    const loadingSection = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const emailContents = document.querySelectorAll('.email-content');
    const copyButtons = document.querySelectorAll('.copy-btn');

    // Generate emails when the button is clicked
    generateBtn.addEventListener('click', () => {
        const recipient = recipientInput.value.trim();
        const idea = ideaInput.value.trim();

        if (!recipient || !idea) {
            alert('Please fill in both fields');
            return;
        }

        // Show loading spinner
        loadingSection.style.display = 'block';
        resultsSection.style.display = 'none';

        // Generate emails using our backend API
        generateEmailsWithAI(recipient, idea);
    });

    // Generate new emails
    generateNewBtn.addEventListener('click', () => {
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'none';
        recipientInput.value = '';
        ideaInput.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Copy email to clipboard
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emailIndex = button.getAttribute('data-email');
            const emailContent = document.querySelector(`#email-${emailIndex} .email-content`).textContent;
            
            navigator.clipboard.writeText(emailContent)
                .then(() => {
                    // Change button text temporarily
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        });
    });

    // Handle feedback buttons
    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    feedbackButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emailIndex = button.getAttribute('data-email');
            const feedbackType = button.getAttribute('data-feedback');
            const emailContent = document.querySelector(`#email-${emailIndex} .email-content`).textContent;
            
            // Get the current recipient and idea from the input fields
            const recipient = recipientInput.value.trim();
            const idea = ideaInput.value.trim();
            
            // Mark this button as active and remove active class from sibling
            const parentButtons = button.closest('.feedback-buttons');
            parentButtons.querySelectorAll('.feedback-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Send feedback to the server
            sendFeedback(emailIndex, feedbackType, recipient, idea, emailContent);
        });
    });

    // Function to generate emails using our backend API
    async function generateEmailsWithAI(recipient, idea) {
        const styles = [
            'formal and professional',
            'conversational and friendly',
            'enthusiastic and concise'
        ];
        
        const emails = [];
        
        try {
            // Reset any previous feedback
            document.querySelectorAll('.feedback-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Generate each email variation one by one
            for (let i = 0; i < styles.length; i++) {
                const email = await generateSingleEmail(recipient, idea, styles[i]);
                emails.push(email);
            }
            
            // Display the generated emails
            for (let i = 0; i < emailContents.length; i++) {
                emailContents[i].textContent = emails[i];
            }
            
            // Hide loading, show results
            loadingSection.style.display = 'none';
            resultsSection.style.display = 'block';
            
            // Smooth scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error generating emails:', error);
            alert('Error generating emails. Please try again.');
            loadingSection.style.display = 'none';
        }
    }
    
    // Function to generate a single email using our backend API
    async function generateSingleEmail(recipient, idea, style) {
        try {
            const response = await fetch('/api/generate-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient,
                    idea,
                    style
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.email;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Function to send feedback to the server
    async function sendFeedback(emailIndex, feedback, recipient, idea, emailContent) {
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailIndex,
                    feedback,
                    recipient,
                    idea,
                    emailContent
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Feedback sent successfully:', data);
        } catch (error) {
            console.error('Error sending feedback:', error);
        }
    }
});
