export default async ({page}) => {
  const c = await page.evaluate(()=>{
    const d=document.querySelector('[data-testid="device-request-prompt"]');
    if(!d) return {err:'no prompt'};
    const b=[...d.querySelectorAll('button')].find(x=>/^Not now$/i.test((x.textContent||'').trim()));
    if(!b) return {err:'no Not now'};
    b.click(); return {ok:true};
  });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>({
    promptStillThere: !!document.querySelector('[data-testid="device-request-prompt"]'),
    cam: (()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const b=[...r.querySelectorAll('button')].find(x=>/^Turn camera (on|off)$/i.test(x.getAttribute('aria-label')||''));
      return b?b.getAttribute('aria-label'):null;})()
  }));
  return {c, after};
};
