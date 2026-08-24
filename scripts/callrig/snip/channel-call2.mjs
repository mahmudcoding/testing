export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const urlBefore = page.url();
  const b = await page.$('button[aria-label="Start call"]');
  if (!b) return {err:'no exact Start call'};
  const box = await b.boundingBox();
  await b.click();
  await page.waitForTimeout(5000);
  const s1 = await page.evaluate(()=>({url:location.href, dialogs:[...document.querySelectorAll('[role="dialog"]')].map(d=>d.innerText.replace(/\n+/g,' | ').slice(0,350))}));
  // also try the dropdown sibling
  let s2=null;
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const d = await page.$('button[aria-label="Start or schedule call"]');
  if (d) { await d.click().catch(()=>{}); await page.waitForTimeout(3000);
    s2 = await page.evaluate(()=>({url:location.href, pops:[...document.querySelectorAll('[role="menu"],[role="dialog"],[data-radix-popper-content-wrapper]')].map(p=>p.innerText.replace(/\n+/g,' | ').slice(0,300))})); }
  return {urlBefore, box, afterStartCall: s1, afterDropdown: s2, net: netlog};
};
