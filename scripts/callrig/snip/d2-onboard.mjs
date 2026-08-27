import { safeClick } from './lib.mjs';
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={landed:page.url()};
  out.welcome = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const m=document.querySelector('main')||document.body;
    return {txt:(m.innerText||'').replace(/\s+/g,' ').slice(-400),
      ctrls:[...m.querySelectorAll('button,a')].filter(vis).map(b=>(b.innerText||'').trim()).filter(Boolean).slice(-8)};
  });
  out.click = await safeClick(page,'main button:has-text("Create a company")');
  await page.waitForTimeout(2500);
  const scan = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const d=document.querySelector('[role=dialog],[role=alertdialog]');
    const root=d||document.querySelector('main')||document.body;
    const lab=e=>{ if(e.id){const l=root.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l)return l.innerText.trim();}
      const l=e.closest('label'); if(l)return l.innerText.trim();
      let p=e.parentElement; for(let k=0;k<4&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<120)return t;} return ''; };
    return {isDialog:!!d, head:(root.querySelector('h1,h2,h3')||{}).innerText||'',
      fields:[...root.querySelectorAll('input,textarea,select')].filter(vis)
        .map(e=>({t:e.type,ph:e.placeholder||'',req:e.required,max:e.getAttribute('maxlength'),label:lab(e).slice(0,45)})),
      btns:[...root.querySelectorAll('button')].filter(vis).map(b=>`${b.disabled?'(dis)':''}${(b.innerText||'').trim().slice(0,26)}`),
      txt:(root.innerText||'').replace(/\s+/g,' ').slice(0,400)};
  });
  out.dialog = await scan();
  // boundary probe on the name field, no submit
  if (out.dialog.fields.length) {
    const inp = page.locator('[role=dialog] input, [role=alertdialog] input').first();
    out.cases=[];
    for (const [n,v] of [['empty',''],['1 char','A'],['2 chars','Ab'],['whitespace','   '],['200 chars','Z'.repeat(200)]]) {
      await inp.fill(''); await page.waitForTimeout(200);
      if(v) await inp.fill(v);
      await page.waitForTimeout(700);
      const s=await scan();
      out.cases.push({case:n, typed:v.length, value:(await inp.inputValue()).length, btns:s.btns});
    }
    await page.locator('[role=dialog] button, [role=alertdialog] button').filter({hasText:/^Cancel$/}).first().click().catch(()=>{});
  }
  return out;
};
