// What the directory shows for each member: name + any presence text/indicator.
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const m=document.querySelector('main')||document.body;
    // each person row: find nodes containing a qa_d_ username
    const rows=[...m.querySelectorAll('li,tr,article,div')].filter(e=>{
      const t=e.innerText||''; return /@qa_d_/.test(t) && t.length<200 && e.querySelectorAll('*').length<40;});
    const seen=new Set(); const out=[];
    for (const r of rows) {
      const t=(r.innerText||'').replace(/\s+/g,' ').trim();
      const key=(t.match(/@qa_d_\w+/)||[''])[0];
      if(!key||seen.has(key)) continue; seen.add(key);
      // presence indicator: aria-labels or title mentioning online/offline/active/seen
      const ind=[...r.querySelectorAll('*')].map(e=>e.getAttribute('aria-label')||e.getAttribute('title')||'')
        .filter(x=>/online|offline|active|away|seen/i.test(x));
      out.push({row:t.slice(0,90), indicators:[...new Set(ind)].slice(0,3)});
    }
    return {count:out.length, people: out, pageText:(m.innerText||'').replace(/\s+/g,' ').slice(0,300)};
  });
};
