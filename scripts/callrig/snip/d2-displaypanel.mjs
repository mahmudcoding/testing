const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(() => localStorage.getItem('aloqa.appearance')||'(absent)');
  await page.keyboard.press('Control+Shift+T').catch(()=>{});
  await page.waitForTimeout(1500);
  let panel = await page.evaluate(`(() => { const vis=(${VIS});
    const d=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper]')].filter(vis)
      .sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return (B.width*B.height)-(A.width*A.height);})[0];
    return d ? { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
      controls:[...d.querySelectorAll('button,input,[role=switch],[role=radio]')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().slice(0,26)).filter(Boolean).slice(0,16) } : null; })()`);
  if (!panel) { await page.keyboard.press('Meta+Shift+T').catch(()=>{}); await page.waitForTimeout(1500);
    panel = await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper]')].filter(vis)[0];
      return d ? { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
        controls:[...d.querySelectorAll('button,input,[role=switch],[role=radio]')].filter(vis)
          .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().slice(0,26)).filter(Boolean).slice(0,16) } : '(panel did not open)'; })()`); }
  return { appearanceStoreBefore: before.slice(0,180), panel };
};
