// read-only: no navigation, safe for the parked idle-test tab
export default async ({page}) => {
  return page.evaluate(()=>{
    const TXTS=['QA-S2-OFFLINE-dkvw','QA-S2-OFFL2-0vz8','QA-S2-OFFL3-tewc'];
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const joined=els.map(e=>e.innerText||'').join(' ');
    return {url:location.pathname.slice(-16), loaded:els.length,
      openMin:+(performance.now()/60000).toFixed(1),
      hasOffline: TXTS.map(t=>({t, inDom:joined.includes(t)})),
      lastThree: els.slice(-3).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(-30))};
  });
};
