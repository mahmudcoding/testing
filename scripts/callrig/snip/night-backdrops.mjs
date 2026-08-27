export default async ({page}) => page.evaluate(() => {
  const info = (e) => {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return {cls:(e.className||'').toString().slice(0,60),
      rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],
      z:cs.zIndex, op:cs.opacity, bg:cs.backgroundColor, disp:cs.display, vis:cs.visibility,
      pe:cs.pointerEvents, text:(e.innerText||'').trim().slice(0,80)};
  };
  const backs = [...document.querySelectorAll('.aloqa-modal-backdrop, [class*="backdrop"]')].map(info);
  const dialogs = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].map(info);
  const portalKids = [...document.body.children].map(e => ({
    tag:e.tagName.toLowerCase(), cls:(e.className||'').toString().slice(0,50),
    kids:e.children.length, txt:(e.innerText||'').trim().slice(0,60)}));
  return {backdrops:backs, dialogs, bodyChildren:portalKids,
          bodyStyle:{overflow:getComputedStyle(document.body).overflow}};
});
