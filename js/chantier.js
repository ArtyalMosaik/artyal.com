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
function next(chantiers, already_done = 0, allow_loop = false) {
  let transitionTime = transitionDuration * (1 - already_done);
  if (transitionTime < 0) {
    transitionTime = transitionDuration;
  }
  if (chantiers.current == chantiers.max) {
    if (chantiers.max == 0) {
      console.warn("Chantier n'a pas d'éléments");
      return;
    }
    if (allow_loop) {
      chantiers.current = 1;
      prev(chantiers, 0);
    } else set_chantier(chantiers, chantiers.current, transitionTime);
    console.log("Atteint la fin du chantier");
    return;
  }
  chantiers.current++;
  set_chantier(chantiers, chantiers.current, transitionTime);
}

// Fonction pour revenir à l'image précédente
function prev(chantiers, already_done = 0) {
  let transitionTime = transitionDuration * (1 - already_done);
  if (transitionTime < 0) {
    transitionTime = transitionDuration;
  }
  if (chantiers.current == 0) {
    set_chantier(chantiers, chantiers.current, transitionTime);
    console.log("Atteint le début du chantier");
    return;
  }
  chantiers.current--;
  set_chantier(chantiers, chantiers.current, transitionTime);
}

// Fonction pour définir la galerie de chantier
function set_chantier(chantiers, index = -1, transitionTime = transitionDuration) {
  if (index == -1) {
    index = chantiers.current;
  }
  if (index < 0 || index > chantiers.max) {
    console.warn("Index hors de portée");
    return;
  }

  for (let j = 0; j < chantiers.items.length; j++) {
    let image = chantiers.items[j];
    image.style.transitionDuration = transitionTime + "ms";
    image.style.transform = "translateX(" + (j - index) * 100 + "% )";
  }
}

// Fonction pour lier les événements de la galerie de chantier
function bind_chantier(chantiers) {
  let items = chantiers.querySelectorAll(".item");
  chantiers["items"] = items;
  chantiers["current"] = 0;
  chantiers["max"] = items.length - 1;

  set_chantier(chantiers, 0, 0);

  addEventListenerChildren(chantiers, "click", (event) => {
    if (Date.now() - last_touch < 500) {
      return;
    }
    let currentChantier = event.intendedTarget;
    let rect = currentChantier.getBoundingClientRect();
    let x = event.clientX - rect.left;
    cancel_hint(currentChantier);
    if (x > currentChantier.offsetWidth * 0.35) {
      next(currentChantier, 0, true);
    } else {
      prev(currentChantier);
    }
  });

  addEventListenerChildren(chantiers, "touchstart", function (event) {
    touch_startX = event.changedTouches[0].screenX;
    touch_startY = event.changedTouches[0].screenY;
  });

  addEventListenerChildren(chantiers, "touchmove", function (event) {
    let currentChantier = event.intendedTarget;
    cancel_hint(currentChantier);
    let touchPercentage =
      (event.changedTouches[0].screenX - touch_startX) /
      currentChantier.offsetWidth;
    for (let j = 0; j < currentChantier.items.length; j++) {
      let image = currentChantier.items[j];
      image.style.transitionDuration = 0 + "ms";
      image.style.transform =
        "translateX(" +
        (j - currentChantier.current + touchPercentage) * 100 +
        "% )";
    }
  });

  addEventListenerChildren(chantiers, "touchend", function (event) {
    last_touch = Date.now();
    let currentChantier = event.intendedTarget;
    touch_endX = event.changedTouches[0].screenX;
    touch_endY = event.changedTouches[0].screenY;
    let touchPercentage = (touch_endX - touch_startX) / chantiers.offsetWidth;
    if (
      Math.abs(touch_endY - touch_startY) > Math.abs(touch_endX - touch_startX)
    ) {
      set_chantier(currentChantier, -1, transitionDuration);
      return;
    } else if (touchPercentage > 0.2) {
      prev(currentChantier, Math.abs(touchPercentage));
    } else if (touchPercentage < -0.2) {
      next(currentChantier, Math.abs(touchPercentage), true);
    } else if (Math.abs(touchPercentage) > 0.1) {
      set_chantier(
        currentChantier,
        -1,
        Math.abs(touchPercentage) * transitionDuration
      );
    } else {
      const rect = currentChantier.getBoundingClientRect();
      const x = touch_endX - rect.left;
      if (x > chantiers.offsetWidth * 0.35) {
        next(currentChantier);
      } else {
        prev(currentChantier);
      }
    }
    cancel_hint(currentChantier);
  });

  chantiers.hint = setInterval(() => {
    hint_slide(chantiers);
  }, 2000);

  cancel_hint(chantiers);
}

function cancel_hint(chantiers) {
  clearInterval(chantiers.hint);
}

function hint_slide(chantiers) {
  set_chantier(chantiers, chantiers.current + 0.1, hintDuration / 2);
  setTimeout(() => {
    set_chantier(chantiers, chantiers.current, hintDuration / 2);
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

// Fetch the index.txt file from contentC
fetch("../contentC/index.txt")
  .then((response) => response.text())
  .then((data) => {
    const lines = data.split("\n");
    lines.forEach((line, index) => {
      const section = document.createElement("section");
      fetch(`../contentC/${line}/content.txt`)
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
            img.src = `../contentC/${line}/${image}`;
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
          bind_chantier(sliderDiv);
        });
      document.querySelector("main").appendChild(section);
    });
  });

