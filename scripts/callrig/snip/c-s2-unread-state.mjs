export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  out.api = await page.evaluate(async(ws)=>{
    const j=await (await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'})).json();
    return j;
  }, ws);
  out.sidebar = await page.evaluate(()=>[...document.querySelectorAll('a[href*="/c/"],a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0)
    .map(a=>({t:(a.innerText||'').replace(/\s+/g,' ').slice(0,26), href:a.getAttribute('href').slice(-16)})));
  out.url=page.url();
  return out;
};
