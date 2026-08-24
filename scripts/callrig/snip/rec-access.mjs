export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  page.on('request', r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET') netlog.push(`REQ ${r.method()} ${u.replace('https://airion-cargo.store','')} :: ${(r.postData()||'').slice(0,150)}`);});
  const b = await page.$('[data-testid="recording-access-manage"]');
  if (!b) return {err:'no manage btn', url: page.url()};
  await b.click(); await page.waitForTimeout(3000);
  const dlg = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,450), items:[...d.querySelectorAll('button,input,[role="menuitem"],[role="menuitemradio"]')].map(x=>`${x.tagName}:${(x.getAttribute('aria-label')||x.textContent||x.value||'').trim().slice(0,32)}`)}:'no dialog';});
  // pick "Everyone" option if present
  const d=[...(await page.$$('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]'))].pop();
  let picked=null;
  if (d) for (const it of await d.$$('button,[role="menuitem"],[role="menuitemradio"],input')) {
    const t=((await it.getAttribute('aria-label'))||(await it.innerText().catch(()=>''))||'').trim();
    if (/Everyone in the meeting|Everyone/i.test(t)) { await it.click().catch(()=>{}); picked=t.slice(0,40); break; } }
  await page.waitForTimeout(4000);
  return {dlg, picked, net: netlog.slice(-6)};
};
