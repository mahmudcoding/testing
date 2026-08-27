export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', parent='M4OX2S2JDLOFCMP';
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(11000);
  const state=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const panel=[...document.querySelectorAll('aside,[role="dialog"],section')].filter(v)
      .filter(d=>/Replies|Thread/i.test(d.innerText||''))
      .sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
    const scope=panel||document;
    const nums=[...scope.querySelectorAll('[data-message-id]')]
      .map(e=>{const m=(e.innerText||'').match(/QA-S2-BT2-(\d{3})/); return m?+m[1]:null;})
      .filter(n=>n!==null);
    const head=(panel?panel.innerText:'').replace(/\s+/g,' ');
    return {panelFound:!!panel, header:(head.match(/Replies \(\d+\)|Thread/)||[''])[0],
      rendered:nums.length, min:nums.length?Math.min(...nums):null,
      max:nums.length?Math.max(...nums):null};});
  out.onOpen=await state();
  if(!out.onOpen.panelFound) return out;
  // scroll up inside the panel
  const panelBox=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const p=[...document.querySelectorAll('aside,[role="dialog"],section')].filter(v)
      .filter(d=>/Replies|Thread/i.test(d.innerText||''))
      .sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
    if(!p) return null; const r=p.getBoundingClientRect();
    return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)};});
  await page.mouse.move(panelBox.x, panelBox.y);
  const series=[out.onOpen]; let stalls=0;
  for(let i=0;i<80 && stalls<10;i++){
    await page.mouse.wheel(0,-1300);
    await page.waitForTimeout(400);
    const s=await state();
    const p=series[series.length-1];
    if(s.rendered===p.rendered && s.min===p.min) stalls++; else stalls=0;
    series.push(s);
    if(s.min===1) break;
  }
  const key=(s)=>`${s.rendered}/${s.min}/${s.max}`;
  const ch2=[]; let prev=null; for(const s of series){ if(key(s)!==prev){ch2.push(s);prev=key(s);} }
  out.scroll={steps:series.length-1, reachedFirst:series[series.length-1].min===1,
    final:series[series.length-1], changes:ch2.slice(-8)};
  return out;
};
