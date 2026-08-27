const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(r.request().method()==='GET') return;
    if(!/compan/i.test(u)) return; let b=''; try{b=(await r.text()).slice(0,200);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,40)} -> ${r.status()} ${b.slice(0,130)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const inp = page.locator('main input').filter({ hasNot: page.locator('[placeholder="Filter settings"]') }).last();
  const field = page.locator('main input[placeholder="Filter settings"]').count().then(()=>null);
  const nameInput = page.locator('main input').nth(1); // 0 = settings filter, 1 = company name
  const original = await nameInput.inputValue();
  const out = { originalName: original, cases: [] };
  for (const [label, value] of [['single char','Q'], ['empty',''], ['129 chars','Q'.repeat(129)]]) {
    await nameInput.scrollIntoViewIfNeeded();
    await nameInput.fill(value); await page.waitForTimeout(700);
    let notices=[], inline=[];
    const poll=setInterval(async()=>{ try{
      const n=await page.evaluate(`(() => { const vis=(${VIS});
        return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
          .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`);
      if(n.length>notices.length) notices=n;
      const l=await page.evaluate(`(() => { const vis=(${VIS});
        return [...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
          .map(e=>(e.innerText||'').trim())
          .filter(t=>/characters|error|required|invalid|must|too |между|символ/i.test(t) && t.length<90); })()`);
      if(l.length>inline.length) inline=l;
    }catch{} },250);
    net.length=0;
    const save = page.locator('button').filter({hasText:/^Save/}).first();
    const present = await save.count();
    const disabled = present ? await save.isDisabled() : null;
    if (present && !disabled) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(4000); }
    else await page.waitForTimeout(1500);
    clearInterval(poll);
    out.cases.push({ label, typed: value.length+'ch', saveButton: present?(disabled?'disabled':'enabled'):'absent',
                     requests: [...net], toasts: notices, inline });
  }
  // restore
  await nameInput.fill(original); await page.waitForTimeout(600);
  const save = page.locator('button').filter({hasText:/^Save/}).first();
  if (await save.count() && !(await save.isDisabled())) { await save.click(); await page.waitForTimeout(3000); }
  out.restoredTo = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/users/me/companies',{credentials:'include'})).json();
    const a=j.companies||j.items||(Array.isArray(j)?j:[]); return a.map(c=>c.name); });
  return out;
};
