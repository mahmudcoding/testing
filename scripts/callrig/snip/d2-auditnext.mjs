const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  const onReq = r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if (/audit-log\?/.test(u)) net.push(u.slice(0,110)); };
  page.on('request', onReq);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const state = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis).filter(tr=>tr.querySelectorAll('td').length>=3);
    const pager=[...main.querySelectorAll('button')].filter(vis)
      .filter(b=>/^(Previous|Next)$/i.test((b.innerText||'').trim()))
      .map(b=>({t:(b.innerText||'').trim(), disabled:b.disabled===true||b.getAttribute('aria-disabled')==='true'}));
    return { rows: rows.length, pager,
             newest: rows.length? [...rows[0].querySelectorAll('td')][3].innerText.trim() : null,
             oldest: rows.length? [...rows[rows.length-1].querySelectorAll('td')][3].innerText.trim() : null }; })()`;
  const page1 = await page.evaluate(state);
  const clickNext = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Next$/i.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length};
    if(b[0].disabled) return {n:1, disabled:true};
    b[0].click(); return {n:1, clicked:true}; })()`;
  const c1 = await page.evaluate(clickNext);
  await page.waitForTimeout(3000);
  const page2 = await page.evaluate(state);
  const c2 = await page.evaluate(clickNext);
  await page.waitForTimeout(3000);
  const page3 = await page.evaluate(state);
  page.off('request', onReq);
  return { page1, clickedToPage2:c1, page2, clickedToPage3:c2, page3, auditRequests: net };
};
