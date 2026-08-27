export default async ({page}) => {
  return await page.evaluate(`(() => {
    const p=window.__poll||[];
    if(!p.length) return {none:true};
    const span={n:p.length, fromMs:p[0].t, toMs:p[p.length-1].t};
    const uniq=[]; let last='';
    for(const s of p){ const k=JSON.stringify([s.n&&s.n.top, s.toasts, s.chips]);
      if(k!==last){ uniq.push(s); last=k; } }
    return { span, distinct:uniq.length,
             changes: uniq.slice(-8).map(u=>({t:u.t, top:u.n&&u.n.top, toasts:u.toasts, chips:u.chips})),
             anyToast: p.some(s=>s.toasts.length>0) };
  })()`);
};
