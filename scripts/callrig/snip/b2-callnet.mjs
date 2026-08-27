export default async ({ page }) => {
  const WS='W4QBF1XTURESO01', WHO=process.env.QA_WHO||'QA Bob';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const net = [];
  page.on('response', async r => {
    if (!/\/api\/v1\/(meeting|calendar|channels|messaging)/.test(r.url())) return;
    let body = ''; try { if (r.request().method() !== 'GET' || r.status() >= 400) body = (await r.text()).slice(0,300); } catch {}
    net.push({ st: r.status(), m: r.request().method(),
               u: r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,80), body });
  });
  const clicked = await page.evaluate((who)=>{
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const rows=[...document.querySelectorAll('li,tr,div')].filter(e=>v(e) && (e.innerText||'').includes(who)
      && (e.innerText||'').length<200 && [...e.querySelectorAll('button')].some(b=>/^Call$/.test((b.innerText||'').trim())));
    const row=rows[rows.length-1]; if(!row) return {noRow:true};
    const cb=[...row.querySelectorAll('button')].filter(v).find(b=>/^Call$/.test((b.innerText||'').trim()));
    if(!cb) return {noBtn:true}; cb.click(); return {clicked:true};
  }, WHO);
  await page.waitForTimeout(7000);
  const toast = await page.evaluate(()=> Array.from(document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]'))
    .filter(t=>t.getBoundingClientRect().height>0).map(t=>t.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean));
  return { who: WHO, clicked, net: net.filter(r=>r.m!=='GET'||r.st>=400), toast };
};
