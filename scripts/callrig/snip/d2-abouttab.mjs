const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,300);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,56)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/d/C4OWQ0K3NB0XTRO`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  await page.evaluate(`(() => { const vis=(${VIS});
    const c=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>{const b=e.getBoundingClientRect(); return b.top<180 && b.left>380;})
      .filter(e=>(e.getAttribute('aria-label')||'')==='Profile');
    if(c.length===1) c[0].click(); })()`);
  await page.waitForTimeout(2600);
  net.length=0;
  const tabs = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button,[role=tab]')].filter(vis)
      .filter(e=>['Profile','About','Files','Pinned'].includes((e.innerText||'').trim()))
      .map(e=>({t:(e.innerText||'').trim(), sel:e.getAttribute('aria-selected')||'',
                x:Math.round(e.getBoundingClientRect().x), y:Math.round(e.getBoundingClientRect().y)})); })()`);
  const clickedAbout = await page.evaluate(`(() => { const vis=(${VIS});
    const c=[...document.querySelectorAll('button,[role=tab]')].filter(vis)
      .filter(e=>(e.innerText||'').trim()==='About');
    if(c.length!==1) return {n:c.length}; c[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(3200);
  const body = await page.evaluate(`(() => { const b=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { len:b.length, tail:b.slice(-420),
      has:{ jobTitle:/QA Engineer/.test(b), department:/Quality/.test(b), pronouns:/they\\/them/.test(b),
            phone:/998 90 000/.test(b), github:/octocat/.test(b), website:/example\\.org/.test(b),
            linkedin:/in\\/example/.test(b), timezone:/Tashkent|GMT\\+5|UTC\\+5|05:00/i.test(b) } }; })()`);
  return { tabs, clickedAbout, body, requestsAfterOpen: net.slice(0,8) };
};
