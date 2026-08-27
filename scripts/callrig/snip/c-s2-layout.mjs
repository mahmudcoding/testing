export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // ── long topic in the header
  const longTopic='Тема канала, которая намеренно очень длинная и должна где-то обрезаться, '
    +'потому что шапка не резиновая, и мы хотим увидеть, что именно с ней произойдёт при выводе.';
  out.setTopic=await page.evaluate(async({ch,topic})=>{
    const cur=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name:cur.name, description:topic})});
    return {status:r.status, len:topic.length};},{ch,topic:longTopic});
  await page.reload(); await page.waitForTimeout(9000);
  out.header=await page.evaluate(()=>{
    const inner=window.innerWidth;
    const m=document.querySelector('main');
    const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0)
      .filter(e=>{const r=e.getBoundingClientRect(); return r.top<140 && r.width>40;})
      .map(e=>{const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
        return {t:(e.textContent||'').trim().slice(0,26), w:Math.round(r.width), right:Math.round(r.right),
          clipped:e.scrollWidth>e.clientWidth, ov:cs.textOverflow, ws:cs.whiteSpace};});
    return {viewport:inner, docScrollWidth:document.documentElement.scrollWidth,
      overflowsRight:leaves.some(l=>l.right>inner+1), nodes:leaves.slice(0,6)};});
  // restore the topic
  await page.evaluate(async(ch)=>{
    const cur=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name:cur.name, description:'throwaway: deep-link to old message'})});}, ch);
  // ── mixed RTL / LTR message
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  await comp.type('QA-V4-RTL مرحبا بالعالم english tail 123',{delay:30}); await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  out.rtl=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    const m=(await r.json()).messages[0];
    const e=document.querySelector(`main [data-message-id="${m.id}"]`);
    const inner=window.innerWidth;
    if(!e) return {stored:m.body, rendered:null};
    const rect=e.getBoundingClientRect();
    const leaf=[...e.querySelectorAll('*')].filter(x=>x.children.length===0)
      .find(x=>/QA-V4-RTL/.test(x.textContent||''));
    const cs=leaf?getComputedStyle(leaf):null;
    return {stored:m.body, rendered:(e.innerText||'').replace(/\s+/g,' ').slice(-46),
      direction:cs&&cs.direction, textAlign:cs&&cs.textAlign, unicodeBidi:cs&&cs.unicodeBidi,
      right:Math.round(rect.right), overflowsRight:rect.right>inner+1,
      docScrollWidth:document.documentElement.scrollWidth, viewport:inner};}, ch);
  return out;
};
