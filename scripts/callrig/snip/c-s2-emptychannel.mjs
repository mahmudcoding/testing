export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(7500);
  const add=page.locator('button[aria-label="Add channel"]');
  if(!await add.count()) return {err:'no Add channel'};
  await add.first().click(); await page.waitForTimeout(1800);
  const inp=page.locator('[role="dialog"] input:visible').first();
  await inp.click(); await inp.fill('qa-c2-emptystate'); await page.waitForTimeout(500);
  const create=page.locator('[role="dialog"] button').filter({hasText:/^Create/}).first();
  await create.click(); await page.waitForTimeout(5000);
  out.url=page.url().replace('https://airion-cargo.store','');
  out.visible=await page.evaluate(()=>{
    const visInfo=(el)=>{const r=el.getBoundingClientRect();
      if(r.width<2||r.height<2) return {ok:false, why:'rect'};
      let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return {ok:false, why:'hidden'};
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;}
      if(op<0.05) return {ok:false, why:'opacity '+op.toFixed(2)};
      const hit=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
      return {ok:!!(hit&&(el.contains(hit)||hit.contains(el))), why:'hit'};};
    const rows=[];
    for(const el of document.querySelectorAll('main *')){
      if(el.children.length) continue;
      const t=(el.textContent||'').trim();
      if(!t||t.length>60) continue;
      const v=visInfo(el);
      if(v.ok) rows.push(t);
    }
    const onboarding=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0)
      .filter(e=>/Start this channel|Add teammates|Add users/.test(e.textContent||''))
      .map(e=>({t:(e.textContent||'').trim().slice(0,44), vis:visInfo(e)}));
    return {visibleTexts:[...new Set(rows)].slice(0,14), onboarding};});
  return out;
};
