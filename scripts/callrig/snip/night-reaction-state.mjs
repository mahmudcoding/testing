export default async ({page}) => {
  return await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-controls-live-reaction"]');
    if (!b) return {present: false};
    const cs = getComputedStyle(b);
    return {
      present: true,
      label: b.getAttribute('aria-label'),
      disabled: b.disabled,
      ariaDisabled: b.getAttribute('aria-disabled'),
      title: b.getAttribute('title'),
      opacity: cs.opacity, pointerEvents: cs.pointerEvents, display: cs.display,
      rect: (r=>({w:Math.round(r.width),h:Math.round(r.height)}))(b.getBoundingClientRect())
    };
  });
};
