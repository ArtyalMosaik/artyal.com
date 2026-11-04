// Slider tactile / clic des pages Galerie et Chantiers.
// Le HTML (sections, images, boutons) est généré au build ; ce script ne fait que le rendre interactif.

const transitionDuration = 500;
const cooldownEvent_ms = 10;

let touch_startX = 0;
let touch_endX = 0;
let touch_startY = 0;
let touch_endY = 0;
let last_touch = 0;

interface Slider extends HTMLElement {
  items: NodeListOf<HTMLElement>;
  current: number;
  max: number;
  last_event?: string;
  last_event_date?: number;
}

type SliderEvent = Event & { intendedTarget: Slider };

// Ajoute un écouteur d'événements à un élément et à tous ses enfants (avec anti-rebond)
function addEventListenerChildren(element: Slider, event: string, func: (e: SliderEvent) => void) {
  const handler = (triggered: Event) => {
    if (
      element.last_event === event &&
      Date.now() - (element.last_event_date ?? 0) < cooldownEvent_ms
    ) {
      return;
    }
    element.last_event = event;
    element.last_event_date = Date.now();
    (triggered as SliderEvent).intendedTarget = element;
    func(triggered as SliderEvent);
  };

  element.querySelectorAll('*').forEach((child) => child.addEventListener(event, handler));
  element.addEventListener(event, handler);
}

// Passe à l'image suivante
function next(slider: Slider, already_done = 0, allow_loop = false) {
  let transitionTime = transitionDuration * (1 - already_done);
  if (transitionTime < 0) {
    transitionTime = transitionDuration;
  }
  if (slider.current == slider.max) {
    if (slider.max == 0) {
      return;
    }
    if (allow_loop) {
      slider.current = 1;
      prev(slider, 0);
    } else set_slider(slider, slider.current, transitionTime);
    return;
  }
  slider.current++;
  set_slider(slider, slider.current, transitionTime);
}

// Revient à l'image précédente
function prev(slider: Slider, already_done = 0) {
  let transitionTime = transitionDuration * (1 - already_done);
  if (transitionTime < 0) {
    transitionTime = transitionDuration;
  }
  if (slider.current == 0) {
    set_slider(slider, slider.current, transitionTime);
    return;
  }
  slider.current--;
  set_slider(slider, slider.current, transitionTime);
}

// Positionne les images du slider
function set_slider(slider: Slider, index = -1, transitionTime = transitionDuration) {
  if (index == -1) {
    index = slider.current;
  }
  if (index < 0 || index > slider.max) {
    return;
  }

  for (let j = 0; j < slider.items.length; j++) {
    const image = slider.items[j]!;
    image.style.transitionDuration = transitionTime + 'ms';
    image.style.transform = 'translateX(' + (j - index) * 100 + '% )';
  }
}

// Lie les événements d'un slider
function bind_slider(el: HTMLElement) {
  const slider = el as Slider;
  slider.items = slider.querySelectorAll<HTMLElement>('.item');
  slider.current = 0;
  slider.max = slider.items.length - 1;

  set_slider(slider, 0, 0);

  addEventListenerChildren(slider, 'click', (event) => {
    if (Date.now() - last_touch < 500) {
      return;
    }
    const current = event.intendedTarget;
    const rect = current.getBoundingClientRect();
    const x = (event as unknown as MouseEvent).clientX - rect.left;
    if (x > current.offsetWidth * 0.35) {
      next(current, 0, true);
    } else {
      prev(current);
    }
  });

  addEventListenerChildren(slider, 'touchstart', (event) => {
    const touch = (event as unknown as TouchEvent).changedTouches[0]!;
    touch_startX = touch.screenX;
    touch_startY = touch.screenY;
  });

  addEventListenerChildren(slider, 'touchmove', (event) => {
    const current = event.intendedTarget;
    const touch = (event as unknown as TouchEvent).changedTouches[0]!;
    const touchPercentage = (touch.screenX - touch_startX) / current.offsetWidth;
    for (let j = 0; j < current.items.length; j++) {
      const image = current.items[j]!;
      image.style.transitionDuration = 0 + 'ms';
      image.style.transform = 'translateX(' + (j - current.current + touchPercentage) * 100 + '% )';
    }
  });

  addEventListenerChildren(slider, 'touchend', (event) => {
    last_touch = Date.now();
    const current = event.intendedTarget;
    const touch = (event as unknown as TouchEvent).changedTouches[0]!;
    touch_endX = touch.screenX;
    touch_endY = touch.screenY;
    const touchPercentage = (touch_endX - touch_startX) / slider.offsetWidth;
    if (Math.abs(touch_endY - touch_startY) > Math.abs(touch_endX - touch_startX)) {
      set_slider(current, -1, transitionDuration);
      return;
    } else if (touchPercentage > 0.2) {
      prev(current, Math.abs(touchPercentage));
    } else if (touchPercentage < -0.2) {
      next(current, Math.abs(touchPercentage), true);
    } else if (Math.abs(touchPercentage) > 0.1) {
      set_slider(current, -1, Math.abs(touchPercentage) * transitionDuration);
    } else {
      const rect = current.getBoundingClientRect();
      const x = touch_endX - rect.left;
      if (x > slider.offsetWidth * 0.35) {
        next(current);
      } else {
        prev(current);
      }
    }
  });
}

document.querySelectorAll<HTMLElement>('.slider').forEach(bind_slider);
