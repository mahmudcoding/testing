export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Start now'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{ const i=document.querySelector('[role=dialog] input[type=text], [role=dialog] input:not([type])'); if(i){ i.focus(); } });
  const nm = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (nm) await nm.fill('QA waiting test');
  await page.evaluate(()=>{ const pick=v=>{const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x=>x.value===v); if(r) r.click();}; pick('public'); pick('open'); });
  await page.waitForTimeout(600);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Start call'); if(b) b.click(); });
  await page.waitForTimeout(6000);
  out.url = page.url();
  out.meetingId = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || null;
  out.txt = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,200));
  return out;
};
