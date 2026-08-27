export default async ({ page }) => {
  const name = process.env.QA_ROOM || 'Leak Room';
  await page.evaluate(n => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const inp = d && [...d.querySelectorAll('input')].filter(v).find(i=>i.type==='text');
    if (inp) { const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
      s.call(inp, n); inp.dispatchEvent(new Event('input',{bubbles:true})); }
  }, name);
  await page.waitForTimeout(600);
  // select the guest as invitee
  const picked = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="side-room-create-invitee"]');
    if (!b) return 'no invitee row'; b.click(); return b.innerText.replace(/\s+/g,' ').trim().slice(0,30);
  });
  await page.waitForTimeout(600);
  const net = [];
  page.on('response', async r => { if (/breakout|side/i.test(r.url()) && r.request().method()!=='GET') {
    let t=''; try { t=(await r.text()).slice(0,160); } catch {}
    net.push({ st:r.status(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,48), body:t }); } });
  await page.evaluate(() => { const b=document.querySelector('[data-testid="side-room-create-submit"]'); if(b && !b.disabled) b.click(); });
  await page.waitForTimeout(6000);
  return { picked, net, after: await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    return d ? (d.innerText||'').replace(/\n+/g,' | ').slice(0,220) : '(no dialog)'; }) };
};
