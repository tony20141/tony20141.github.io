console.log("Portfolio website loaded.");

// Add dark mode styles
const darkModeStyles = document.createElement('style');
darkModeStyles.textContent = `
  body.dark-mode {
    background-color: #121212;
    color: #e0e0e0;
  }
  
  body.dark-mode .nav-container {
    background: rgba(30, 30, 30, 0.95);
  }
  
  body.dark-mode .nav-links a {
    color: #e0e0e0;
  }
  
  body.dark-mode .project, 
  body.dark-mode .about-me-frame {
    background-color: #1e1e1e;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
  
  body.dark-mode .project h3 {
    background-color: #2a2a2a;
    border-bottom: 1px solid #333;
  }
  
  body.dark-mode .project p {
    color: #b0b0b0;
  }
  
  body.dark-mode footer {
    background-color: #1a1a1a;
  }
  
  body.dark-mode .btn {
    background-color: #0088ff;
  }
  
  body.dark-mode .btn:hover {
    background-color: #0066cc;
  }
`;
document.head.appendChild(darkModeStyles);

// Smooth scrolling for navigation
document.querySelectorAll('.nav-links a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    window.scrollTo({
      top: targetElement.offsetTop - 80,
      behavior: 'smooth'
    });
  });
});

// Save dark mode preference in local storage
const themeToggle = document.querySelector('.theme-toggle');
const icon = themeToggle.querySelector('i');

// Check for saved preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  icon.classList.remove('fa-moon');
  icon.classList.add('fa-sun');
}

// Toggle dark mode
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  if (document.body.classList.contains('dark-mode')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    localStorage.setItem('darkMode', 'true');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    localStorage.setItem('darkMode', 'false');
  }
});

// Fade-in animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Once the animation is complete, stop observing
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Start observing elements
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
  });
});

// Add a slight delay between animations for a cascade effect
document.querySelectorAll('.project').forEach((project, index) => {
  project.style.transitionDelay = `${index * 0.1}s`;
});
