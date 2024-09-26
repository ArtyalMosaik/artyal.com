// index.js

document.addEventListener('DOMContentLoaded', () => {
    // Navigation fluide
    const navLinks = document.querySelectorAll('#navigation a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche le comportement par défaut
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Afficher un message au clic sur le projet
    const projectLink = document.querySelector('.texte-projet a');
    projectLink.addEventListener('click', () => {
        alert("Vous allez découvrir les projets !");
    });

    // Ouvrir les liens sociaux dans un nouvel onglet
    const socialLinks = document.querySelectorAll('#social a');
    socialLinks.forEach(link => {
        link.setAttribute('target', '_blank');
    });
});
