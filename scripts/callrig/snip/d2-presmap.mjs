// Map each presence indicator to the person it belongs to. Light: only walks
// [aria-label] nodes and a few ancestors each (a full '*' scan crashed the tab).
export default async ({page}) => {
  const where = process.env.QA_WHERE || '/w/W4QDF1XTURESO01/directories?tab=people';
  await page.goto('https://airion-cargo.store'+where,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(()=>{
    const out=[];
    for (const e of document.querySelectorAll('[aria-label]')) {
      const al=e.getAttribute('aria-label')||'';
      if(!/^(Online|Offline|Active|Away|Last seen)/i.test(al)) continue;
      let p=e, name='';
      for(let i=0;i<6 && p;i++,p=p.parentElement){
        const t=(p.innerText||'').replace(/\s+/g,' ').trim();
        if(/QA \w+/.test(t) && t.length<90){ name=t; break; }
      }
      out.push({presence:al, near:name.slice(0,70)});
    }
    const names=[...document.querySelectorAll('main *')].length; // cheap sanity number
    return {indicators:out, domNodes:names};
  });
};
