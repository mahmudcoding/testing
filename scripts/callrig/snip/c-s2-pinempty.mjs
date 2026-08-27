export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const surfaces=[['channel qa-general','c/C4QCGENERAL0001','C4QCGENERAL0001'],
                  ['direct message','d/C4OX37SVWDRD28T','C4OX37SVWDRD28T']];
  const out=[];
  for (const [name,path,cid] of surfaces) {
    await page.goto(`https://airion-cargo.store/w/${ws}/${path}`);
    await page.waitForTimeout(9000);
    out.push(await page.evaluate(async ({name,cid})=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const b=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
        .find(x=>/pin/i.test(x.getAttribute('aria-label')||x.innerText||''));
      let banner='NO-BANNER';
      if(b){let n=b;for(let i=0;i<3&&n.parentElement;i++)n=n.parentElement;
        banner=(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,90);}
      const r=await fetch(`/api/v1/messaging/channels/${cid}/messages/pinned`,{credentials:'include'});
      let j=null; try{j=await r.json()}catch{}
      return {name, serverTotal:j&&j.total, banner};
    },{name,cid}));
  }
  return out;
};
