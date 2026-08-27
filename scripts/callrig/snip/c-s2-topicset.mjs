export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={runs:[]};
  const open=async()=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(5500);
    const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
    if(await det.count()) { await det.first().click(); await page.waitForTimeout(1500); }
    const about=page.locator('[role="tab"]').filter({hasText:'About'});
    if(await about.count()){ await about.first().click(); await page.waitForTimeout(1200); }
  };
  const setTopic=async(text, tag)=>{
    await open();
    const ta=page.locator('textarea').first();
    const n=await ta.count();
    if(!n) return {tag, err:'no textarea'};
    await ta.click();
    await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(300);
    if(text) await ta.fill(text);
    await page.waitForTimeout(400);
    const reqs=[];
    const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
      reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,40), body:(r.postData()||'').slice(0,120)}); };
    page.on('request', onReq);
    const save=page.locator('button').filter({hasText:'Save'}).first();
    await save.click(); await page.waitForTimeout(2500);
    page.off('request', onReq);
    // read back: header + about panel + API
    const shown=await page.evaluate(()=>{
      const h=document.querySelector('main header')||document.querySelector('header');
      const panel=[...document.querySelectorAll('[role="tabpanel"]')].find(p=>p.getBoundingClientRect().height>4);
      const ta=document.querySelector('textarea');
      return {header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,90),
        panel:(panel?panel.innerText:'').replace(/\s+/g,' ').slice(0,110),
        textarea: ta? ta.value.slice(0,90):null};
    });
    const api=await page.evaluate(async(ch)=>{
      const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
      if(!r.ok) return {status:r.status};
      const j=await r.json();
      return {topic:j.topic??j.description??null, keys:Object.keys(j).filter(k=>/topic|desc/i.test(k))};
    }, ch);
    return {tag, sent:text, reqs, shown, api};
  };
  out.runs.push(await setTopic('QA-S2-TOPIC plain topic','plain'));
  out.runs.push(await setTopic('QA-S2-TOPIC *bold* _it_ [x](http://y) # head','markdown'));
  out.runs.push(await setTopic('QA-S2-TOPIC line1\nline2\nline3','newlines'));
  return out;
};
