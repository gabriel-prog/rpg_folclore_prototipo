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
    document.body.className = "fase1";
    document.body.style.fontFamily = "'VT323', monospace";
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <div id="timer"></div>
        <p>🌨️ Fase 1: Plantação Congelada no Alasca.</p>
        <button onclick="fase2(); tocarClique();">Ir para o Laboratório</button>
    `;
}

function fase2() {
    document.body.className = "fase2";
    document.body.style.fontFamily = "'Press Start 2P', cursive";
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <div id="timer"></div>
        <p>🔋 Fase 2: Laboratório Abandonado.</p>
        <button onclick="ativarPoderHacker(); tocarClique();">Ativar Poder Hacker</button>
    `;
}

function ativarPoderHacker() {
    document.body.style.backgroundColor = "black";
    document.getElementById('gameScreen').innerHTML = `
        <canvas id="matrixCanvas"></canvas>
        <p>🟢 Poder Hacker Matrix Ativado!</p>
        <button onclick="fase3(); tocarClique();">Avançar para a Fase 3</button>
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
    document.body.className = "fase3";
    document.body.style.fontFamily = "'VT323', monospace";
    atualizarEnergia(-30);
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <div id="timer"></div>
        <p>🌲 Fase 3: Floresta densa. Você sente fome.</p>
        <p>Você precisa comer em 20 segundos ou perderá energia!</p>
        <button onclick="comer(); tocarClique();">Comer</button>
    `;
    tocarAlerta();
    iniciarCronometro(20, () => {
        atualizarEnergia(-50);
        document.getElementById('gameScreen').innerHTML += `<p>❌ Você demorou demais!</p><button onclick="fase4(); tocarClique();">Fase 4</button>`;
    });
}

function comer() {
    clearInterval(timerInterval);
    atualizarEnergia(20);
    document.getElementById('gameScreen').innerHTML += `
        <p>✅ Você se alimentou e recuperou energia!</p>
        <button onclick="fase4(); tocarClique();">Fase 4</button>
    `;
}

function fase4() {
    document.body.className = "fase4";
    document.body.style.fontFamily = "'Press Start 2P', cursive";
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>🏞️ Fase 4: Um inimigo te ataca!</p>
        <button onclick="fase5(); tocarClique();">Continuar</button>
    `;
}
function fase5() {
    document.body.className = "fase1";
    document.body.style.fontFamily = "'VT323', monospace";
    atualizarEnergia(-10);
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>🌌 Fase 5: Floresta Noturna. Um espírito sombrio aparece!</p>
        <button onclick="atacarInimigo(); tocarAtaque();">⚔️ Atacar</button>
        <button onclick="fugir(); tocarClique();">🏃‍♂️ Fugir</button>
    `;
}

function atacarInimigo() {
    atualizarEnergia(-20);
    document.getElementById('gameScreen').innerHTML = `
        <p>💥 Você derrotou o inimigo, mas gastou energia.</p>
        <button onclick="fase6(); tocarClique();">Avançar para a Fase 6</button>
    `;
}

function fugir() {
    atualizarEnergia(-5);
    document.getElementById('gameScreen').innerHTML = `
        <p>✅ Você fugiu com menos perda de energia.</p>
        <button onclick="fase6(); tocarClique();">Avançar para a Fase 6</button>
    `;
}

function fase6() {
    document.body.className = "fase2";
    document.body.style.fontFamily = "'Press Start 2P', cursive";
    atualizarEnergia(-15);
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>🕳️ Fase 6: Caverna Subterrânea. Escolha o caminho:</p>
        <button onclick="escolhaCaminho('esquerda'); tocarClique();">← Esquerda</button>
        <button onclick="escolhaCaminho('direita'); tocarClique();">→ Direita</button>
    `;
}

function escolhaCaminho(caminho) {
    if (caminho === 'esquerda') {
        atualizarEnergia(-30);
        document.getElementById('gameScreen').innerHTML = `
            <p>❌ Armadilha! Você perdeu energia.</p>
            <button onclick="fase7(); tocarClique();">Fase 7</button>
        `;
    } else {
        atualizarEnergia(10);
        document.getElementById('gameScreen').innerHTML = `
            <p>✅ Caminho certo! Energia recuperada.</p>
            <button onclick="fase7(); tocarClique();">Fase 7</button>
        `;
    }
}

function fase7() {
    document.body.className = "fase3";
    document.body.style.fontFamily = "'VT323', monospace";
    atualizarEnergia(-10);
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>💻 Fase 7: Vila Hacker Subterrânea. Quebre o código em 15 segundos!</p>
        <button onclick="quebrarCodigo(); tocarClique();">Quebrar Código</button>
        <div id="timer"></div>
    `;
    tocarAlerta();
    iniciarCronometro(15, () => {
        atualizarEnergia(-25);
        document.getElementById('gameScreen').innerHTML += `<p>❌ Tempo esgotado!</p><button onclick="fase8(); tocarClique();">Fase 8</button>`;
    });
}

function quebrarCodigo() {
    clearInterval(timerInterval);
    atualizarEnergia(15);
    document.getElementById('gameScreen').innerHTML = `
        <p>✅ Código quebrado! Energia recuperada.</p>
        <button onclick="fase8(); tocarClique();">Fase 8</button>
    `;
}

function fase8() {
    document.body.className = "fase4";
    document.body.style.fontFamily = "'Press Start 2P', cursive";
    atualizarEnergia(-20);
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>👹 Fase 8: Campo Aberto. Dois inimigos atacam!</p>
        <button onclick="lutarDoisInimigos(); tocarAtaque();">Lutar!</button>
    `;
}

function lutarDoisInimigos() {
    atualizarEnergia(-30);
    document.getElementById('gameScreen').innerHTML = `
        <p>💥 Você venceu os dois inimigos!</p>
        <button onclick="fase9(); tocarClique();">Fase 9</button>
    `;
}

function fase9() {
    document.body.className = "fase1";
    document.body.style.fontFamily = "'VT323', monospace";
    atualizarEnergia(-10);
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>🌀 Fase 9: Sala do Portal Final.</p>
        <p>Deseja restaurar energia antes do Chefão?</p>
        <button onclick="recuperarEnergia(); tocarClique();">Restaurar Energia</button>
        <button onclick="fase10(); tocarClique();">Entrar no portal sem recuperar</button>
    `;
}

function recuperarEnergia() {
    atualizarEnergia(30);
    document.getElementById('gameScreen').innerHTML = `
        <p>✅ Energia restaurada!</p>
        <button onclick="fase10(); tocarClique();">Ir para o Chefão</button>
    `;
}

function fase10() {
    document.body.className = "fase4";
    document.body.style.fontFamily = "'Press Start 2P', cursive";
    document.getElementById('gameScreen').innerHTML = `
        <div id="energiaBar"><div id="energiaFill"></div></div>
        <p>👑 Fase 10: CHEFÃO FINAL - Entidade Suprema do Folclore!</p>
        <p>Você luta bravamente...</p>
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
        <p>🏆 Ranking Final:</p>
        <h2>${rank}</h2>
        <p>Obrigado por jogar!</p>
    `;
}
