export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const enum_=(label)=>page.evaluate((label)=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const items=[...document.querySelectorAll('button,[role="button"],a,input,textarea,select,[role="tab"],[role="switch"]')]
      .filter(vis).map(e=>{const r=e.getBoundingClientRect();
        return {l:(e.getAttribute('aria-label')||e.getAttribute('placeholder')||(e.textContent||'').trim()).slice(0,30),
          tag:e.tagName, x:Math.round(r.x), y:Math.round(r.y)};})
      .filter(e=>e.l);
    const seen=new Set(); const uniq=[];
    for(const i of items){ const k=i.l+'|'+i.tag; if(!seen.has(k)){seen.add(k); uniq.push(i);} }
    return {label, count:uniq.length, items:uniq};
  }, label);
  out.channelView=await enum_('channel view');
  // hover a message to expose row controls
  const el=page.locator('main [data-message-id]').last();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(700);
  out.withHover=await enum_('with message hover');
  return out;
};
