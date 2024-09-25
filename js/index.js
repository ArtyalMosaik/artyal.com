// Assurez-vous que le DOM est entièrement chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", function () {
    // Alerte de bienvenue
    alert("Bienvenue sur le site d'ARTYAL Mozaïk !");

    // Gestion du menu hamburger
    const menuButton = document.createElement("button");
    menuButton.id = "menu-button";
    menuButton.innerText = "Menu"; // Texte du bouton
    document.body.insertBefore(menuButton, document.getElementById("navigation"));

    const nav = document.getElementById("navigation");

    menuButton.addEventListener("click", function () {
        nav.classList.toggle("visible"); // Ajoute ou enlève la classe pour afficher/masquer le menu
        if (nav.classList.contains("visible")) {
            menuButton.innerText = "Fermer"; // Change le texte quand le menu est ouvert
        } else {
            menuButton.innerText = "Menu"; // Réinitialise le texte quand le menu est fermé
        }
    });

    // Scroll smooth au clic des liens de navigation
    const nav
