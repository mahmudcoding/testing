const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // find the share tile in the filmstrip by its label
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const lbl=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/screen$/i.test((e.innerText||'').trim()))[0];
    if(!lbl) return null;
    const card=lbl.closest('div');
    const r=(card||lbl).getBoundingClientRect();
    return {txt:lbl.innerText.trim().slice(0,26), x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2),
            w:Math.round(r.width), h:Math.round(r.height)};},VS);
  out.shareTile=pos;
  if(!pos) return out;
  await page.mouse.move(pos.x,pos.y); await page.waitForTimeout(1400);
  out.hoverButtons = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,28),
      x:Math.round(b.getBoundingClientRect().x),y:Math.round(b.getBoundingClientRect().y)}))
      .filter(b=>/more|pin|fullscreen|watch/i.test(b.al));},VS);
  // click the nearest More to the tile
  const m = (out.hoverButtons||[]).filter(b=>/more/i.test(b.al))
    .sort((a,b)=>Math.hypot(a.x-pos.x,a.y-pos.y)-Math.hypot(b.x-pos.x,b.y-pos.y))[0];
  out.chosenMore=m;
  if(m){ await page.mouse.click(m.x+10,m.y+10); await page.waitForTimeout(1800);
    out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...new Set([...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/pin|watch|fullscreen|hide/i.test(e.innerText||''))
        .map(e=>e.innerText.trim().slice(0,34)))].slice(0,10);},VS); }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/share-card-menu.png'});
  return out;
};
