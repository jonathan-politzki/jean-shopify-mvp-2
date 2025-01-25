function openTwitterPopup() {
    const dialog = document.getElementById('twitter-popup');
    dialog.showModal();
  }
  
  function closeTwitterPopup() {
    const dialog = document.getElementById('twitter-popup');
    dialog.close();
  }
  
  // Close popup when clicking outside
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
        
        const response = await fetch('/apps/twitter-recommendations/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ 
            twitterUrl,
            context: 'theme'
          })
        });

        const data = await response.json();
        
        if (data.success) {
          closeTwitterPopup();
          alert('Twitter profile connected! ' + (data.recommendations || 'Processing recommendations...'));
        } else {
          throw new Error(data.error || 'Failed to process request');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect Twitter profile. Please try again. ' + error.message);
      } finally {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  });