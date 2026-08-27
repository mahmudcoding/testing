export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const vis = e=>{let a=e,op=1;while(a){const cs=getComputedStyle(a);op=Math.min(op,parseFloat(cs.opacity));if(cs.display==='none'||cs.visibility==='hidden')return false;a=a.parentElement;}return op>0.05&&e.getClientRects().length>0;};
    let srv=null; try{const c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); srv=c.meeting?c.meeting.name:null;}catch(e){}
    const leaves=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && vis(e) && (e.textContent||'').trim().length>2 && (e.textContent||'').trim().length<40);
    const top = leaves.filter(e=>e.getBoundingClientRect().top < 70).map(e=>({t:(e.textContent||'').trim(), y:Math.round(e.getBoundingClientRect().top), x:Math.round(e.getBoundingClientRect().left)}));
    const named = leaves.filter(e=>/QA-C-SR|RENAMED-SR|Team meeting/.test(e.textContent||'')).map(e=>({t:(e.textContent||'').trim(), y:Math.round(e.getBoundingClientRect().top)}));
    return {serverName:srv, topBar: top.slice(0,8), named};
  });
};
