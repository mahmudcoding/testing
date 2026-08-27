const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  // A. Display name too long, typed then blurred
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)[0]; i.focus(); })()`);
  await page.keyboard.type('N'.repeat(45), { delay: 4 });
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)[0]; i.blur(); })()`);
  await page.waitForTimeout(1600);
  out.displayName = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)[0];
    const db=i.getAttribute('aria-describedby');
    const desc = db ? db.split(/\\s+/).map(id=>{const e=document.getElementById(id); return e?(e.innerText||'').trim().slice(0,60):'(#'+id+' missing)';}) : null;
    const msg=[...main.querySelectorAll('p,span,div')].filter(vis).filter(e=>!e.children.length)
      .filter(e=>/characters or fewer/i.test(e.innerText||''))[0];
    return { ariaInvalid:i.getAttribute('aria-invalid'), describedby:db, describedbyText:desc,
      msgFound:!!msg, msgRole: msg?msg.getAttribute('role'):null,
      msgLive: msg?(msg.getAttribute('aria-live')|| (msg.closest('[aria-live]')?msg.closest('[aria-live]').getAttribute('aria-live'):null)):null,
      msgId: msg?msg.id:null }; })()`);
  // B. Notifications refusal (a server-side error surfaced as a toast)
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    if(l[0]) l[0].click(); })()`);
  await page.waitForTimeout(900);
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim())); if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(3500);
  out.notificationsToast = await page.evaluate(`(() => { const vis=(${VIS});
    const cands=[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[aria-live]')].filter(vis);
    return cands.map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role'),
      live:e.getAttribute('aria-live'), text:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,60) })).slice(0,4); })()`);
  await page.reload({ waitUntil:'networkidle' });
  return out;
};
