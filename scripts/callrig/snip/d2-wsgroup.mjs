export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  for (const p of ['company','workspace','roles?scope=company','roles?scope=workspace','admin/members','admin/company']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${p}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3200);
    out[p] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main')||document.body;
      const all=(main.innerText||'').replace(/\s+/g,' ');
      const i=all.indexOf('Settings ›');
      const c = i>=0? all.slice(i):all;
      const btns=[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
      const inputs=[...main.querySelectorAll('input,textarea,select')].filter(vis).length;
      return { refusal: /do not have permission|access required|don.?t have access/i.test(c),
        text: c.slice(0,150), buttons: btns.length, inputs, sample: btns.slice(0,6) };
    });
  }
  return out;
};
