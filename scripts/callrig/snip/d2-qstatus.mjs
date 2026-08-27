export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { const u = r.url(); if (!u.includes('/api/v1/')) return;
    let b=''; try { b = (await r.text()).slice(0,300); } catch {}
    net.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status(), req:(r.request().postData()||'').slice(0,220), res:b }); });
  const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // label the Identity inputs properly
  const identity = await page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('main input,main textarea')].filter(vis).map(e => {
      let lbl = e.getAttribute('aria-label') || '';
      if (!lbl && e.id) { const l = document.querySelector('label[for="'+CSS.escape(e.id)+'"]'); if (l) lbl = l.innerText.trim(); }
      if (!lbl) { const l = e.closest('label') || e.parentElement?.querySelector('label'); if (l) lbl = l.innerText.trim(); }
      if (!lbl) { let n=e.parentElement; for(let i=0;i<3&&n;i++){ const t=(n.innerText||'').trim(); if(t&&t.length<40){lbl=t.split('\\n')[0];break;} n=n.parentElement; } }
      return { label: lbl.slice(0,40), placeholder: (e.getAttribute('placeholder')||'').slice(0,32), value: String(e.value||'').slice(0,40), maxlen: e.getAttribute('maxlength')||'' };
    }); })()`);

  const btns = () => page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean); })()`);
  const before = await btns();
  net.length = 0;

  const meeting = page.locator('button:has-text("In a meeting")').first();
  await meeting.scrollIntoViewIfNeeded();
  const pressedBefore = await meeting.evaluate(e => ({ pressed: e.getAttribute('aria-pressed'), cls: e.className.slice(0,60), data: e.getAttribute('data-state') }));
  await meeting.click();
  await page.waitForTimeout(2500);
  const pressedAfter = await meeting.evaluate(e => ({ pressed: e.getAttribute('aria-pressed'), cls: e.className.slice(0,60), data: e.getAttribute('data-state') }));
  const after = await btns();

  let saved = null;
  const save = page.locator('button:has-text("Save changes")').first();
  if (await save.count()) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(3000); saved = true; }

  return { identityInputs: identity,
    quickStatusPressedBefore: pressedBefore, quickStatusPressedAfter: pressedAfter,
    newButtons: after.filter(b => !before.includes(b)), clickedSave: saved,
    requests: net.map(n => `${n.m} ${n.u} -> ${n.s}`).slice(0,10),
    bodies: net.filter(n => n.req).map(n => n.req).slice(0,3) };
};
