const transitionDuration = 500;
const hintDuration = 500;
var touch_startX = 0;
var touch_endX = 0;
var touch_startY = 0;
var touch_endY = 0;

var cooldownEvent_ms = 10;
var last_touch = 0;

// Fonction pour ajouter un écouteur d'événements à un élément et ses enfants
function addEventListenerChildren(element, event, func) {
  var new_function = (triggered) => {
    if (
      element.last_event === event &&
      Date.now() - element.last_event_date < cooldownEvent_ms
    ) {
      return;
    }
    element.last_event = event;
    element.last_event_date = Date.now();
    triggered.intendedTarget = element;
    func(triggered);
  };

  let children = element.querySelectorAll("*");
  for (let i = 0; i < children.length; i++) {
    children[i].addEventListener(event, new_function);
  }
  element.addEventListener(event, new_function);
}

// Fonction pour passer à l'image suivante
function next(gallery, already_done = 0, allow_loop = false) {
  let transitionTime = transitionDuration * (1 - already_done);
  if (transitionTime < 0) {
    transitionTime = transitionDuration;
  }
  if (gallery.current == gallery.max) {
    if (gallery.max == 0) {
      console.warn("Galerie n'a pas d'éléments");
      return;
    }
    if (allow_loop) {
      gallery.current = 1;
      prev(gallery, 0);
    } else set_gallery(gallery, gallery.current, transitionTime);
    console.log("Atteint la fin de la galerie");
    return;
  }
  gallery.current++;
  set_gallery(gallery, gallery.current, transitionTime);
}

// Fonction pour revenir à l'image précédente
function prev(gallery, already_done = 0) {
  let transitionTime = transitionDuration * (1 - already_done);
  if (transitionTime < 0) {
    transitionTime = transitionDuration;
  }
  if (gallery.current == 0) {
    set_gallery(gallery, gallery.current, transitionTime);
    console.log("Atteint le début de la galerie");
    return;
  }
  gallery.current--;
  set_gallery(gallery, gallery.current, transitionTime);
}

// Fonction pour définir la galerie
function set_gallery(gallery, index = -1, transitionTime = transitionDuration) {
  if (index == -1) {
    index = gallery.current;
  }
  if (index < 0 || index > gallery.max) {
    console.warn("Index hors de portée");
    return;
  }

  for (let j = 0; j < gallery.items.length; j++) {
    let image = gallery.items[j];
    image.style.transitionDuration = transitionTime + "ms";
    image.style.transform = "translateX(" + (j - index) * 100 + "% )";
  }
}

// Fonction pour lier les événements de la galerie
function bind_gallery(gallery) {
  let items = gallery.querySelectorAll(".item");
  gallery["items"] = items;
  gallery["current"] = 0;
  gallery["max"] = items.length - 1;

  set_gallery(gallery, 0, 0);

  addEventListenerChildren(gallery, "click", (event) => {
    if (Date.now() - last_touch < 500) {
      return;
    }
    let currentGallery = event.intendedTarget;
    let rect = currentGallery.getBoundingClientRect();
    let x = event.clientX - rect.left;
    cancel_hint(currentGallery);
    if (x > currentGallery.offsetWidth * 0.35) {
      next(currentGallery, 0, true);
    } else {
      prev(currentGallery);
    }
  });

  addEventListenerChildren(gallery, "touchstart", function (event) {
    touch_startX = event.changedTouches[0].screenX;
    touch_startY = event.changedTouches[0].screenY;
  });

  addEventListenerChildren(gallery, "touchmove", function (event) {
    let currentGallery = event.intendedTarget;
    cancel_hint(currentGallery);
    let touchPercentage =
      (event.changedTouches[0].screenX - touch_startX) /
      currentGallery.offsetWidth;
    for (let j = 0; j < currentGallery.items.length; j++) {
      let image = currentGallery.items[j];
      image.style.transitionDuration = 0 + "ms";
      image.style.transform =
        "translateX(" +
        (j - currentGallery.current + touchPercentage) * 100 +
        "% )";
    }
  });

  addEventListenerChildren(gallery, "touchend", function (event) {
    last_touch = Date.now();
    let currentGallery = event.intendedTarget;
    touch_endX = event.changedTouches[0].screenX;
    touch_endY = event.changedTouches[0].screenY;
    let touchPercentage = (touch_endX - touch_startX) / gallery.offsetWidth;
    if (
      Math.abs(touch_endY - touch_startY) > Math.abs(touch_endX - touch_startX)
    ) {
      set_gallery(currentGallery, -1, transitionDuration);
      return;
    } else if (touchPercentage > 0.2) {
      prev(currentGallery, Math.abs(touchPercentage));
    } else if (touchPercentage < -0.2) {
      next(currentGallery, Math.abs(touchPercentage), true);
    } else if (Math.abs(touchPercentage) > 0.1) {
      set_gallery(
        currentGallery,
        -1,
        Math.abs(touchPercentage) * transitionDuration
      );
    } else {
      const rect = currentGallery.getBoundingClientRect();
      const x = touch_endX - rect.left;
      if (x > gallery.offsetWidth * 0.35) {
        next(currentGallery);
      } else {
        prev(currentGallery);
      }
    }
    cancel_hint(currentGallery);
  });

  gallery.hint = setInterval(() => {
    hint_slide(gallery);
  }, 2000);

  cancel_hint(gallery);
}

