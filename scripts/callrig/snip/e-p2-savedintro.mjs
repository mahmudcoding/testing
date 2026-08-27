import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/chat/saved`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(()=>{
    const probe=(needle)=>{
      const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      let n, node=null;
      while(n=w.nextNode()){ if(n.nodeValue && n.nodeValue.includes(needle)){ node=n.parentElement; break; } }
      if(!node) return {found:false};
      let o=1,x=node;
      while(x&&x!==document.documentElement){ const s=getComputedStyle(x);
        if(s.display==='none'||s.visibility==='hidden') return {found:true,visible:false,why:'display/visibility'};
        o*=parseFloat(s.opacity||'1'); x=x.parentElement; }
      const r=node.getBoundingClientRect();
      const hit=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
      return {found:true, opacity:+o.toFixed(3),
        rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
        inViewport:r.y>=0&&r.y<innerHeight,
        hitIsSelfOrChild: !!hit && (node.contains(hit)||hit.contains(node)),
        visible: o>0.01 && r.width>0 && r.height>0};
    };
    return {addTeammates: probe('Add teammates'),
            startChannel: probe('Start this channel'),
            pinnedBar:  probe('no message text')};
  });
};
