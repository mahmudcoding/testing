const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  const onResp = r => { if(/auth\/me\/profile/.test(r.url()) && r.request().method()!=='GET')
    net.push(`${r.request().method()} -> ${r.status()}`); };
  page.on('response', onResp);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const saveState = `(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()))
      .map(b=>({ t:(b.innerText||'').trim(), disabled:b.disabled===true||b.getAttribute('aria-disabled')==='true' })); })()`;
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis).filter(i=>i.type!=='search');
    const t=ins.find(i=>/QA /.test(i.value))||ins[0];
    const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    s.call(t,'QA Alice R2'); t.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await page.waitForTimeout(1200);
  const out={ beforeFirstSave: await page.evaluate(saveState) };
  const click = `(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()));
    if(!b.length) return 'none'; if(b[0].disabled) return 'disabled'; b[0].click(); return 'clicked'; })()`;
  out.click1 = await page.evaluate(click);
  await page.waitForTimeout(3500);
  out.afterFirst429 = await page.evaluate(saveState);
  out.click2 = await page.evaluate(click);          // can the user hammer it again?
  await page.waitForTimeout(3500);
  out.afterSecondAttempt = await page.evaluate(saveState);
  out.click3 = await page.evaluate(click);
  await page.waitForTimeout(3000);
  out.profileRequests = [...net];
  out.nameNow = await page.evaluate(`(async()=>(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).name)()`);
  page.off('response', onResp);
  return out;
};
