export default async ({ctx}) => {
  const M = process.env.QA_MEET;
  const p = ctx.pages().filter(x=>x.url().includes('guest/meeting')||x.url().includes('/join/')).pop();
  if (!p) return {err:'no guest page', urls: ctx.pages().map(x=>x.url().slice(-40))};
  await p.waitForTimeout(2000);
  const tb = await p.evaluate(()=>{
    const t=document.querySelector('[data-testid="call-toolbar"]');
    return t? [...t.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)}#${b.getAttribute('data-testid')||'-'}${b.disabled?' DIS':''}`):'no toolbar';
  });
  let panel=null;
  const sr = p.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await sr.count()) { await sr.click(); await p.waitForTimeout(2500);
    panel = await p.evaluate(()=>{const s=document.querySelector('[data-testid="breakout-rooms-panel"]'); return s? {text:s.innerText.replace(/\n+/g,' | ').slice(0,300), btns:[...s.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)).filter(Boolean)}:'no panel';}); }
  const api = await p.evaluate(async (M)=>{
    const mk = await fetch('/api/v1/meeting/'+M+'/breakout-rooms',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Guest Room',visibility:'public'})});
    const mkT = (await mk.text()).slice(0,200);
    const perm = await (await fetch('/api/v1/meeting/'+M+'/my-permissions',{credentials:'include'})).text();
    const inv = await fetch('/api/v1/meeting/'+M+'/invite',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_ids:['U4QABOB00000001']})});
    const rec = await fetch('/api/v1/meeting/'+M+'/recording/start',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_scope:'participants'})});
    const end = await fetch('/api/v1/meeting/'+M+'/end',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});
    return {createRoom: mk.status+' :: '+mkT, myPermissions: perm.slice(0,300),
            invite: inv.status+' :: '+(await inv.text()).slice(0,120),
            recording: rec.status+' :: '+(await rec.text()).slice(0,120),
            end: end.status+' :: '+(await end.text()).slice(0,120)};
  }, M);
  return {toolbar: tb, panel, api};
};
