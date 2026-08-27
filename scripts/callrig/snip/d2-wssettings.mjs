export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/workspace',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(async ()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const m=document.querySelector('main');
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>({}));
    const t=(m.innerText||'').replace(/\s+/g,' ');
    return {me:me.email,
      tabs:[...m.querySelectorAll('[role=tab],a')].filter(vis).map(e=>e.innerText.trim()).filter(x=>/^(General|Roles)$/.test(x)),
      identity: t.slice(t.indexOf('Workspace identity'), t.indexOf('Workspace identity')+220),
      danger: t.slice(t.indexOf('Danger zone'), t.indexOf('Danger zone')+320),
      inputs:[...m.querySelectorAll('input')].filter(vis).filter(e=>!/Filter settings/.test(e.placeholder||''))
        .map(e=>`${e.type} value="${String(e.value).slice(0,30)}" ph="${e.placeholder||''}"`),
      ctrls:[...m.querySelectorAll('button')].filter(vis)
        .map(b=>`${b.disabled?'(dis)':''}${(b.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,34)}`)};
  });
};
