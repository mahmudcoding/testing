const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const probe = () => page.evaluate((vs)=>{const vis=eval(vs);
    const f=(ph)=>document.querySelector(`input[placeholder="${ph}"]`);
    return {
      vals:{phone:f('+1 555 0100')?.value, li:f('https://linkedin.com/in/username')?.value, gh:f('https://github.com/username')?.value, web:f('https://example.com')?.value},
      saveBtn:(()=>{const b=[...document.querySelectorAll('button')].filter(vis).find(b=>/save changes/i.test(b.innerText||'')); return b?{dis:b.disabled}:null;})(),
      errors:[...document.querySelectorAll('[role="alert"],[aria-invalid="true"],[class*="error"],[class*="destructive"]')].filter(vis)
        .map(e=>({tag:e.tagName,txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,80),ai:e.getAttribute('aria-invalid')})).slice(0,8),
      toasts:[...document.querySelectorAll('[role="status"],[data-sonner-toast],li[data-state]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,80)),
    };},VS);

  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);

  // 1) invalid URL in LinkedIn + junk phone
  const li = await page.$('input[placeholder="https://linkedin.com/in/username"]');
  await li.click(); await page.keyboard.type('not a url at all', {delay:25});
  const ph = await page.$('input[placeholder="+1 555 0100"]');
  await ph.click(); await page.keyboard.type('abcdefg!!!', {delay:25});
  await page.waitForTimeout(900);
  const afterType = await probe();

  // attempt save, poll network + UI
  const reqs=[]; page.on('response', r => { if(r.url().includes('/api/v1/')&&r.request().method()!=='GET') reqs.push({u:r.url().split('/api/v1/')[1].slice(0,50),s:r.status(),m:r.request().method()}); });
  const saveBtn = await page.$$('button');
  for (const b of saveBtn) { const t=(await b.innerText().catch(()=>''))||''; if(/save changes/i.test(t)){ await b.click().catch(()=>{}); break; } }
  const poll=[]; for(let i=0;i<9;i++){ poll.push(await probe()); await page.waitForTimeout(350); }
  return { afterType, afterSave: poll[poll.length-1], anyError: poll.find(p=>p.errors.length)?.errors ?? null,
           anyToast: poll.find(p=>p.toasts.length)?.toasts ?? null, requests: reqs };
};
