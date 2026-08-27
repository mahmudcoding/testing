export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Start now'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const nm = await page.$('[role=dialog] input[type=text]');
  if (nm) await nm.fill('QA rating test');
  await page.evaluate(()=>{ const pick=v=>{const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x=>x.value===v); if(r) r.click();}; pick('public'); pick('open'); });
  await page.waitForTimeout(600);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Start call'); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.meetingId = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1]||null;
  // end it
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/End for everyone/i.test((x.innerText||x.getAttribute('aria-label')||''))); if(b) b.click(); });
  await page.waitForTimeout(2000);
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-end-confirm-submit"]')||[...document.querySelectorAll('[role=dialog] button,[role=alertdialog] button')].find(x=>/^End for everyone$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.summary = await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0;
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!d) return {none:true, url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,250)};
    return { txt:d.innerText.replace(/\s+/g,' ').slice(0,400),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,25), al:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'), checked:b.getAttribute('aria-checked')})).slice(0,20) };
  });
  return out;
};
