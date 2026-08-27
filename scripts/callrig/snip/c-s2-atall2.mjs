export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  await page.waitForTimeout(12000);
  const notif=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=8',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const a=(j&&(j.notifications||j.items))||[];
    const hit=(Array.isArray(a)?a:[]).find(n=>JSON.stringify(n).includes('QA-ATALL'));
    return hit?{title:hit.title, titleKey:hit.title_key, type:hit.type,
      body:String(hit.body||'').slice(0,30)}:'no notification for it';});
  const mentions=await page.evaluate(async ({ws})=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/mentions?limit=20`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const a=(j&&(j.mentions||j.items))||[];
    return {status:r.status, total:Array.isArray(a)?a.length:null,
      hasAtAll:(Array.isArray(a)?a:[]).some(m=>JSON.stringify(m).includes('QA-ATALL'))};},{ws});
  const ui=await page.evaluate(()=>{
    const main=document.querySelector('main');
    const txt=main?(main.innerText||''):'';
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {atAllOnPage:txt.includes('QA-ATALL'),
      tabs:[...document.querySelectorAll('button')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim())
        .filter(t=>/^(All|Unread) \(\d+\)$/.test(t))};});
  return {notification:notif, mentionsApi:mentions, mentionsPage:ui};
};
