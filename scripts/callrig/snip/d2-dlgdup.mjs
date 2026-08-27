// Open the Delete-role dialog and measure each text block's real visibility.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', scope=process.env.QA_SCOPE||'company', role=process.env.QA_ROLE;
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.evaluate(r=>{
    for(const tr of document.querySelectorAll('tr')) if((tr.innerText||'').includes(r)){
      const b=[...tr.querySelectorAll('button')].find(x=>/^Delete/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
      if(b){b.scrollIntoView({block:'center'}); b.click(); return;}
    }
  }, role);
  await page.waitForTimeout(2500);
  const res = await page.evaluate(()=>{
    const d=document.querySelector('[role=dialog],[role=alertdialog]');
    if(!d) return {err:'no dialog'};
    const blocks=[...d.querySelectorAll('h1,h2,h3,p,span,div')]
      .filter(e=>e.children.length===0 || [...e.children].every(c=>!c.textContent.trim()))
      .filter(e=>(e.textContent||'').trim().length>8);
    return {blocks: blocks.map(e=>{
      const r=e.getBoundingClientRect();
      let n=e,op=1,hidden=false;
      while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden'){hidden=true;break;} op*=parseFloat(c.opacity||'1'); n=n.parentElement;}
      const cx=r.left+r.width/2, cy=r.top+r.height/2;
      const top=(cx>=0&&cy>=0&&cx<innerWidth&&cy<innerHeight)?document.elementFromPoint(cx,cy):null;
      return {txt:(e.textContent||'').trim().slice(0,70), tag:e.tagName.toLowerCase(),
        cls:(typeof e.className==='string'?e.className:'').slice(0,40),
        w:Math.round(r.width), h:Math.round(r.height), op:Number(op.toFixed(2)), hidden,
        hitSelf: !!(top && (e===top||e.contains(top)||top.contains(e)))};
    })};
  });
  // leave it closed
  await page.locator('[role=dialog] button,[role=alertdialog] button').filter({hasText:/^Cancel$/}).first().click().catch(()=>{});
  return res;
};
