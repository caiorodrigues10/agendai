type ScrollTriggerApi = typeof import('gsap/ScrollTrigger').ScrollTrigger;

let registered: ScrollTriggerApi | null = null;

export function registerScrollTrigger(scrollTrigger: ScrollTriggerApi) {
  registered = scrollTrigger;
}

export function refreshScrollTrigger() {
  registered?.refresh();
}
