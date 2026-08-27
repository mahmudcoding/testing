// Is a node with this exact text really visible? opacity chain + elementFromPoint at its centre.
export default async ({page}) => {
  const needle = process.env.QA_TEXT || 'Message everyone';
  return await page.evaluate((n)=>{
    const out=[];
    for (const e of document.querySelectorAll('*')) {
      if (e.childElementCount) continue;
      if ((e.textContent||'').trim() !== n) continue;
      const r=e.getBoundingClientRect(); let a=e, op=1, hidden=false;
      while (a && a!==document.documentElement) { const s=getComputedStyle(a);
        if (s.display==='none'||s.visibility==='hidden') hidden=true;
        op*=parseFloat(s.opacity||'1'); a=a.parentElement; }
      const cx=r.left+r.width/2, cy=r.top+r.height/2;
      const top=document.elementFromPoint(cx,cy);
      out.push({rect:`${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`,
        opacity:Math.round(op*100)/100, hidden,
        onTop: !!(top && (top===e || e.contains(top) || top.contains(e))),
        topTag: top?top.tagName.toLowerCase()+'.'+String(top.className||'').slice(0,26):null,
        color:getComputedStyle(e).color, fs:getComputedStyle(e).fontSize});
    }
    return {needle:n, found:out.length, nodes:out};
  }, needle);
};
