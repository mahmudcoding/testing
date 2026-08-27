export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}`);
  await page.waitForTimeout(12000);
  return page.evaluate(async ()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const main=document.querySelector('main');
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const j=await r.json();
    const ch=await fetch(`/api/v1/workspaces/W4QCF1XTURESO01/channels`,{credentials:'include'});
    let cj=null; try{cj=await ch.json()}catch{}
    const list=(cj&&(cj.channels||cj.items))||[];
    return {who:j.email||j.username,
      url:location.pathname.slice(0,40),
      channelsFromApi:Array.isArray(list)?list.length:null,
      sidebarChannels:[...new Set([...document.querySelectorAll('a[href*="/c/"]')].filter(v)
        .map(a=>(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,24)))],
      sidebarDMs:[...document.querySelectorAll('a[href*="/d/"]')].filter(v).length,
      mainText:(main?(main.innerText||''):'').replace(/\s+/g,' ').trim().slice(0,200),
      composer:!!document.querySelector('div[contenteditable][aria-label="Compose message"]'),
      actions:[...new Set([...document.querySelectorAll('button,a')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim())
        .filter(t=>t&&t.length<28))].slice(0,16)};});
};
