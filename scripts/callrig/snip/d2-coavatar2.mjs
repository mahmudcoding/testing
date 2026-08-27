const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,120);}catch{}
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,50)} -> ${r.status()} ${b.slice(0,70)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const before = await page.evaluate(`(() => { const vis=(${VIS});
    const i=[...document.querySelectorAll('main img')].filter(vis)[0]; return i?(i.getAttribute('src')||''):'(none)'; })()`);
  let notices=[], dialogSeen=0;
  const poll=setInterval(async()=>{ try{
    const n=await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
        .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`);
    if(n.length>notices.length) notices=n;
    const d=await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('[role=dialog]')].filter(vis).length; })()`);
    if(d>dialogSeen) dialogSeen=d;
  }catch{} },200);
  net.length=0;
  await page.locator('input[type=file]').first().setInputFiles(process.env.D2_FILE);
  await page.waitForTimeout(6000);
  clearInterval(poll);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const i=[...document.querySelectorAll('main img')].filter(vis)[0]; return i?(i.getAttribute('src')||''):'(none)'; })()`);
  const saveBar = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard|Cancel)/.test(t)); })()`);
  return { avatarBefore: before.slice(0,50), avatarAfter: after.slice(0,50),
           anyDialogAppeared: dialogSeen, saveBarAfter: saveBar, notices, requests: net };
};
