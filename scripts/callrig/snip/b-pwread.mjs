export default async ({page}) => {
  const out={};
  // close settings if open, then reopen fresh
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Close meeting settings'); if(b) b.click(); });
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Meeting settings'); if(b) b.click(); });
  await page.waitForTimeout(3000);
  out.state = await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const toggle=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Password protection');
    const pwInput=[...document.querySelectorAll('input[type=password]')].filter(vis)[0];
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return {
      toggleChecked: toggle? (toggle.getAttribute('aria-checked')||toggle.getAttribute('data-state')) : 'no-toggle',
      pwInputPresent: !!pwInput,
      pwValue: pwInput? String(pwInput.value) : null,
      pwValueLen: pwInput? pwInput.value.length : null,
      pwPlaceholder: pwInput? pwInput.placeholder : null,
      revealBtn: d? [...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(t=>/show|reveal|eye|copy/i.test(t)) : [],
      passwordSectionText: d? (d.innerText.replace(/\s+/g,' ').match(/Password protection.{0,160}/)||[])[0] : null
    };
  });
  out.api = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); const m=j&&j.meeting; return m?{pw:m.password_protected, pwField:m.password!==undefined?String(m.password):'(absent)'}:null; });
  return out;
};
