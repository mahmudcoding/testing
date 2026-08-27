const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LEAF = `() => { const vis=(${VIS});
  return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
    .map(e=>(e.innerText||'').trim()).filter(t=>t && t.length>3 && t.length<170)
    .filter((v,i,a)=>a.indexOf(v)===i); }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/forgot|reset|password|auth/i.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,180);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,50)} -> ${r.status()} ${b}`); });
  const go = async (email, note) => {
    await page.context().clearCookies().catch(()=>{});
    await page.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
    await page.waitForTimeout(1800);
    const link = page.locator('a:has-text("Forgot password"), button:has-text("Forgot password")').first();
    if (!(await link.count())) return { note, err:'no forgot link' };
    await link.click(); await page.waitForTimeout(2500);
    const before = await page.evaluate(`(${LEAF})()`);
    const em = page.locator('input[type=email], input[name=email]').first();
    if (!(await em.count())) return { note, url: page.url().replace(/^https?:\/\/[^/]+/,''), pageText: before.slice(0,12), err:'no email field' };
    await em.fill(email);
    net.length=0;
    const sub = page.locator('button[type=submit]').first();
    await sub.click().catch(()=>{});
    await page.waitForTimeout(5000);
    const after = await page.evaluate(`(${LEAF})()`);
    return { note, url: page.url().replace(/^https?:\/\/[^/]+/,''),
             newTextAfterSubmit: after.filter(t=>!before.includes(t)).slice(0,8),
             requests: [...net] };
  };
  const real = await go('qa.d.outsider@aloqa.test', 'REAL account');
  const fake = await go('definitely.not.a.user.qa@aloqa.test', 'UNKNOWN account');
  return { real, fake,
    sameResponse: JSON.stringify(real.newTextAfterSubmit) === JSON.stringify(fake.newTextAfterSubmit) };
};
