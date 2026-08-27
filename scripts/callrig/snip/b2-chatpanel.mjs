export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const inputs = [...document.querySelectorAll('textarea,[contenteditable="true"],input')].filter(v)
      .map(e=>({ tag:e.tagName, type:e.getAttribute('type'), tid:e.getAttribute('data-testid'),
                 ph:e.getAttribute('placeholder'), al:(e.getAttribute('aria-label')||'').slice(0,34),
                 rect:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width)}))(e.getBoundingClientRect()) }));
    const sendBtns = [...document.querySelectorAll('button')].filter(v)
      .filter(b=>/send/i.test((b.getAttribute('aria-label')||'')+(b.innerText||'')))
      .map(b=>({ tid:b.getAttribute('data-testid'), al:b.getAttribute('aria-label'), disabled:b.disabled }));
    return { inputs, sendBtns };
  });
};
