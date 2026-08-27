const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  return await page.evaluate(async (dm)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const list=(j.messages||j.data||[]);
    const evs=list.filter(m=>!m.body);
    const rows=[...document.querySelectorAll('[data-message-id]')].filter(e=>/call/i.test(e.innerText||''));
    return {apiEvents: evs.map(m=>({id:m.id, keys:Object.keys(m).join(','), meta: JSON.stringify(m).slice(0,320)})),
      domRows: rows.map(e=>({id:e.getAttribute('data-message-id'), text:e.innerText.replace(/\n+/g,' | ').slice(0,120),
        buttons:[...e.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)).filter(Boolean)}))};
  }, DM);
};
