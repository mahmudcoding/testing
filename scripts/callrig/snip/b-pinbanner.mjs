export default async ({page}) => {
  return await page.evaluate(() => {
    const all = [...document.querySelectorAll('*')];
    const hit = all.filter(e => {
      const t = (e.innerText||'');
      return /Pinned message/i.test(t) && e.children.length <= 6;
    });
    const el = hit[hit.length-1];
    if (!el) return {found:false};
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // walk up to find the banner container
    let box = el; for (let i=0;i<3 && box.parentElement;i++) box = box.parentElement;
    const br = box.getBoundingClientRect();
    return {
      found: true,
      text: (el.innerText||'').replace(/\s+/g,' ').slice(0,200),
      rect: {x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)},
      visible: r.width>0 && r.height>0 && cs.visibility!=='hidden' && cs.display!=='none' && cs.opacity!=='0',
      containerHTML: box.outerHTML.replace(/\s+/g,' ').slice(0,700),
      containerRect: {w:Math.round(br.width), h:Math.round(br.height)}
    };
  });
};
