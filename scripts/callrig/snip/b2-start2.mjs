export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const NAME=process.env.QA_CALLNAME||'QA call', ENTRY=process.env.QA_ENTRY||'open', VIS=process.env.QA_VIS||'public', GL=process.env.QA_GUESTLINK||'host_only';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Start now'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const nm = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (nm) { await nm.fill(''); await nm.fill(NAME); }
  await page.evaluate(({vis,entry,gl})=>{ const pick=v=>{const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x=>x.value===v); if(r) r.click();}; pick(vis); pick(entry); pick(gl); }, {vis:VIS, entry:ENTRY, gl:GL});
  await page.waitForTimeout(700);
  const chosen = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(r=>r.checked).map(r=>r.name+'='+r.value));
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Start call'); if(b) b.click(); });
  await page.waitForTimeout(7000);
  return {chosen, url: page.url(), meetingId: (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1]||null};
};