function cancel_hint(gallery) {
  clearInterval(gallery.hint);
}

function hint_slide(gallery) {
  set_gallery(gallery, gallery.current + 0.1, hintDuration / 2);
  setTimeout(() => {
    set_gallery(gallery, gallery.current, hintDuration / 2);
  }, hintDuration / 2);
}

function markdownToHtml(markdown) {
  markdown = markdown.replace(/^#### (.*$)/gim, "<h6>$1</h6>");
  markdown = markdown.replace(/^### (.*$)/gim, "<h5>$1</h5>");
  markdown = markdown.replace(/^## (.*$)/gim, "<h4>$1</h4>");
  markdown = markdown.replace(/^# (.*$)/gim, "<h3>$1</h3>");
  markdown = markdown.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
  markdown = markdown.replace(/__(.*)__/gim, "<strong>$1</strong>");
  markdown = markdown.replace(/\*(.*)\*/gim, "<em>$1</em>");
  markdown = markdown.replace(/_(.*)_/gim, "<em>$1</em>");
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
  markdown = markdown.replace(/\n$/gim, "<br />");
  markdown = markdown.replace(/^\>(.*)$/gim, "<blockquote>$1</blockquote>");
  markdown = markdown.replace(/<\/blockquote>\n<blockquote>/gim, "<br>");
  return markdown.trim();
}

// Fetch the index.txt file
fetch("../contentG/index.txt")
  .then((response) => response.text())
  .then((data) => {
    const lines = data.split("\n");
    lines.forEach((line, index) => {
      const section = document.createElement("section");
      fetch(`../contentG/${line}/content.txt`)
        .then((response) => response.text())
        .then((data) => {
          const sections = data.split("---");
          section.className = index % 2 === 0 ? "img-left" : "img-right";

          const contentDiv = document.createElement("div");
          contentDiv.className = "content";

          const title = document.createElement("h2");
          title.textContent = sections[0].trim();
          contentDiv.appendChild(title);

          const text = document.createElement("p");
          text.innerHTML = markdownToHtml(sections[2]);
          contentDiv.appendChild(text);

          section.appendChild(contentDiv);

          const sliderDiv = document.createElement("div");
          sliderDiv.className = "slider no-select";

          const images = sections[1].trim().split("\n");
          images.forEach((image, imageIndex) => {
            const img = document.createElement("img");
            img.src = `../contentG/${line}/${image}`;
            img.alt = `Image ${imageIndex + 1}`;
            img.className = "item";
            sliderDiv.appendChild(img);
          });

          const controls = document.createElement("div");
          controls.className = "controls";

          const prev = document.createElement("div");
          prev.className = "prev no-select";
          prev.innerHTML = "<";
          controls.appendChild(prev);

          const next = document.createElement("div");
          next.className = "next no-select";
          next.innerHTML = ">";
          controls.appendChild(next);
          sliderDiv.appendChild(controls);

          section.appendChild(sliderDiv);
          bind_gallery(sliderDiv);
        });
      document.querySelector("main").appendChild(section);
    });
  });
