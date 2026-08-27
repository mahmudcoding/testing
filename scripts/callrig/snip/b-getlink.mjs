export default async ({page}) => {
  const out = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop() || document.body;
    const inputs=[...d.querySelectorAll('input,textarea')].map(i=>String(i.value||'').slice(0,200)).filter(v=>v.includes('http'));
    const anchors=[...d.querySelectorAll('a')].map(a=>a.href).filter(h=>/join|guest|invite|call/i.test(h));
    const txt=d.innerText.match(/https?:\/\/\S+/g)||[];
    return {inputs, anchors, txt};
  });
  if (!out.inputs.length && !out.anchors.length && !out.txt.length) {
    // click Copy and read clipboard
    await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Copy$/i.test((x.innerText||'').trim())); if(b) b.click(); });
    await page.waitForTimeout(1200);
    out.clip = await page.evaluate(async()=>{ try{ return (await navigator.clipboard.readText()).slice(0,200);}catch(e){return 'ERR:'+e.message;} });
  }
  return out;
};
