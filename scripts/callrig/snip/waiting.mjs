export default async ({page}) => {
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meeting/'+(window.__mid||'V4OS2YX9F8YKV3S')+'/waiting',{credentials:'include'});
    return r.status+' :: '+(await r.text()).slice(0,400);
  });
  const dom = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"]')];
    return {
      overlay: (document.querySelector('[data-testid="call-overlay-expanded"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,600),
      modals: d.filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').map(x=>x.innerText.replace(/\n+/g,' | ').slice(0,300)),
      toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim().slice(0,150)).filter(Boolean),
      waitBtns: [...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(t=>/admit|deny|approve|reject|waiting/i.test(t))
    };
  });
  return {api, dom};
};
