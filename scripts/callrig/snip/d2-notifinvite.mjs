const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  const bell = page.locator('button[aria-label*="Notifications"]').first();
  if (!(await bell.count())) return { err:'bell not found' };
  await bell.click(); await page.waitForTimeout(2800);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const all=[...document.querySelectorAll('body *')].filter(vis)
      .filter(e=>/Workspace invitation/i.test(e.innerText||''));
    const row=all.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return { found:false, panelText:(document.body.innerText||'').slice(0,220) };
    let box=row; for(let i=0;i<4&&box.parentElement;i++){ if((box.innerText||'').length>60) break; box=box.parentElement; }
    const inter=[...box.querySelectorAll('*')].filter(vis).filter(e=>{
      const t=e.tagName.toLowerCase(); const r=e.getAttribute('role')||'';
      return t==='button'||t==='a'||['button','link','menuitem'].includes(r)||getComputedStyle(e).cursor==='pointer'; })
      .map(e=>({ tag:e.tagName.toLowerCase(), text:(e.innerText||'').trim().replace(/\\n/g,' | ').slice(0,40),
                 aria:(e.getAttribute('aria-label')||'').slice(0,36) }));
    return { found:true, rowText:(box.innerText||'').replace(/\\n+/g,' | ').slice(0,240),
             interactiveCount:inter.length, interactive:inter.slice(0,8) }; })()`);
};
