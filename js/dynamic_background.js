document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c'];
    let currentColorIndex = 0;

    function changeBackgroundColor() {
        body.style.backgroundColor = colors[currentColorIndex];
        currentColorIndex = (currentColorIndex + 1) % colors.length;
    }

    setInterval(changeBackgroundColor, 3000); // Change color every 3 seconds
});
