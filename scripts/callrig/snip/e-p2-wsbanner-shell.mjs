import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']});
  const routes = [
    ['channel',     `/w/${WS}/c/C4QEGENERAL0001`],
    ['calendar',    `/w/${WS}/calendar`],
    ['files',       `/w/${WS}/files`],
    ['directories', `/w/${WS}/directories?tab=people`],
    ['calls hub',   `/w/${WS}/calls`],
    ['settings',    `/w/${WS}/settings/account`],
  ];
  const out=[];
  for (const [name,path] of routes) {
    await page.goto(BASE+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    const r = await page.evaluate(()=> {
      const t=(document.body.innerText||'').replace(/\s+/g,' ');
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
          if(c.display==='none'||c.visibility==='hidden') return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;}
        if(o<=0.01) return false;
        const rc=el.getBoundingClientRect(), cx=rc.x+rc.width/2, cy=rc.y+rc.height/2;
        if(cx<0||cy<0||cx>innerWidth||cy>innerHeight) return false;
        const h=document.elementFromPoint(cx,cy); return !!h&&(h===el||el.contains(h)||h.contains(el));};
      const nodes=[...document.querySelectorAll('*')].filter(e=>e.children.length===0
        && /^(Connecting…|Reconnecting…|Offline|Connecting|Reconnecting)$/.test((e.textContent||'').trim()));
      const visible=nodes.filter(vis);
      return {textHasConnecting: /Connecting…|Reconnecting/.test(t),
              matchingNodes: nodes.length, visibleNodes: visible.length,
              firstText: visible.length? (visible[0].textContent||'').trim() : (nodes.length? (nodes[0].textContent||'').trim():null),
              head: t.slice(0,80)};
    });
    out.push({route:name, ...r});
  }
  await cdp.send('Network.setBlockedURLs', {urls:[]});
  return out;
};
