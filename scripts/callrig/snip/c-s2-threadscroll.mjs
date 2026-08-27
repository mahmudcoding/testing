const WS='W4QCF1XTURESO01', CH='C4OWOSZN35PTPMA', PID='M4OWQ375XE923T4';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}?thread=${PID}`,{waitUntil:'load'});
  await page.waitForTimeout(11000);
  const snap=(t)=>page.evaluate((tag)=>{
    // the thread panel is the right-hand region; find its scroll container
    let sc=null, best=0;
    for (const e of document.querySelectorAll('div')) {
      if (e.scrollHeight>e.clientHeight+40 && e.clientHeight>200) {
        const r=e.getBoundingClientRect();
        if (r.x > innerWidth*0.5 && e.querySelector('[data-message-id]')) { sc=e; break; }
      }
    }
    const nums=[...document.querySelectorAll('[data-message-id]')]
      .map(e=>{const m=(e.innerText||'').match(/QA-S2-TR-(\d+)/); return m?Number(m[1]):null;}).filter(n=>n!==null);
    return {tag, total:document.querySelectorAll('[data-message-id]').length,
      trCount:nums.length, min:nums.length?Math.min(...nums):null, max:nums.length?Math.max(...nums):null,
      missing: nums.length? (()=>{const s=new Set(nums); const out=[];
        for(let i=Math.min(...nums);i<=Math.max(...nums);i++) if(!s.has(i)) out.push(i); return out.slice(0,8);})():null,
      marker:(document.body.innerText.match(/Replies \(\d+\)/)||[null])[0],
      scroll: sc?{top:Math.round(sc.scrollTop), h:Math.round(sc.scrollHeight), ch:Math.round(sc.clientHeight), x:Math.round(sc.getBoundingClientRect().x)}:null};
  }, t);
  const out=[];
  out.push(await snap('initial'));
  const box = await page.evaluate(()=>{
    for (const e of document.querySelectorAll('div')) {
      if (e.scrollHeight>e.clientHeight+40 && e.clientHeight>200) {
        const r=e.getBoundingClientRect();
        if (r.x > innerWidth*0.5 && e.querySelector('[data-message-id]'))
          return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};
      }
    }
    return null;
  });
  if (box) {
    for (let i=0;i<10;i++){
      await page.mouse.move(box.x, box.y);
      await page.mouse.wheel(0, -1500);
      await page.waitForTimeout(2000);
      out.push(await snap('wheel-'+(i+1)));
    }
  }
  return {box, steps: out.filter((s,i)=> i===0 || s.trCount!==out[i-1].trCount || s.min!==out[i-1].min)};
};
