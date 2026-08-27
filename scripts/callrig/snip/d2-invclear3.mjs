const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { const m=r.request().method();
    if(m==='GET'||!/invite/i.test(r.url())) return;
    let b=''; try{ b=(await r.text()).slice(0,110);}catch{}
    net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,64)} -> ${r.status()} ${b}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const open = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const tr=[...main.querySelectorAll('tr')].filter(vis)
      .filter(x=>[...x.querySelectorAll('td')].some(td=>/^Pending$/i.test((td.innerText||'').trim())))[0];
    if(!tr) return 'no pending row';
    const b=[...tr.querySelectorAll('button')].filter(vis).filter(x=>/Revoke/i.test(x.innerText||''))[0];
    if(!b) return 'no revoke button'; b.click(); return 'opened'; })()`);
  await page.waitForTimeout(2000);
  const confirm = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vis)[0];
    if(!dlg) return 'no dialog';
    const b=[...dlg.querySelectorAll('button')].filter(vis)
      .filter(x=>(x.innerText||'').trim()==='Revoke invitation');
    if(b.length!==1) return 'matched '+b.length; b[0].click(); return 'confirmed'; })()`);
  await page.waitForTimeout(3000);
  const after = await page.evaluate(`(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const j=await r.json().catch(()=>null);
      return Array.isArray(j)?j:((j&&(j.invites||j.items))||[]);};
    const d=await g('/api/v1/workspaces/W4QDF1XTURESO01/invites/direct');
    const l=await g('/api/v1/workspaces/W4QDF1XTURESO01/invites');
    return { directPending:d.filter(x=>x.status==='pending').length,
             linkPending:l.filter(x=>x.status==='pending').length,
             directTotal:d.length, linkTotal:l.length };})()`);
  return { open, confirm, requests:net, after };
};
