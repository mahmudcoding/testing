const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/auth\/me\/settings/.test(u)) return;
    let b=''; try{b=r.request().postData()||'';}catch{}
    net.push(`${r.request().method()} <- ${b.slice(0,300)} -> ${r.status()}`); });
  const readProfile = () => page.evaluate(async () => {
    const j = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s = j.settings||{};
    return { profile:s.profile, privacy:s.privacy };
  });
  // 1. seed distinctive profile values via the server, then confirm the UI shows them
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  const seeded = await page.evaluate(async () => {
    const cur = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s = cur.settings||{};
    const body = { ...s, profile: { ...(s.profile||{}),
      jobTitle:'QA Engineer', department:'Quality', pronouns:'they/them', showTimezone:true } };
    const r = await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
    return { status:r.status, body:(await r.text()).slice(0,160) };
  });
  const afterSeed = await readProfile();
  // 2. reload privacy page, change the FIRST combobox, save
  await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  net.length=0;
  const cb = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('[role=combobox]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300); })`;
  const before0 = await page.evaluate(`(() => ${cb}()[0].innerText.trim())()`);
  await page.evaluate(`(() => { ${cb}()[0].click(); })()`);
  await page.waitForTimeout(900);
  const picked = await page.evaluate(`(() => { const vis=(${VIS});
    const o=[...document.querySelectorAll('[role=option]')].filter(vis);
    const t=o.filter(x=>(x.innerText||'').trim()==='Nobody');
    if(t.length){ t[0].click(); return 'Nobody'; }
    return '(no Nobody option: '+o.map(x=>(x.innerText||'').trim()).join('|')+')'; })()`);
  await page.waitForTimeout(1000);
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
    if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(2600);
  const afterPrivacyChange = await readProfile();
  return { seeded, afterSeed, before0, picked,
           afterPrivacyChange,
           profileSurvived: JSON.stringify(afterSeed.profile)===JSON.stringify(afterPrivacyChange.profile),
           requests:net };
};
