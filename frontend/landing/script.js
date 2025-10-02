// Animate text letter by letter
function animateLetters(id, delayStep = 0.08, startDelay = 0) {
    const element = document.getElementById(id);
    const text = element.innerText;
    element.innerHTML = '';
    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.innerHTML = char === ' ' ? '&nbsp;' : char;
        span.classList.add('letter');
        span.style.animationDelay = `${startDelay + i * delayStep}s`;
        element.appendChild(span);
    });
}
fetch("http://localhost:5001/api/files?type=logo")
  .then(res => res.json())
  .then(data => {
    const logoUrl = data[0].url; // this now exists
    const img = document.createElement("img");
    img.src = logoUrl;
    img.alt = "Fixora Logo";
    img.width = 150;
    document.getElementById("logo-container").innerHTML = "";
    document.getElementById("logo-container").appendChild(img);
  })
  .catch(err => console.error(err));

// Animate hero title
animateLetters('hero-title', 0.08, 0);

// Animate hero subtitle after title finishes
const heroTitleLength = document.getElementById('hero-title').innerText.length;
const subtitleDelay = heroTitleLength * 0.08 + 0.3;
animateLetters('hero-subtitle', 0.03, subtitleDelay);
// Animate buttons after subtitle finishes
const heroSubtitleLength = document.getElementById('hero-subtitle').innerText.length;
const buttonsStartDelay = heroTitleLength * 0.08 + heroSubtitleLength * 0.03 + 0.3;

document.querySelectorAll('.cta-buttons button').forEach((btn, i) => {
    btn.style.animationDelay = `${buttonsStartDelay + i * 0.2}s`; // small stagger between buttons
});


// Button click events
document.getElementById('loginBtn').onclick = () => { window.location.href = '../login-choice.html'; };
document.getElementById('signupBtn').onclick = () => { window.location.href = '../signup-choice.html'; };
document.getElementById('reportBtn').onclick = () => { window.location.href = '../signup.html'; };
document.getElementById('exploreBtn').onclick = () => { alert("Explore City feature coming soon!"); };
