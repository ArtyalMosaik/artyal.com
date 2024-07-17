const transitionDuration = 500;
const hintDuration = 500;
var touch_startX = 0;
var touch_endX = 0;
var touch_startY = 0;
var touch_endY = 0;

var cooldownEvent_ms = 10;

var last_touch = 0;

function addEventListenerChildren(element, event, func) {
  // This function adds an event listener to an element and all its children
  // The event listener widget will be the parent element
  // The event listener will be added to all the children
  var new_function = (triggered) => {
    // Add a cooldown to avoid double triggering
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

  // We add the event listener to all the children
  let children = element.querySelectorAll("*");
  for (let i = 0; i < children.length; i++) {
    children[i].addEventListener(event, new_function);
  }
  // We add the event listener to the element
  element.addEventListener(event, new_function);
}

function next(gallery, already_done = 0, allow_loop = false) {
  let transitionTime = transitionDuration * (1 - already_done);

  if (transitionTime < 0) {
    transitionTime = transitionDuration;
  }

  if (gallery.current == gallery.max) {
    if (gallery.max == 0) {
      console.warn("Gallery has no items");
      return;
    }
    if (allow_loop) {
      gallery.current = 1;
      prev(gallery, 0);
    } else set_gallery(gallery, gallery.current, transitionTime);
    console.log("Reached end of gallery");
    return;
  }
  gallery.current++;
  set_gallery(gallery, gallery.current, transitionTime);
}

function prev(gallery, already_done = 0) {
  let transitionTime = transitionDuration * (1 - already_done);

  if (transitionTime < 0) {
    transitionTime = transitionDuration;
  }

  if (gallery.current == 0) {
    set_gallery(gallery, gallery.current, transitionTime);
    console.log("Reached start of gallery");
    return;
  }
  gallery.current--;
  set_gallery(gallery, gallery.current, transitionTime);
}

function set_gallery(gallery, index = -1, transitionTime = transitionDuration) {
  if (index == -1) {
    index = gallery.current;
  }
  if (index < 0 || index > gallery.max) {
    console.warn("Index out of range");
    return;
  }
  // Set the aspect ratio of the gallery to the aspect ratio of the current image
  //let currentImage = gallery.items[index];
  //let aspectRatio = currentImage.naturalWidth / currentImage.naturalHeight;
  //gallery.style.aspectRatio = aspectRatio;

  for (let j = 0; j < gallery.items.length; j++) {
    let image = gallery.items[j];
    image.style.transitionDuration = transitionTime + "ms";
    image.style.transform = "translateX(" + (j - index) * 100 + "% )";
  }
}

function bind_gallery(gallery) {
  let items = gallery.querySelectorAll(".item");
  gallery["items"] = items;
  gallery["current"] = 0;
  gallery["max"] = items.length - 1;

  set_gallery(gallery, 0, 0);

  addEventListenerChildren(gallery, "click", (event) => {
    if (Date.now() - last_touch < 500) {
      // Avoid the click to be triggered after a swipe
      return;
    }
    // If the click is on the 65% right part, call next, else call right
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

  // We add the ability to swipe left and right, the view should follow the finger
  addEventListenerChildren(gallery, "touchstart", function (event) {
    //console.log("touchstart");
    //event.preventDefault();
    touch_startX = event.changedTouches[0].screenX;
    touch_startY = event.changedTouches[0].screenY;
  });
  // When the finger moves, we move the gallery
  addEventListenerChildren(gallery, "touchmove", function (event) {
    //event.preventDefault();

    let currentGallery = event.intendedTarget;

    cancel_hint(currentGallery);

    //console.log("touchmove");
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
  // When the finger is released, we check if the swipe was enough to change the image
  addEventListenerChildren(gallery, "touchend", function (event) {
    //console.log("touchend");

    last_touch = Date.now();
    //event.preventDefault();
    let currentGallery = event.intendedTarget;
    touch_endX = event.changedTouches[0].screenX;
    touch_endY = event.changedTouches[0].screenY;
    let touchPercentage = (touch_endX - touch_startX) / gallery.offsetWidth;
    console.log(touchPercentage);
    if (
      Math.abs(touch_endY - touch_startY) > Math.abs(touch_endX - touch_startX)
    ) {
      // If the swipe is vertical, we do nothing
      set_gallery(currentGallery, -1, transitionDuration);
      return;
    } else if (touchPercentage > 0.2) {
      prev(currentGallery, Math.abs(touchPercentage));
    } else if (touchPercentage < -0.2) {
      next(currentGallery, Math.abs(touchPercentage), true); // true to allow loop
    } else if (Math.abs(touchPercentage) > 0.1) {
      set_gallery(
        currentGallery,
        -1,
        Math.abs(touchPercentage) * transitionDuration
      );
    } else {
      // Click
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

  // Schedule a hint to show the user that he can swipe
  // When the item becomes visible
  gallery.hint = setInterval(() => {
    hint_slide(gallery);
  }, 2000);

  // TEMPORARY
  cancel_hint(gallery);
}

function cancel_hint(gallery) {
  // This function cancels the hint to show the user that he can swipe
  clearInterval(gallery.hint);
}

function hint_slide(gallery) {
  // This function shifts the gallery to the right slightly and then back to the left
  // It is used to show the user that he can swipe

  // We shift the gallery to the right
  set_gallery(gallery, gallery.current + 0.1, hintDuration / 2);
  // We shift the gallery back to the left
  setTimeout(() => {
    set_gallery(gallery, gallery.current, hintDuration / 2);
  }, hintDuration / 2);
}

function markdownToHtml(markdown) {
  // Convert headers
  markdown = markdown.replace(/^##### (.*$)/gim, "<h6>$1</h6>");
  markdown = markdown.replace(/^#### (.*$)/gim, "<h5>$1</h5>");
  markdown = markdown.replace(/^### (.*$)/gim, "<h4>$1</h4>");
  markdown = markdown.replace(/^## (.*$)/gim, "<h3>$1</h3>");
  markdown = markdown.replace(/^# (.*$)/gim, "<h2>$1</h2>");

  // Convert bold text
  markdown = markdown.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
  markdown = markdown.replace(/__(.*)__/gim, "<strong>$1</strong>");

  // Convert italic text
  markdown = markdown.replace(/\*(.*)\*/gim, "<em>$1</em>");
  markdown = markdown.replace(/_(.*)_/gim, "<em>$1</em>");

  // Convert links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  // Convert line breaks
  markdown = markdown.replace(/\n$/gim, "<br />");

  return markdown.trim();
}

// Fetch the index.txt file
fetch("/content/index.txt")
  .then((response) => response.text())
  .then((data) => {
    // Split the data into lines
    const lines = data.split("\n");

    // For each line, fetch the content.txt file
    lines.forEach((line, index) => {
      // Create a new section element
      const section = document.createElement("section");
      fetch(`/content/${line}/content.txt`)
        .then((response) => response.text())
        .then((data) => {
          // Split the data into sections
          const sections = data.split("---");

          section.className = index % 2 === 0 ? "img-left" : "img-right";

          // Create a new div for the content
          const contentDiv = document.createElement("div");
          contentDiv.className = "content";

          // Create a new h2 for the title
          const title = document.createElement("h2");
          title.textContent = sections[0].trim();
          contentDiv.appendChild(title);

          // Create a new p for the text content (With line breaks)
          const text = document.createElement("p");
          text.innerHTML = markdownToHtml(sections[2]);
          contentDiv.appendChild(text);

          // Append the content div to the section
          section.appendChild(contentDiv);

          // Create a new div for the slider
          const sliderDiv = document.createElement("div");
          sliderDiv.className = "slider";

          // Split the images into lines
          const images = sections[1].trim().split("\n");

          // For each image, create a new img element
          images.forEach((image, imageIndex) => {
            const img = document.createElement("img");
            img.src = `/content/${line}/${image}`;
            img.alt = `Image ${imageIndex + 1}`;
            img.className = "item";
            sliderDiv.appendChild(img);
          });

          // Add the controls
          /*<div class="controls">
          <div class="prev">
          ←
          </div>
          <div class="next">
          →
          </div>
          </div>
          */
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

          // Append the slider div to the section
          section.appendChild(sliderDiv);
          bind_gallery(sliderDiv);
        });
      // Append the section to the main element
      document.querySelector("main").appendChild(section);
    });
  });
