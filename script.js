let energia = 100;
let timerInterval;

window.onload = function() {
    tocarAmbiente();
    fase1();
};

function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0;
        sound.play();
    }
}

function tocarClique() { playSound('clickSound'); }
function tocarAtaque() { playSound('attackSound'); }
function tocarAlerta() { playSound('alertSound'); }
function tocarAmbiente() { playSound('ambientSound'); }

function atualizarEnergia(valor) {
    energia = Math.max(0, Math.min(100, energia + valor));
    document.getElementById('energiaFill').style.width = energia + '%';
    if (energia <= 0) {
        document.getElementById('gameScreen').innerHTML = "<p>💀 Você desmaiou de exaustão...</p>";
        clearInterval(timerInterval);
    }
}

function iniciarCronometro(segundos, aoExpirar) {
    let restante = segundos;
    document.getElementById('timer').innerText = `⏳ Tempo: ${restante}s`;

    timerInterval = setInterval(() => {
        restante--;
        document.getElementById('timer').innerText = `⏳ Tempo: ${restante}s`;
        if (restante <= 0) {
            clearInterval(timerInterval);
            aoExpirar();
        }
    }, 1000);
}

function fase1() {
    document.body.style.backgroundImage = "url('images/floresta_frio.jpg')";
    document.body.style.fontFamily = "'VT323', monospace";
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <div id="timer"></div>
        <p>🌨️ Fase 1: Você acorda em uma plantação congelada no Alasca...</p>
        <button onclick="fase2(); tocarClique();">Ir para o laboratório</button>
    `;
}

function fase2() {
    document.body.style.backgroundImage = "url('images/floresta_frio.jpg')";
    document.body.style.fontFamily = "'Press Start 2P', cursive";
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>🔋 Fase 2: Laboratório abandonado...</p>
        <button onclick="ativarPoderHacker(); tocarClique();">Ativar Poder Hacker</button>
    `;
}

function ativarPoderHacker() {
    document.body.style.backgroundColor = "black";
    document.getElementById('gameScreen').innerHTML = `
        <canvas id="matrixCanvas"></canvas>
        <p>🟢 Seu poder Hacker foi ativado!</p>
        <button onclick="fase3(); tocarClique();">Ir para Fase 3</button>
    `;
    startMatrixEffect();
}

function startMatrixEffect() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const letters = Array(256).join(1).split('');
    setInterval(function() {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        letters.map(function(y_pos, index) {
            const text = String.fromCharCode(3e4 + Math.random() * 33);
            const x_pos = index * 10;
            ctx.fillText(text, x_pos, y_pos);
            letters[index] = (y_pos > 758 + Math.random() * 1e4) ? 0 : y_pos + 10;
        });
    }, 33);
}

function fase3() {
    document.body.style.backgroundImage = "url('images/floresta_frio.jpg')";
    document.body.style.fontFamily = "'VT323', monospace";
    atualizarEnergia(-20);

    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <div id="timer"></div>
        <p>🌲 Fase 3: Você sente fome e está ficando fraco.</p>
        <p>Escolha o que fazer antes de 20 segundos:</p>
        <button onclick="procurarComida(); tocarClique();">Procurar comida</button>
        <button onclick="ignorarFome(); tocarClique();">Ignorar fome</button>
    `;
    tocarAlerta();
    iniciarCronometro(20, () => {
        atualizarEnergia(-30);
        fase4();
    });
}

function procurarComida() {
    clearInterval(timerInterval);
    atualizarEnergia(30);
    document.getElementById('gameScreen').innerHTML = `
        <p>✅ Você encontrou algumas frutas congeladas e comeu!</p>
        <button onclick="fase4(); tocarClique();">Avançar para Fase 4</button>
    `;
}

function ignorarFome() {
    clearInterval(timerInterval);
    atualizarEnergia(-30);
    document.getElementById('gameScreen').innerHTML = `
        <p>❌ Você ficou ainda mais fraco.</p>
        <button onclick="fase4(); tocarClique();">Avançar para Fase 4</button>
    `;
}

function fase4() {
    document.body.style.fontFamily = "'Press Start 2P', cursive";
    atualizarEnergia(-10);
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>👹 Fase 4: Um espírito te ataca!</p>
        <button onclick="atacarInimigo(); tocarAtaque();">Atacar</button>
        <button onclick="fugir(); tocarClique();">Fugir</button>
    `;
}

function atacarInimigo() {
    atualizarEnergia(-15);
    document.getElementById('gameScreen').innerHTML = `
        <p>💥 Você venceu o inimigo, mas perdeu energia!</p>
        <button onclick="fase5(); tocarClique();">Fase 5</button>
    `;
}

function fugir() {
    atualizarEnergia(-5);
    document.getElementById('gameScreen').innerHTML = `
        <p>✅ Você conseguiu fugir!</p>
        <button onclick="fase5(); tocarClique();">Fase 5</button>
    `;
}

