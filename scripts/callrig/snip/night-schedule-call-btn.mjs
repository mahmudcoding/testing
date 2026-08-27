export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET')
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,50),s:r.status()});};
  page.on('response',onResp);
  const d=[...await page.$$('[role="dialog"]')].pop();
  if(!d) return {err:'no dialog open'};
  let info=null;
  for(const b of await d.$$('button')){ const t=((await b.textContent())||'').trim();
    if(t==='Schedule call'){ info={label:t, disabled:await b.isDisabled()};
      await b.click(); break; } }
  await page.waitForTimeout(6000);
  page.off('response',onResp);
  return {info, reqs, url:page.url().slice(-42),
    dialogs: await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"]')]
      .map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,90)).slice(0,3))};
};
