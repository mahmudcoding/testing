export default async ({page}) => {
  const out={};
  out.toggled = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Password protection'); if(b){ b.click(); return b.getAttribute('aria-checked'); } return null; });
  await page.waitForTimeout(1800);
  out.inputsNow = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] input')].filter(i=>i.getBoundingClientRect().width>0).map(i=>({t:i.type, ph:i.placeholder, v:String(i.value).slice(0,20)})));
  // fill password field
  const pw = await page.$('[role=dialog] input[type=password]');
  if (pw) { await pw.fill('Secret123'); out.filled='password-input'; }
  else {
    const cands = await page.$$('[role=dialog] input[type=text]');
    for (const c of cands) { const ph = await c.getAttribute('placeholder'); if (ph && /password/i.test(ph)) { await c.fill('Secret123'); out.filled='text-input:'+ph; break; } }
  }
  await page.waitForTimeout(600);
  out.saved = await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Save'); if(b){ b.click(); return true;} return false; });
  await page.waitForTimeout(4000);
  out.after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    const m=j&&j.meeting;
    return { name:m&&m.name, pw:m&&m.password_protected, appr:m&&m.requires_approval, priv:m&&m.is_private,
      toast: [...document.querySelectorAll('[role=dialog],[class*="toast"]')].filter(x=>x.getBoundingClientRect().width>0).map(x=>x.innerText.replace(/\s+/g,' ').slice(0,120)).join(' || ') };
  });
  return out;
};
