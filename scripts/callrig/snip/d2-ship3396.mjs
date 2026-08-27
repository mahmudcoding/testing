const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
// ALK-3396: submitting the create-role form with an empty name scrolled the page to the top,
// losing the reader's position. Shipped fix: "keep the reader on the role name field".
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const runs=[];
  for (let r=0;r<3;r++){
    const net=[];
    const onResp = resp => { const m=resp.request().method();
      if (m!=='GET' && /\/api\//.test(resp.url())) net.push(`${m} ${resp.url().replace(/^https?:\/\/[^/]+/,'').slice(0,54)} -> ${resp.status()}`); };
    page.on('response', onResp);
    await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2400);
    const before = await page.evaluate(`(() => { const vis=(${VIS});
      const sc=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);
        return e.scrollHeight-e.clientHeight>40 && /auto|scroll/.test(s.overflowY) && vis(e);})[0];
      if(!sc) return null; sc.scrollTop = 520;      // move away from the top
      const nm=[...document.querySelectorAll('input[placeholder="e.g. Moderators"]')].filter(vis)[0];
      return { scrollTop: sc.scrollTop,
               nameInViewport: nm ? (nm.getBoundingClientRect().top>=0 && nm.getBoundingClientRect().bottom<=innerHeight) : null,
               nameY: nm ? Math.round(nm.getBoundingClientRect().top) : null }; })()`);
    await page.waitForTimeout(400);
    const clicked = await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>(x.innerText||'').trim()==='Create role');
      if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
    await page.waitForTimeout(1400);
    const after = await page.evaluate(`(() => { const vis=(${VIS});
      const sc=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);
        return e.scrollHeight-e.clientHeight>40 && /auto|scroll/.test(s.overflowY) && vis(e);})[0];
      const nm=[...document.querySelectorAll('input[placeholder="e.g. Moderators"]')].filter(vis)[0];
      const ae=document.activeElement;
      const err=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&vis(e))
        .map(e=>(e.innerText||'').trim())
        .filter(t=>/required|name|enter|empty/i.test(t)&&t.length<90).slice(0,4);
      return { scrollTop: sc?sc.scrollTop:null,
               nameInViewport: nm ? (nm.getBoundingClientRect().top>=0 && nm.getBoundingClientRect().bottom<=innerHeight) : null,
               nameY: nm ? Math.round(nm.getBoundingClientRect().top) : null,
               focusIsNameField: !!(nm && ae===nm),
               focusTag: ae?ae.tagName.toLowerCase()+(ae.placeholder?'['+ae.placeholder+']':''):null,
               messages: err }; })()`);
    page.off('response', onResp);
    runs.push({ clicked, before, after, jumpedToTop: before && after && before.scrollTop>0 && after.scrollTop===0,
                writeRequests: [...net] });
  }
  return { runs };
};
