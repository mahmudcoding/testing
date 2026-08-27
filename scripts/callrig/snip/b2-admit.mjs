export default async ({ page }) => {
  const before = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('button')).find(b=>/^Admit$/.test(b.textContent.trim()));
    let n=a, h=0; while(n&&h<6&&!/WAITING/i.test(n.textContent)){n=n.parentElement;h++;}
    return { found: !!a, ctx: n? n.innerText.replace(/\n+/g,' | ').slice(0,150):'' };
  });
  const net = [];
  page.on('response', r => { if (/\/api\/v1\//.test(r.url()))
    net.push({ st: r.status(), u: r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,90), m: r.request().method() }); });
  const clicked = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('button')).find(b=>/^Admit$/.test(b.textContent.trim()));
    if (!a) return false; a.click(); return true; });
  await page.waitForTimeout(6000);
  const after = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('button')).find(b=>/^Admit$/.test(b.textContent.trim()));
    let n=a, h=0; if(a){while(n&&h<6&&!/WAITING/i.test(n.textContent)){n=n.parentElement;h++;}}
    return { admitStillThere: !!a, ctx: a&&n? n.innerText.replace(/\n+/g,' | ').slice(0,150):'(no waiting block)',
             tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length,
             toasts: Array.from(document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]'))
               .filter(t=>t.getBoundingClientRect().height>0).map(t=>t.innerText.slice(0,90)) };
  });
  return { before, clicked, net: net.filter(r=>/admit|participant|meeting/i.test(r.u)).slice(0,8), after };
};
