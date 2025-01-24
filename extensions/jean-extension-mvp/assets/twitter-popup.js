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
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const twitterUrl = document.getElementById('twitter-url').value;
      
      // Send to your app's backend
      fetch('/apps/twitter-recommendations/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ twitterUrl })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          closeTwitterPopup();
          // Show success message
          alert('Twitter profile connected successfully!');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to connect Twitter profile. Please try again.');
      });
    });
  });