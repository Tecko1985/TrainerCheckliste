// Wiederverwendbare Canvas-Signatur-Komponente (Maus + Touch/Pen).
// Speichert das Ergebnis erst beim Strichende (pointerup), nicht bei jedem
// pointermove, um Schreibgröße/-frequenz beim Autosave zu begrenzen.
function createSignaturePad(canvas, onChange) {
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let hasInk = false;
  let last = null;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const prev = !canvas.dataset.blank ? canvas.toDataURL() : null;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e2330";
    if (prev && hasInk) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = prev;
    }
  }

  function pointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    last = pointFromEvent(e);
    canvas.setPointerCapture(e.pointerId);
  }

  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    hasInk = true;
  }

  function end(e) {
    if (!drawing) return;
    drawing = false;
    if (hasInk && onChange) onChange(canvas.toDataURL("image/png"));
  }

  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", (e) => { if (drawing) end(e); });

  window.addEventListener("resize", resize);
  resize();

  return {
    clear() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      hasInk = false;
      if (onChange) onChange("");
    },
    // Leert die Anzeige beim Wechsel des Eintrags, ohne onChange auszulösen
    // (sonst würde das Laden eines anderen Eintrags die gerade verlassene Signatur löschen).
    resetSilent() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      hasInk = false;
    },
    // Muss erneut aufgerufen werden, sobald das Canvas sichtbar wird: beim ersten
    // Erstellen (während die Detailansicht noch display:none ist) liefert
    // getBoundingClientRect() 0x0, wodurch das Canvas-Backing-Bitmap leer bleibt.
    resize,
    isEmpty() {
      return !hasInk;
    },
    toDataURL() {
      return hasInk ? canvas.toDataURL("image/png") : "";
    },
    loadDataURL(dataUrl) {
      if (!dataUrl) return;
      const rect = canvas.getBoundingClientRect();
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        hasInk = true;
      };
      img.src = dataUrl;
    }
  };
}
