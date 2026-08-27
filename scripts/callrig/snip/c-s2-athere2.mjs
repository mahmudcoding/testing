export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  await page.waitForTimeout(12000);
  return page.evaluate(async ({ws})=>{
    const n=await fetch('/api/v1/notifications?limit=8',{credentials:'include'});
    let nj=null; try{nj=await n.json()}catch{}
    const na=(nj&&(nj.notifications||nj.items))||[];
    const hit=(Array.isArray(na)?na:[]).find(x=>JSON.stringify(x).includes('QA-ATHERE'));
    const m=await fetch(`/api/v1/workspaces/${ws}/mentions?limit=25`,{credentials:'include'});
    let mj=null; try{mj=await m.json()}catch{}
    const ma=(mj&&(mj.mentions||mj.items))||[];
    const main=document.querySelector('main');
    return {notification: hit?{title:hit.title, key:hit.title_key, type:hit.type,
              body:String(hit.body||'').slice(0,28)}:'no notification',
      mentionsTotal:Array.isArray(ma)?ma.length:null,
      hereInMentionsApi:(Array.isArray(ma)?ma:[]).some(x=>JSON.stringify(x).includes('QA-ATHERE')),
      hereOnPage:(main?.innerText||'').includes('QA-ATHERE')};},{ws});
};
