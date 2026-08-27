export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const stagedUI = await page.evaluate(v=>{const vv=eval(v);
    const nodes=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/qa-c-attach/i.test(e.textContent)&&vv(e));
    const near=nodes[0]?nodes[0].closest('div').parentElement:null;
    return {found:nodes.length, text:near?near.innerText.replace(/\s+/g,' ').slice(0,180):null,
      btns:near?[...near.querySelectorAll('button')].filter(vv).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,24)):[]};}, V);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type('QA-C-ATTACH-MSG');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  const sent = await page.evaluate(v=>{const vv=eval(v);
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    return {id:m.getAttribute('data-message-id'), text:m.innerText.replace(/\s+/g,' ').slice(0,180),
      imgs:[...m.querySelectorAll('img')].filter(vv).map(i=>({src:(i.src||'').slice(0,70), w:Math.round(i.getBoundingClientRect().width), h:Math.round(i.getBoundingClientRect().height), nat:i.naturalWidth+'x'+i.naturalHeight})),
      btns:[...m.querySelectorAll('button,a')].filter(vv).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,28)).filter(Boolean)};}, V);
  const api = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=2',{credentials:'include'});
    const j=await r.json(); const arr=j.messages||j.data||j;
    const m=(Array.isArray(arr)?arr:[])[0]||{};
    return {body:m.body, atts:(m.attachments||[]).map(a=>({name:a.name||a.file_name, mime:a.mime_type||a.content_type, size:a.size||a.file_size}))};
  });
  return {stagedUI, sent, api};
};
