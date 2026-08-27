export default async ({page}) => {
  const before = await page.evaluate(()=>({
    overlayExpanded: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    pip: (p=>p?(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(p.getBoundingClientRect()):null)(document.querySelector('[data-testid*="pip" i]')),
    pipTestids: [...document.querySelectorAll('[data-testid*="pip" i]')].map(e=>e.getAttribute('data-testid')),
    url: location.href
  }));
  await page.locator('[data-testid="call-surface-minimize"]').click();
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>({
    overlayExpanded: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    pipTestids: [...document.querySelectorAll('[data-testid*="pip" i]')].map(e=>e.getAttribute('data-testid')),
    pip: (p=>p?{rect:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(p.getBoundingClientRect()), text:p.innerText.replace(/\n+/g,' | ').slice(0,200), buttons:[...p.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30))}:null)(document.querySelector('[data-testid*="pip" i]')),
    url: location.href,
    mainText: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,150)
  }));
  return {before, after};
};
