// script.js - Lógica principal do jogo
document.addEventListener('DOMContentLoaded', () => { // Garante que o DOM está carregado antes de rodar o script
    const gameScreen = document.getElementById('gameScreen'); // Elemento principal do jogo
    const gameTitle = document.getElementById('gameTitle'); // Título do jogo
    const energiaDisplay = document.getElementById('energiaDisplay'); // Exibição de texto da energia
    const energiaFill = document.getElementById('energiaFill'); // Preenchimento visual da barra de energia
    const timerDisplay = document.getElementById('timer'); // Exibição do temporizador
    const matrixCanvas = document.getElementById('matrixCanvas'); // Canvas para o efeito Matrix
    const clickSound = document.getElementById('clickSound'); // Som de clique
    const attackSound = document.getElementById('attackSound'); // Som de ataque
    const alertSound = document.getElementById('alertSound'); // Som de alerta
    const ambientSound = document.getElementById('ambientSound'); // Som ambiente

    let energia = 100; // Energia inicial do jogador
    let currentPhase = 0; // Fase atual do jogo (começa em 0, a primeira será a 1)
    let timerInterval; // Variável para controlar o setInterval do timer
    let score = 0; // Pontuação para o ranking final

    // --- Funções de Utilitário ---

    // Função para atualizar a barra de energia
    function updateEnergy(amount) {
        energia += amount;
        if (energia < 0) energia = 0;
        if (energia > 100) energia = 100;
        energiaFill.style.width = `${energia}%`;
        energiaDisplay.textContent = energia;

        if (energia <= 20 && energia > 0) {
            alertSound.play(); // Toca som de alerta se a energia estiver baixa
        } else if (energia === 0) {
            gameOver("Você ficou sem energia!"); // Game Over se a energia acabar
        }
    }

    // Função para tocar sons
    function playSound(soundElement) {
        if (soundElement) {
            soundElement.currentTime = 0; // Reinicia o som se já estiver tocando
            soundElement.play().catch(e => console.error("Erro ao tocar som:", e)); // Captura erros de reprodução
        }
    }

    // Função para iniciar ou parar o temporizador
    function startTimer(durationInSeconds, onTimerEnd) {
        let timeLeft = durationInSeconds;
        timerDisplay.textContent = `Tempo restante: ${timeLeft}s`;

        clearInterval(timerInterval); // Limpa qualquer timer anterior
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Tempo restante: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = "Tempo esgotado!";
                onTimerEnd(); // Chama a função quando o tempo acaba
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerDisplay.textContent = '';
    }

    // Função para exibir o efeito Matrix
    function showMatrixEffect(duration = 3000) {
        matrixCanvas.style.display = 'block';
        // TODO: Implementar a lógica real do efeito Matrix no canvas
        // Isso normalmente envolve desenhar caracteres caindo no canvas
        setTimeout(() => {
            matrixCanvas.style.display = 'none';
        }, duration);
    }

    // Função para mudar o fundo da fase
    function setBackground(phaseNum) {
        document.body.className = `fase${phaseNum}`;
        // TODO: Para fases com fundos diferentes, adicionar mais classes CSS (ex: body.fase5 { background-image: url('...'); })
    }

    // Função para mudar a fonte (exemplo, você pode expandir isso)
    function setFont(fontName) {
        gameScreen.style.fontFamily = fontName;
    }

    // --- Lógica das Fases ---

    // Array de objetos para cada fase, contendo suas propriedades
    const phases = [
        // Fase 0 (Tela de Início ou Introdução)
        {
            id: 0,
            title: "Início da Jornada no Alasca",
            description: "Bem-vindo ao RPG Folclore Hacker – Jornada no Alasca! Prepare-se para uma aventura de sobrevivência, mistério e lendas. Você está em uma base de operações secreta, o inverno rigoroso se aproxima. Sua missão começa agora.",
            options: [
                { text: "Iniciar Jogo", action: () => nextPhase() }
            ],
            background: 0, // Sem fundo específico para a intro, ou uma imagem genérica
            font: 'Press Start 2P', // Fonte diferente para o título
            matrix: false
        },
        // Fase 1: Introdução à Floresta Congelada
        {
            id: 1,
            title: "O Início da Invasão",
            description: "Você está na borda da densa floresta congelada do Alasca. Um sinal estranho foi detectado em um satélite desativado. Você precisa chegar lá e investigar. A geada morde a pele.",
            options: [
                { text: "Seguir pela trilha principal (+5 energia)", action: () => handleChoice(1, 5) },
                { text: "Atravessar o atalho perigoso (-10 energia, +10 score)", action: () => handleChoice(1, -10, 10) }
            ],
            background: 1, // Corresponde à classe CSS 'fase1'
            font: 'VT323',
            matrix: false,
            timer: 30 // Tempo limite para esta fase
        },
        // Fase 2: Encontro com a Criatura (Curupira)
        {
            id: 2,
            title: "Vozes na Neve",
            description: "Um som estranho ecoa entre as árvores, passos rápidos se aproximam, mas parecem vir de trás. Uma criatura com os pés virados para trás aparece! É o Curupira, guardião da floresta brasileira, agora no Alasca!",
            options: [
                { text: "Tentar se comunicar com o Curupira (+15 energia, se sucesso)", action: () => handleChoice(2, 15, 0, 'communicate') },
                { text: "Atacar o Curupira (-20 energia, pode ganhar/perder)", action: () => handleChoice(2, -20, 0, 'attack') },
                { text: "Fugir rapidamente (-5 energia, se falha -20 energia)", action: () => handleChoice(2, -5, 0, 'run') }
            ],
            background: 2, // 'fase2'
            font: 'VT323',
            matrix: true, // Efeito Matrix ao encontrar o Curupira
            timer: 45
        },
        // TODO: Adicionar Fase 3 a Fase 9
        // Exemplo de estrutura para outras fases:
        /*
        {
            id: 3,
            title: "Desafio Hacker",
            description: "Você chegou a uma torre de comunicação antiga. Parece estar protegida por um sistema de segurança complexo.",
            options: [
                { text: "Invadir sistema (chance de sucesso/falha)", action: () => handleChoice(3, 0, 0, 'hack') },
                { text: "Desviar do sistema (gasta energia)", action: () => handleChoice(3, -15) }
            ],
            background: 3,
            font: 'VT323',
            matrix: false,
            timer: 60
        },
        */
        // Fase 10: Chefão Final
        {
            id: 10,
            title: "O Chefão Final: O Monstro do Lago Ness (versão Alasca)",
            description: "Você alcançou a fonte do sinal. Um vasto lago congelado, e no centro, uma figura gigantesca emerge do gelo! Não é o lendário Monstro do Lago Ness, mas algo ainda mais antigo e perigoso, influenciado pelo folclore brasileiro!",
            options: [
                { text: "Confrontar o monstro (batalha final)", action: () => handleFinalBoss('confront') },
                { text: "Usar hack para expor sua fraqueza (chance de vitória fácil)", action: () => handleFinalBoss('hack') }
            ],
            background: 10, // 'fase10'
            font: 'Press Start 2P',
            matrix: true, // Efeito Matrix intenso
            timer: 90
        }
    ];

    // Função para renderizar a fase atual na tela
    function renderPhase(phase) {
        stopTimer(); // Para o timer da fase anterior, se houver
        gameScreen.innerHTML = ''; // Limpa o conteúdo anterior

        gameTitle.textContent = phase.title; // Atualiza o título do jogo
        document.body.className = ''; // Limpa classes de fase anteriores
        setBackground(phase.background); // Define o fundo da fase
        setFont(phase.font); // Define a fonte da fase

        const phaseContent = document.createElement('div');
        phaseContent.classList.add('phase-content');
        phaseContent.innerHTML = `<h2>${phase.title}</h2><p>${phase.description}</p>`;
        gameScreen.appendChild(phaseContent);

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('options');
        phase.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.onclick = () => {
                playSound(clickSound); // Toca som de clique ao selecionar
                option.action(); // Executa a ação da opção
            };
            optionsDiv.appendChild(button);
        });
        gameScreen.appendChild(optionsDiv);

        // Ativa o efeito Matrix se a fase exigir
        if (phase.matrix) {
            showMatrixEffect();
        }

        // Inicia o timer se a fase tiver um
        if (phase.timer) {
            startTimer(phase.timer, () => {
                // TODO: Ação ao tempo esgotar (ex: perda de energia, game over)
                gameOver("Tempo esgotado! Você não conseguiu reagir a tempo.");
            });
        }
    }

    // Função para avançar para a próxima fase
    function nextPhase() {
        currentPhase++;
        score += 10; // Exemplo: ganha pontos por avançar
        if (phases[currentPhase]) {
            renderPhase(phases[currentPhase]);
        } else {
            // Se não houver mais fases na lista, game over ou final do jogo
            endGame();
        }
    }

    // Função para lidar com as escolhas do jogador
    function handleChoice(phaseId, energyChange, scoreChange = 0, specificAction = null) {
        updateEnergy(energyChange);
        score += scoreChange;

        // Lógica específica para cada escolha/fase
        switch (phaseId) {
            case 1: // Fase 1
                if (energyChange === -10) { // Atalho perigoso
                    // TODO: Talvez uma chance de evento negativo aqui
                    gameScreen.innerHTML += "<p>Você sente um arrepio... Mas economiza tempo.</p>";
                } else { // Trilha principal
                    gameScreen.innerHTML += "<p>A trilha é mais longa, mas você se sente mais seguro.</p>";
                }
                nextPhase();
                break;
            case 2: // Fase 2: Curupira
                playSound(attackSound); // Exemplo: som de ataque ou alerta
                if (specificAction === 'communicate') {
                    if (Math.random() > 0.5) { // 50% de chance de sucesso
                        updateEnergy(20); // Recompensa extra
                        score += 50;
                        gameScreen.innerHTML += "<p>O Curupira o observa e aponta para uma direção, desaparecendo na neblina. Você sente um impulso de energia!</p>";
                    } else {
                        updateEnergy(-30); // Punição por falha
                        gameScreen.innerHTML += "<p>O Curupira não entende seus sinais e te assusta, fazendo você perder o equilíbrio e energia.</p>";
                    }
                } else if (specificAction === 'attack') {
                    if (Math.random() > 0.7) { // 30% de chance de vitória
                        score += 100;
                        gameScreen.innerHTML += "<p>Você consegue afastar o Curupira! Ele some na mata, deixando um rastro de folhas.</p>";
                    } else {
                        updateEnergy(-40);
                        gameScreen.innerHTML += "<p>O Curupira é ágil demais! Você leva um golpe forte e ele foge.</p>";
                    }
                } else if (specificAction === 'run') {
                    if (Math.random() > 0.6) { // 40% de chance de falha grave
                        updateEnergy(-20);
                        gameScreen.innerHTML += "<p>Você tropeça e o Curupira te alcança, te deixando exausto antes de sumir.</p>";
                    } else {
                        gameScreen.innerHTML += "<p>Você correu o mais rápido que pôde e conseguiu despistar o Curupira.</p>";
                    }
                }
                nextPhase();
                break;
            // TODO: Adicionar lógica para Fase 3 até Fase 9
            default:
                nextPhase(); // Por padrão, avança para a próxima fase
        }
    }

    // Lógica do Chefão Final
    function handleFinalBoss(actionType) {
        playSound(attackSound);
        stopTimer();
        gameScreen.innerHTML = '';
        if (actionType === 'confront') {
            // Lógica de confronto direto
            if (energia > 50 && Math.random() > 0.3) {
                score += 500;
                gameScreen.innerHTML = "<h2>VITÓRIA!</h2><p>Com sua habilidade e energia, você derrota a criatura! A fonte do sinal é neutralizada.</p>";
            } else {
                gameScreen.innerHTML = "<h2>DERROTA!</h2><p>O monstro é muito poderoso. Suas forças não foram o suficiente.</p>";
                gameOver("Derrotado pelo Chefão Final.");
            }
        } else if (actionType === 'hack') {
            // Lógica de hack
            if (energia > 30 && Math.random() > 0.1) {
                score += 700;
                gameScreen.innerHTML = "<h2>VITÓRIA CEREBRAL!</h2><p>Você hackeia o ambiente, expondo a fraqueza do monstro e o desativando!</p>";
            } else {
                gameScreen.innerHTML = "<h2>HACK FALHO!</h2><p>Seu hack falhou e o monstro te subjuga.</p>";
                gameOver("Seu hack não funcionou contra o Chefão Final.");
            }
        }
        setTimeout(endGame, 3000); // Vai para a tela final após 3 segundos
    }


    // Função Game Over
    function gameOver(message) {
        stopTimer();
        playSound(alertSound);
        gameScreen.innerHTML = `<h2>GAME OVER</h2><p>${message}</p><button onclick="location.reload()">Reiniciar Jogo</button>`;
        gameTitle.textContent = "Fim da Jornada";
        // TODO: Parar o som ambiente
        ambientSound.pause();
        ambientSound.currentTime = 0;
    }

    // Função para calcular o ranking final
    function calculateRanking() {
        let rank = "D";
        if (score >= 1000) rank = "S";
        else if (score >= 700) rank = "A";
        else if (score >= 400) rank = "B";
        else if (score >= 100) rank = "C";
        return rank;
    }

    // Função de Fim de Jogo
    function endGame() {
        stopTimer();
        const finalRank = calculateRanking();
        gameScreen.innerHTML = `<h2>Jornada Concluída!</h2><p>Sua pontuação final: ${score}</p><p>Seu Ranking: ${finalRank}</p><button onclick="location.reload()">Jogar Novamente</button>`;
        gameTitle.textContent = "Fim da Jornada";
        // TODO: Parar o som ambiente
        ambientSound.pause();
        ambientSound.currentTime = 0;
    }

    // --- Inicialização do Jogo ---
    function initializeGame() {
        updateEnergy(0); // Inicia a barra de energia com o valor padrão
        // Tenta tocar o som ambiente. Pode falhar sem interação do usuário.
        ambientSound.play().catch(e => console.warn("Som ambiente não pode ser tocado automaticamente:", e));
        renderPhase(phases[0]); // Começa com a fase de introdução
    }

    // Efeito Matrix (lógica básica - precisa ser expandida para um efeito real)
    const ctx = matrixCanvas.getContext('2d');
    const columns = Math.floor(matrixCanvas.width / 20);
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        ctx.fillStyle = '#0F0'; // Green text

        for (let i = 0; i < drops.length; i++) {
            const text = String.fromCharCode(48 + Math.random() * 75);
            ctx.fillText(text, i * 20, drops[i] * 20);
            if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    // TODO: Chamar drawMatrix em um setInterval apenas quando o efeito estiver ativo
    // Exemplo: let matrixAnimation;
    // function showMatrixEffect() { matrixCanvas.style.display = 'block'; matrixAnimation = setInterval(drawMatrix, 33); }
    // function hideMatrixEffect() { matrixCanvas.style.display = 'none'; clearInterval(matrixAnimation); }


    // Inicia o jogo quando o DOM estiver completamente carregado
    initializeGame();
});
