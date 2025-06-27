// Provided mock function - do not change
function mimicServerCall(url = "http://mimicServer.example.com", config = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Randomly fail 20% of the time
      let isRandomFailure = Math.random() < 0.2;
      if (isRandomFailure) {
        reject("Random server error. Try again.");
      } else {
        resolve("Pretend remote server notified of action!");
      }
    }, 300);
  });
}

// Select the modal and message area
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");

// Select all the hearts
const hearts = document.querySelectorAll(".like-glyph");

// Unicode characters for hearts
const EMPTY_HEART = '♡';
const FULL_HEART = '♥';

// Add event listeners to each heart
hearts.forEach(heart => {
  heart.addEventListener("click", () => {
    mimicServerCall()
      .then(() => {
        // If successful, toggle the heart
        if (heart.textContent === EMPTY_HEART) {
          heart.textContent = FULL_HEART;
          heart.classList.add("activated-heart");
        } else {
          heart.textContent = EMPTY_HEART;
          heart.classList.remove("activated-heart");
        }
      })
      .catch((error) => {
        // Show error modal
        modal.classList.remove("hidden");
        modalMessage.textContent = error;

        // Hide modal after 3 seconds
        setTimeout(() => {
          modal.classList.add("hidden");
        }, 3000);
      });
  });
});
