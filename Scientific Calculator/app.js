(() => {
  const exprEl = document.getElementById('expr');
  const resultEl = document.getElementById('result');
  const keys = document.getElementById('keys');
  const degToggle = document.getElementById('degToggle');
  const historyBtn = document.getElementById('historyBtn');
  const historyPanel = document.getElementById('history');
  const historyList = document.getElementById('historyList');

  let expr = '0';
  let lastWasEval = false;
  let memory = 0;
  let history = [];

  const clampLen = 120;

  const toRad = x => x * Math.PI / 180;
  const sinD = x => Math.sin(toRad(x));
  const cosD = x => Math.cos(toRad(x));
  const tanD = x => Math.tan(toRad(x));
  const asinD = x => (Math.asin(x) * 180 / Math.PI);
  const acosD = x => (Math.acos(x) * 180 / Math.PI);
  const atanD = x => (Math.atan(x) * 180 / Math.PI);
  const log10 = x => Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10;
  const rand = () => Math.random();

  function fact(n){
    if (n < 0 || !Number.isFinite(n)) throw new Error('Bad factorial');
    if (Math.floor(n) !== n) throw new Error('Factorial only for integers');
    let r = 1; for (let i=2; i<=n; i++) r *= i; return r;
  }

  function updateDisplay(){ exprEl.textContent = expr || '0'; }

  function pushHistory(input, output){
    history.unshift({ in: input, out: output });
    history = history.slice(0, 12);
    renderHistory();
  }

  function renderHistory(){
    historyList.innerHTML = history.map(item => (
      `<li data-expr="${encodeURIComponent(item.in)}">
        <small>${escapeHTML(item.in)}</small>
        = <b>${escapeHTML(String(item.out))}</b>
      </li>`
    )).join('');
  }

  function escapeHTML(s){
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  /* ---------- FIXED LOGIC HERE ---------- */
  function insertToken(t){
    // fresh start after '=' when the next token is a value/function/open-group
    if (lastWasEval && /^(?:[0-9.]|[a-z]|[πe(√])/i.test(t)) {
      expr = '0';
      lastWasEval = false;
    }

    // drop leading zero when starting with value/function/open-group
    if (expr === '0' && /^(?:[0-9.]|[a-z]|[π(√])/i.test(t)) {
      expr = '';
    }

    if (expr.length > clampLen) return;
    expr += t;
    updateDisplay();
  }
  /* ------------------------------------- */

  function clearAll(){ expr = '0'; lastWasEval = false; updateDisplay(); resultEl.textContent = '0'; }
  function backspace(){ if (lastWasEval) lastWasEval = false; expr = expr.length <= 1 ? '0' : expr.slice(0,-1); updateDisplay(); }

  function toggleSign(){
    const i = findTailTokenIndex(expr); if (i == null) return;
    const before = expr.slice(0, i.start);
    const target = expr.slice(i.start, i.end);
    expr = `${before}(-1*${target})` + expr.slice(i.end);
    updateDisplay();
  }

  function percent(){
    const i = findTailTokenIndex(expr); if (i == null) return;
    const before = expr.slice(0, i.start);
    const target = expr.slice(i.start, i.end);
    expr = `${before}(${target}/100)` + expr.slice(i.end);
    updateDisplay();
  }

  function findTailTokenIndex(s){
    if (!s) return null;
    let end = s.length, i = end - 1;
    while (i >= 0 && /\s/.test(s[i])) i--;
    if (s[i] === ')'){
      let depth = 0;
      for (; i >= 0; i--){
        if (s[i] === ')') depth++;
        else if (s[i] === '(') { depth--; if (depth === 0) break; }
      }
      if (i < 0) return null;
      return { start: i, end };
    } else {
      while (i >= 0 && /[0-9.]/.test(s[i])) i--;
      if (s[i] === 'π' || s[i] === 'e') i--;
      return { start: i+1, end };
    }
  }

  function replaceFactorials(s){
    while (s.includes('!')){
      const idx = s.indexOf('!'); let j = idx - 1;
      if (s[j] === ')'){
        let depth = 0;
        for (; j >= 0; j--){
          if (s[j] === ')') depth++;
          else if (s[j] === '(') { depth--; if (depth === 0) break; }
        }
        if (j < 0) throw new Error('Bad factorial');
        const inside = s.slice(j, idx);
        s = s.slice(0, j) + `fact${inside}` + s.slice(idx+1);
      } else {
        let start = j; while (start >= 0 && /[0-9.]/.test(s[start])) start--; start++;
        if (start > j) throw new Error('Bad factorial');
        const num = s.slice(start, idx);
        s = s.slice(0, start) + `fact(${num})` + s.slice(idx+1);
      }
    }
    return s;
  }

  function transform(exprRaw){
    let s = exprRaw;
    s = s.replace(/÷/g,'/').replace(/×/g,'*');
    s = s.replace(/\^/g,'**');
    s = s.replace(/√\(/g,'Math.sqrt(');
    s = s.replace(/\bpi\b|π/gi,'Math.PI');
    s = s.replace(/\be\b(?![0-9+-])/gi,'Math.E');

    const DEG = degToggle.checked;
    s = s.replace(/\bsin\(/gi, DEG ? 'sinD('  : 'Math.sin(');
    s = s.replace(/\bcos\(/gi, DEG ? 'cosD('  : 'Math.cos(');
    s = s.replace(/\btan\(/gi, DEG ? 'tanD('  : 'Math.tan(');
    s = s.replace(/\basin\(/gi, DEG ? 'asinD(' : 'Math.asin(');
    s = s.replace(/\bacos\(/gi, DEG ? 'acosD(' : 'Math.acos(');
    s = s.replace(/\batan\(/gi, DEG ? 'atanD(' : 'Math.atan(');

    s = s.replace(/\blog\(/gi,'log10(');
    s = s.replace(/\bln\(/gi,'Math.log(');
    s = s.replace(/\babs\(/gi,'Math.abs(');
    s = s.replace(/\brand\(\)/gi,'rand()');

    s = replaceFactorials(s);

    if (/[^0-9+\-*/%.(),\s^!eπA-Za-z]/.test(exprRaw.replace(/[÷×√]/g,''))) {
      throw new Error('Invalid chars');
    }
    return s;
  }

  function doEval(){
    try{
      const input = expr.trim();
      const code = transform(input);
      const scope = { Math, sinD, cosD, tanD, asinD, acosD, atanD, log10, fact, rand };
      const result = Function('with (this) { return (' + code + ') }').call(scope);
      if (typeof result === 'number' && Number.isFinite(result)){
        const out = tidy(result);
        resultEl.textContent = out;
        lastWasEval = true;
        pushHistory(input, out);
      } else throw new Error('Bad result');
    } catch {
      resultEl.textContent = 'Error';
      resultEl.classList.add('shake'); setTimeout(()=>resultEl.classList.remove('shake'),320);
    }
    resultEl.style.animation = 'none'; void resultEl.offsetWidth; resultEl.style.animation = '';
  }

  function tidy(n){
    if (!Number.isFinite(n)) return String(n);
    if (Math.abs(n) >= 1e10 || (Math.abs(n) > 0 && Math.abs(n) < 1e-6)){
      return n.toExponential(8).replace(/(?:\.?0+)(e|$)/,'$1');
    }
    const s = n.toFixed(10); return s.replace(/\.?0+$/,'');
  }

  function memSet(v){ memory = v; flashMem(); }
  function memAdd(v){ memory += v; flashMem(); }
  function memSub(v){ memory -= v; flashMem(); }
  function memClear(){ memory = 0; flashMem(); }
  function flashMem(){
    historyBtn.textContent = memory ? `M: ${tidy(memory)}` : 'History';
    historyBtn.classList.toggle('has-mem', !!memory);
  }

  keys.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    const ins = btn.getAttribute('data-insert'); const fn = btn.getAttribute('data-fn');
    if (ins != null){ insertToken(ins); return; }
    if (!fn) return;
    switch(fn){
      case 'clear': clearAll(); break;
      case 'back':  backspace(); break;
      case 'eval':  doEval(); break;
      case 'sign':  toggleSign(); break;
      case 'percent': percent(); break;
      case 'fact': insertToken('!'); break;
      case 'mc': memClear(); break;
      case 'mr': insertToken(String(tidy(memory))); break;
      case 'mplus': { const v = Number(resultEl.textContent); if (Number.isFinite(v)) memAdd(v); break; }
      case 'mminus':{ const v = Number(resultEl.textContent); if (Number.isFinite(v)) memSub(v); break; }
    }
  });

  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'Enter'){ e.preventDefault(); doEval(); return; }
    if (k === 'Backspace'){ e.preventDefault(); backspace(); return; }
    if (k === 'Escape'){ e.preventDefault(); clearAll(); return; }
    const map = { '*':'×', '/':'÷', '^':'^', '(':'(', ')':')', '+':'+ ', '-':'- ', '.':'.' };
    if (/[0-9]/.test(k)) { insertToken(k); return; }
    if (k in map) { insertToken(map[k]); return; }
  });

  historyBtn.addEventListener('click', () => {
    const open = historyPanel.hasAttribute('open');
    if (open){
      historyPanel.removeAttribute('open');
      historyPanel.setAttribute('aria-hidden','true');
      historyBtn.setAttribute('aria-expanded','false');
    } else {
      historyPanel.setAttribute('open','');
      historyPanel.setAttribute('aria-hidden','false');
      historyBtn.setAttribute('aria-expanded','true');
    }
  });

  historyList.addEventListener('click', (e) => {
    const li = e.target.closest('li'); if (!li) return;
    const raw = decodeURIComponent(li.getAttribute('data-expr') || '0');
    expr = raw; lastWasEval = false; updateDisplay();
  });

  updateDisplay();
  resultEl.textContent = '0';
})();
// Elements
const historyBtn = document.getElementById("historyBtn");
const historyBox = document.getElementById("history"); // your <aside id="history">...
const body = document.body;

// create close button inside modal if not present
if (!historyBox.querySelector('.close')) {
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.setAttribute('aria-label', 'Close history');
  closeBtn.innerHTML = '&times;';
  historyBox.appendChild(closeBtn);
}

// helper to open/close
function openHistory() {
  historyBox.classList.add('open');
  body.classList.add('show-history');
  historyBtn.setAttribute('aria-expanded', 'true');
}
function closeHistory() {
  historyBox.classList.remove('open');
  body.classList.remove('show-history');
  historyBtn.setAttribute('aria-expanded', 'false');
}

// toggle on history button click
historyBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (historyBox.classList.contains('open')) closeHistory();
  else openHistory();
});

// close when clicking backdrop (body::before cannot be easily listened to),
// so listen on document and if click target is outside modal, close it
document.addEventListener('click', (e) => {
  if (!historyBox.classList.contains('open')) return;
  // if click happened inside the modal, ignore
  if (historyBox.contains(e.target)) return;
  // if click was on the history button itself, also ignore (handled above)
  if (historyBtn.contains(e.target)) return;
  // otherwise, close modal
  closeHistory();
});

// close when the modal's close (×) button clicked
historyBox.addEventListener('click', (e) => {
  if (e.target.closest('.close')) closeHistory();
});

// close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && historyBox.classList.contains('open')) {
    closeHistory();
  }
});

// HISTORY SYSTEM ========================================
const historyList = document.getElementById("historyList");
let calcHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];

// Function to render history in popup
function renderHistory() {
  historyList.innerHTML = "";
  if (calcHistory.length === 0) {
    historyList.innerHTML = "<li class='empty'>No history yet</li>";
    return;
  }
  calcHistory.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

// Save calculation to history
function addToHistory(expression, result) {
  const record = `${expression} = ${result}`;
  calcHistory.push(record);
  if (calcHistory.length > 20) calcHistory.shift(); // limit to 20
  localStorage.setItem("calcHistory", JSON.stringify(calcHistory));
  renderHistory();
}

// Clear history button (optional)
const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear History";
clearBtn.className = "clear-history";
clearBtn.onclick = () => {
  calcHistory = [];
  localStorage.removeItem("calcHistory");
  renderHistory();
};
historyList.parentElement.appendChild(clearBtn);

// Initial render when page loads
renderHistory();

// Example usage: jab "=" button press ho
const eqBtn = document.querySelector("[data-fn='eval']");
const exprEl = document.getElementById("expr");
const resultEl = document.getElementById("result");

eqBtn.addEventListener("click", () => {
  try {
    // replace × and ÷ signs for JS eval
    let expression = exprEl.textContent.replace(/×/g, "*").replace(/÷/g, "/");
    let result = eval(expression);
    resultEl.textContent = result;
    addToHistory(exprEl.textContent, result);
  } catch (err) {
    resultEl.textContent = "Error";
  }
});
