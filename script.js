document.addEventListener('DOMContentLoaded', () => {
    // --- Referências para Elementos HTML ---
    const gameTitle = document.getElementById('gameTitle');
    const gameScreen = document.getElementById('gameScreen');
    const energiaDisplay = document.getElementById('energiaDisplay');
    const energiaFill = document.getElementById('energiaFill');
    const timerDisplay = document.getElementById('timer');
    const matrixCanvas = document.getElementById('matrixCanvas');
    const playerInventoryDiv = document.getElementById('playerInventory');
    const inventoryList = document.getElementById('inventoryList');

    // --- Elementos de Áudio ---
    const clickSound = document.getElementById('clickSound');
    const attackSound = document.getElementById('attackSound');
    const alertSound = document.getElementById('alertSound');
    const ambientSound = document.getElementById('ambientSound');
    const fase2Music = document.getElementById('fase2Music'); // Exemplo de música específica
    const bossMusic = document.getElementById('bossMusic'); // Exemplo de música de boss

    let currentMusic = null; // Para controlar qual música está tocando

    // --- Variáveis de Estado do Jogo ---
    let player = {
        energy: 100,
        score: 0,
        inventory: [],
        currentPhaseIndex: 0 // Começa no índice 0 (Introdução)
    };

    let timerInterval;
    let matrixAnimationId; // Para controlar o loop do efeito Matrix

    // --- Definição das Fases do Jogo ---
    const phases = [
        // Fase 0: Introdução (Tela de Início)
        {
            id: 0,
            title: "🌌 RPG Folclore Hacker - Jornada no Alasca 🌌",
            description: "Bem-vindo ao Alasca! Prepare-se para uma aventura de sobrevivência, mistério e lendas. Você está em uma base de operações secreta. O inverno rigoroso se aproxima. Sua missão começa agora.",
            options: [
                { text: "Iniciar Nova Aventura", action: () => startGame() },
                { text: "Continuar (se houver save)", action: () => loadGame() } // Opção de carregar jogo
            ],
            backgroundClass: 'bg-fase-intro', // Ajustado
            fontClass: 'font-press-start',
            matrixEffect: false,
            timerDuration: 0,
            music: null
        },
        // Fase 1: A Floresta de Gelo
        {
            id: 1,
            title: "A Floresta de Gelo: O Sinal Anômalo",
            description: "Você está na borda da densa floresta congelada do Alasca. Um sinal anômalo foi detectado em um satélite desativado. Você precisa chegar lá e investigar. A geada morde a pele.",
            options: [
                { text: "Seguir pela trilha principal", action: () => handleChoice(10, -5, null, "Você encontra um caminho mais fácil através da neve. A brisa gelada é revigorante, mas a sensação de que o tempo está passando persiste.") },
                { text: "Atravessar o atalho perigoso", action: () => handleChoice(-15, 20, null, "O atalho é íngreme e perigoso, drenando sua energia. Você sente que algo foi deixado para trás, uma oportunidade ou um perigo futuro.") }
            ],
            backgroundClass: 'bg-fase-1', // Ajustado
            fontClass: 'font-vt323',
            matrixEffect: false,
            timerDuration: 30,
            music: ambientSound
        },
        // Fase 2: Encontro com o Curupira
        {
            id: 2,
            title: "Vozes na Neve: O Curupira",
            description: "Um som estranho ecoa entre as árvores, passos rápidos se aproximam, mas parecem vir de trás. Uma criatura com os pés virados para trás aparece! É o Curupira, guardião da floresta brasileira, agora no Alasca!",
            options: [
                { text: "Tentar se comunicar com o Curupira", action: () => handleComplexChoice('curupira-comunicar', 0, 0) },
                { text: "Atacar o Curupira (Risco!)", action: () => handleComplexChoice('curupira-atacar', -20, 0) },
                { text: "Fugir rapidamente", action: () => handleComplexChoice('curupira-fugir', -10, 0) }
            ],
            backgroundClass: 'bg-fase-2', // Ajustado
            fontClass: 'font-vt323',
            matrixEffect: true, // Ativa o efeito Matrix
            timerDuration: 45,
            music: fase2Music // Música específica para esta fase
        },
        // Fase 3: Desafio Hacker na Cabana Abandonada
        {
            id: 3,
            title: "A Cabana Oculta: Desafio de Rede",
            description: "Você encontra uma cabana de caça abandonada. Há um terminal antigo piscando em seu interior. Parece que há dados sobre o sinal anômalo aqui, mas está bloqueado por uma rede criptografada.",
            options: [
                { text: "Tentar invadir a rede (Hack rápido)", action: () => handleComplexChoice('hack-cabana', -5, 50) },
                { text: "Procurar por uma entrada física (Gasta mais tempo)", action: () => handleChoice(-15, 0, null, "Você perde tempo procurando, mas encontra uma porta lateral secreta.") },
                { text: "Ignorar a cabana e seguir em frente", action: () => handleChoice(0, -20, null, "Você sente que perdeu uma grande oportunidade.") }
            ],
            backgroundClass: 'bg-fase-3', // Ajustado
            fontClass: 'font-vt323',
            matrixEffect: true,
            timerDuration: 60,
            music: ambientSound
        },
        // Fase 4: O Encontro com o "Homem da Neve" (Saci-Pererê Disfarçado?)
        {
            id: 4,
            title: "A Figura na Neve: O Mistério do Saci",
            description: "Enquanto avança, uma figura estranha surge na neve. Parece um homem coberto de pelo, mas seus olhos brilham com uma astúcia familiar. Seria um Saci-Pererê adaptado ao frio do Alasca?",
            options: [
                { text: "Tentar ludibriar o Saci (Teste de Inteligência)", action: () => handleComplexChoice('saci-ludibriar', 0, 30) },
                { text: "Oferecer um cachimbo (Se tiver no inventário)", action: () => handleComplexChoice('saci-cachimbo', 0, 50) },
                { text: "Atacar a criatura", action: () => handleComplexChoice('saci-atacar', -25, 0) }
            ],
            backgroundClass: 'bg-fase-4', // Ajustado
            fontClass: 'font-vt323',
            matrixEffect: false,
            timerDuration: 50,
            music: ambientSound
        },
        // Fase 5: A Base Militar Abandonada e Seus Segredos (MANTER PLACEHOLDER DA IMAGEM POR ENQUANTO)
        {
            id: 5,
            title: "Eco do Passado: A Base Abandonada",
            description: "Você se depara com uma antiga base militar de pesquisa, coberta pela neve. Suas estruturas de comunicação estão estranhamente ativas. Este pode ser o local de onde o sinal está vindo.",
            options: [
                { text: "Infiltrar-se silenciosamente", action: () => handleComplexChoice('infiltrar-base', -10, 40) },
                { text: "Buscar por entradas de serviço (requer item)", action: () => handleComplexChoice('entrada-servico', 0, 0) },
                { text: "Forçar a entrada (Risco de Alarme)", action: () => handleComplexChoice('forcar-entrada', -30, 20) }
            ],
            backgroundClass: 'bg-fase-5', // PLACEHOLDER
            fontClass: 'font-vt323',
            matrixEffect: true,
            timerDuration: 70,
            music: ambientSound
        },
        // Fase 6: O Laboratório Subterrâneo e Experimentos Fracassados (MANTER PLACEHOLDER DA IMAGEM POR ENQUANTO)
        {
            id: 6,
            title: "Os Horrores do Gelo: Laboratório Abandono",
            description: "Dentro da base, você desce para um laboratório subterrâneo. Equipamentos estão destruídos, e há sinais de experimentos biológicos falhos. Algo terrível aconteceu aqui, e o ar está carregado de uma energia sinistra.",
            options: [
                { text: "Investigar os arquivos de dados", action: () => handleComplexChoice('lab-investigar-arquivos', 0, 60) },
                { text: "Coletar amostras de equipamentos", action: () => handleComplexChoice('lab-coletar-amostras', -15, 30) },
                { text: "Sair rapidamente do laboratório", action: () => handleChoice(-5, 0, null, "Você não aguenta o cheiro e sai o mais rápido possível.") }
            ],
            backgroundClass: 'bg-fase-6', // PLACEHOLDER
            fontClass: 'font-vt323',
            matrixEffect: false,
            timerDuration: 80,
            music: ambientSound
        },
        // Fase 7: O Enigma da Curupira Hacker (MANTER PLACEHOLDER DA IMAGEM POR ENQUANTO)
        {
            id: 7,
            title: "A Enigma da Curupira Hacker",
            description: "Ao tentar acessar um terminal principal, você é confrontado por uma IA complexa. Ela se manifesta como uma figura digital com pés virados: a Curupira Hacker, protetora do núcleo do sinal. Ela te desafia com um enigma lógico.",
            options: [
                { text: "Tentar resolver o enigma (Teste de Lógica)", action: () => handleComplexChoice('curupira-hacker-enigma', 0, 70) },
                { text: "Tentar bypass (Risco de Efeito Colateral)", action: () => handleComplexChoice('curupira-hacker-bypass', -20, 40) },
                { text: "Requisitar ajuda (se tiver item/habilidade)", action: () => handleComplexChoice('curupira-hacker-ajuda', 0, 0) }
            ],
            backgroundClass: 'bg-fase-7', // PLACEHOLDER
            fontClass: 'font-press-start',
            matrixEffect: true,
            timerDuration: 90,
            music: fase2Music // Pode ser uma música de desafio
        },
        // Fase 8: A Realidade Distorcida (Boto Enfeitiçador) (MANTER PLACEHOLDER DA IMAGEM POR ENQUANTO)
        {
            id: 8,
            title: "O Pântano Digital: A Ilusão do Boto",
            description: "A caminho da fonte, a realidade começa a se distorcer. A floresta se transforma em um pântano digital ilusório. Você vê um homem elegante emergir da água, seus olhos brilham. É o Boto, usando seus encantos digitais para te desorientar.",
            options: [
                { text: "Resistir à ilusão (Teste de Vontade)", action: () => handleComplexChoice('boto-resistir', -10, 50) },
                { text: "Aceitar a ilusão por um tempo (Pode dar informações, mas é perigoso)", action: () => handleComplexChoice('boto-aceitar', -5, 20) },
                { text: "Tentar quebrar o encanto com um pulso EMP (se tiver item)", action: () => handleComplexChoice('boto-emp', 0, 80) }
            ],
            backgroundClass: 'bg-fase-8', // PLACEHOLDER
            fontClass: 'font-vt323',
            matrixEffect: true,
            timerDuration: 70,
            music: ambientSound
        },
        // Fase 9: A Fortaleza do Gelo (Cuca Mestra) (MANTER PLACEHOLDER DA IMAGEM POR ENQUANTO)
        {
            id: 9,
            title: "A Fortaleza do Gelo: A Sentinela Cuca",
            description: "Você chega a uma imponente fortaleza de gelo, que pulsa com a energia do sinal anômalo. A entrada é guardada por uma figura grotesca, de cabeça grande e olhos astutos: a Cuca, agora uma mestra em armadilhas de gelo e ilusões digitais.",
            options: [
                { text: "Confrontar a Cuca diretamente", action: () => handleComplexChoice('cuca-confrontar', -30, 50) },
                { text: "Buscar por vulnerabilidades nos sistemas da fortaleza", action: () => handleComplexChoice('cuca-vulnerabilidades', -10, 60) },
                { text: "Tentar uma distração (requer item)", action: () => handleComplexChoice('cuca-distracao', 0, 30) }
            ],
            backgroundClass: 'bg-fase-9', // PLACEHOLDER
            fontClass: 'font-press-start',
            matrixEffect: true,
            timerDuration: 85,
            music: ambientSound
        },
        // Fase 10: O Chefão Final - A Entidade Glacial-Folclórica (MANTER PLACEHOLDER DA IMAGEM POR ENQUANTO)
        {
            id: 10,
            title: "O Chefão Final: O Ente Antigo do Gelo",
            description: "Você alcançou a fonte do sinal, no coração da fortaleza. Um vasto salão de gelo, e no centro, uma figura gigantesca e amorfa emerge do gelo, pulsando com energia hacker e folclórica. Não é o lendário Monstro do Lago Ness, mas algo ainda mais antigo e perigoso, uma fusão bizarra de tecnologia e lenda brasileira!",
            options: [
                { text: "Confrontar a criatura (Batalha Final)", action: () => handleFinalBoss('confront') },
                { text: "Usar seus conhecimentos hacker para expor uma fraqueza crítica", action: () => handleFinalBoss('hack') }
            ],
            backgroundClass: 'bg-fase-final', // PLACEHOLDER
            fontClass: 'font-press-start',
            matrixEffect: true, // Efeito Matrix intenso
            timerDuration: 90,
            music: bossMusic // Música específica para o boss
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
            timerDuration: 0,
            music: null
        }
    ];

    // --- Funções Auxiliares ---

    // Atualiza a barra de energia e exibe o valor
    function updateEnergy(amount) {
        player.energy += amount;
        if (player.energy < 0) player.energy = 0;
        if (player.energy > 100) player.energy = 100;

        energiaFill.style.width = `${player.energy}%`;
        energiaDisplay.textContent = player.energy;

        if (player.energy <= 20 && player.energy > 0) {
            playSound(alertSound); // Som de alerta para energia baixa
        } else if (player.energy === 0) {
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

    // Gerencia a música de fundo
    function playMusic(musicElement) {
        if (currentMusic) {
            currentMusic.pause();
            currentMusic.currentTime = 0;
        }
        if (musicElement) {
            currentMusic = musicElement;
            currentMusic.loop = true;
            currentMusic.volume = 0.5; // Ajuste o volume
            currentMusic.play().catch(e => console.warn("Erro ao tocar música:", e));
        } else {
            currentMusic = null;
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
        gameScreen.style.fontFamily = (className === 'font-vt323' ? "'VT323', monospace" : "'Press Start 2P', cursive");
        gameTitle.style.fontFamily = "'Press Start 2P', cursive"; // Título sempre Press Start 2P
    }

    // Gerencia o inventário
    function addItemToInventory(item) {
        player.inventory.push(item);
        updateInventoryDisplay();
        playerInventoryDiv.classList.remove('hidden'); // Mostra o inventário
    }

    function removeItemFromInventory(item) {
        player.inventory = player.inventory.filter(i => i !== item);
        updateInventoryDisplay();
        if (player.inventory.length === 0) {
            playerInventoryDiv.classList.add('hidden'); // Oculta se vazio
        }
    }

    function hasItem(item) {
        return player.inventory.includes(item);
    }

    function updateInventoryDisplay() {
        inventoryList.innerHTML = '';
        if (player.inventory.length === 0) {
            inventoryList.innerHTML = '<li>Vazio</li>';
        } else {
            player.inventory.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                inventoryList.appendChild(li);
            });
        }
    }

    // Efeito Matrix (apenas visual, rodando em loop quando ativado)
    const matrixCtx = matrixCanvas.getContext('2d');
    let matrixFontSize = 15;
    let matrixColumns = Math.floor(window.innerWidth / matrixFontSize);
    let matrixDrops = Array.from({length: matrixColumns}, () => 1);

    function resizeMatrixCanvas() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize);
        matrixDrops = Array.from({length: matrixColumns}, (_, i) => matrixDrops[i] || 1); // Maintain existing drops or initialize new ones
    }
    window.addEventListener('resize', resizeMatrixCanvas);

    function drawMatrix() {
        matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        matrixCtx.fillStyle = '#0F0'; // Green text
        matrixCtx.font = `${matrixFontSize}px monospace`; // Melhor para estilo retro

        for (let i = 0; i < matrixDrops.length; i++) {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96); // Caracteres Katakana para efeito mais autêntico
            matrixCtx.fillText(text, i * matrixFontSize, matrixDrops[i] * matrixFontSize);
            if (matrixDrops[i] * matrixFontSize > matrixCanvas.height && Math.random() > 0.975) {
                matrixDrops[i] = 0; // Reinicia a "gota"
            }
            matrixDrops[i]++;
        }
    }

    function startMatrixEffect() {
        resizeMatrixCanvas(); // Ajusta o canvas ao tamanho da tela
        if (matrixAnimationId) clearInterval(matrixAnimationId); // Limpa anterior
        matrixCanvas.style.display = 'block';
        matrixAnimationId = setInterval(drawMatrix, 33); // Aproximadamente 30 FPS
    }

    function stopMatrixEffect() {
        clearInterval(matrixAnimationId);
        matrixCanvas.style.display = 'none';
    }

    // --- Salvamento e Carregamento de Jogo (LocalStorage) ---
    function saveGame() {
        try {
            const gameState = {
                energy: player.energy,
                score: player.score,
                inventory: player.inventory,
                currentPhaseIndex: player.currentPhaseIndex
            };
            localStorage.setItem('rpgSave', JSON.stringify(gameState));
            console.log("Jogo salvo com sucesso!");
        } catch (e) {
            console.error("Erro ao salvar jogo:", e);
        }
    }

    function loadGame() {
        try {
            const savedState = localStorage.getItem('rpgSave');
            if (savedState) {
                const gameState = JSON.parse(savedState);
                player.energy = gameState.energy;
                player.score = gameState.score;
                player.inventory = gameState.inventory || []; // Garante que inventory é um array
                player.currentPhaseIndex = gameState.currentPhaseIndex;

                console.log("Jogo carregado com sucesso!");
                startGame(); // Inicia o jogo com o estado carregado
                return true;
            } else {
                console.log("Nenhum jogo salvo encontrado.");
                alert("Nenhum jogo salvo encontrado. Iniciando nova aventura.");
                startGame(); // Inicia um novo jogo se não houver save
                return false;
            }
        } catch (e) {
            console.error("Erro ao carregar jogo:", e);
            alert("Erro ao carregar jogo salvo. Iniciando nova aventura.");
            startGame(); // Inicia novo jogo em caso de erro no carregamento
            return false;
        }
    }

    // --- Lógica Principal do Jogo ---

    // Renderiza o conteúdo da fase atual na tela
    function renderPhase(phase) {
        stopTimer(); // Para o timer da fase anterior
        stopMatrixEffect(); // Para o efeito matrix se não for usar
        playMusic(phase.music); // Toca a música da fase

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
                saveGame(); // Salva o jogo após cada escolha
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
        updateEnergy(0); // Atualiza display de energia
        updateInventoryDisplay(); // Atualiza display do inventário
    }

    // Avança para a próxima fase na sequência
    function nextPhase() {
        player.currentPhaseIndex++;
        player.score += 10; // Exemplo: ganha pontos por avançar de fase
        if (phases[player.currentPhaseIndex]) {
            renderPhase(phases[player.currentPhaseIndex]);
        } else {
            // Se não houver mais fases na lista, é o final do jogo
            endGame();
        }
    }

    // Função para lidar com escolhas simples de energia/pontos
    function handleChoice(energyChange, scoreChange, nextPhaseId = null, message = "") {
        updateEnergy(energyChange);
        player.score += scoreChange;
        if (message) {
            // Adiciona uma pequena mensagem de feedback na tela
            const feedback = document.createElement('p');
            feedback.classList.add('feedback-message'); // Adicione estilo para isso no CSS
            feedback.textContent = message;
            gameScreen.appendChild(feedback);
        }
        // Espera um pouco antes de ir para a próxima fase, para o jogador ler o feedback
        setTimeout(() => {
            if (player.energy <= 0) return; // Se a energia chegou a zero, já chamou gameOver
            if (nextPhaseId !== null) {
                const nextIndex = phases.findIndex(p => p.id === nextPhaseId);
                if (nextIndex !== -1) {
                    player.currentPhaseIndex = nextIndex;
                    renderPhase(phases[player.currentPhaseIndex]);
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
        player.score += baseScoreChange;

        let feedbackMessage = "";
        let nextPhaseToJump = null; // Para pular para uma fase específica, se necessário

        switch (actionType) {
            case 'curupira-comunicar':
                if (Math.random() > 0.6) { // 40% de chance de sucesso
                    updateEnergy(25);
                    player.score += 50;
                    feedbackMessage = "O Curupira o observa e aponta para uma direção, desaparecendo na neblina. Você sente um impulso de energia!";
                } else {
                    updateEnergy(-30);
                    feedbackMessage = "O Curupira não entende seus sinais e te assusta, fazendo você perder o equilíbrio e energia.";
                }
                break;
            case 'curupira-atacar':
                if (Math.random() > 0.7) { // 30% de chance de vitória
                    player.score += 100;
                    feedbackMessage = "Você consegue afastar o Curupira! Ele some na mata, deixando um rastro de folhas.";
                    addItemToInventory("Pena de Curupira");
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
            case 'hack-cabana':
                if (Math.random() > 0.4) { // 60% de chance de sucesso
                    player.score += 100;
                    feedbackMessage = "Hack bem-sucedido! Você acessa dados cruciais sobre a origem do sinal e encontra um 'Módulo de Criptografia'.";
                    addItemToInventory("Módulo de Criptografia");
                } else {
                    updateEnergy(-20);
                    feedbackMessage = "Falha no hack! O sistema se autoprotege e você leva um choque de feedback. O terminal se fecha.";
                }
                break;
            case 'saci-ludibriar':
                if (Math.random() > 0.5) { // 50%
                    player.score += 60;
                    feedbackMessage = "Você consegue ludibriar o Saci! Ele ri e some, deixando cair uma 'Pó Mágico'.";
                    addItemToInventory("Pó Mágico");
                } else {
                    updateEnergy(-10);
                    feedbackMessage = "O Saci é muito esperto, ele te prega uma peça e te deixa confuso.";
                }
                break;
            case 'saci-cachimbo':
                if (hasItem("Cachimbo Antigo")) { // Exemplo de item necessário
                    removeItemFromInventory("Cachimbo Antigo");
                    player.score += 80;
                    feedbackMessage = "O Saci aceita o cachimbo e te revela um atalho secreto. Sua jornada fica mais fácil!";
                    nextPhaseToJump = 6; // Pula para a fase 6
                } else {
                    updateEnergy(-15);
                    feedbackMessage = "Você não tem um cachimbo. O Saci assobia e te ignora, você se perde um pouco.";
                }
                break;
            case 'saci-atacar':
                if (Math.random() > 0.8) { // 20%
                    player.score += 30;
                    feedbackMessage = "Você assusta o Saci com um ataque inesperado! Ele desaparece em um redemoinho.";
                } else {
                    updateEnergy(-35);
                    feedbackMessage = "O Saci é rápido demais! Ele te ataca com um turbilhão de vento, causando dor.";
                }
                break;
            case 'infiltrar-base':
                if (Math.random() > 0.4) {
                    player.score += 70;
                    feedbackMessage = "Você se infiltra silenciosamente, encontrando um 'Mapa da Base'.";
                    addItemToInventory("Mapa da Base");
                } else {
                    updateEnergy(-25);
                    feedbackMessage = "Um sensor te detecta! Você se esconde, mas o alarme é ativado brevemente.";
                }
                break;
            case 'entrada-servico':
                if (hasItem("Chave Mestra Universal")) {
                    removeItemFromInventory("Chave Mestra Universal");
                    player.score += 90;
                    feedbackMessage = "Você usa a chave e entra sem ser detectado! Ganha acesso a uma área secreta.";
                    nextPhaseToJump = 6; // Pode pular ou ir para uma sub-fase
                } else {
                    feedbackMessage = "Você não tem a chave correta. Perde tempo e é forçado a procurar outra entrada.";
                    updateEnergy(-10);
                }
                break;
            case 'forcar-entrada':
                if (Math.random() > 0.7) { // 30% de dar MUITO errado
                    updateEnergy(-50);
                    feedbackMessage = "Você força a entrada, mas um sistema de defesa é ativado. Você mal escapa com vida!";
                } else {
                    feedbackMessage = "Você força a entrada com sucesso, mas fez barulho. Melhor ser rápido!";
                }
                break;
            case 'lab-investigar-arquivos':
                if (Math.random() > 0.3) {
                    player.score += 120;
                    feedbackMessage = "Você encontra arquivos de pesquisa sobre a entidade! Ganha 'Dados Críticos'.";
                    addItemToInventory("Dados Críticos");
                } else {
                    updateEnergy(-10);
                    feedbackMessage = "Os arquivos estão corrompidos. Você não encontra nada útil.";
                }
                break;
            case 'lab-coletar-amostras':
                if (Math.random() > 0.6 && hasItem("Luvas Anti-Radiação")) {
                    player.score += 80;
                    feedbackMessage = "Você coleta amostras estranhas. 'Amostras Anômalas' adicionadas ao inventário.";
                    addItemToInventory("Amostras Anômalas");
                } else {
                    updateEnergy(-20);
                    feedbackMessage = "Você tenta coletar, mas um dispositivo libera gás tóxico. Você recua.";
                }
                break;
            case 'curupira-hacker-enigma':
                if (player.score >= 300 && Math.random() > 0.3) { // Mais fácil se tiver score alto
                    player.score += 150;
                    feedbackMessage = "Você resolve o enigma! A Curupira Hacker concede acesso ao núcleo do sistema e te dá um 'Chip de Anomalia'.";
                    addItemToInventory("Chip de Anomalia");
                } else {
                    updateEnergy(-25);
                    feedbackMessage = "O enigma é muito complexo! A Curupira Hacker bloqueia o acesso, punindo sua falha.";
                }
                break;
            case 'curupira-hacker-bypass':
                if (hasItem("Módulo de Criptografia") && Math.random() > 0.6) {
                    player.score += 100;
                    feedbackMessage = "Você usa o módulo para um bypass rápido! A Curupira Hacker é enganada.";
                } else {
                    updateEnergy(-40);
                    feedbackMessage = "Seu bypass falha! O sistema entra em modo de segurança, causando dano.";
                }
                break;
            case 'curupira-hacker-ajuda':
                if (hasItem("Pena de Curupira")) {
                    removeItemFromInventory("Pena de Curupira");
                    player.score += 180;
                    feedbackMessage = "A pena ressoa com a Curupira Hacker! Ela o considera um aliado e abre caminho.";
                } else {
                    feedbackMessage = "Você não tem como pedir ajuda. A Curupira Hacker espera uma resposta de código.";
                    updateEnergy(-10);
                }
                break;
            case 'boto-resistir':
                if (player.energy > 50 && Math.random() > 0.4) {
                    player.score += 100;
                    feedbackMessage = "Você resiste bravamente à ilusão! O Boto se irrita e desaparece, deixando um 'Dado Digital'.";
                    addItemToInventory("Dado Digital");
                } else {
                    updateEnergy(-30);
                    feedbackMessage = "A ilusão é forte! Você se sente desorientado e perde energia tentando resistir.";
                }
                break;
            case 'boto-aceitar':
                feedbackMessage = "Você cede à ilusão. O Boto te mostra visões fascinantes, mas você se sente estranhamente drenado. Gasta um pouco de energia mas ganha 'Visão Distorcida'.";
                updateEnergy(-5);
                addItemToInventory("Visão Distorcida"); // Pode ser um item que altera opções futuras
                break;
            case 'boto-emp':
                if (hasItem("Dispositivo EMP Portátil")) { // Exemplo de item
                    removeItemFromInventory("Dispositivo EMP Portátil");
                    player.score += 150;
                    feedbackMessage = "Você ativa o EMP! A ilusão do Boto se desfaz em pixels e ele foge, atordoado.";
                } else {
                    updateEnergy(-15);
                    feedbackMessage = "Você não tem um dispositivo EMP. O Boto sorri e intensifica a ilusão.";
                }
                break;
            case 'cuca-confrontar':
                if (player.energy > 60 && hasItem("Pó Mágico")) { // Combinação de energia e item
                    removeItemFromInventory("Pó Mágico");
                    player.score += 120;
                    feedbackMessage = "Você lança o pó mágico enquanto ataca! A Cuca é desorientada e você consegue passar.";
                } else {
                    updateEnergy(-45);
                    feedbackMessage = "A Cuca é forte demais! Ela te aprisiona em uma armadilha de gelo, custando muita energia para escapar.";
                }
                break;
            case 'cuca-vulnerabilidades':
                if (hasItem("Dados Críticos") && Math.random() > 0.5) {
                    player.score += 140;
                    feedbackMessage = "Usando os dados, você encontra uma vulnerabilidade no campo de força da Cuca! Ela fica exposta.";
                } else {
                    updateEnergy(-20);
                    feedbackMessage = "Você não consegue encontrar nada. A Cuca te observa com um sorriso malicioso.";
                }
                break;
            case 'cuca-distracao':
                if (hasItem("Dispositivo Holográfico")) { // Exemplo de item
                    removeItemFromInventory("Dispositivo Holográfico");
                    player.score += 100;
                    feedbackMessage = "Você cria uma distração holográfica. A Cuca é enganada e você passa despercebido.";
                } else {
                    feedbackMessage = "Você não tem um dispositivo de distração. A Cuca fica em alerta máximo.";
                    updateEnergy(-10);
                }
                break;

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
            if (player.energy <= 0) return; // Se a energia chegou a zero, já chamou gameOver
            if (nextPhaseToJump !== null) {
                const nextIndex = phases.findIndex(p => p.id === nextPhaseToJump);
                if (nextIndex !== -1) {
                    player.currentPhaseIndex = nextIndex;
                    renderPhase(phases[player.currentPhaseIndex]);
                } else {
                    console.error("Próxima fase específica não encontrada:", nextPhaseToJump);
                    nextPhase();
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
        stopMatrixEffect();
        playMusic(null); // Para a música do boss

        gameScreen.innerHTML = ''; // Limpa a tela para o resultado final

        let finalMessage = "";
        let victory = false;

        if (actionType === 'confront') {
            if (player.energy > 70 && Math.random() > 0.4) { // Maior chance de vitória com energia alta
                player.score += 500;
                finalMessage = "<h2>VITÓRIA!</h2><p>Com sua coragem e força, você derrota a criatura! A fonte do sinal é neutralizada. O Alasca está seguro... por enquanto.</p>";
                victory = true;
            } else {
                finalMessage = "<h2>DERROTA!</h2><p>O monstro é muito poderoso. Suas forças não foram o suficiente. O Alasca caiu no caos.</p>";
                victory = false;
            }
        } else if (actionType === 'hack') {
            if (player.energy > 40 && hasItem("Chip de Anomalia") && Math.random() > 0.2) { // Chance de sucesso com energia razoável e item
                player.score += 700;
                finalMessage = "<h2>VITÓRIA CEREBRAL!</h2><p>Você usa o Chip de Anomalia e hackeia o ambiente, explorando uma fraqueza crítica do monstro e o desativando completamente! Sua inteligência salvou o dia.</p>";
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
        playMusic(null); // Para qualquer música
        localStorage.removeItem('rpgSave'); // Limpa o save ao perder

        gameTitle.textContent = "Fim da Jornada";
        phases[phases.length - 1].description = message; // Última fase é a de 'end'
        phases[phases.length - 1].title = "GAME OVER";
        phases[phases.length - 1].options = [{ text: "Tentar Novamente", action: () => restartGame() }];
        renderPhase(phases[phases.length - 1]); // Renderiza a tela de game over
    }

    // Calcula o ranking final baseado na pontuação
    function calculateRanking() {
        let rank = "D";
        if (player.score >= 1000) rank = "S";
        else if (player.score >= 700) rank = "A";
        else if (player.score >= 400) rank = "B";
        else if (player.score >= 100) rank = "C";
        return rank;
    }

    // Função de Fim de Jogo (Sucesso)
    function endGame() {
        stopTimer();
        stopMatrixEffect();
        playMusic(null); // Para qualquer música
        localStorage.removeItem('rpgSave'); // Limpa o save ao terminar com sucesso

        const finalRank = calculateRanking();
        gameTitle.textContent = "Jornada Concluída!";
        phases[phases.length - 1].description = `Você completou a jornada no Alasca com sucesso!\nSua pontuação final: ${player.score}\nSeu Ranking: ${finalRank}`;
        phases[phases.length - 1].title = "Parabéns, Agente!";
        phases[phases.length - 1].options = [{ text: "Jogar Novamente", action: () => restartGame() }];
        renderPhase(phases[phases.length - 1]); // Renderiza a tela de final de jogo
    }

    // Reinicia o jogo para o estado inicial
    window.restartGame = function() { // Tornada global para ser chamada pelo onclick no HTML
        player.energy = 100;
        player.score = 0;
        player.inventory = [];
        player.currentPhaseIndex = 0; // Volta para a introdução
        localStorage.removeItem('rpgSave'); // Remove o save antigo
        updateInventoryDisplay(); // Limpa o display do inventário
        initializeGame(); // Reinicia a inicialização do jogo
    };

    // Função para iniciar o jogo (novo jogo ou após load)
    function startGame() {
        player.currentPhaseIndex = 1; // Pula a intro, vai para a Fase 1
        renderPhase(phases[player.currentPhaseIndex]);
        playMusic(ambientSound); // Começa a tocar a música ambiente
    }

    // --- Inicialização do Jogo ---
    function initializeGame() {
        updateEnergy(0); // Atualiza a energia inicial (100%)
        renderPhase(phases[0]); // Renderiza a fase de introdução (Menu Inicial)
        // A música ambiente só começará a tocar após o clique em "Iniciar Nova Aventura"
        // ou ao carregar um jogo.
    }

    // Inicia o jogo quando o DOM estiver pronto (exibindo o menu inicial)
    initializeGame();
});
