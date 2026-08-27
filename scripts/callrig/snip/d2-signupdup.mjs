const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/signup|register/i.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,200);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,40)} -> ${r.status()} ${b}`); });
  await page.context().clearCookies().catch(()=>{});
  await page.goto('https://airion-cargo.store/signup', { waitUntil:'networkidle' });
  await page.waitForTimeout(4000);
  const fields = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('input')].filter(vis).map((e,i)=>({i,type:e.type,
      ph:e.getAttribute('placeholder')||'', aria:e.getAttribute('aria-label')||''})); })()`);
  const ins = page.locator('input');
  for (const f of fields) {
    const v = f.type==='email' ? 'qa.d.alice@aloqa.test' : f.type==='password' ? 'QaPass123!' : 'D2 Probe';
    await ins.nth(f.i).fill(v).catch(()=>{});
  }
  await page.waitForTimeout(600);
  // PROVE the values actually landed before submitting
  const filled = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('input')].filter(vis).map(e=>e.type+'="'+String(e.value).slice(0,28)+'"'); })()`);
  const allFilled = filled.every(f => !/=""$/.test(f));
  if (!allFilled) return { abort: 'values did not stick before submit', filled };
  const sub = page.locator('button[type=submit]').first();
  const st = { count: await sub.count(), disabled: (await sub.count()) ? await sub.isDisabled() : null };
  const beforeTxt = await page.evaluate(`(() => document.body.innerText)()`);
  if (st.count && !st.disabled) await sub.click().catch(()=>{});
  await page.waitForTimeout(6000);
  const afterTxt = await page.evaluate(`(() => document.body.innerText)()`);
  const newLines = afterTxt.split('\n').map(s=>s.trim()).filter(t=>t && !beforeTxt.includes(t)).slice(0,8);
  return { fields, valuesBeforeSubmit: filled, submit: st, url: page.url().replace(/^https?:\/\/[^/]+/,''), newLines, requests: net };
};
