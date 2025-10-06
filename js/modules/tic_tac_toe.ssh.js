export async function run(ctx) {
  const overlay = document.createElement('div');
  overlay.classList.add('ttt-overlay');
  overlay.style.cssText = `
    position: fixed; inset:0; display:flex; align-items:center; justify-content:center;
    background: rgba(0,0,0,0.85); z-index: 9999; color: var(--orange, #ff9900); font-family: monospace;
  `;

  overlay.innerHTML = `
    <div class="ttt-window" style="
      background: #050505; color: var(--orange, #ff8c00); padding: 18px; border-radius: 10px;
      box-shadow: 0 0 30px #000; min-width: 300px; display: flex; flex-direction: column;
      align-items: center; gap: 12px; border: 2px solid rgba(255,140,0,0.06); transition: all 0.2s ease;
    ">
      <h3 style="margin:0; font-family: monospace;">Tic Tac Toe</h3>
      <div class="ttt-timer" aria-live="polite" style="font-family: monospace;">Tiempo: 60</div>
      <div id="ttt-board" class="ttt-board" style="
        display: grid; grid-template-columns: repeat(3, 72px); grid-template-rows: repeat(3, 72px);
        gap: 8px; padding: 6px;
      "></div>
      <div class="ttt-msg" style="min-height:20px; font-family: monospace;"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const winEl = overlay.querySelector('.ttt-window');
  const boardEl = overlay.querySelector('#ttt-board');
  const timerEl = overlay.querySelector('.ttt-timer');
  const msgEl = overlay.querySelector('.ttt-msg');

  const SIZE = 3;
  let board = Array(SIZE*SIZE).fill(null);
  let active = true;
  let timeLeft = 60;
  let blinkStarted = false;
  let timerInterval = null;
  let blinkInterval = null;
  let aiThinking = false;

  function renderBoard(){
    boardEl.innerHTML='';
    for(let i=0;i<board.length;i++){
      const cell=document.createElement('div');
      cell.classList.add('ttt-cell');
      cell.dataset.idx=i;
      cell.style.cssText=`
        width:72px;height:72px;display:flex;align-items:center;justify-content:center;
        background: rgba(0,0,0,0.35);border: 2px solid rgba(255,0,0,0.12);
        font-family: monospace;font-size: 36px;user-select: none;transition: box-shadow 0.25s,border-color 0.25s;
      `;
      if(board[i]==='X'){ const span=document.createElement('span'); span.textContent='X'; span.style.fontWeight='700'; cell.appendChild(span);}
      else if(board[i]==='O'){ const span=document.createElement('span'); span.textContent='O'; span.style.fontWeight='700'; cell.appendChild(span);}
      boardEl.appendChild(cell);
    }
  }

  renderBoard();

  function checkWinner(bd){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b,c] of lines){ if(bd[a]&&bd[a]===bd[b]&&bd[a]===bd[c]) return bd[a]; }
    if(bd.every(Boolean)) return 'draw';
    return null;
  }

  function minimax(bd, player){
    const winner=checkWinner(bd);
    if(winner==='O') return {score:10};
    if(winner==='X') return {score:-10};
    if(winner==='draw') return {score:0};
    const moves=[];
    for(let i=0;i<bd.length;i++){
      if(!bd[i]){
        const move={}; move.index=i; bd[i]=player;
        const result=minimax(bd, player==='O'?'X':'O');
        move.score=result.score; bd[i]=null; moves.push(move);
      }
    }
    let bestMove;
    if(player==='O'){
      let bestScore=-Infinity;
      for(const m of moves){ if(m.score>bestScore){ bestScore=m.score; bestMove=m;}}
    } else{
      let bestScore=Infinity;
      for(const m of moves){ if(m.score<bestScore){ bestScore=m.score; bestMove=m;}}
    }
    return bestMove||{score:0,index:null};
  }

  function aiMove(){ const move=minimax(board.slice(),'O'); return move.index; }

  async function playerMove(idx){
    if(!active||aiThinking||board[idx]) return;
    board[idx]='X';
    renderBoard();
    let result=checkWinner(board);
    if(result) return resetGame(result);
    aiThinking=true;
    await ctx.delay(120);
    const aiIdx=aiMove();
    if(aiIdx!=null) board[aiIdx]='O';
    renderBoard();
    aiThinking=false;
    result=checkWinner(board);
    if(result) return resetGame(result);
  }

  boardEl.addEventListener('click',ev=>{
    const cell=ev.target.closest('.ttt-cell');
    if(!cell) return;
    const idx=Number(cell.dataset.idx);
    playerMove(idx);
  });

  function shakeWindow(){
    winEl.classList.add('shake');
    setTimeout(()=>winEl.classList.remove('shake'),400);
  }

  function resetGame(result){
    if(result==='X') msgEl.textContent='Has ganado (imposible 😎)';
    else if(result==='O') { msgEl.textContent='IA gana. Reiniciando juego...'; shakeWindow(); }
    else if(result==='draw') { msgEl.textContent='Empate. Reiniciando juego...'; shakeWindow(); }
    board=Array(SIZE*SIZE).fill(null);
    renderBoard();
  }

  function startTimers(){
    timerEl.textContent=`Tiempo: ${timeLeft}`;
    timerInterval=setInterval(async ()=>{
      timeLeft--;
      timerEl.textContent=`Tiempo: ${timeLeft}`;
      if(timeLeft===30&&!blinkStarted) startBlinking();
      if(timeLeft<=0){ clearInterval(timerInterval); timerInterval=null; await onTimeExpired();}
    },1000);
  }

  function startBlinking(){
    blinkStarted=true;
    let on=false;
    blinkInterval=setInterval(()=>{
      on=!on;
      // Parpadeo de toda la ventana
      winEl.style.boxShadow = on ? '0 0 30px 6px red' : '0 0 30px 0px rgba(255,0,0,0.06)';
      winEl.style.borderColor = on ? 'rgba(255,0,0,0.95)' : 'rgba(255,0,0,0.06)';
      winEl.style.filter = on ? 'brightness(2) contrast(1.5) hue-rotate(10deg)' : 'none';
    },300);
  }

  async function stopBlinking(){
    if(blinkInterval){ clearInterval(blinkInterval); blinkInterval=null; }
    winEl.style.boxShadow='0 0 30px 0 rgba(255,0,0,0.06)';
    winEl.style.borderColor='rgba(255,0,0,0.06)';
    winEl.style.filter='none';
  }

  async function onTimeExpired(){
    active=false;
    if(blinkInterval) clearInterval(blinkInterval);
    winEl.style.boxShadow='0 0 40px 8px red';
    winEl.style.borderColor='rgba(255,0,0,0.95)';
    winEl.style.filter='brightness(2.5) contrast(1.5) hue-rotate(10deg)';
    const term=document.getElementById('terminal');
    if(term) term.classList.add('ttt-glitch');
    await ctx.delay(400);
    try{ overlay.remove(); } catch(e){}
    if(term) term.innerHTML='';

    const bootLines=[
      'Initializing SPLIT kernel v4.21.0',
      'Loading modules: [core, net, ui, ai]',
      'Checking security... FAIL',
      'Forcing emergency override...',
      'Mounting virtual filesystem...',
      'Applying memory patch 0xA1F3C7...',
      'Decrypting admin keys...',
      'Spawn background processes: 12',
      'Initializing terminal subsystems.',
      'ATTEMPTING HARD RESET',
      '--- SYSTEM BOOT SEQUENCE ---',
      'printf: booting...',
      'sh: injecting startup scripts',
      'loading user preferences...',
      'starting diagnostics...',
      'console: spam-logger started',
      '>>> entering interactive shell',
      'login: _'
    ];

    for(let i=0;i<bootLines.length;i++){
      ctx.print(bootLines[i]);
      await ctx.delay(30+Math.random()*120);
    }

    await ctx.delay(300);
    // limpieza total + new prompt
   if(term) {
  term.innerHTML = '';  // limpia toda la terminal
  ctx.print('');        // imprime un "Enter" (salto de línea)
  if(typeof window.newPrompt === 'function') window.newPrompt(); // nuevo prompt listo
}
    if(term) term.classList.remove('ttt-glitch');
  }

  renderBoard();
  msgEl.textContent='Eres X. Juega contra IA imposible.';
  startTimers();

  await new Promise(resolve=>{
    const obs=new MutationObserver(()=>{
      if(!document.body.contains(overlay)){ obs.disconnect(); resolve();}
    });
    obs.observe(document.body,{childList:true});
  });

  if(timerInterval) clearInterval(timerInterval);
  await stopBlinking();
}
