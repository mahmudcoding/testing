export default async ({page}) => {
  const info = await page.evaluate(() => {
    const tb = document.querySelector('[data-testid="call-toolbar"]');
    const pick = lbl => { const b=[...tb.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').startsWith(lbl)); return b? {
      aria: b.getAttribute('aria-label'), title: b.getAttribute('title'), disabled: b.disabled,
      describedby: b.getAttribute('aria-describedby'), tooltipText: (()=>{const id=b.getAttribute('aria-describedby'); const e=id&&document.getElementById(id); return e?e.textContent.trim():null;})()
    } : null; };
    return {
      unmute: pick('Unmute'), camera: pick('Turn camera on'), share: pick('Share screen'),
      surfaceText: (document.querySelector('[role="dialog"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,500),
      anyNotice: [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /not allowed|disabled|blocked|host has|restricted/i.test(e.textContent)).map(e=>e.textContent.trim().slice(0,120)).slice(0,6)
    };
  });
  // hover the disabled button to see if a tooltip appears
  const btn = page.locator('[data-testid="call-toolbar"] button[aria-label^="Unmute"]').first();
  let hover = null;
  if (await btn.count()) {
    try { await btn.hover({force:true}); await page.waitForTimeout(1500);
      hover = await page.evaluate(() => [...document.querySelectorAll('[role="tooltip"],[data-radix-popper-content-wrapper]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)));
    } catch(e) { hover = 'hover-failed: '+String(e).slice(0,80); }
  }
  return {info, hover};
};
