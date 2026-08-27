import { safeClick } from './lib.mjs';
export default async ({page}) => {
  const ws=process.env.QA_WS, name=process.env.QA_WSNAME||'QA D2 Probe Workspace';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/company`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.click = await safeClick(page,'main button:has-text("Create your first workspace")');
  await page.waitForTimeout(2500);
  out.dialog = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const d=document.querySelector('[role=dialog],[role=alertdialog]');
    const root=d||document.querySelector('main')||document.body;
    return {isDialog:!!d, txt:(root.innerText||'').replace(/\s+/g,' ').slice(0,260),
      fields:[...root.querySelectorAll('input')].filter(vis).filter(e=>!/Filter settings/.test(e.placeholder||'')).map(e=>e.placeholder||e.type),
      btns:[...root.querySelectorAll('button')].filter(vis).map(b=>`${b.disabled?'(dis)':''}${(b.innerText||'').trim().slice(0,22)}`)};
  });
  if (out.dialog.isDialog && out.dialog.fields.length) {
    await page.locator('[role=dialog] input, [role=alertdialog] input').first().fill(name);
    await page.waitForTimeout(700);
    const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
      if(m!=='GET'||u.pathname.startsWith('/api/v1/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    await page.locator('[role=dialog] button, [role=alertdialog] button').filter({hasText:/^(Create|Create workspace)$/i}).last().click();
    await page.waitForTimeout(9000);
    out.reqs=reqs.filter(r=>/workspace|compan/i.test(r)); page.off('response', on);
    out.after = await page.evaluate(async()=>{
      const ws=await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).json().catch(()=>({}));
      return {url:location.pathname, workspaces:(ws.workspaces||[]).map(w=>`${w.name} (${w.type}) ${w.id}`)};
    });
  }
  return out;
};
