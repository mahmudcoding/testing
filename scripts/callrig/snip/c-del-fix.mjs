export default async ({page}) => {
  const id=process.env.MID;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const clicked = await page.evaluate(v=>{const vv=eval(v);
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vv)
      .find(x=>/Delete this message/i.test(x.innerText));
    if(!d) return 'no confirm dialog open';
    const b=[...d.querySelectorAll('button')].filter(vv).find(x=>/^Delete$/i.test((x.innerText||'').trim()));
    if(!b) return 'no Delete button in dialog';
    b.click(); return 'clicked';}, V);
  await page.waitForTimeout(3000);
  const after = await page.evaluate(m=>({present:!!document.querySelector('[data-message-id="'+m+'"]'),
    count:document.querySelectorAll('[data-message-id]').length}), id);
  return {clicked, afterDelete: after};
};
