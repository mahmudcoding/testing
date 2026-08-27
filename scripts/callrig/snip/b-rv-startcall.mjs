export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  const name = process.env.QA_NAME || 'QA reverify call';
  const access = process.env.QA_ACCESS || 'public';
  const join = process.env.QA_JOIN || 'open';   // open | manual_admit | password
  // end own leftover
  out.pre = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    const m=j&&j.meeting; if(!m||m.status!=='active') return null;
    const r=await fetch(`/api/v1/meeting/${m.id}/end`,{method:'POST',credentials:'include'}); return {ended:m.name,s:r.status};
  });
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="calls-hub-start-now"]'); if(b) b.click(); });
  await page.waitForTimeout(2800);
  const nm = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (nm) await nm.fill(name);
  out.dlgText = await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop(); return d? d.innerText.replace(/\s+/g,' ').slice(0,500):null; });
  out.radios = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] input[type=radio]')].map(r=>({v:r.value,c:r.checked})));
  await page.evaluate(([a,j])=>{ const pick=v=>{const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x=>x.value===v); if(r) r.click();}; pick(a); pick(j); }, [access, join]);
  await page.waitForTimeout(900);
  if (process.env.QA_PW) {
    const pw = await page.$('[role=dialog] input[type=password]');
    if (pw) { await pw.fill(process.env.QA_PW); out.pwFilled=true; }
  }
  out.checked = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(r=>r.checked).map(r=>r.value));
  await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/^Start call$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(8000);
  out.url = page.url();
  out.meetingId = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || null;
  out.meeting = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); const m=j&&j.meeting; return m?{id:m.id,name:m.name,priv:m.is_private,pw:m.password_protected,appr:m.requires_approval}:null; });
  return out;
};
