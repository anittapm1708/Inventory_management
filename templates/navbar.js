document.addEventListener("DOMContentLoaded", function() {
    fetch("/templates/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector("header").innerHTML = data;
        });
});
