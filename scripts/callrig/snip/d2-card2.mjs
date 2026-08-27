const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/d/C4OWQ0K3NB0XTRO`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const header = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button,[role=button],a,img')].filter(vis)
      .filter(e=>{const r=e.getBoundingClientRect(); return r.top<180 && r.left>380;})
      .map(e=>({tag:e.tagName.toLowerCase(), t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
                al:(e.getAttribute('aria-label')||'').slice(0,40), x:Math.round(e.getBoundingClientRect().x)})); })()`);
  const tries=[];
  for (const sel of ['QA Alice','View profile','Profile']) {
    await page.goto(`https://airion-cargo.store/w/${W}/d/C4OWQ0K3NB0XTRO`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2400);
    const r = await page.evaluate(`(() => { const vis=(${VIS}); const S=${JSON.stringify('SEL')};
      const c=[...document.querySelectorAll('button,[role=button],a')].filter(vis)
        .filter(e=>{const b=e.getBoundingClientRect(); return b.top<180 && b.left>380;})
        .filter(e=>((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')).includes(S));
      if(!c.length) return {found:0}; c[0].click(); return {found:c.length,
        clicked:((c[0].innerText||'')||c[0].getAttribute('aria-label')||'').slice(0,34)}; })()`.replace("'SEL'", JSON.stringify(sel)));
    if (!r.found) { tries.push({sel, ...r}); continue; }
    await page.waitForTimeout(2600);
    const panel = await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog],aside')].filter(vis)
        .filter(e=>/QA Alice/.test(e.innerText||''));
      const p=d.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
      const body=document.body.innerText||'';
      return { dialogs:d.length, text:p?(p.innerText||'').replace(/\\s+/g,' ').slice(0,420):'(none)',
        has:{ job:/QA Engineer/.test(body), dept:/Quality/.test(body), pron:/they\\/them/.test(body),
              phone:/998 90 000/.test(body), github:/octocat/.test(body),
              site:/example\\.org/.test(body), li:/in\\/example/.test(body),
              tz:/Tashkent|GMT\\+5|UTC\\+5|\\+05:00/i.test(body) } }; })()`);
    tries.push({sel, ...r, panel});
    if (panel.dialogs) break;
  }
  const api = await page.evaluate(async () => {
    const A='U4QDALICE000001', W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();
      return {u:u.slice(0,50),s:r.status, hasJob:/QA Engineer/.test(t), hasPhone:/998 90 000/.test(t),
              hasGithub:/octocat/.test(t), len:t.length};};
    return [ await g(`/api/v1/workspaces/${W}/members`), await g(`/api/v1/companies/${CO}/members?limit=100&offset=0`),
             await g(`/api/v1/users/${A}/status`), await g(`/api/v1/workspaces/${W}/presence`) ];
  });
  return { header, tries, api };
};
