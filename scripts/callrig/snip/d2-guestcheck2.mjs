const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const bodies = [];
  page.on('response', async r => { const u=r.url(); if(!u.includes('/api/v1/')) return;
    if(!/member/i.test(u)) return; let b=''; try{b=await r.text();}catch{}
    bodies.push({ u:u.replace(/^https?:\/\/[^/]+/,'').slice(0,80), s:r.status(),
      hasIsGuest:/"is_guest"/.test(b), guestTrue:/"is_guest"\s*:\s*true/.test(b), len:b.length,
      guestSlice:(b.match(/.{0,150}"is_guest"\s*:\s*true.{0,60}/)||[''])[0] }); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/members', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const rows = await page.evaluate(`(() => { const vis = ${VIS};
    const out={};
    for (const who of ['QA Guest','QA Alice','QA Admin']) {
      const btn=[...document.querySelectorAll('button[aria-label^="Remove "]')].filter(vis)
        .find(b=>(b.getAttribute('aria-label')||'').includes(who));
      if(!btn){ out[who]='(row not found)'; continue; }
      let row=btn.parentElement;
      for(let i=0;i<6&&row;i++){ const t=(row.innerText||'').trim(); if(t.includes(who)&&t.length>10&&t.length<220) break; row=row.parentElement; }
      const html=(row.innerHTML||'');
      out[who]={ text:(row.innerText||'').replace(/\\n/g,' | ').replace(/\\t/g,' ').slice(0,120),
                 mentionsGuestAttr:/guest/i.test(html.replace(/QA Guest/g,'').replace(/qa_d_guest/g,'')),
                 titleAttrs:[...row.querySelectorAll('[title]')].map(e=>e.getAttribute('title')).slice(0,4) };
    }
    return out; })()`);
  return { rows, memberApiCalls: bodies };
};
