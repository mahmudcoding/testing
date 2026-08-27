export default async ({page}) => {
  const NAME=process.env.QA_CALLNAME||'QA password test', PW=process.env.QA_PWSET||'Sekret-42';
  const nm = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (nm) { await nm.fill(''); await nm.fill(NAME); }
  const pw = await page.$('[role=dialog] input[type=password]');
  if (pw) { await pw.fill(PW); }
  await page.waitForTimeout(600);
  const chosen = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(r=>r.checked).map(r=>r.name+'='+r.value));
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Start call'); if(b) b.click(); });
  await page.waitForTimeout(7000);
  return {chosen, url:page.url(), meetingId:(page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1]||null};
};
