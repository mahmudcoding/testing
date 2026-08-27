const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const PW='QaPass123!';
export default async ({ browser }) => {
  const cases = [
    ['wrong password #1',      'qa.d.dave@aloqa.test',  'WrongPass000!'],
    ['wrong password #2',      'qa.d.dave@aloqa.test',  'WrongPass000!'],
    ['wrong password #3',      'qa.d.dave@aloqa.test',  'WrongPass000!'],
    ['UPPERCASE email',        'QA.D.DAVE@ALOQA.TEST',  PW],
    ['email with spaces',      '  qa.d.dave@aloqa.test  ', PW],
    ['correct, recovery check','qa.d.dave@aloqa.test',  PW],
  ];
  const out=[];
  for (const [label,email,pw] of cases) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const net=[];
    p.on('response', async r => { if(r.request().method()==='GET') return;
      let b=''; try{b=(await r.text()).slice(0,150);}catch{}
      net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,42)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
    await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
    await p.waitForTimeout(1500);
    await p.fill('input[name="email"]', email).catch(()=>{});
    await p.fill('input[name="password"]', pw).catch(()=>{});
    await p.waitForTimeout(250);
    const filled = await p.evaluate(`(() => { const e=document.querySelector('input[name=email]'), q=document.querySelector('input[name=password]');
      return { email:e?e.value:null, pwLen:q?q.value.length:null }; })()`);
    await p.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button[type=submit]')].filter(vis); if(b.length) b[0].click(); })()`);
    await p.waitForTimeout(5000);
    const after = await p.evaluate(`(() => ({ url:location.pathname,
      text:(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,220) }))()`);
    const signedIn = await p.evaluate(async () => {
      try { const r=await fetch('/api/v1/auth/me',{credentials:'include'});
            if(r.status!==200) return {status:r.status};
            const j=await r.json(); return {status:200, email:j.email||(j.user&&j.user.email)}; }
      catch(e){ return {err:String(e).slice(0,40)}; } });
    out.push({ label, sentEmail:filled.email, after, signedIn, net:net.slice(0,3) });
    await ctx.close();
  }
  return out;
};
