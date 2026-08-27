const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const cases = [
    ['known fixture email',      'qa.d.dave@aloqa.test'],
    ['unknown but valid format', 'qa.d.nosuchperson9f2a@aloqa.test'],
    ['known email again (2nd)',  'qa.d.dave@aloqa.test'],
    ['known email again (3rd)',  'qa.d.dave@aloqa.test'],
    ['malformed',                'not-an-email'],
    ['empty',                    ''],
  ];
  const results=[];
  for (const [label, email] of cases) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const net=[];
    p.on('response', async r => { if(r.request().method()==='GET') return;
      const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\//.test(u)) return;
      let b=''; try{b=(await r.text()).slice(0,180);}catch{}
      net.push(`${r.request().method()} ${u.slice(0,50)} -> ${r.status()} ${b}`); });
    await p.goto('https://airion-cargo.store/forgot-password', { waitUntil:'networkidle' });
    await p.waitForTimeout(1600);
    const seen=[];
    const poll=setInterval(async()=>{ try{
      const t=await p.evaluate(`(() => { const vis=(${VIS});
        return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=oast],p,span,div')]
          .filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim())
          .filter(x=>x&&x.length<170&&/sent|check|email|link|invalid|valid|required|too many|wait|error|unable|reset/i.test(x)); })()`);
      for(const x of t) if(!seen.includes(x)) seen.push(x);
    }catch{} }, 250);
    await p.fill('input[name="email"]', email).catch(()=>{});
    await p.waitForTimeout(400);
    const filled = await p.evaluate(`(() => { const e=document.querySelector('input[name="email"]'); return e?e.value:null; })()`);
    await p.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button[type=submit]')].filter(vis); if(b.length) b[0].click(); })()`);
    await p.waitForTimeout(3800);
    clearInterval(poll);
    const after = await p.evaluate(`(() => { const vis=(${VIS});
      return { url:location.pathname,
               text:(document.body.innerText||'').replace(/\\s+/g,' ').trim().slice(0,300) }; })()`);
    results.push({ label, email, filled, net, after,
      notices:[...new Set(seen)].sort((a,b)=>a.length-b.length).slice(0,4) });
    await ctx.close();
  }
  return results;
};
