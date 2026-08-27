const WS='W4QCF1XTURESO01', EMPTY='C4QCEMPTY000001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${EMPTY}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  return await page.evaluate(() => {
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const hit = (re) => [...document.querySelectorAll('div,p,span,h1,h2,h3,button')]
      .filter(e=>e.children.length===0 && re.test(e.textContent||''))
      .map(e=>{const r=e.getBoundingClientRect();
        const centre=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
        return {text:(e.textContent||'').trim().slice(0,60), vis:vis(e),
          rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
          hitTest: centre? (e===centre||e.contains(centre)||centre.contains(e)) : false};});
    // sidebar: find the element containing the channel list
    const links=[...document.querySelectorAll('a')].filter(vis).map(a=>({t:(a.textContent||'').trim().slice(0,28), href:(a.getAttribute('href')||'').slice(-20)}));
    return {url:location.href,
      startThisChannel: hit(/Start this channel/i),
      addTeammates: hit(/Add teammates before/i),
      noMessages: hit(/No messages yet/i),
      pinnedBanner: hit(/no message text/i),
      viewAll: hit(/View all \(/i),
      sidebarLinks: links.filter(l=>/\/c\//.test(l.href)).slice(0,12)};
  });
};
