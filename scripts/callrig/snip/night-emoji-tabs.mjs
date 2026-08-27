export default async ({page}) => {
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    const btns=[...m.querySelectorAll('button')].slice(0,10).map((b,i)=>{
      const r=b.getBoundingClientRect();
      return {i, aria:b.getAttribute('aria-label'), title:b.getAttribute('title'),
        text:JSON.stringify(b.textContent), codePoints:[...(b.textContent||'')].map(c=>c.codePointAt(0).toString(16)),
        role:b.getAttribute('role'), pressed:b.getAttribute('aria-pressed'), sel:b.getAttribute('aria-selected'),
        rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
        html:b.innerHTML.replace(/\s+/g,' ').slice(0,120)};
    });
    return {buttons: btns};
  });
};