// Continua nas próximas fases com múltiplas escolhas também (Fase 5 até 10)

function fase5() {
    document.getElementById('gameScreen').innerHTML = `
        <p>🌌 Fase 5: Você encontra um computador quebrado no caminho...</p>
        <button onclick="tentarReparar(); tocarClique();">Tentar reparar</button>
        <button onclick="ignorarPC(); tocarClique();">Ignorar e seguir</button>
    `;
}

function tentarReparar() {
    atualizarEnergia(-10);
    document.getElementById('gameScreen').innerHTML = `
        <p>🔧 Você tentou reparar, mas gastou energia.</p>
        <button onclick="fase6(); tocarClique();">Fase 6</button>
    `;
}

function ignorarPC() {
    document.getElementById('gameScreen').innerHTML = `
        <p>🚶‍♂️ Você seguiu em frente...</p>
        <button onclick="fase6(); tocarClique();">Fase 6</button>
    `;
}

function fase6() {
    document.getElementById('gameScreen').innerHTML = `
        <p>🕳️ Fase 6: Entrada de uma caverna...</p>
        <button onclick="entrarNaCaverna(); tocarClique();">Entrar</button>
        <button onclick="darAVolta(); tocarClique();">Dar a volta</button>
    `;
}

function entrarNaCaverna() {
    atualizarEnergia(-20);
    document.getElementById('gameScreen').innerHTML = `
        <p>⚡ Você entrou e enfrentou monstros...</p>
        <button onclick="fase7(); tocarClique();">Fase 7</button>
    `;
}

function darAVolta() {
    atualizarEnergia(-5);
    document.getElementById('gameScreen').innerHTML = `
        <p>✅ Você evitou perigos!</p>
        <button onclick="fase7(); tocarClique();">Fase 7</button>
    `;
}

function fase7() {
    document.getElementById('gameScreen').innerHTML = `
        <p>💻 Fase 7: Vila Hacker Subterrânea. Quebre o código antes de 15 segundos!</p>
        <button onclick="quebrarCodigo(); tocarClique();">Quebrar código</button>
        <div id="timer"></div>
    `;
    tocarAlerta();
    iniciarCronometro(15, () => {
        atualizarEnergia(-25);
        fase8();
    });
}

function quebrarCodigo() {
    clearInterval(timerInterval);
    atualizarEnergia(15);
    document.getElementById('gameScreen').innerHTML = `
        <p>✅ Código quebrado com sucesso!</p>
        <button onclick="fase8(); tocarClique();">Fase 8</button>
    `;
}

function fase8() {
    document.getElementById('gameScreen').innerHTML = `
        <p>👹 Fase 8: Dois inimigos aparecem juntos!</p>
        <button onclick="lutarDoisInimigos(); tocarAtaque();">Lutar</button>
        <button onclick="fugirDosDois(); tocarClique();">Fugir</button>
    `;
}

function lutarDoisInimigos() {
    atualizarEnergia(-30);
    document.getElementById('gameScreen').innerHTML = `
        <p>💥 Vitória difícil, mas você sobreviveu!</p>
        <button onclick="fase9(); tocarClique();">Fase 9</button>
    `;
}

function fugirDosDois() {
    atualizarEnergia(-15);
    document.getElementById('gameScreen').innerHTML = `
        <p>🏃‍♂️ Você conseguiu escapar por pouco.</p>
        <button onclick="fase9(); tocarClique();">Fase 9</button>
    `;
}

function fase9() {
    document.getElementById('gameScreen').innerHTML = `
        <p>🌀 Fase 9: Sala do Portal Final!</p>
        <button onclick="restaurarEnergia(); tocarClique();">Restaurar Energia</button>
        <button onclick="fase10(); tocarClique();">Ir direto para o Chefão</button>
    `;
}

function restaurarEnergia() {
    atualizarEnergia(30);
    fase10();
}

function fase10() {
    document.getElementById('gameScreen').innerHTML = `
        <p>👑 Fase 10: CHEFÃO FINAL - Entidade Suprema!</p>
        <button onclick="calcularRanking(); tocarClique();">Ver Resultado Final</button>
    `;
}

function calcularRanking() {
    let rank = "";
    if (energia >= 90) rank = "S – Hacker Supremo";
    else if (energia >= 70) rank = "A – Sobrevivente Épico";
    else if (energia >= 50) rank = "B – Guerreiro Folclórico";
    else if (energia >= 30) rank = "C – Lutou até o fim";
    else rank = "D – Sobreviveu por pouco";

    document.getElementById('gameScreen').innerHTML = `
        <p>🏆 Seu Ranking Final:</p>
        <h2>${rank}</h2>
        <p>Obrigado por jogar!</p>
    `;
}
