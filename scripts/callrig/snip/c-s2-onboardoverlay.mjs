export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const chans=[['qa-c2-deep','C4OX0TTLIMVOUBH'],['qa-general','C4QCGENERAL0001']];
  const out=[];
  for(const [name,ch] of chans){
    await page.goto('about:blank'); await page.waitForTimeout(600);
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(9000);
    out.push(await page.evaluate((name)=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
      const opac=(e)=>{let o=1,n=e;while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return +o.toFixed(3);};
      const ob=document.querySelector('[data-testid="channel-onboarding-transition"]');
      const obR=ob?ob.getBoundingClientRect():null;
      // find the pinned banner's "View all" control by enumerating interactive nodes
      const inter=[...document.querySelectorAll('main button, main a, main [role="button"]')].filter(v);
      const va=inter.find(e=>/view all/i.test((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')));
      let vaInfo=null;
      if(va){
        const r=va.getBoundingClientRect();
        const cx=Math.round(r.left+r.width/2), cy=Math.round(r.top+r.height/2);
        const hit=document.elementFromPoint(cx,cy);
        vaInfo={txt:(va.innerText||'').replace(/\s+/g,' ').slice(0,28),
          rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],
          opacity:opac(va), clickable: !!(hit&&(hit===va||va.contains(hit)||va.contains(hit)||hit.contains(va))),
          hitTag:hit?hit.tagName:null,
          hitCls:hit?((hit.className||'').toString().slice(0,46)):null,
          hitInOnboarding: !!(hit && ob && ob.contains(hit))};
      }
      return {channel:name,
        msgs:document.querySelectorAll('main [data-message-id]').length,
        onboarding: ob? {phase:ob.getAttribute('data-phase'), opacity:opac(ob),
          rect:[Math.round(obR.left),Math.round(obR.top),Math.round(obR.width),Math.round(obR.height)],
          text:(ob.innerText||'').replace(/\s+/g,' ').slice(0,70)} : null,
        viewAll: vaInfo,
        pinnedBannerText: (()=>{const m=document.querySelector('main');
          const t=(m.innerText||'').replace(/\s+/g,' ');
          const i=t.indexOf('Pinned'); return i>=0? t.slice(i,i+70):null;})()};
    }, name));
  }
  return out;
};
