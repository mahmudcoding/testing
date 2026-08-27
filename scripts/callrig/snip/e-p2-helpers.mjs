// Lane-E pass-2 shared probe fragments. Injected as strings into page.evaluate.
// VISFN: true visibility = non-zero rect + no display/visibility:none up the chain
//        + effective opacity > 0.01 + the element is actually hit at its own centre.
export const VISFN = `
  const _hit = (el) => { const r=el.getBoundingClientRect(); const cx=r.x+r.width/2, cy=r.y+r.height/2;
    if (cx<0||cy<0||cx>innerWidth||cy>innerHeight) return false;
    const h=document.elementFromPoint(cx,cy); return !!h && (h===el||el.contains(h)||h.contains(el)); };
  const vis = (el) => { if(!el) return false; const r=el.getBoundingClientRect();
    if (r.width<1||r.height<1) return false;
    let n=el, op=1;
    while (n && n!==document.documentElement) { const cs=getComputedStyle(n);
      if (cs.display==='none'||cs.visibility==='hidden') return false;
      op *= parseFloat(cs.opacity||'1'); n=n.parentElement; }
    if (op<=0.01) return false;
    return _hit(el); };
  const desc = (el) => ({ tag: el.tagName, label: (el.getAttribute('aria-label')||el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,60),
    testid: el.getAttribute('data-testid')||null, href: el.getAttribute('href')||null,
    x: Math.round(el.getBoundingClientRect().left), y: Math.round(el.getBoundingClientRect().top),
    w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height),
    disabled: el.disabled===true||el.getAttribute('aria-disabled')==='true' });
  const interactives = (root) => [...(root||document).querySelectorAll('button,a,[role=button],[role=tab],[role=menuitem],[role=option],[role=switch],[role=checkbox],input,select,textarea,[contenteditable=true]')].filter(vis).map(desc);
`;
export const WS = 'W4QEF1XTURESO01';
export const BASE = 'https://airion-cargo.store';

// CLICKDEEPEST: click the innermost actually-clickable node whose text matches.
// Rows in this app are often <LI><BUTTON>…</BUTTON></LI>; querySelectorAll returns
// document order, so a naive 'button,li' match hits the LI wrapper and the handler
// never fires. Bitten by this on notification rows and the meeting member picker.
export const CLICKDEEPEST = `
  const clickDeepest = (root, re) => {
    const nameOf = n => ((n.getAttribute('aria-label')||'') + ' ' + (n.textContent||'')).replace(/\\s+/g,' ').trim();
    const cands=[...root.querySelectorAll('button,a,[role=option],[role=menuitem],[role=button]')]
      .filter(n=>vis(n) && (re.test(n.textContent||'') || re.test(n.getAttribute('aria-label')||'')));
    if(!cands.length) return 'no clickable match';
    // innermost = the one containing no other candidate
    const inner = cands.filter(c=>!cands.some(o=>o!==c && c.contains(o)));
    const target = inner[0] || cands[0];
    target.click();
    return 'clicked <'+target.tagName+'> "'+nameOf(target).slice(0,28)+'"';
  };
`;
