const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l=e.getAttribute('aria-label')||'';
  if(!l){ let p=e.parentElement; for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){ l=t.split('\\n')[0]; break; } } p=p.parentElement; } } return l.slice(0,44); }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    if(!/compan/i.test(u)) return; let b=''; try{b=(await r.text()).slice(0,200);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,40)} -> ${r.status()} ${b.slice(0,120)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const inputs = await page.evaluate(`(() => { const vis=(${VIS}); const lbl=(${LBL});
    return [...document.querySelectorAll('main input')].filter(vis).map((e,i)=>({i,label:lbl(e),value:String(e.value).slice(0,26)})); })()`);
  const idx = inputs.findIndex(x=>/Company name/i.test(x.label));
  if (idx < 0) return { err:'Company name input not found', inputs };
  const grab = async () => (await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main input')].filter(vis)[${idx}]; })()`)).asElement();
  const el0 = await grab();
  const original = await el0.inputValue();
  const out = { inputs, originalName: original, cases: [] };
  for (const [label, value] of [['single char','Q'], ['empty',''], ['129 chars','Q'.repeat(129)]]) {
    const el = await grab();
    await el.scrollIntoViewIfNeeded(); await el.fill(value); await page.waitForTimeout(800);
    const typed = await el.inputValue();
    let notices=[], inline=[];
    const poll=setInterval(async()=>{ try{
      const n=await page.evaluate(`(() => { const vis=(${VIS});
        return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
          .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`);
      if(n.length>notices.length) notices=n;
      const l=await page.evaluate(`(() => { const vis=(${VIS});
        return [...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
          .map(e=>(e.innerText||'').trim())
          .filter(t=>t.length<90 && /character|error|required|invalid|must|too |between/i.test(t)); })()`);
      if(l.length>inline.length) inline=l;
    }catch{} },250);
    net.length=0;
    const save = page.locator('button').filter({hasText:/^Save/}).first();
    const present = await save.count();
    const disabled = present ? await save.isDisabled() : null;
    if (present && !disabled) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(4000); }
    else await page.waitForTimeout(1800);
    clearInterval(poll);
    out.cases.push({ label, typedLen: typed.length, saveButton: present?(disabled?'disabled':'enabled'):'absent',
                     requests:[...net], toasts:notices.slice(0,2), inline:inline.slice(0,3) });
  }
  const elr = await grab();
  await elr.fill(original); await page.waitForTimeout(700);
  const save = page.locator('button').filter({hasText:/^Save/}).first();
  if (await save.count() && !(await save.isDisabled())) { await save.click(); await page.waitForTimeout(3500); }
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2500);
  out.finalName = await (await grab()).inputValue();
  return out;
};
