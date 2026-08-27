const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
// leaf-level error text only: elements with no element children
const ERRS = `() => { const vis=(${VIS});
  return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
    .map(e=>(e.innerText||'').trim())
    .filter(t=>t && t.length>3 && t.length<120)
    .filter(t=>/invalid|incorrect|wrong|not found|no account|error|failed|try again|too many|locked|verify|required|must/i.test(t))
    .filter((v,i,a)=>a.indexOf(v)===i).slice(0,6); }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/auth|login|sign/i.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,180);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${b}`); });
  const attempt = async (email, pw, note) => {
    await page.context().clearCookies().catch(()=>{});
    await page.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
    await page.waitForTimeout(2000);
    net.length = 0;
    await page.locator('input[type=email], input[name=email]').first().fill(email);
    await page.locator('input[type=password]').first().fill(pw);
    await page.locator('button[type=submit], button:has-text("Sign in")').first().click().catch(()=>{});
    // wait until the button stops saying "Signing in…", then settle
    for (let i=0;i<20;i++) { const busy = await page.evaluate(`(() => /Signing in/i.test(document.body.innerText))()`);
      if (!busy) break; await page.waitForTimeout(500); }
    await page.waitForTimeout(1500);
    return { note, errorsOnScreen: await page.evaluate(`(${ERRS})()`),
             requests: [...net], urlAfter: page.url().replace(/^https?:\/\/[^/]+/,'') };
  };
  const a = await attempt('qa.d.outsider@aloqa.test', 'WrongPassword123!', 'REAL account, WRONG password');
  const b = await attempt('definitely.not.a.user.qa@aloqa.test', 'WrongPassword123!', 'UNKNOWN account');
  return { wrongPassword: a, unknownAccount: b,
    sameMessage: JSON.stringify(a.errorsOnScreen) === JSON.stringify(b.errorsOnScreen),
    sameStatus: (a.requests[0]||'').split('->')[1]?.trim().slice(0,3) === (b.requests[0]||'').split('->')[1]?.trim().slice(0,3) };
};
