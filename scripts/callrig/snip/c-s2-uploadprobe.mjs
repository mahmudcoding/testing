export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const mk = async (dm) => {
      const cv=document.createElement('canvas'); cv.width=90; cv.height=70;
      const g=cv.getContext('2d'); g.fillStyle= dm==='file'?'#39c':'#c93'; g.fillRect(0,0,90,70);
      const blob=await new Promise(r=>cv.toBlob(r,'image/png'));
      const fd=new FormData();
      fd.append('file', new File([blob], `probe-${dm||'none'}.png`, {type:'image/png'}));
      if (dm) fd.append('display_mode', dm);
      const r=await fetch('/api/v1/files/upload',{method:'POST',credentials:'include',body:fd});
      const t=await r.text();
      return {display_mode_sent: dm||'(omitted)', status:r.status, body:t.slice(0,300)};
    };
    return {photo: await mk('photo'), file: await mk('file'), none: await mk(null)};
  });
};
