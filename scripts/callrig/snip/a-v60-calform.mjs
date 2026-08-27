const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const btns = await page.$$('button');
  for(const b of btns){ const t=(await b.innerText().catch(()=>''))||''; if(/^New meeting/i.test(t.trim())){ await b.click(); break; } }
  await page.waitForTimeout(2200);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/cal-newmeeting.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]||document.body;
    return { isDialog:!!document.querySelector('[role="dialog"]'),
      inputs:[...d.querySelectorAll('input,textarea')].filter(vis).map(i=>({tag:i.tagName,type:i.type,ph:(i.placeholder||'').slice(0,26),al:(i.getAttribute('aria-label')||'').slice(0,26),val:(i.value||'').slice(0,22),max:i.maxLength})),
      switches:[...d.querySelectorAll('[role="switch"]')].filter(vis).map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,34),on:s.getAttribute('aria-checked')})),
      combos:[...d.querySelectorAll('[role="combobox"],select,button[aria-haspopup]')].filter(vis).map(c=>(c.innerText||'').replace(/\s+/g,' ').slice(0,26)),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,20)).filter(Boolean).slice(0,14),
      txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300) };},VS);
};
