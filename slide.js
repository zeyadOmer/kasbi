$(document).ready(function() {
    let currentIndex = 0;
    const slides = $(".slide");
    const totalSlides = slides.length;

    function showSlide(index) {
        if (index < 0) {
            index = totalSlides - 1;
        } else if (index >= totalSlides) {
            index = 0;
        }

        const translateX = -index * 100 + "%";
        $(".slider").css("transform", "translateX(" + translateX + ")");
        currentIndex = index;
    }

    setInterval(function() {
        showSlide(currentIndex + 1);
    }, 5000); // Change slides every 5 seconds

    showSlide(currentIndex);

    // Optional: Add previous and next buttons for manual navigation
    $(".prev-btn").click(function() {
        showSlide(currentIndex - 1);
    });

    $(".next-btn").click(function() {
        showSlide(currentIndex + 1);
    });
});
