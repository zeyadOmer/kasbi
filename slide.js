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


    let currentSlide = 0;

    function next() {
        console.log("Moving to the next slide");
        currentSlide = (currentSlide + 1) % document.querySelectorAll('.slide').length;
        updateSlider();
    }

    function goback() {
        console.log("Going back to the previous slide");
        currentSlide = (currentSlide - 1 + document.querySelectorAll('.slide').length) % document.querySelectorAll('.slide').length;
        updateSlider();
    }

    function updateSlider() {
        const slideWidth = document.querySelector('.slide').offsetWidth;
        const translateValue = -currentSlide * slideWidth;
        document.getElementById('slider').style.transform = 'translateX(' + translateValue + 'px)';
    }

