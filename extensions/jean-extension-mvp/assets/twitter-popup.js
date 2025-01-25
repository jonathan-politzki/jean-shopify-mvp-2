function openTwitterPopup() {
    const dialog = document.getElementById('twitter-popup');
    dialog.showModal();
}
  
function closeTwitterPopup() {
    const dialog = document.getElementById('twitter-popup');
    dialog.close();
}
  
document.addEventListener('click', function(event) {
    const dialog = document.getElementById('twitter-popup');
    if (event.target === dialog) {
        dialog.close();
    }
});
  
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('twitter-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const twitterUrl = document.getElementById('twitter-url').value;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        try {
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;
            
            console.log('Sending request with URL:', twitterUrl);

            // Use the proper proxy endpoint format for theme extensions
            const appUrl = window.location.origin + '/apps/twitter-recommendations';
            const response = await fetch(appUrl + '/proxy/twitter-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ twitterUrl })
            });

            console.log('Raw response:', response);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new Error('Server returned invalid JSON');
            }
            
            if (data.success) {
                closeTwitterPopup();
                const message = `Successfully processed ${data.tweetCount} tweets for @${data.handle}`;
                alert(message);
            } else {
                throw new Error(data.error || 'Failed to process request');
            }
        } catch (error) {
            console.error('Full Error Details:', error);
            alert('Failed to connect Twitter profile. Please try again. ' + error.message);
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
});