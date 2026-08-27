const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const EXIST='qa.d.alice@aloqa.test';
export default async ({ browser }) => {
  const cases = [
    ['registered email, all else valid', EXIST, 'Probe Person', 'QaPass123!'],
    ['password 7 chars',                 EXIST, 'Probe Person', 'Qa1234!'],
    ['empty display name',               EXIST, '',             'QaPass123!'],
    ['whitespace-only display name',     EXIST, '   ',          'QaPass123!'],
    ['all empty',                        '',    '',             ''],
    ['malformed email',                  'bad@', 'Probe Person','QaPass123!'],
  ];
  const out=[];
  for (const [label,email,name,pw] of cases) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const net=[];
    p.on('response', async r => { if(r.request().method()==='GET') return;
      let b=''; try{b=(await r.text()).slice(0,140);}catch{}
      net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,34)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
    await p.goto('https://airion-cargo.store/signup', { waitUntil:'networkidle' });
    await p.waitForTimeout(1700);
    await p.fill('input[name="email"]', email).catch(()=>{});
    await p.fill('input[name="displayName"]', name).catch(()=>{});
    await p.fill('input[name="password"]', pw).catch(()=>{});
    await p.waitForTimeout(250);
    await p.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button[type=submit]')].filter(vis); if(b.length) b[0].click(); })()`);
    await p.waitForTimeout(4200);
    const after = await p.evaluate(`(() => { const vis=(${VIS});
      const t=(document.body.innerText||'').replace(/\\s+/g,' ');
      const msgs=[...document.querySelectorAll('p,span,div,[role=alert],[role=status]')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim())
        .filter(x=>x&&x.length<120&&/valid|required|least|exist|already|character|error|unable|taken|enter/i.test(x));
      return { url:location.pathname, msgs:[...new Set(msgs)].sort((a,b)=>a.length-b.length).slice(0,4),
               text:t.slice(0,190) }; })()`);
    out.push({ label, after, net:net.slice(0,3) });
    await ctx.close();
  }
  return out;
};
