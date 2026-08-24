export default async ({page}) => {
  const netlog=[];
  page.on('request', r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET') netlog.push(`REQ ${r.method()} ${u.replace('https://airion-cargo.store','')} :: ${(r.postData()||'').slice(0,150)}`);});
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} netlog.push(`RES ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const d=[...(await page.$$('[role="dialog"]'))].pop();
  if (!d) return {err:'no dialog'};
  const radio = await d.$('input[value="all"]');
  if (radio) await radio.click({force:true}).catch(async()=>{ await page.evaluate(()=>{const r=document.querySelector('[role="dialog"] input[value="all"]'); r&&r.click();}); });
  await page.waitForTimeout(1000);
  for (const b of await d.$$('button')) { const t=(await b.innerText()).trim(); if (/^Save$/i.test(t)) { await b.click(); break; } }
  await page.waitForTimeout(5000);
  const scope = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/meeting/recordings/RC4OS2PS8K8A9O1V',{credentials:'include'})).json(); return j.recording? j.recording.access_scope : j;});
  return {net: netlog, scope};
};
