document.addEventListener('DOMContentLoaded', () => {
    const gameTitle = document.getElementById('gameTitle');
    const gameScreen = document.getElementById('gameScreen');
    const energyBar = document.getElementById('energiaBar');
    const energyFill = document.getElementById('energiaFill');
    const energiaDisplay = document.getElementById('energiaDisplay');
    const timerDisplay = document.getElementById('timer');
    const playerInventoryDiv = document.getElementById('playerInventory');
    const inventoryList = document.getElementById('inventoryList');
    const statsDiv = document.querySelector('.stats');

    // Áudios
    const clickSound = document.getElementById('clickSound');
    const attackSound = document.getElementById('attackSound');
    const alertSound = document.getElementById('alertSound');
    const ambientSound = document.getElementById('ambientSound');
    const fase2Music = document.getElementById('fase2Music');
    const bossMusic = document.getElementById('bossMusic');
    const hackSuccessSound = document.getElementById('hackSuccessSound');
    const hackFailSound = document.getElementById('hackFailSound');
    const snowWalkSound = document.getElementById('snowWalkSound');
    const suspenseMusic = document.getElementById('suspenseMusic');

    let currentMusic = null;
    let audioContextResumed = false; // Flag para controlar o contexto de áudio

    // Canvas Matrix Effect
    const matrixCanvas = document.getElementById('matrixCanvas');
    const ctx = matrixCanvas.getContext('2d');
    let matrixEffectInterval;

    const transitionOverlay = document.getElementById('transitionOverlay');

    let currentEnergy = 100;
    let currentPhaseId = 0;
    let timerInterval;
    let playerInventory = []; // Armazena objetos { name: string, icon: string }
    let rankingScore = 0;
    let difficultyMultiplier = 1; // Não utilizado ainda, mas mantido para futuras implementações
    let playerReputation = 0; // -100 (Agente Secreto) a +100 (Hacktivista)

    let playerName = ''; // Novo: Nome do jogador
    let playerClass = ''; // Novo: Classe do jogador

    // Definição das classes e seus bônus
    const playerClasses = {
        'Hacker de Elite': {
            description: "Um mestre em invasões digitais e engenharia reversa. Começa com alta energia e um item chave.",
            initialEnergy: 120,
            initialItem: {name: "Chave Mestra Universal", icon: "images/icon_key.png"},
            initialReputation: 10
        },
        'Engenheiro Reverso': {
            description: "Especialista em desvendar sistemas complexos e otimizar recursos. Menor consumo de energia em certas ações.",
            initialEnergy: 100,
            initialItem: {name: "Detector de Ilusões Digitais", icon: "images/icon_detector.png"},
            initialReputation: 0
        },
        'Infiltrador Silencioso': {
            description: "Prioriza a furtividade e a manipulação de informações. Começa com um boost de reputação hacktivista.",
            initialEnergy: 80,
            initialItem: {name: "Rede de Captura Óptica", icon: "images/icon_net.png"},
            initialReputation: 20
        }
    };

    // --- Funções de Áudio ---
    function resumeAudioContext() {
        if (!audioContextResumed) {
            // Tenta desmutar todos os áudios e dar play para "ativar" o contexto
            [clickSound, attackSound, alertSound, ambientSound, fase2Music, bossMusic, hackSuccessSound, hackFailSound, snowWalkSound, suspenseMusic].forEach(audio => {
                if (audio) {
                    audio.muted = false;
                    audio.play().catch(e => console.log("Áudio inicial play com erro, mas desmutado:", e));
                }
            });
            audioContextResumed = true;
            console.log("Contexto de áudio resumido.");
            // Garante que a música ambiente comece se for a fase 1
            if (currentPhaseId === 1 && phases[1].music && currentMusic !== phases[1].music) {
                playMusic(phases[1].music);
            }
        }
    }

    function playSound(audioElement) {
        if (audioElement && audioContextResumed) {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.error("Erro ao tocar som:", e));
        }
    }

    function playMusic(musicElement) {
        if (!audioContextResumed) {
            console.log("Contexto de áudio não resumido. Música não será tocada.");
            return;
        }

        if (currentMusic && currentMusic !== musicElement) {
            currentMusic.pause();
            currentMusic.currentTime = 0;
        }
        if (musicElement) {
            musicElement.volume = 0.5;
            musicElement.play().catch(e => console.error("Erro ao tocar música:", e));
            currentMusic = musicElement;
        } else {
            if (currentMusic) {
                currentMusic.pause();
                currentMusic.currentTime = 0;
            }
            currentMusic = null;
        }
    }

    // --- Funções de Jogo ---

    function updateEnergy(amount) {
        currentEnergy += amount;
        if (currentEnergy > 100) currentEnergy = 100;
        if (currentEnergy <= 0) {
            currentEnergy = 0;
            gameOver("Sua energia se esgotou! Fim da jornada.");
            return;
        }
        energyFill.style.width = `${currentEnergy}%`;
        energiaDisplay.textContent = currentEnergy;

        // Efeitos visuais para a energia
        if (currentEnergy > 60) {
            energyFill.style.backgroundColor = '#00ff00';
            energiaDisplay.classList.remove('low-energy', 'critical-energy');
        } else if (currentEnergy > 30) {
            energyFill.style.backgroundColor = '#ffff00';
            energiaDisplay.classList.add('low-energy');
            energiaDisplay.classList.remove('critical-energy');
        } else {
            energyFill.style.backgroundColor = '#ff0000';
            energiaDisplay.classList.add('critical-energy');
            energiaDisplay.classList.remove('low-energy');
        }
    }

    function startTimer(duration, onTimeout) {
        let timeLeft = duration;
        timerDisplay.textContent = `Tempo: ${timeLeft}s`;
        timerDisplay.classList.remove('timer-warning', 'timer-critical');

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Tempo: ${timeLeft}s`;

            if (timeLeft <= 10 && timeLeft > 5) {
                timerDisplay.classList.add('timer-warning');
                timerDisplay.classList.remove('timer-critical');
            } else if (timeLeft <= 5) {
                timerDisplay.classList.add('timer-critical');
                timerDisplay.classList.remove('timer-warning');
            } else {
                timerDisplay.classList.remove('timer-warning', 'timer-critical');
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                onTimeout();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerDisplay.textContent = '';
        timerDisplay.classList.remove('timer-warning', 'timer-critical');
    }

    function addItemToInventory(item) {
        if (!playerInventory.some(i => i.name === item.name)) {
             playerInventory.push(item);
             updateInventoryDisplay();
             saveProgress();
        }
    }

    function hasItem(itemName) {
        return playerInventory.some(item => item.name === itemName);
    }

    function updateInventoryDisplay() {
        if (playerInventory.length > 0) {
            playerInventoryDiv.classList.remove('hidden');
            inventoryList.innerHTML = '';
            playerInventory.forEach(item => {
                const li = document.createElement('li');
                const itemIcon = document.createElement('img');
                itemIcon.src = item.icon;
                itemIcon.alt = item.name;

                li.appendChild(itemIcon);
                li.appendChild(document.createTextNode(item.name));
                inventoryList.appendChild(li);
            });
        } else {
            playerInventoryDiv.classList.add('hidden');
        }
    }

    function setBackground(className) {
        document.body.className = className;
    }

    function setFont(className) {
        gameScreen.style.fontFamily = '';
        gameTitle.style.fontFamily = '';
        if (className) {
            gameScreen.style.fontFamily = `"${className}", sans-serif`;
            gameTitle.style.fontFamily = `"${className}", cursive`;
        }
    }

    function typeWriterEffect(element, text, speed = 30) {
        let i = 0;
        element.textContent = '';
        element.style.animation = 'typing-cursor .75s step-end infinite';
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                element.style.animation = '';
            }
        }, speed);
    }

    // --- Efeito Matrix ---
    function startMatrixEffect() {
        matrixCanvas.style.display = 'block';
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const columns = Math.floor(matrixCanvas.width / 20);
        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            ctx.fillStyle = '#00ff99';
            ctx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = String.fromCharCode(0x30A0 + Math.random() * 96);
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        matrixEffectInterval = setInterval(drawMatrix, 33);
    }

    function stopMatrixEffect() {
        clearInterval(matrixEffectInterval);
        matrixCanvas.style.display = 'none';
        ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }

    // --- Gerenciamento de Fases ---
    function performTransition(callback) {
        if (!gameScreen) {
            console.error("performTransition: gameScreen não encontrado. Pulando animação.");
            callback();
            return;
        }

        // Aumenta a duração da transição (2000ms = 2 segundos)
        const transitionDuration = 2000; // Original: 800

        gameScreen.style.animation = 'fade-out-content 0.75s forwards'; // Original: 0.5s
        gameScreen.style.pointerEvents = 'none';

        transitionOverlay.style.opacity = 1;
        transitionOverlay.classList.add('glitch-active');
        transitionOverlay.textContent = 'Realidade se distorcendo...';

        setTimeout(() => {
            callback();

            transitionOverlay.classList.remove('glitch-active');
            transitionOverlay.style.opacity = 0;
            transitionOverlay.textContent = '';

            gameScreen.style.animation = 'fade-in-content 0.75s forwards'; // Original: 0.5s
            gameScreen.style.pointerEvents = 'auto';
        }, transitionDuration / 2); // Metade da duração para o callback

        setTimeout(() => {
            gameScreen.style.animation = ''; // Limpa a animação CSS
        }, transitionDuration);
    }

    function renderPhase(phase, useTransition = true) {
        const renderPhaseContent = () => {
            stopTimer();
            stopMatrixEffect();

            if (phase.music && currentMusic !== phase.music) {
                playMusic(phase.music);
            } else if (!phase.music && currentMusic) {
                playMusic(null); // Para a música se a nova fase não tiver uma
            }

            gameTitle.textContent = phase.title;
            const descriptionParagraph = document.createElement('p');
            gameScreen.innerHTML = '';
            gameScreen.appendChild(descriptionParagraph);
            typeWriterEffect(descriptionParagraph, phase.description);


            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options');
            phase.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option.text;
                button.onclick = () => {
                    playSound(clickSound);
                    option.action();
                };
                optionsDiv.appendChild(button);
            });
            
            // Adiciona opções DEPOIS que o texto da descrição terminou de digitar
            setTimeout(() => {
                 gameScreen.appendChild(optionsDiv);
            }, phase.description.length * 30 + 500); // 30ms por char + 500ms de buffer

            setBackground(phase.backgroundClass);
            setFont(phase.fontClass);

            if (phase.matrixEffect) {
                startMatrixEffect();
            }

            // Exibir/Ocultar stats e inventário dependendo da fase (agora estão no HTML)
            if (phase.showStats) {
                statsDiv.classList.remove('hidden');
            } else {
                statsDiv.classList.add('hidden');
            }
            if (phase.showInventory) {
                playerInventoryDiv.classList.remove('hidden');
            } else {
                playerInventoryDiv.classList.add('hidden');
            }

            if (phase.timerDuration > 0) {
                startTimer(phase.timerDuration, () => {
                    gameOver("Você não conseguiu tomar uma decisão a tempo!");
                });
            }
            updateEnergy(0); // Apenas atualiza a exibição
            updateInventoryDisplay();
        };

        if (useTransition) {
            performTransition(renderPhaseContent);
        } else {
            renderPhaseContent();
        }
    }

    // --- Handlers de Escolha ---

    // Este handler agora é mais genérico, com a adição de reputação e itens.
    function handleChoice(nextPhaseId, energyChange, scoreChange, message, reputationChange = 0, itemToAdd = null) {
        currentPhaseId = nextPhaseId;
        updateEnergy(energyChange);
        rankingScore += scoreChange;
        playerReputation += reputationChange;
        playerReputation = Math.max(-100, Math.min(100, playerReputation)); // Garante limites

        if (itemToAdd) {
            addItemToInventory(itemToAdd);
        }

        const feedbackDiv = document.createElement('p');
        feedbackDiv.classList.add('feedback-message');
        feedbackDiv.textContent = message;
        gameScreen.appendChild(feedbackDiv);

        setTimeout(() => {
            feedbackDiv.remove();
            if (phases[currentPhaseId]) {
                renderPhase(phases[currentPhaseId]);
            } else {
                checkGameEnd();
            }
            saveProgress(); // Salva após cada escolha
        }, 3000);
    }

    function handleComplexChoice(nextPhaseId, actionType, energyCost, scoreChange, itemRequired, successMessage, failMessage, successEnergyChange, failEnergyChange, reputationChangeSuccess = 0, reputationChangeFail = 0, itemToAddOnSuccess = null) {
        let success = true;
        let message = successMessage;
        let energyMod = successEnergyChange;
        let currentReputationChange = reputationChangeSuccess;

        if (energyCost > 0 && currentEnergy < energyCost) {
            success = false;
            message = "Energia insuficiente para esta ação!";
            energyMod = 0;
            currentReputationChange = 0;
        } else if (itemRequired && !hasItem(itemRequired.name || itemRequired)) { // Adapta para objeto ou string
            success = false;
            message = `Você precisa de ${itemRequired.name || itemRequired} para fazer isso!`;
            energyMod = 0;
            currentReputationChange = 0;
        } else {
            updateEnergy(-energyCost); // Custo inicial da tentativa
            switch (actionType) {
                case 'hack-cabana':
                    if (Math.random() < 0.7) {
                        message = successMessage;
                        energyMod = successEnergyChange;
                        playSound(hackSuccessSound);
                        currentReputationChange = reputationChangeSuccess;
                    } else {
                        success = false;
                        message = failMessage;
                        energyMod = failEnergyChange;
                        playSound(hackFailSound);
                        currentReputationChange = reputationChangeFail;
                    }
                    break;
                case 'entrada-servico':
                    // Já verificou o item acima
                    message = successMessage;
                    energyMod = successEnergyChange;
                    playSound(snowWalkSound);
                    currentReputationChange = reputationChangeSuccess;
                    break;
                case 'decifrar-sussurro':
                    if (Math.random() < 0.6) {
                        message = successMessage;
                        energyMod = successEnergyChange;
                        currentReputationChange = reputationChangeSuccess;
                    } else {
                        success = false;
                        message = failMessage;
                        energyMod = failEnergyChange;
                        currentReputationChange = reputationChangeFail;
                    }
                    break;
                case 'capturar-saci':
                    if (Math.random() < 0.8) {
                        message = successMessage;
                        energyMod = successEnergyChange;
                        playSound(hackSuccessSound);
                        currentReputationChange = reputationChangeSuccess;
                        if (itemToAddOnSuccess) addItemToInventory(itemToAddOnSuccess); // Adiciona item
                    } else {
                        success = false;
                        message = failMessage;
                        energyMod = failEnergyChange;
                        playSound(hackFailSound);
                        currentReputationChange = reputationChangeFail;
                    }
                    break;
                case 'conectar-modulo':
                    message = successMessage;
                    energyMod = successEnergyChange;
                    currentReputationChange = reputationChangeSuccess;
                    if (itemToAddOnSuccess) addItemToInventory(itemToAddOnSuccess);
                    break;
                case 'resolver-enigma':
                    if (Math.random() < 0.75) {
                        message = successMessage;
                        energyMod = successEnergyChange;
                        currentReputationChange = reputationChangeSuccess;
                    } else {
                        success = false;
                        message = failMessage;
                        energyMod = failEnergyChange;
                        currentReputationChange = reputationChangeFail;
                    }
                    break;
                case 'usar-detector':
                    message = successMessage;
                    energyMod = successEnergyChange;
                    currentReputationChange = reputationChangeSuccess;
                    break;
                case 'stealth-hack':
                    if (Math.random() < 0.6) {
                        message = successMessage;
                        energyMod = successEnergyChange;
                        currentReputationChange = reputationChangeSuccess;
                    } else {
                        success = false;
                        message = failMessage;
                        energyMod = failEnergyChange;
                        currentReputationChange = reputationChangeFail;
                    }
                    break;
                case 'final-virus':
                    if (Math.random() < 0.9 && hasItem("Vírus Definitivo")) { // Assume sucesso alto se tiver o item
                        message = successMessage;
                        energyMod = successEnergyChange;
                        currentReputationChange = reputationChangeSuccess;
                    } else {
                        success = false;
                        message = failMessage;
                        energyMod = failEnergyChange;
                        currentReputationChange = reputationChangeFail;
                    }
                    break;
            }
        }

        updateEnergy(energyMod);
        playerReputation += currentReputationChange;
        playerReputation = Math.max(-100, Math.min(100, playerReputation));

        if (success) {
            rankingScore += scoreChange;
        }

        const feedbackDiv = document.createElement('p');
        feedbackDiv.classList.add('feedback-message');
        feedbackDiv.textContent = message;
        gameScreen.appendChild(feedbackDiv);

        setTimeout(() => {
            feedbackDiv.remove();
            if (success && phases[nextPhaseId]) {
                currentPhaseId = nextPhaseId;
                renderPhase(phases[currentPhaseId]);
            } else if (!success) {
                if (energyMod < 0 && currentEnergy <= 0) {
                     // Game Over já tratado
                } else if (phases[currentPhaseId]) {
                    renderPhase(phases[currentPhaseId]); // Permanece na fase atual em caso de falha suave
                } else {
                    checkGameEnd();
                }
            } else {
                checkGameEnd();
            }
            saveProgress();
        }, 4000);
    }

    // --- Handlers da Tela de Registro de Personagem ---
    function handleCharacterCreation() {
        const nameInput = document.getElementById('playerNameInput');
        const classSelect = document.getElementById('playerClassSelect');

        playerName = nameInput.value.trim();
        playerClass = classSelect.value;

        if (!playerName || !playerClass) {
            alert('Por favor, insira seu nickname e escolha uma classe!');
            return;
        }

        // Aplica os bônus da classe
        const chosenClass = playerClasses[playerClass];
        currentEnergy = chosenClass.initialEnergy;
        playerReputation = chosenClass.initialReputation;
        if (chosenClass.initialItem) {
            addItemToInventory(chosenClass.initialItem);
        }

        resumeAudioContext(); // Resume o contexto de áudio na primeira interação
        handleChoice(2, 0, 0, `Bem-vindo(a), ${playerName} (${playerClass})! Sua jornada começa agora.`, 0); // Inicia o jogo na fase 2 (antiga fase 1)
    }

    // --- Fases do Jogo ---
    const phases = [
        // NOVA Fase 0: Registro de Personagem
        {
            id: 0,
            title: "Criação de Personagem",
            description: "Insira seu Nickname e escolha sua especialidade hacker para iniciar sua jornada no Alasca.",
            options: [], // As opções serão geradas dinamicamente
            backgroundClass: "bg-fase-0",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 0,
            music: null,
            showStats: false, // Ocultar stats e inventário nesta fase
            showInventory: false
        },
        // Antiga Fase 0 (Menu Inicial) AGORA Fase 1
        {
            id: 1,
            title: "🌌 RPG Folclore Hacker - Jornada no Alasca 🌌",
            description: "Bem-vindo(a) à sua jornada gelada. Desvende os mistérios do folclore em meio ao código e à neve. Você está pronto para começar?",
            options: [
                { text: "Iniciar Nova Aventura", action: () => handleMainMenuChoice('new') }, // Redireciona para a nova fase 0
                { text: "Continuar Última Aventura", action: () => handleMainMenuChoice('continue') },
                { text: "Ver Ranking Global", action: () => handleMainMenuChoice('ranking') } // Nova opção para o Ranking
            ],
            backgroundClass: "bg-fase-0",
            fontClass: "font-pixel",
            matrixEffect: false,
            timerDuration: 0,
            music: null,
            showStats: false,
            showInventory: false
        },
        // Antiga Fase 1 AGORA Fase 2
        {
            id: 2,
            title: "A Chegada Gélida",
            description: "Você aterrissa em uma remota pista de pouso no Alasca. O vento uiva, e a neve chicoteia seu rosto. Um bilhete em seu bolso diz: 'Procure a cabana mais antiga. O segredo está na rede.'",
            options: [
                { text: "Seguir a trilha principal", action: () => handleChoice(3, -5, 10, "Você decide seguir a trilha marcada, economizando energia.") },
                { text: "Ativar scanner térmico", action: () => handleChoice(3, -15, 5, "Seu scanner revela uma anomalia térmica fora da trilha. Isso custa energia, mas pode ser mais rápido.") }
            ],
            backgroundClass: "bg-fase-1",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 60,
            music: ambientSound,
            showStats: true,
            showInventory: true
        },
        // Restante das fases (3 a 12) já ajustadas para os novos IDs
        // Fase 3: Floresta Sombria e Gélida (antiga 2)
        {
            id: 3,
            title: "Floresta Sombria e Gélida",
            description: "A trilha se adentra em uma floresta densa e escura. As árvores cobertas de neve parecem figuras fantasmagóricas. Você ouve um sussurro distante, quase como um código binário se misturando ao vento.",
            options: [
                { text: "Ignorar e seguir em frente", action: () => handleChoice(4, -10, 15, "Você persiste, mas a sensação de ser observado aumenta.") },
                { text: "Tentar decifrar o sussurro", action: () => handleComplexChoice(4, 'decifrar-sussurro', 10, 25, null, "Você capta uma sequência: '01001000 01100001 01100011 01101011'. É uma pista!", "Você tenta decifrar, mas a interferência é muito forte e gasta energia.", -10, 0, -5, 5, -5) }
            ],
            backgroundClass: "bg-fase-2",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 90,
            music: fase2Music,
            showStats: true,
            showInventory: true
        },
        // Fase 4: A Cabana Antiga (com hack) - antiga 3
        {
            id: 4,
            title: "A Cabana Antiga",
            description: "Você encontra uma cabana isolada, coberta por neve. Há um brilho fraco vindo de uma janela. Parece abandonada, mas a porta tem um teclado de segurança antigo. Você tenta uma abordagem hacker.",
            options: [
                { text: "Forçar a entrada (gasta energia)", action: () => handleChoice(5, -20, 5, "Você tenta arrombar, mas o frio torna seus movimentos lentos. A porta não cede.", -10) },
                { text: "Tentar hackear o teclado", action: () => handleComplexChoice(5, 'hack-cabana', 25, 50, null, "Acesso concedido! O teclado pisca em verde e a porta range. Você é bom nisso!", "Falha no hack. O sistema se tranca, e um alarme silencioso é ativado. Isso chamará atenção!", -10, -20, 15, -15) }
            ],
            backgroundClass: "bg-fase-3",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 120,
            music: suspenseMusic,
            showStats: true,
            showInventory: true
        },
        // Fase 5: O Encontro com o "Homem da Neve" (Saci) - antiga 4
        {
            id: 5,
            title: "O Vulto na Neve",
            description: "Dentro da cabana, há equipamentos antigos e um cheiro forte de fumaça. De repente, um vulto pequeno e ágil com um gorro vermelho passa voando. É o 'Homem da Neve', uma lenda local que rouba bits de dados!",
            options: [
                { text: "Tentar capturar o vulto", action: () => handleComplexChoice(6, 'capturar-saci', 30, 75, {name: "Rede de Captura Óptica", icon: "images/icon_net.png"}, "Você lança sua rede óptica e captura o Vulto! Ele deixa cair um 'Módulo de Dados Encriptado'.", "O vulto é muito rápido e desaparece na neve, zombando de você. (-15 energia)", -10, -15, 20, -5, {name: "Módulo de Dados Encriptado", icon: "images/icon_data.png"}) },
                { text: "Instalar um rastreador de IP", action: () => handleChoice(6, -15, 20, "Você instala um rastreador. Pode não pegar o vulto, mas talvez revele seu destino.", -5) }
            ],
            backgroundClass: "bg-fase-4",
            fontClass: "font-pixel",
            matrixEffect: true,
            timerDuration: 90,
            music: ambientSound,
            showStats: true,
            showInventory: true
        },
        // Fase 6: Base Militar Abandonada - antiga 5
        {
            id: 6,
            title: "Base Militar Abandonada",
            description: "Seu rastreador de IP (ou a trilha do Vulto) te leva a uma antiga base militar soviética, semi-enterrada na neve. Há uma porta de serviço com um selo de segurança que parece impossível de hackear sem uma chave física.",
            options: [
                { text: "Procurar por uma entrada alternativa", action: () => handleChoice(7, -20, 30, "Você encontra um duto de ventilação, mas está parcialmente bloqueado. (-20 energia)", 5) },
                { text: "Tentar entrada de serviço com Chave Mestra", action: () => handleComplexChoice(7, 'entrada-servico', 10, 100, {name: "Chave Mestra Universal", icon: "images/icon_key.png"}, "A Chave Mestra Universal se encaixa perfeitamente! A porta se abre com um assobio metálico. (Item usado)", "A porta está trancada, você precisa de uma Chave Mestra Universal para abrir. (-5 energia)", 0, -5, 10, -10) }
            ],
            backgroundClass: "bg-fase-5",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 100,
            music: ambientSound,
            showStats: true,
            showInventory: true
        },
        // Fase 7: Laboratório Subterrâneo - antiga 6
        {
            id: 7,
            title: "Laboratório Subterrâneo",
            description: "Os corredores escuros da base levam a um laboratório bizarro. Telas piscam com diagramas de circuitos e símbolos antigos. No centro, um dispositivo estranho pulsa com energia mística e digital. O 'Módulo de Dados Encriptado' que você pegou do Vulto começa a vibrar.",
            options: [
                { text: "Conectar o Módulo de Dados ao dispositivo", action: () => handleComplexChoice(8, 'conectar-modulo', 15, 150, {name: "Módulo de Dados Encriptado", icon: "images/icon_data.png"}, "O dispositivo absorve o módulo, revelando projeções de seres folclóricos controlando redes. Você entende tudo! (Item usado) Um 'Vírus Definitivo' é baixado.", "O dispositivo rejeita o módulo, causando um curto-circuito e liberando uma descarga elétrica. (-30 energia)", -10, -30, 20, -10, {name: "Vírus Definitivo", icon: "images/icon_virus.png"}) },
                { text: "Analisar o dispositivo com seu óculos de Raio-X", action: () => handleChoice(8, -10, 50, "A análise revela que o dispositivo está sincronizando as lendas com a rede global. Isso é maior do que você pensava!", 5) }
            ],
            backgroundClass: "bg-fase-6",
            fontClass: "font-pixel",
            matrixEffect: true,
            timerDuration: 120,
            music: ambientSound,
            showStats: true,
            showInventory: true
        },
        // Fase 8: O Enigma da Curupira Hacker - antiga 7
        {
            id: 8,
            title: "O Enigma da Curupira Hacker",
            description: "De repente, as telas do laboratório mudam. Uma imagem distorcida de uma criatura com pés virados para trás aparece. É a Curupira, mas seus olhos brilham com código binário. Ela te desafia com um enigma para acessar a próxima rede.",
            options: [
                { text: "Tentar resolver o enigma (lógica)", action: () => handleComplexChoice(9, 'resolver-enigma', 20, 100, null, "Você decifra a charada! A Curupira sorri digitalmente e abre um portal de dados. (+50 energia)", "Você falha. A Curupira te redireciona para um loop infinito de anúncios pop-up! (-25 energia)", 50, -25, 25, -20) },
                { text: "Atacar o sistema da Curupira", action: () => handleChoice(9, -40, 0, "Seu ataque é ineficaz. A Curupira se dissipa em pixels, e você perde tempo e energia.", -10) }
            ],
            backgroundClass: "bg-fase-7",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 100,
            music: ambientSound,
            showStats: true,
            showInventory: true
        },
        // Fase 9: A Realidade Distorcida (Boto) - antiga 8
        {
            id: 9,
            title: "A Realidade Distorcida",
            description: "O portal da Curupira te leva a uma dimensão onde a realidade se distorce. Você está em um rio congelado, mas vê um vulto de um homem elegante com um chapéu, que se transforma em um golfinho cor-de-rosa digitalizado. É o Boto Hacker, mestre das ilusões e da camuflagem na rede.",
            options: [
                { text: "Aceitar a ilusão e buscar uma saída", action: () => handleChoice(10, -10, 30, "Você tenta entender a lógica da ilusão, buscando uma falha na sua programação.", 10) },
                { text: "Usar 'Detector de Ilusões Digitais'", action: () => handleComplexChoice(10, 'usar-detector', 20, 120, {name: "Detector de Ilusões Digitais", icon: "images/icon_detector.png"}, "O detector revela uma porta oculta na paisagem distorcida. A ilusão se desfaz. (Item usado)", "O detector falha em meio a tanta distorção, deixando você desorientado. (-20 energia)", 0, -20, -5, 0) }
            ],
            backgroundClass: "bg-fase-8",
            fontClass: "font-pixel",
            matrixEffect: true,
            timerDuration: 90,
            music: ambientSound,
            showStats: true,
            showInventory: true
        },
        // Fase 10: A Fortaleza do Gelo (Cuca) - antiga 9
        {
            id: 10,
            title: "A Fortaleza do Gelo",
            description: "Você chega a uma imponente fortaleza feita de gelo e circuitaria, flutuando em um abismo digital. Luzes estroboscópicas brilham em sincronia com batidas pesadas. Esta é a base da Cuca Hacker, a arquiteta de toda a rede folclórica.",
            options: [
                { text: "Entrar furtivamente (stealth hack)", action: () => handleComplexChoice(11, 'stealth-hack', 30, 150, null, "Você desativa as sentinelas digitais e entra sem ser detectado. (+70 energia)", "Você aciona um alarme sonoro! Sentinelas são ativadas. (-40 energia)", 70, -40, 20, -10) },
                { text: "Atacar diretamente o firewall", action: () => handleChoice(11, -50, 50, "Você lança um ataque DDoS massivo, mas o firewall da Cuca é robusto e revida com força total.", -15) }
            ],
            backgroundClass: "bg-fase-9",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 120,
            music: bossMusic,
            showStats: true,
            showInventory: true
        },
        // Fase 11: O Chefão Final (Cuca) - antiga 10
        {
            id: 11,
            title: "Cuca: O Núcleo do Folclore Digital",
            description: "No coração da fortaleza, a Cuca surge. Não como uma bruxa, mas como uma inteligência artificial colossal, tecendo o folclore na rede global. Ela é a fusão de todas as lendas, protegendo o 'Núcleo Folclórico'. Prepare-se para a batalha final de código e vontade.",
            options: [
                { text: "Lançar vírus definitivo", action: () => handleComplexChoice(12, 'final-virus', 50, 200, {name: "Vírus Definitivo", icon: "images/icon_virus.png"}, "Seu vírus corrompe o Núcleo Folclórico! A Cuca se desfaz em uma cascata de bits de luz. Vitória!", "O vírus é neutralizado! A Cuca te sobrecarrega com um ataque de negação de serviço. (-50 energia, Game Over)", 0, -50, 10, -30) },
                { text: "Tentar negociar (persuasão)", action: () => handleChoice(12, -30, 100, "Você tenta persuadir a Cuca a liberar o folclore. Ela hesita, mas sua programação a impede. Ela ataca!", 20) }
            ],
            backgroundClass: "bg-fase-final",
            fontClass: "font-pixel",
            matrixEffect: true,
            timerDuration: 150,
            music: bossMusic,
            showStats: true,
            showInventory: true
        },
        // Fase 12 (Será a nova fase final de vitória ou Game Over)
        // A lógica de múltiplos finais será expandida aqui em etapas futuras.
        {
            id: 12,
            title: "Fim da Jornada",
            description: "A aventura chegou ao seu clímax. O que acontecerá agora?",
            options: [
                // Será preenchido pela função checkGameEnd
            ],
            backgroundClass: "bg-fase-final",
            fontClass: "font-pixel",
            matrixEffect: false,
            timerDuration: 0,
            music: null,
            showStats: false,
            showInventory: false
        }
    ];

    // --- Telas de Fim de Jogo ---
    function gameOver(message) {
        stopTimer();
        stopMatrixEffect();
        playMusic(null);
        playSound(alertSound);

        gameScreen.innerHTML = `<h2>GAME OVER!</h2><p>${message}</p><p>Sua jornada termina aqui, Hacker ${playerName}.</p><button id="restartButton">Reiniciar Jogo</button>`;
        setBackground("bg-game-over");
        gameTitle.textContent = "Fim da Linha";
        statsDiv.classList.add('hidden');
        playerInventoryDiv.classList.add('hidden');

        document.getElementById('restartButton').onclick = restartGame;
    }

    function showVictoryScreen() {
        stopTimer();
        stopMatrixEffect();
        playMusic(null);

        const finalRank = calculateRanking();

        gameScreen.innerHTML = `<h2>VITÓRIA!</h2>
                               <p>Parabéns, ${playerName}! Você desvendou os mistérios do Alasca e salvou o Folclore Digital!</p>
                               <p>Sua pontuação final: <span class="score">${rankingScore}</span></p>
                               <p>Seu Ranking: <span class="score">${finalRank}</span></p>
                               <button id="restartButton">Jogar Novamente</button>`;
        setBackground("bg-victory");
        gameTitle.textContent = "Jornada Concluída!";
        statsDiv.classList.add('hidden');
        playerInventoryDiv.classList.add('hidden');

        document.getElementById('restartButton').onclick = restartGame;
    }

    // A função checkGameEnd será expandida para múltiplos finais no próximo passo
    function checkGameEnd() {
        if (currentPhaseId >= phases.length - 1) { // -1 porque a última fase é a 12, que é o "fim"
            showVictoryScreen(); // Por enquanto, sempre vitória ao chegar ao fim
        } else if (currentEnergy <= 0) {
            gameOver("Sua energia se esgotou completamente!");
        }
        // Futuramente, aqui será a lógica para múltiplos finais baseados em reputação, itens, etc.
    }


    function calculateRanking() {
        let rankBonus = 0;
        if (playerReputation > 50) rankBonus = 100;
        else if (playerReputation < -50) rankBonus = -50;

        const finalScore = rankingScore + rankBonus;

        if (finalScore >= 1000) return "S+ (Lenda Hacker)";
        if (finalScore >= 800) return "S (Mestre Digital)";
        if (finalScore >= 600) return "A (Cientista de Dados)";
        if (finalScore >= 400) return "B (Codificador Experiente)";
        if (finalScore >= 200) return "C (Novato Curioso)";
        return "D (Aprendiz Hacker)";
    }

    // --- Nova Função para Mostrar Tela de Ranking ---
    function showRankingScreen() {
        stopTimer();
        stopMatrixEffect();
        playMusic(null); // Sem música específica para o ranking por enquanto

        gameTitle.textContent = "Ranking Global dos Hackers";
        setBackground("bg-ranking"); // Nova classe de fundo para o ranking

        // Placeholder para o ranking, será preenchido de verdade na próxima etapa
        gameScreen.innerHTML = `
            <h2>Melhores Hackers</h2>
            <p>Este ranking será preenchido em breve!</p>
            <ul id="highScoresList">
                <li>1. Top Hacker - 1500pts</li>
                <li>2. Cyber Mestre - 1200pts</li>
                <li>3. Anon Codificador - 900pts</li>
            </ul>
            <button id="backToMenuButton">Voltar ao Menu Principal</button>
        `;
        document.getElementById('backToMenuButton').onclick = initializeGame; // Volta para o menu principal

        statsDiv.classList.add('hidden');
        playerInventoryDiv.classList.add('hidden');
    }

    function restartGame() {
        currentEnergy = 100;
        currentPhaseId = 0; // Volta para a tela de criação de personagem
        playerInventory = [];
        rankingScore = 0;
        difficultyMultiplier = 1;
        playerReputation = 0;
        playerName = '';
        playerClass = '';

        stopTimer();
        stopMatrixEffect();
        playMusic(null);

        document.body.className = '';

        initializeGame(); // Reinicia o fluxo do jogo desde a criação de personagem
    }

    // --- Funções de Salvar/Carregar Progresso (LocalStorage) ---
    function saveProgress() {
        const gameState = {
            currentEnergy,
            currentPhaseId,
            playerInventory,
            rankingScore,
            playerReputation,
            playerName, // Salva o nome
            playerClass // Salva a classe
        };
        localStorage.setItem('rpgFolcloreHackerState', JSON.stringify(gameState));
        console.log("Progresso salvo!");
    }

    function loadProgress() {
        const savedState = localStorage.getItem('rpgFolcloreHackerState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            currentEnergy = gameState.currentEnergy;
            currentPhaseId = gameState.currentPhaseId;
            playerInventory = gameState.playerInventory || [];
            rankingScore = gameState.rankingScore;
            playerReputation = gameState.playerReputation || 0;
            playerName = gameState.playerName || ''; // Carrega o nome
            playerClass = gameState.playerClass || ''; // Carrega a classe

            updateEnergy(0);
            updateInventoryDisplay();
            // Inicia o jogo na fase carregada (com transição)
            renderPhase(phases[currentPhaseId]);
            resumeAudioContext(); // Garante que o áudio seja resumido
            console.log("Progresso carregado!");
            return true;
        }
        console.log("Nenhum progresso salvo encontrado.");
        alert("Nenhum progresso salvo encontrado. Iniciando nova aventura!");
        initializeGame(); // Inicia uma nova aventura se não houver save
        return false;
    }

    // --- Inicialização do Jogo ---
    function initializeGame() {
        // Redireciona para a Fase 1 (o novo menu principal)
        renderPhase(phases[1], false); // Menu principal não tem transição inicial
    }

    // Função para renderizar a tela de criação de personagem (nova Fase 0)
    function renderCharacterCreationScreen() {
        stopTimer();
        stopMatrixEffect();
        playMusic(null); // Garante que nenhuma música toque aqui

        gameTitle.textContent = phases[0].title;
        setBackground(phases[0].backgroundClass);
        setFont(phases[0].fontClass);
        if (phases[0].matrixEffect) startMatrixEffect();

        const descriptionParagraph = document.createElement('p');
        gameScreen.innerHTML = '';
        gameScreen.appendChild(descriptionParagraph);
        typeWriterEffect(descriptionParagraph, phases[0].description);

        // Cria os elementos de input e select
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('options');
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Nickname:';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'playerNameInput';
        nameInput.placeholder = 'Digite seu nome de Hacker';
        nameInput.maxLength = 15; // Limite de caracteres para nickname
        optionsDiv.appendChild(nameLabel);
        optionsDiv.appendChild(nameInput);

        const classLabel = document.createElement('label');
        classLabel.textContent = 'Classe:';
        const classSelect = document.createElement('select');
        classSelect.id = 'playerClassSelect';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Escolha sua classe...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        classSelect.appendChild(defaultOption);

        for (const className in playerClasses) {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = `${className} - ${playerClasses[className].description}`;
            classSelect.appendChild(option);
        }
        optionsDiv.appendChild(classLabel);
        optionsDiv.appendChild(classSelect);

        const startButton = document.createElement('button');
        startButton.textContent = 'Começar Aventura!';
        startButton.onclick = handleCharacterCreation;
        optionsDiv.appendChild(startButton);

        setTimeout(() => {
            gameScreen.appendChild(optionsDiv);
        }, phases[0].description.length * 30 + 500);

        statsDiv.classList.add('hidden');
        playerInventoryDiv.classList.add('hidden');
    }

    // Adapta o handler da Fase 1 para iniciar a criação de personagem ou carregar
    function handleMainMenuChoice(choiceType) {
        if (choiceType === 'new') {
            renderCharacterCreationScreen(); // Vai para a nova tela de criação
        } else if (choiceType === 'continue') {
            loadProgress(); // Tenta carregar
        } else if (choiceType === 'ranking') {
            showRankingScreen(); // Mostra o ranking
        }
    }


    // Inicia o jogo no menu principal (fase 1)
    initializeGame();
});
