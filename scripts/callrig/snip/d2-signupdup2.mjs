const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/signup|register/i.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,220);}catch{}
    if (r.request().method()==='POST') net.push(`POST ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,34)} -> ${r.status()} ${b.slice(0,140)}`); });
  const attempt = async (email, pw, name, note) => {
    await page.context().clearCookies().catch(()=>{});
    await page.goto('https://airion-cargo.store/signup', { waitUntil:'networkidle' });
    await page.waitForTimeout(2500);
    await page.fill('input[name=email]', email);
    await page.fill('input[name=displayName]', name);
    await page.fill('input[name=password]', pw);
    await page.waitForTimeout(400);
    const values = await page.evaluate(() => ['email','displayName','password']
      .map(n => { const e=document.querySelector(`input[name=${n}]`); return n+'='+(e?String(e.value).length:'(missing)')+'ch'; }));
    const before = await page.evaluate(() => document.body.innerText);
    net.length=0;
    await page.locator('button').filter({hasText:/^Create account$/}).first().click().catch(()=>{});
    await page.waitForTimeout(6000);
    const after = await page.evaluate(() => document.body.innerText);
    return { note, valuesLanded: values, url: page.url().replace(/^https?:\/\/[^/]+/,''),
             newLines: after.split('\n').map(s=>s.trim()).filter(t=>t && !before.includes(t)).slice(0,6),
             requests: [...net] };
  };
  const dup = await attempt('qa.d.alice@aloqa.test', 'QaPass123!', 'D2 Probe', 'EXISTING email');
  const weak = await attempt('d2.weak.probe@aloqa.test', 'abc', 'D2 Probe', 'weak password');
  return { existingEmail: dup, weakPassword: weak };
};
