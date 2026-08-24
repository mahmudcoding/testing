export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN, M = process.env.QA_MEET;
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/join/'+tok,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(2500);
  await p.fill('input[type=text]','SideRoom Guest');
  await p.locator('button', {hasText:'Join call'}).first().click();
  await p.waitForTimeout(7000);
  const tb = await p.evaluate(()=>{
    const t=document.querySelector('[data-testid="call-toolbar"]');
    return t? [...t.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)}#${b.getAttribute('data-testid')||'-'}${b.disabled?' DIS':''}`):null;
  });
  // open the side rooms panel if present
  let panel=null;
  const sr = p.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await sr.count()) { await sr.click(); await p.waitForTimeout(2500);
    panel = await p.evaluate(()=>{const s=document.querySelector('[data-testid="breakout-rooms-panel"]')||document.querySelector('[data-testid="call-overlay-expanded"]'); return s? {text:s.innerText.replace(/\n+/g,' | ').slice(-300), btns:[...s.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)).filter(Boolean).slice(-10)}:null;}); }
  // direct API attempt
  const api = await p.evaluate(async (M)=>{
    const r = await fetch('/api/v1/meeting/'+M+'/breakout-rooms',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Guest Room',visibility:'public'})});
    return r.status+' :: '+(await r.text()).slice(0,220);
  }, M);
  const perms = await p.evaluate(async (M)=> (await (await fetch('/api/v1/meeting/'+M+'/my-permissions',{credentials:'include'})).text()).slice(0,400), M);
  return {toolbar: tb, panel, apiCreate: api, myPermissions: perms};
};
