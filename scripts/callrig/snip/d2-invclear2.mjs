const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { const m=r.request().method();
    if(m==='GET'||!/invite/i.test(r.url())) return;
    let b=''; try{ b=(await r.text()).slice(0,120);}catch{}
    net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,60)} -> ${r.status()} ${b}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  // find the row whose status cell reads Pending, and click its Revoke invite button
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .filter(tr=>[...tr.querySelectorAll('td')].some(td=>/^Pending$/i.test((td.innerText||'').trim())));
    if(!rows.length) return {rows:0};
    const b=[...rows[0].querySelectorAll('button')].filter(vis)
      .filter(x=>/Revoke/i.test((x.innerText||'')));
    if(b.length!==1) return {rows:rows.length, buttons:b.length};
    b[0].click(); return {rows:rows.length, clicked:true}; })()`);
  await page.waitForTimeout(2500);
  // a confirmation dialog may appear
  const confirmed = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis)
      .filter(x=>/^(Revoke|Revoke invite|Confirm|Yes)$/i.test((x.innerText||'').trim()));
    if(b.length){ b[b.length-1].click(); return b.length; } return 0; })()`);
  await page.waitForTimeout(2500);
  const after = await page.evaluate(`(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const j=await r.json().catch(()=>null);
      return Array.isArray(j)?j:((j&&(j.invites||j.items))||[]);};
    const d=await g('/api/v1/workspaces/W4QDF1XTURESO01/invites/direct');
    const l=await g('/api/v1/workspaces/W4QDF1XTURESO01/invites');
    return { directPending:d.filter(x=>x.status==='pending').length,
             linkPending:l.filter(x=>x.status==='pending').length };})()`);
  return { clicked, confirmed, requests:net.slice(0,5), after };
};
