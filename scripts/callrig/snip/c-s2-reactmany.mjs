export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const mid=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QAREACT many'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  out.mid=mid?'ok':'no id';
  await page.waitForTimeout(2000);
  const emojis=['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍',
                '🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔'];
  out.add=await page.evaluate(async ({ch,mid,emojis})=>{
    let ok=0, firstErr=null;
    for(const e of emojis){
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/reactions`,
        {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
         body:JSON.stringify({emoji:e})});
      if(r.ok) ok++;
      else { firstErr={afterOk:ok, status:r.status, body:(await r.text()).slice(0,150)}; break; }
    }
    return {ok, firstErr};}, {ch,mid,emojis});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  out.ui=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const els=[...document.querySelectorAll('main [data-message-id]')]
      .filter(e=>/QAREACT many/.test(e.innerText||''));
    const m=els[els.length-1]; if(!m) return {found:false};
    const chips=[...m.querySelectorAll('button')].filter(v)
      .filter(e=>/reaction/i.test(e.getAttribute('aria-label')||''));
    const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e));
    const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1).length;
    const r=m.getBoundingClientRect();
    return {found:true, chips:chips.length, clippedLeaves:clipped,
      msgH:Math.round(r.height), msgW:Math.round(r.width),
      offRight:chips.filter(e=>e.getBoundingClientRect().left>=window.innerWidth).length,
      pageOverflow:document.documentElement.scrollWidth>window.innerWidth};});
  return out;
};
