const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LEAF = `() => { const vis=(${VIS});
  return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
    .map(e=>(e.innerText||'').trim()).filter(t=>t&&t.length<170).filter((v,i,a)=>a.indexOf(v)===i); }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    let b=''; try{b=(await r.text()).slice(0,200);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${b.slice(0,120)}`); });
  const run = async (email, note) => {
    await page.context().clearCookies();
    await page.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
    await page.waitForTimeout(2200);
    const link = page.locator('a:has-text("magic link"), button:has-text("magic link")').first();
    if (!(await link.count())) return { note, err:'magic link entry not found' };
    await link.click(); await page.waitForTimeout(2500);
    const before = await page.evaluate(`(${LEAF})()`);
    const em = page.locator('input[type=email]').first();
    if (!(await em.count())) return { note, url:page.url().replace(/^https?:\/\/[^/]+/,''), screen: before.slice(0,10), err:'no email field' };
    await em.fill(email);
    net.length=0;
    await page.locator('button[type=submit]').first().click().catch(()=>{});
    for (let i=0;i<16;i++){ const busy=await page.evaluate(`(()=>/Sending|Loading/i.test(document.body.innerText))()`); if(!busy) break; await page.waitForTimeout(500); }
    await page.waitForTimeout(3000);
    const after = await page.evaluate(`(${LEAF})()`);
    return { note, url: page.url().replace(/^https?:\/\/[^/]+/,''),
             newText: after.filter(t=>!before.includes(t)).slice(0,6), requests:[...net] };
  };
  return { real: await run('qa.d.alice@aloqa.test','REAL account'),
           unknown: await run('definitely.not.a.user.qa@aloqa.test','UNKNOWN account') };
};
