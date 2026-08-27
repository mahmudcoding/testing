export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', mid='M4OXB5YQSSALZDZ';
  const un=await page.evaluate(async ({ch,mid})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,
      {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
       body:JSON.stringify({pin:false})});
    return r.status;
  },{ch,mid});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const before=await page.evaluate(async (ch)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
      .find(x=>/pin/i.test(x.getAttribute('aria-label')||x.innerText||''));
    let banner='NO-BANNER';
    if(b){let n=b;for(let i=0;i<3&&n.parentElement;i++)n=n.parentElement;
      banner=(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,90);}
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    let j=null;try{j=await r.json()}catch{}
    return {serverTotal:j&&j.total, banner};
  },ch);
  const va=page.locator('button:has-text("View all"), [role="button"]:has-text("View all")').first();
  let clicked=false;
  try { await va.scrollIntoViewIfNeeded({timeout:3000}); await va.click({timeout:4000}); clicked=true; } catch {}
  await page.waitForTimeout(3000);
  const after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const heads=[...document.querySelectorAll('h1,h2,h3,[role="heading"],[role="dialog"]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,50)).filter(Boolean);
    return {headings:heads.slice(-6), bodyTail:(document.body.innerText||'').replace(/\s+/g,' ').trim().slice(-160)};
  });
  return {unpinStatus:un, afterUnpin:before, viewAllClicked:clicked, afterClick:after};
};
