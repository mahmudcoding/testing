export default async ({page}) => {
  const WS='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const out={};
  out.url = page.url();
  out.diagText = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const t=(m.innerText||'');
    const i=t.toLowerCase().indexOf('diagnostic');
    return i<0? t.slice(0,400).replace(/\n+/g,' | ') : t.slice(Math.max(0,i-60), i+320).replace(/\n+/g,' | ');
  });
  out.switches = await page.evaluate(()=>[...document.querySelectorAll('[role="switch"]')].map(s=>({l:(s.getAttribute('aria-label')||'').slice(0,40), on:s.getAttribute('aria-checked')})));
  out.toggled = await page.evaluate(()=>{
    const s=[...document.querySelectorAll('[role="switch"]')].find(x=>/diagnostic/i.test(x.getAttribute('aria-label')||x.closest('div')?.parentElement?.innerText||''));
    if(!s) return 'not found'; if(s.getAttribute('aria-checked')==='true') return 'already on'; s.click(); return 'clicked';
  });
  await page.waitForTimeout(1500);
  out.saveBar = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length&&/save|discard/i.test(b.textContent||'')).map(b=>b.textContent.trim()));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^save/i.test((x.textContent||'').trim())); if(b)b.click();});
  await page.waitForTimeout(2500);
  out.after = await page.evaluate(()=>[...document.querySelectorAll('[role="switch"]')].map(s=>({l:(s.getAttribute('aria-label')||'').slice(0,40), on:s.getAttribute('aria-checked')})));
  return out;
};
