document.addEventListener('DOMContentLoaded', () => {
    // --- Referências para Elementos HTML ---
    const gameTitle = document.getElementById('gameTitle');
    const gameScreen = document.getElementById('gameScreen');
    const energiaDisplay = document.getElementById('energiaDisplay');
    const energiaFill = document.getElementById('energiaFill');
    const timerDisplay = document.getElementById('timer');
    const matrixCanvas = document.getElementById('matrixCanvas');
    const clickSound = document.getElementById('clickSound');
    const attackSound = document.getElementById('attackSound');
    const alertSound = document.getElementById('alertSound');
    const ambientSound = document.getElementById('ambientSound');

    // --- Variáveis de Estado do Jogo ---
    let playerEnergy = 100;
    let currentPhaseIndex = 0; // Começa no índice 0 do array de fases
    let timerInterval;
    let score = 0;
    let matrixAnimationId; // Para controlar o loop do efeito Matrix

    // --- Definição das Fases do Jogo ---
    // Você vai preencher a descrição, opções e lógica para cada fase
    const phases = [
        // Fase 0: Introdução (Tela de Início)
        {
            id: 0,
            title: "Bem-vindo à Jornada no Alasca!",
            description: "Prepare-se para uma aventura de sobrevivência, mistério e folclore brasileiro no rigoroso Alasca. Sua missão começa agora.",
            options: [
                { text: "Iniciar Aventura", action: () => nextPhase() }
            ],
            backgroundClass: 'no-bg', // Nenhuma imagem de fundo específica para a intro ou uma imagem neutra
            fontClass: 'font-press-start', // Exemplo de classe para mudar a fonte
            matrixEffect: false,
            timerDuration: 0
        },
        // Fase 1: A Floresta Congelada
        {
            id: 1,
            title: "A Floresta de Gelo",
            description: "Você está na borda da densa floresta congelada. Um sinal estranho foi detectado em um satélite desativado. Você precisa investigá-lo. A geada morde a pele.",
            options: [
                { text: "Seguir pela trilha principal (+5 Energia)", action: () => handleChoice(5, 10, null, "Você encontra um caminho mais fácil.") },
                { text: "Atravessar o atalho perigoso (-10 Energia, +20 Pontos)", action: () => handleChoice(-10, 20, null, "O atalho é difícil, mas você economiza tempo. Sentiu algo estranho...") }
            ],
            backgroundClass: 'fase-bg-1', // Corresponde à classe CSS definida em style.css
            fontClass: 'font-vt323',
            matrixEffect: false,
            timerDuration: 30 // Tempo limite para esta decisão
        },
        // Fase 2: Encontro com o Curupira
        {
            id: 2,
            title: "Vozes na Neve: O Curupira",
            description: "Um som estranho ecoa entre as árvores, passos rápidos se aproximam, mas parecem vir de trás. Uma criatura com os pés virados para trás aparece! É o Curupira, guardião da floresta, agora no Alasca!",
            options: [
                { text: "Tentar se comunicar com o Curupira", action: () => handleComplexChoice('curupira-comunicar', 0, 0) },
                { text: "Atacar o Curupira (Risco!)", action: () => handleComplexChoice('curupira-atacar', -20, 0) },
                { text: "Fugir rapidamente", action: () => handleComplexChoice('curupira-fugir', -10, 0) }
            ],
            backgroundClass: 'fase-bg-1', // Pode ser a mesma ou uma nova
            fontClass: 'font-vt323',
            matrixEffect: true, // Ativa o efeito Matrix
            timerDuration: 45
        },
        // TODO: Adicionar Fase 3 a Fase 9 com suas descrições, opções e lógicas
        /*
        {
            id: 3,
            title: "A Caverna Misteriosa",
            description: "Você encontra uma caverna escura e úmida. O ar está pesado, mas você sente uma energia estranha vindo de dentro.",
            options: [
                { text: "Entrar na caverna (+10 Pontos, Risco)", action: () => handleComplexChoice('caverna-entrar', -15, 10) },
                { text: "Contornar a caverna (-5 Pontos, Mais seguro)", action: () => handleChoice(-5, 0, null, "Você decide não arriscar.") }
            ],
            backgroundClass: 'fase-bg-2', // Você precisaria criar 'fase-bg-2' no CSS
            fontClass: 'font-vt323',
            matrixEffect: false,
            timerDuration: 60
        },
        */
        // Fase 10: O Chefão Final
        {
            id: 10,
            title: "O Chefão Final: O Ente Antigo do Gelo",
            description: "Você alcançou a fonte do sinal. Um vasto lago congelado, e no centro, uma figura gigantesca emerge do gelo! Não é o lendário Monstro do Lago Ness, mas algo ainda mais antigo e perigoso, influenciado pelo folclore brasileiro!",
            options: [
                { text: "Confrontar a criatura (Batalha Final)", action: () => handleFinalBoss('confront') },
                { text: "Usar seus conhecimentos hacker para encontrar uma fraqueza", action: () => handleFinalBoss('hack') }
            ],
            backgroundClass: 'fase-bg-final', // Uma classe específica para o chefão
            fontClass: 'font-press-start',
            matrixEffect: true, // Efeito Matrix intenso
            timerDuration: 90
        },
        // Cena de Final de Jogo (Vitória/Derrota)
        {
            id: 'end',
            title: "Fim da Jornada",
            description: "", // Preenchida dinamicamente
            options: [{ text: "Jogar Novamente", action: () => restartGame() }],
            backgroundClass: 'no-bg',
            fontClass: 'font-press-start',
            matrixEffect: false,
            timerDuration: 0
        }
    ];

    // --- Funções Auxiliares ---

    // Atualiza a barra de energia e exibe o valor
    function updateEnergy(amount) {
        playerEnergy += amount;
        if (playerEnergy < 0) playerEnergy = 0;
        if (playerEnergy > 100) playerEnergy = 100;

        energiaFill.style.width = `${playerEnergy}%`;
        energiaDisplay.textContent = playerEnergy;

        if (playerEnergy <= 20 && playerEnergy > 0) {
            playSound(alertSound); // Som de alerta para energia baixa
        } else if (playerEnergy === 0) {
            gameOver("Sua energia se esgotou. Você sucumbiu ao frio e à exaustão.");
        }
    }

    // Toca um som específico
    function playSound(soundElement) {
        if (soundElement) {
            soundElement.currentTime = 0; // Reinicia o som
            soundElement.play().catch(e => console.warn("Erro ao tocar som:", e)); // Para evitar erros de autoplay
        }
    }

    // Gerencia o temporizador da fase
    function startTimer(durationInSeconds, onTimerEndCallback) {
        let timeLeft = durationInSeconds;
        timerDisplay.textContent = `Tempo restante: ${timeLeft}s`;

        clearInterval(timerInterval); // Limpa qualquer timer anterior
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Tempo restante: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = "Tempo esgotado!";
                onTimerEndCallback(); // Chama a função de callback
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerDisplay.textContent = '';
    }

    // Altera a classe do body para mudar o fundo
    function setBackground(className) {
        document.body.className = className;
    }

    // Altera a fonte do game screen
    function setFont(className) {
        // Você pode aplicar a classe diretamente ao gameScreen ou a elementos específicos
        gameScreen.style.fontFamily = (className === 'font-vt323' ? "'VT323', monospace" : "'Press Start 2P', cursive");
        gameTitle.style.fontFamily = "'Press Start 2P', cursive"; // Título sempre Press Start 2P
    }

    // Efeito Matrix (apenas visual, rodando em loop quando ativado)
    const matrixCtx = matrixCanvas.getContext('2d');
    const matrixFontSize = 15;
    const matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize);
    const matrixDrops = [];
    for (let i = 0; i < matrixColumns; i++) {
        matrixDrops[i] = 1;
    }

    function drawMatrix() {
        matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        matrixCtx.fillStyle = '#0F0'; // Green text
        matrixCtx.font = `${matrixFontSize}px arial`;

        for (let i = 0; i < matrixDrops.length; i++) {
            const text = String.fromCharCode(48 + Math.random() * 75); // Caracteres aleatórios
            matrixCtx.fillText(text, i * matrixFontSize, matrixDrops[i] * matrixFontSize);
            if (matrixDrops[i] * matrixFontSize > matrixCanvas.height && Math.random() > 0.975) {
                matrixDrops[i] = 0; // Reinicia a "gota"
            }
            matrixDrops[i]++;
        }
    }

    function startMatrixEffect() {
        if (matrixAnimationId) clearInterval(matrixAnimationId); // Limpa anterior
        matrixCanvas.style.display = 'block';
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        // Recalcular colunas se a tela mudou
        matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize);
        // Reset drops array
        for (let i = 0; i < matrixColumns; i++) {
            if (!matrixDrops[i]) matrixDrops[i] = 1;
        }

        matrixAnimationId = setInterval(drawMatrix, 33); // 30 FPS
    }

    function stopMatrixEffect() {
        clearInterval(matrixAnimationId);
        matrixCanvas.style.display = 'none';
    }

    // --- Lógica Principal do Jogo ---

    // Renderiza o conteúdo da fase atual na tela
    function renderPhase(phase) {
        stopTimer(); // Para o timer da fase anterior
        stopMatrixEffect(); // Para o efeito matrix se não for usar

        gameTitle.textContent = phase.title;
        gameScreen.innerHTML = `<p>${phase.description}</p>`; // Seta a descrição da fase

        // Limpa e cria os botões de opção
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('options');
        phase.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.onclick = () => {
                playSound(clickSound); // Som de clique ao interagir
                option.action(); // Executa a ação definida para a opção
            };
            optionsDiv.appendChild(button);
        });
        gameScreen.appendChild(optionsDiv);

        // Atualiza o fundo e a fonte
        setBackground(phase.backgroundClass);
        setFont(phase.fontClass);

        // Ativa o efeito Matrix se a fase exigir
        if (phase.matrixEffect) {
            startMatrixEffect();
        }

        // Inicia o timer se a fase tiver um
        if (phase.timerDuration > 0) {
            startTimer(phase.timerDuration, () => {
                gameOver("Você não conseguiu tomar uma decisão a tempo!");
            });
        }
    }

    // Avança para a próxima fase na sequência
    function nextPhase() {
        currentPhaseIndex++;
        score += 10; // Exemplo: ganha pontos por avançar de fase
        if (phases[currentPhaseIndex]) {
            renderPhase(phases[currentPhaseIndex]);
        } else {
            // Se não houver mais fases na lista, é o final do jogo
            endGame();
        }
    }

    // Função para lidar com escolhas simples de energia/pontos
    // message é opcional para feedback imediato na tela
    function handleChoice(energyChange, scoreChange, nextPhaseId = null, message = "") {
        updateEnergy(energyChange);
        score += scoreChange;
        if (message) {
            // Adiciona uma pequena mensagem de feedback na tela
            const feedback = document.createElement('p');
            feedback.textContent = message;
            gameScreen.appendChild(feedback);
        }
        // Espera um pouco antes de ir para a próxima fase, para o jogador ler o feedback
        setTimeout(() => {
            if (nextPhaseId) {
                // Se um ID de próxima fase for especificado, encontre-o e vá para ele
                const nextIndex = phases.findIndex(p => p.id === nextPhaseId);
                if (nextIndex !== -1) {
                    currentPhaseIndex = nextIndex;
                    renderPhase(phases[currentPhaseIndex]);
                } else {
                    console.error("Próxima fase não encontrada:", nextPhaseId);
                    nextPhase(); // Tenta ir para a próxima na sequência se não encontrar
                }
            } else {
                nextPhase(); // Vai para a próxima fase sequencial
            }
        }, 1500); // Exemplo: 1.5 segundos de delay
    }

    // Função para lidar com escolhas mais complexas (ex: Curupira, desafios de hacker)
    function handleComplexChoice(actionType, baseEnergyChange, baseScoreChange) {
        playSound(attackSound); // Exemplo: som de ataque ou alerta
        updateEnergy(baseEnergyChange); // Aplica a mudança de energia base

        let feedbackMessage = "";
        let nextPhaseToJump = null; // Para pular para uma fase específica, se necessário

        switch (actionType) {
            case 'curupira-comunicar':
                if (Math.random() > 0.6) { // 40% de chance de sucesso
                    updateEnergy(25); // Recompensa extra
                    score += 50;
                    feedbackMessage = "O Curupira o observa e aponta para uma direção, desaparecendo na neblina. Você sente um impulso de energia!";
                } else {
                    updateEnergy(-30); // Punição por falha
                    feedbackMessage = "O Curupira não entende seus sinais e te assusta, fazendo você perder o equilíbrio e energia.";
                }
                break;
            case 'curupira-atacar':
                if (Math.random() > 0.7) { // 30% de chance de vitória
                    score += 100;
                    feedbackMessage = "Você consegue afastar o Curupira! Ele some na mata, deixando um rastro de folhas.";
                } else {
                    updateEnergy(-40);
                    feedbackMessage = "O Curupira é ágil demais! Você leva um golpe forte e ele foge.";
                }
                break;
            case 'curupira-fugir':
                if (Math.random() > 0.6) { // 40% de chance de falha grave
                    updateEnergy(-20);
                    feedbackMessage = "Você tropeça e o Curupira te alcança, te deixando exausto antes de sumir.";
                } else {
                    feedbackMessage = "Você correu o mais rápido que pôde e conseguiu despistar o Curupira.";
                }
                break;
            // TODO: Adicionar mais casos para outras ações complexas (Fase 3 a 9)
            // Exemplo:
            /*
            case 'caverna-entrar':
                if (playerEnergy > 50 && Math.random() > 0.4) {
                    score += 50;
                    feedbackMessage = "A caverna revela um antigo esconderijo, com suprimentos úteis! Você se sente revigorado.";
                    updateEnergy(15);
                } else {
                    feedbackMessage = "Você se perde nas profundezas da caverna, perdendo tempo e energia.";
                    updateEnergy(-25);
                }
                break;
            */
            default:
                feedbackMessage = "Ação desconhecida.";
                break;
        }

        // Adiciona a mensagem de feedback
        const feedback = document.createElement('p');
        feedback.textContent = feedbackMessage;
        gameScreen.appendChild(feedback);

        // Avança para a próxima fase após um pequeno atraso
        setTimeout(() => {
            if (playerEnergy <= 0) { // Verifica GAME OVER após a ação
                gameOver("Sua energia se esgotou após a interação.");
            } else if (nextPhaseToJump) {
                const nextIndex = phases.findIndex(p => p.id === nextPhaseToJump);
                if (nextIndex !== -1) {
                    currentPhaseIndex = nextIndex;
                    renderPhase(phases[currentPhaseIndex]);
                } else {
                    console.error("Próxima fase específica não encontrada:", nextPhaseToJump);
                    nextPhase(); // Avança sequencialmente se o ID específico for inválido
                }
            } else {
                nextPhase(); // Avança sequencialmente
            }
        }, 2000); // Atraso maior para complexidade
    }

    // Lógica do Chefão Final
    function handleFinalBoss(actionType) {
        playSound(attackSound);
        stopTimer();
        stopMatrixEffect(); // Para o efeito Matrix no final
        gameScreen.innerHTML = ''; // Limpa a tela para o resultado final

        let finalMessage = "";
        let victory = false;

        if (actionType === 'confront') {
            if (playerEnergy > 70 && Math.random() > 0.4) { // Maior chance de vitória com energia alta
                score += 500;
                finalMessage = "<h2>VITÓRIA!</h2><p>Com sua coragem e força, você derrota a criatura! A fonte do sinal é neutralizada. O Alasca está seguro... por enquanto.</p>";
                victory = true;
            } else {
                finalMessage = "<h2>DERROTA!</h2><p>O monstro é muito poderoso. Suas forças não foram o suficiente. O Alasca caiu no caos.</p>";
                victory = false;
            }
        } else if (actionType === 'hack') {
            if (playerEnergy > 40 && Math.random() > 0.2) { // Chance de sucesso com energia razoável
                score += 700;
                finalMessage = "<h2>VITÓRIA CEREBRAL!</h2><p>Você hackeia o ambiente, explorando uma fraqueza oculta do monstro e o desativando completamente! Sua inteligência salvou o dia.</p>";
                victory = true;
            } else {
                finalMessage = "<h2>HACK FALHO!</h2><p>Seu hack falhou e o monstro te subjuga, absorvendo seus conhecimentos. O mundo está em perigo.</p>";
                victory = false;
            }
        }

        gameScreen.innerHTML = finalMessage;
        setTimeout(() => {
            if (victory) {
                endGame();
            } else {
                gameOver("Sua tentativa contra o Chefão Final falhou.");
            }
        }, 3000); // Tempo para o jogador ler o resultado da batalha
    }

    // Função de Game Over
    function gameOver(message) {
        stopTimer();
        stopMatrixEffect();
        playSound(alertSound);
        ambientSound.pause();
        ambientSound.currentTime = 0; // Para o som ambiente

        gameTitle.textContent = "Fim da Jornada";
        gameScreen.innerHTML = `<h2>GAME OVER</h2><p>${message}</p><button onclick="restartGame()">Reiniciar Jogo</button>`;
        // Note: A função restartGame() precisa ser global ou acessível aqui
    }

    // Calcula o ranking final baseado na pontuação
    function calculateRanking() {
        let rank = "D";
        if (score >= 1000) rank = "S";
        else if (score >= 700) rank = "A";
        else if (score >= 400) rank = "B";
        else if (score >= 100) rank = "C";
        return rank;
    }

    // Função de Fim de Jogo (Sucesso)
    function endGame() {
        stopTimer();
        stopMatrixEffect();
        ambientSound.pause();
        ambientSound.currentTime = 0; // Para o som ambiente

        const finalRank = calculateRanking();
        gameTitle.textContent = "Jornada Concluída!";
        gameScreen.innerHTML = `<h2>Parabéns!</h2><p>Você completou a jornada no Alasca.</p><p>Sua pontuação final: ${score}</p><p>Seu Ranking: ${finalRank}</p><button onclick="restartGame()">Jogar Novamente</button>`;
    }

    // Reinicia o jogo para o estado inicial
    window.restartGame = function() { // Tornada global para ser chamada pelo onclick
        playerEnergy = 100;
        score = 0;
        currentPhaseIndex = 0;
        stopTimer();
        stopMatrixEffect();
        initializeGame(); // Reinicia a inicialização do jogo
    };

    // --- Inicialização do Jogo ---
    function initializeGame() {
        updateEnergy(0); // Atualiza a energia inicial (100%)
        renderPhase(phases[currentPhaseIndex]); // Renderiza a primeira fase (introdução)

        // Tenta tocar o som ambiente. Pode precisar de interação do usuário primeiro.
        ambientSound.play().catch(e => console.warn("Som ambiente não pode ser tocado automaticamente na inicialização:", e));
    }

    // Inicia o jogo quando o DOM estiver pronto
    initializeGame();
});

// Resizing do canvas para efeito Matrix (para ser responsivo)
window.addEventListener('resize', () => {
    if (matrixCanvas.style.display === 'block') {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        // Recalcular colunas e re-inicializar drops se necessário
        const matrixFontSize = 15; // Certifique-se de que esta variável é acessível
        const matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize);
        const matrixDrops = [];
        for (let i = 0; i < matrixColumns; i++) {
            matrixDrops[i] = 1;
        }
    }
});
