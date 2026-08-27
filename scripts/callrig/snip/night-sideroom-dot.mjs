export default async ({page}) => {
  return await page.evaluate(()=>{
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
      const n=t.querySelector('[data-testid="participant-name"]');
      const dot=t.querySelector('[data-testid="participant-tile-side-room-dot"]');
      return {name:n?n.innerText.trim():'?', hasSideRoomDot:!!dot,
        dotAria: dot?dot.getAttribute('aria-label'):null,
        dotVisible: dot? (r=>r.width>0&&r.height>0)(dot.getBoundingClientRect()) : null,
        text:t.innerText.replace(/\n+/g,' | ').slice(0,60)};
    });
    return {tiles, panelText:(p=>p?p.innerText.replace(/\n+/g,' | ').slice(0,300):null)(document.querySelector('[data-testid="participants-list-panel"]'))};
  });
};
