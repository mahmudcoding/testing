export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const FILE=process.env.QA_FILE;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  await page.locator('input[type="file"]').first().setInputFiles(FILE);
  await page.waitForTimeout(6000);
  out.state=await page.evaluate(()=>{
    const vis=(e)=>{let op=1,n=e;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden') return 0; n=n.parentElement;}
      return +op.toFixed(2);};
    let node=null;
    for(const e of document.querySelectorAll('*'))
      if(e.children.length===0 && /unsupported file type/i.test(e.textContent||'')){ node=e; break; }
    const send=document.querySelector('button[aria-label="Send"]');
    const r=node?node.getBoundingClientRect():null;
    const hit=node?document.elementFromPoint(r.left+r.width/2, r.top+r.height/2):null;
    return {message:node?(node.textContent||'').trim().slice(0,60):'NOT-IN-DOM',
      opacityProduct:node?vis(node):null,
      hitIsSelfOrChild:!!hit&&!!node&&(node.contains(hit)||hit.contains(node)),
      rect:r?{y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}:null,
      sendPresent:!!send, sendDisabled:send?(send.disabled||send.getAttribute('aria-disabled')):null,
      chipCount:document.querySelectorAll('[class*=chip],[data-attachment]').length};});
  // does Send actually go through?
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()==='POST')
    reqs.push(u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(e=>{out.sendClick='FAIL'});
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.postsAfterSend=reqs.slice(0,3);
  return out;
};
