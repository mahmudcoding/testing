const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return 'guest'; const j=await r.json().catch(()=>null); return (j?.email||'').split('@')[0];});
  await page.waitForTimeout(2500);
  return await page.evaluate(([vs,who])=>{const vis=eval(vs);
    const labels=[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean);
    return { who,
      hasMeetingSettings: labels.some(l=>/^Meeting settings$/i.test(l)),
      hasEndForEveryone: labels.some(l=>/End for everyone/i.test(l)),
      hasRecord: labels.some(l=>/^Record$/i.test(l)),
      hasAddToCall: labels.some(l=>/^Add to call$/i.test(l)),
      hasSideRooms: labels.some(l=>/^Side Rooms$/i.test(l)),
      shareLabel: labels.find(l=>/share/i.test(l))||null,
      toolbar: labels.filter(l=>l.length<26).slice(-14) };},[VS,who]);
};
