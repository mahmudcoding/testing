export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/sessions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  out.before = await page.evaluate(async()=>{const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
    const j=await r.json().catch(()=>({})); return Array.isArray(j)?j.length:(j.sessions||[]).length;});
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET'||u.pathname.startsWith('/api/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  const b = page.locator('main button').filter({hasText:/^Sign out$/}).first();
  out.found = await b.count();
  if (out.found) { await b.scrollIntoViewIfNeeded(); await b.click(); await page.waitForTimeout(2000);
    const dlg = await page.evaluate(()=>{const d=document.querySelector('[role=dialog],[role=alertdialog]');
      return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,180),btns:[...d.querySelectorAll('button')].map(x=>x.innerText.trim()).filter(Boolean)}:null;});
    out.dialog=dlg;
    if(dlg) await page.locator('[role=dialog] button,[role=alertdialog] button').filter({hasText:/Sign out|Confirm|Yes/i}).first().click().catch(e=>out.err=String(e).slice(0,70));
    await page.waitForTimeout(4500);
  }
  out.reqs=reqs.filter(r=>/session/i.test(r)); page.off('response', on);
  out.after = await page.evaluate(async()=>{const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
    const j=await r.json().catch(()=>({})); return Array.isArray(j)?j.length:(j.sessions||[]).length;});
  out.notices = await page.evaluate(()=>[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')]
    .filter(e=>{const r=e.getBoundingClientRect(); return r.width>2&&r.height>2;})
    .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,3));
  return out;
};
