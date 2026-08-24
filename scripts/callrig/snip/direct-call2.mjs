export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const rows = await page.$$('main button');
  const labs = await Promise.all(rows.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  // find the Call button that follows "Open QA Bob's profile"
  let idx=-1;
  for (let i=0;i<labs.length;i++){ if (/Open QA Bob/.test(labs[i])) { for (let j=i;j<Math.min(i+4,labs.length);j++){ if (labs[j]==='Call'){ idx=j; break; } } } if (idx>=0) break; }
  if (idx<0) return {err:'no call btn', labs: labs.slice(0,20)};
  await rows[idx].click();
  await page.waitForTimeout(6000);
  return {net: netlog, body: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,200))};
};
