export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const NAME = process.env.QA_CALLNAME || 'QA takeover test';
  const ENTRY = process.env.QA_ENTRY || 'open';
  const VIS = process.env.QA_VIS || 'public';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Start now'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const nm = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (nm) { await nm.fill(''); await nm.fill(NAME); }
  await page.evaluate(({vis,entry})=>{ const pick=v=>{const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x=>x.value===v); if(r) r.click();}; pick(vis); pick(entry); }, {vis:VIS, entry:ENTRY});
  await page.waitForTimeout(600);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Start call'); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.url = page.url();
  out.meetingId = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || null;
  out.buttons = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,20));
  return out;
};
