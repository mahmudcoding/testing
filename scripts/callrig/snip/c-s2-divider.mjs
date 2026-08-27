export default async ({page}) => page.evaluate(()=>{
  const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
  let node=null;
  for (const e of document.querySelectorAll('main *')){
    if(e.children.length) continue;
    if((e.textContent||'').trim()!=='New') continue;
    if(!vis(e)) continue; node=e; break;
  }
  if(!node) return 'no New marker';
  // widen to the container that spans the feed
  let box=node, hops=0;
  while(box.parentElement && hops<4 && box.getBoundingClientRect().width<400){ box=box.parentElement; hops++; }
  const br=box.getBoundingClientRect();
  const msgs=[...document.querySelectorAll('main [data-message-id]')].map(m=>{
    const r=m.getBoundingClientRect();
    return {id:m.getAttribute('data-message-id'), y:Math.round(r.y),
      txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,40)};
  });
  const y=Math.round(node.getBoundingClientRect().y);
  return {markerY:y, containerRect:[Math.round(br.x),Math.round(br.y),Math.round(br.width),Math.round(br.height)],
    containerText:(box.innerText||'').replace(/\s+/g,' ').slice(0,40),
    above: msgs.filter(m=>m.y<y).slice(-2), below: msgs.filter(m=>m.y>=y).slice(0,2)};
});
