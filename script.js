document.addEventListener('DOMContentLoaded', () => {
    const gameTitle = document.getElementById('gameTitle');
    const gameScreen = document.getElementById('gameScreen');
    const energyBar = document.getElementById('energiaBar');
    const energyFill = document.getElementById('energiaFill');
    const energiaDisplay = document.getElementById('energiaDisplay');
    const timerDisplay = document.getElementById('timer');
    const playerInventoryDiv = document.getElementById('playerInventory');
    const inventoryList = document.getElementById('inventoryList');
    const statsDiv = document.querySelector('.stats'); // Referência para a div de stats

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

    // Canvas Matrix Effect
    const matrixCanvas = document.getElementById('matrixCanvas');
    const ctx = matrixCanvas.getContext('2d');
    let matrixEffectInterval;

    // Nova referência para a div de transição
    const transitionOverlay = document.getElementById('transitionOverlay');

    let currentEnergy = 100;
    let currentPhaseId = 0;
    let timerInterval;
    let playerInventory = [];
    let rankingScore = 0; // Pontuação para o ranking
    let difficultyMultiplier = 1; // Pode ser ajustado para influenciar a dificuldade/energia

    // --- Funções de Áudio ---
    function playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0; // Reinicia o som
            audioElement.play().catch(e => console.error("Erro ao tocar som:", e));
        }
    }

    function playMusic(musicElement) {
        if (currentMusic && currentMusic !== musicElement) {
            currentMusic.pause();
            currentMusic.currentTime = 0;
        }
        if (musicElement) {
            musicElement.volume = 0.5; // Volume padrão para música
            musicElement.play().catch(e => console.error("Erro ao tocar música:", e));
            currentMusic = musicElement;
        } else {
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
        energiaFill.style.width = `${currentEnergy}%`;
        energiaDisplay.textContent = currentEnergy;

        // Atualizar cor da barra de energia
        if (currentEnergy > 60) {
            energiaFill.style.backgroundColor = '#00ff00'; // Verde
        } else if (currentEnergy > 30) {
            energiaFill.style.backgroundColor = '#ffff00'; // Amarelo
        } else {
            energiaFill.style.backgroundColor = '#ff0000'; // Vermelho
        }
    }

    function startTimer(duration, onTimeout) {
        let timeLeft = duration;
        timerDisplay.textContent = `Tempo: ${timeLeft}s`;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Tempo: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                onTimeout();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerDisplay.textContent = '';
    }

    function addItemToInventory(item) {
        playerInventory.push(item);
        updateInventoryDisplay();
        saveProgress();
    }

    function hasItem(item) {
        return playerInventory.includes(item);
    }

    function updateInventoryDisplay() {
        if (playerInventory.length > 0) {
            playerInventoryDiv.classList.remove('hidden');
            inventoryList.innerHTML = '';
            playerInventory.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                inventoryList.appendChild(li);
            });
        } else {
            playerInventoryDiv.classList.add('hidden');
        }
    }

    function setBackground(className) {
        document.body.className = className; // Remove classes antigas e adiciona a nova
    }

    function setFont(className) {
        gameScreen.style.fontFamily = ''; // Reseta para o padrão
        gameTitle.style.fontFamily = '';
        if (className) {
            gameScreen.style.fontFamily = `"${className}", sans-serif`;
            gameTitle.style.fontFamily = `"${className}", cursive`;
        }
    }

    // --- Efeito Matrix ---
    function startMatrixEffect() {
        matrixCanvas.style.display = 'block';
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const columns = Math.floor(matrixCanvas.width / 20); // Largura de cada "gota"
        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1; // Inicia a gota no topo
        }

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Efeito de rastro
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            ctx.fillStyle = '#00ff99'; // Cor das letras
            ctx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = String.fromCharCode(0x30A0 + Math.random() * 96); // Caracteres japoneses
                ctx.fillText(text, i * 20, drops[i] * 20);

                // Mover para baixo ou reiniciar no topo
                if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        matrixEffectInterval = setInterval(drawMatrix, 33); // Atualiza a cada 33ms
    }

    function stopMatrixEffect() {
        clearInterval(matrixEffectInterval);
        matrixCanvas.style.display = 'none';
        ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height); // Limpa o canvas
    }

    // --- Gerenciamento de Fases ---

    // Nova função para a transição de tela
    function performTransition(callback) {
        const transitionDuration = 800; // Duração total para fade out + glitch + fade in (ms)

        // 1. Fade out current content and activate glitch overlay
        gameScreen.style.animation = 'fade-out-content 0.5s forwards'; // Aplica animação de fade-out
        gameScreen.style.pointerEvents = 'none'; // Desabilita cliques durante a transição

        transitionOverlay.style.opacity = 1; // Torna o overlay visível
        transitionOverlay.classList.add('glitch-active'); // Inicia a animação de glitch
        transitionOverlay.textContent = 'Realidade se distorcendo...'; // Mensagem durante a transição

        // 2. Após um curto delay, executa o callback (renderização da nova fase)
        // e então esconde o glitch e faz o fade-in do novo conteúdo
        setTimeout(() => {
            callback(); // Executa a lógica de renderização da fase (muda conteúdo, bg, etc.)

            transitionOverlay.classList.remove('glitch-active'); // Para o glitch
            transitionOverlay.style.opacity = 0; // Esconde o overlay
            transitionOverlay.textContent = ''; // Limpa a mensagem

            gameScreen.style.animation = 'fade-in-content 0.5s forwards'; // Aplica animação de fade-in
            gameScreen.style.pointerEvents = 'auto'; // Re-habilita cliques
        }, transitionDuration / 2); // Na metade da duração total, o conteúdo está escondido

        // Garante que as propriedades de animação sejam removidas após a transição completa
        setTimeout(() => {
            gameScreen.style.animation = ''; // Remove a propriedade animation para evitar interferências
        }, transitionDuration);
    }

    function renderPhase(phase) {
        // Envolve a lógica de renderização da fase em um callback para performTransition
        const renderPhaseContent = () => {
            stopTimer(); // Para o timer da fase anterior
            stopMatrixEffect(); // Para o efeito matrix se não for usar

            if (phase.music && currentMusic !== phase.music) {
                playMusic(phase.music); // Toca a música da fase
            } else if (!phase.music && currentMusic) {
                playMusic(null); // Para a música se a fase não tiver
            }

            gameTitle.textContent = phase.title;
            gameScreen.innerHTML = `<p>${phase.description}</p>`; // Seta a descrição da fase

            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options');
            phase.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option.text;
                button.onclick = () => {
                    playSound(clickSound); // Toca o som de clique
                    option.action();
                };
                optionsDiv.appendChild(button);
            });
            gameScreen.appendChild(optionsDiv);

            setBackground(phase.backgroundClass);
            setFont(phase.fontClass);

            if (phase.matrixEffect) {
                startMatrixEffect();
            }

            if (phase.timerDuration > 0) {
                statsDiv.classList.remove('hidden'); // Mostra stats
                startTimer(phase.timerDuration, () => {
                    gameOver("Você não conseguiu tomar uma decisão a tempo!");
                });
            } else {
                statsDiv.classList.add('hidden'); // Esconde stats se não houver timer
            }
            updateEnergy(0); // Atualiza exibição de energia sem alterar valor
            updateInventoryDisplay(); // Garante que o inventário esteja atualizado
        };

        // Chama a função de transição, passando o conteúdo da fase como callback
        performTransition(renderPhaseContent);
    }

    // --- Handlers de Escolha ---

    function handleChoice(nextPhaseId, energyChange, scoreChange, message) {
        currentPhaseId = nextPhaseId;
        updateEnergy(energyChange);
        rankingScore += scoreChange;

        // Exibe mensagem de feedback
        const feedbackDiv = document.createElement('p');
        feedbackDiv.classList.add('feedback-message');
        feedbackDiv.textContent = message;
        gameScreen.appendChild(feedbackDiv);

        // Aumenta o tempo da mensagem de feedback (de 1.5s para 3s)
        setTimeout(() => {
            feedbackDiv.remove();
            if (phases[currentPhaseId]) {
                renderPhase(phases[currentPhaseId]);
            } else {
                // Se não houver próxima fase, pode ser vitória ou game over final
                checkGameEnd();
            }
        }, 3000); // Mensagem fica por 3 segundos
    }

    function handleComplexChoice(nextPhaseId, actionType, energyCost, scoreChange, itemRequired, successMessage, failMessage, successEnergyChange, failEnergyChange) {
        let success = true;
        let message = successMessage;
        let energyMod = successEnergyChange;

        if (energyCost > 0 && currentEnergy < energyCost) {
            success = false;
            message = "Energia insuficiente para esta ação!";
            energyMod = 0; // Sem mudança de energia se não conseguir tentar
        } else if (itemRequired && !hasItem(itemRequired)) {
            success = false;
            message = `Você precisa de ${itemRequired} para fazer isso!`;
            energyMod = 0;
        } else {
            updateEnergy(-energyCost); // Custo de energia aplicado ao tentar
            // Lógica específica para cada tipo de ação complexa
            switch (actionType) {
                case 'hack-cabana':
                    // Simula chance de sucesso
                    if (Math.random() < 0.7) { // 70% de chance de sucesso
                        message = successMessage;
                        energyMod = successEnergyChange;
                        playSound(hackSuccessSound); // Som de sucesso no hack
                    } else {
                        success = false;
                        message = failMessage;
                        energyMod = failEnergyChange;
                        playSound(hackFailSound); // Som de falha no hack
                    }
                    break;
                case 'entrada-servico':
                    if (hasItem("Chave Mestra Universal")) {
                        message = successMessage;
                        energyMod = successEnergyChange;
                        playSound(snowWalkSound); // Som de passos na neve
                    } else {
                        success = false;
                        message = `A porta está trancada, você precisa de uma ${itemRequired}.`;
                        energyMod = failEnergyChange;
                    }
                    break;
                // Adicione mais tipos de ações complexas aqui
                default:
                    // Ação padrão se não for um tipo específico
                    break;
            }
        }

        updateEnergy(energyMod); // Aplica mudança de energia pós-ação
        if (success) {
            rankingScore += scoreChange; // Adiciona pontos apenas no sucesso
        }

        // Exibe mensagem de feedback
        const feedbackDiv = document.createElement('p');
        feedbackDiv.classList.add('feedback-message');
        feedbackDiv.textContent = message;
        gameScreen.appendChild(feedbackDiv);

        // Aumenta o tempo da mensagem de feedback (de 2s para 4s)
        setTimeout(() => {
            feedbackDiv.remove();
            if (success && phases[nextPhaseId]) {
                currentPhaseId = nextPhaseId;
                renderPhase(phases[currentPhaseId]);
            } else if (!success) {
                // Se falhou, geralmente permanece na mesma fase ou volta para uma anterior
                // Por simplicidade, vamos para a mesma fase, ou para uma fase de falha específica
                // Se não houver nextPhaseId para falha, mantém na fase atual
                if (phases[currentPhaseId]) { // Permanece na fase atual se não mudar
                    renderPhase(phases[currentPhaseId]);
                } else {
                    // Fallback para caso não haja mais fases ou haja erro
                    checkGameEnd();
                }
            } else {
                checkGameEnd(); // Se success mas nextPhaseId inválido
            }
        }, 4000); // Mensagem fica por 4 segundos
    }


    // --- Fases do Jogo ---
    const phases = [
        // Fase 0: Menu Inicial
        {
            id: 0,
            title: "RPG Folclore Hacker - Jornada no Alasca",
            description: "Bem-vindo à sua jornada gelada. Desvende os mistérios do folclore em meio ao código e à neve. Você está pronto para começar?",
            options: [
                { text: "Iniciar Jogo", action: () => handleChoice(1, 0, 0, "A jornada começa!") }
            ],
            backgroundClass: "bg-fase-0",
            fontClass: "font-pixel",
            matrixEffect: false,
            timerDuration: 0,
            music: null // Nenhuma música de fundo inicialmente
        },
        // Fase 1: A Chegada
        {
            id: 1,
            title: "A Chegada Gélida",
            description: "Você aterrissa em uma remota pista de pouso no Alasca. O vento uiva, e a neve chicoteia seu rosto. Um bilhete em seu bolso diz: 'Procure a cabana mais antiga. O segredo está na rede.'",
            options: [
                { text: "Seguir a trilha principal", action: () => handleChoice(2, -5, 10, "Você decide seguir a trilha marcada, economizando energia.") },
                { text: "Ativar scanner térmico", action: () => handleChoice(2, -15, 5, "Seu scanner revela uma anomalia térmica fora da trilha. Isso custa energia, mas pode ser mais rápido.") }
            ],
            backgroundClass: "bg-fase-1",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 60,
            music: ambientSound
        },
        // Fase 2: Floresta Sombria
        {
            id: 2,
            title: "Floresta Sombria e Gélida",
            description: "A trilha se adentra em uma floresta densa e escura. As árvores cobertas de neve parecem figuras fantasmagóricas. Você ouve um sussurro distante, quase como um código binário se misturando ao vento.",
            options: [
                { text: "Ignorar e seguir em frente", action: () => handleChoice(3, -10, 15, "Você persiste, mas a sensação de ser observado aumenta.") },
                { text: "Tentar decifrar o sussurro", action: () => handleComplexChoice(3, 'decifrar-sussurro', 10, 25, null, "Você capta uma sequência: '01001000 01100001 01100011 01101011'. É uma pista!", -10, 0, -5) } // Exemplo de ação complexa
            ],
            backgroundClass: "bg-fase-2",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 90,
            music: fase2Music // Música específica para a Fase 2
        },
        // Fase 3: A Cabana Antiga (com hack)
        {
            id: 3,
            title: "A Cabana Antiga",
            description: "Você encontra uma cabana isolada, coberta por neve. Há um brilho fraco vindo de uma janela. Parece abandonada, mas a porta tem um teclado de segurança antigo. Você tenta uma abordagem hacker.",
            options: [
                { text: "Forçar a entrada (gasta energia)", action: () => handleChoice(4, -20, 5, "Você tenta arrombar, mas o frio torna seus movimentos lentos. A porta não cede.") },
                { text: "Tentar hackear o teclado", action: () => handleComplexChoice(4, 'hack-cabana', 25, 50, null, "Acesso concedido! O teclado pisca em verde e a porta range. Você é bom nisso!", "Falha no hack. O sistema se tranca, e um alarme silencioso é ativado. Isso chamará atenção!", -10, -20) }
            ],
            backgroundClass: "bg-fase-3",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 120,
            music: suspenseMusic // Música de suspense na Fase 3
        },
        // Fase 4: O Encontro com o "Homem da Neve" (Saci)
        {
            id: 4,
            title: "O Vulto na Neve",
            description: "Dentro da cabana, há equipamentos antigos e um cheiro forte de fumaça. De repente, um vulto pequeno e ágil com um gorro vermelho passa voando. É o 'Homem da Neve', uma lenda local que rouba bits de dados!",
            options: [
                { text: "Tentar capturar o vulto", action: () => handleComplexChoice(5, 'capturar-saci', 30, 75, "Rede de Captura Óptica", "Você lança sua rede óptica e captura o Vulto! Ele deixa cair um 'Módulo de Dados Encriptado'.", "O vulto é muito rápido e desaparece na neve, zombando de você. (-15 energia)", -10, -15) },
                { text: "Instalar um rastreador de IP", action: () => handleChoice(5, -15, 20, "Você instala um rastreador. Pode não pegar o vulto, mas talvez revele seu destino.") }
            ],
            backgroundClass: "bg-fase-4",
            fontClass: "font-pixel",
            matrixEffect: true,
            timerDuration: 90,
            music: ambientSound
        },
        // Fase 5: Base Militar Abandonada
        {
            id: 5,
            title: "Base Militar Abandonada",
            description: "Seu rastreador de IP (ou a trilha do Vulto) te leva a uma antiga base militar soviética, semi-enterrada na neve. Há uma porta de serviço com um selo de segurança que parece impossível de hackear sem uma chave física.",
            options: [
                { text: "Procurar por uma entrada alternativa", action: () => handleChoice(6, -20, 30, "Você encontra um duto de ventilação, mas está parcialmente bloqueado. (-20 energia)") },
                { text: "Tentar entrada de serviço com Chave Mestra", action: () => handleComplexChoice(6, 'entrada-servico', 10, 100, "Chave Mestra Universal", "A Chave Mestra Universal se encaixa perfeitamente! A porta se abre com um assobio metálico. (Item usado)", "A porta está trancada, você precisa de uma Chave Mestra Universal para abrir. (-5 energia)", 0, -5) }
            ],
            backgroundClass: "bg-fase-5",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 100,
            music: ambientSound
        },
        // Fase 6: Laboratório Subterrâneo
        {
            id: 6,
            title: "Laboratório Subterrâneo",
            description: "Os corredores escuros da base levam a um laboratório bizarro. Telas piscam com diagramas de circuitos e símbolos antigos. No centro, um dispositivo estranho pulsa com energia mística e digital. O 'Módulo de Dados Encriptado' que você pegou do Vulto começa a vibrar.",
            options: [
                { text: "Conectar o Módulo de Dados ao dispositivo", action: () => handleComplexChoice(7, 'conectar-modulo', 15, 150, "Módulo de Dados Encriptado", "O dispositivo absorve o módulo, revelando projeções de seres folclóricos controlando redes. Você entende tudo! (Item usado)", "O dispositivo rejeita o módulo, causando um curto-circuito e liberando uma descarga elétrica. (-30 energia)", -10, -30) },
                { text: "Analisar o dispositivo com seu óculos de Raio-X", action: () => handleChoice(7, -10, 50, "A análise revela que o dispositivo está sincronizando as lendas com a rede global. Isso é maior do que você pensava!") }
            ],
            backgroundClass: "bg-fase-6",
            fontClass: "font-pixel",
            matrixEffect: true,
            timerDuration: 120,
            music: ambientSound
        },
        // Fase 7: O Enigma da Curupira Hacker
        {
            id: 7,
            title: "O Enigma da Curupira Hacker",
            description: "De repente, as telas do laboratório mudam. Uma imagem distorcida de uma criatura com pés virados para trás aparece. É a Curupira, mas seus olhos brilham com código binário. Ela te desafia com um enigma para acessar a próxima rede.",
            options: [
                { text: "Tentar resolver o enigma (lógica)", action: () => handleComplexChoice(8, 'resolver-enigma', 20, 100, null, "Você decifra a charada! A Curupira sorri digitalmente e abre um portal de dados. (+50 energia)", "Você falha. A Curupira te redireciona para um loop infinito de anúncios pop-up! (-25 energia)", 50, -25) },
                { text: "Atacar o sistema da Curupira", action: () => handleChoice(8, -40, 0, "Seu ataque é ineficaz. A Curupira se dissipa em pixels, e você perde tempo e energia.") }
            ],
            backgroundClass: "bg-fase-7",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 100,
            music: ambientSound
        },
        // Fase 8: A Realidade Distorcida (Boto)
        {
            id: 8,
            title: "A Realidade Distorcida",
            description: "O portal da Curupira te leva a uma dimensão onde a realidade se distorce. Você está em um rio congelado, mas vê um vulto de um homem elegante com um chapéu, que se transforma em um golfinho cor-de-rosa digitalizado. É o Boto Hacker, mestre das ilusões e da camuflagem na rede.",
            options: [
                { text: "Aceitar a ilusão e buscar uma saída", action: () => handleChoice(9, -10, 30, "Você tenta entender a lógica da ilusão, buscando uma falha na sua programação.") },
                { text: "Usar 'Detector de Ilusões Digitais'", action: () => handleComplexChoice(9, 'usar-detector', 20, 120, "Detector de Ilusões Digitais", "O detector revela uma porta oculta na paisagem distorcida. A ilusão se desfaz. (Item usado)", "O detector falha em meio a tanta distorção, deixando você desorientado. (-20 energia)", 0, -20) }
            ],
            backgroundClass: "bg-fase-8",
            fontClass: "font-pixel",
            matrixEffect: true,
            timerDuration: 90,
            music: ambientSound
        },
        // Fase 9: A Fortaleza do Gelo (Cuca)
        {
            id: 9,
            title: "A Fortaleza do Gelo",
            description: "Você chega a uma imponente fortaleza feita de gelo e circuitaria, flutuando em um abismo digital. Luzes estroboscópicas brilham em sincronia com batidas pesadas. Esta é a base da Cuca Hacker, a arquiteta de toda a rede folclórica.",
            options: [
                { text: "Entrar furtivamente (stealth hack)", action: () => handleComplexChoice(10, 'stealth-hack', 30, 150, null, "Você desativa as sentinelas digitais e entra sem ser detectado. (+70 energia)", "Você aciona um alarme sonoro! Sentinelas são ativadas. (-40 energia)", 70, -40) },
                { text: "Atacar diretamente o firewall", action: () => handleChoice(10, -50, 50, "Você lança um ataque DDoS massivo, mas o firewall da Cuca é robusto e revida com força total.") }
            ],
            backgroundClass: "bg-fase-9",
            fontClass: "font-typewriter",
            matrixEffect: true,
            timerDuration: 120,
            music: bossMusic
        },
        // Fase 10: O Chefão Final (Cuca)
        {
            id: 10,
            title: "Cuca: O Núcleo do Folclore Digital",
            description: "No coração da fortaleza, a Cuca surge. Não como uma bruxa, mas como uma inteligência artificial colossal, tecendo o folclore na rede global. Ela é a fusão de todas as lendas, protegendo o 'Núcleo Folclórico'. Prepare-se para a batalha final de código e vontade.",
            options: [
                { text: "Lançar vírus definitivo", action: () => handleComplexChoice(11, 'final-virus', 50, 200, "Vírus Definitivo", "Seu vírus corrompe o Núcleo Folclórico! A Cuca se desfaz em uma cascata de bits de luz. Vitória!", "O vírus é neutralizado! A Cuca te sobrecarrega com um ataque de negação de serviço. (-50 energia, Game Over)", 0, -50) },
                { text: "Tentar negociar (persuasão)", action: () => handleChoice(11, -30, 100, "Você tenta persuadir a Cuca a liberar o folclore. Ela hesita, mas sua programação a impede. Ela ataca!") }
            ],
            backgroundClass: "bg-fase-final",
            fontClass: "font-pixel",
            matrixEffect: true,
            timerDuration: 150,
            music: bossMusic
        }
    ];

    // --- Telas de Fim de Jogo ---
    function gameOver(message) {
        stopTimer();
        stopMatrixEffect();
        playMusic(null); // Para qualquer música
        playSound(alertSound); // Som de alerta/derrota

        gameScreen.innerHTML = `<h2>GAME OVER!</h2><p>${message}</p><p>Sua jornada termina aqui, Hacker.</p><button id="restartButton">Reiniciar Jogo</button>`;
        setBackground("bg-game-over"); // Fundo de game over
        gameTitle.textContent = "Fim da Linha"; // Muda o título
        statsDiv.classList.add('hidden'); // Esconde stats
        playerInventoryDiv.classList.add('hidden'); // Esconde inventário

        document.getElementById('restartButton').onclick = restartGame;
    }

    function showVictoryScreen() {
        stopTimer();
        stopMatrixEffect();
        playMusic(null); // Para qualquer música
        // playSound(victorySound); // Adicionar um som de vitória

        const finalRank = calculateRanking();

        gameScreen.innerHTML = `<h2>VITÓRIA!</h2>
                               <p>Você desvendou os mistérios do Alasca e salvou o Folclore Digital!</p>
                               <p>Sua pontuação final: <span class="score">${rankingScore}</span></p>
                               <p>Seu Ranking: <span class="score">${finalRank}</span></p>
                               <button id="restartButton">Jogar Novamente</button>`;
        setBackground("bg-victory"); // Fundo de vitória
        gameTitle.textContent = "Jornada Concluída!"; // Muda o título
        statsDiv.classList.add('hidden'); // Esconde stats
        playerInventoryDiv.classList.add('hidden'); // Esconde inventário

        document.getElementById('restartButton').onclick = restartGame;
    }

    function calculateRanking() {
        if (rankingScore >= 1000) return "S+ (Lenda Hacker)";
        if (rankingScore >= 800) return "S (Mestre Digital)";
        if (rankingScore >= 600) return "A (Cientista de Dados)";
        if (rankingScore >= 400) return "B (Codificador Experiente)";
        if (rankingScore >= 200) return "C (Novato Curioso)";
        return "D (Aprendiz Hacker)";
    }

    function checkGameEnd() {
        if (currentPhaseId >= phases.length) { // Se não houver mais fases
            showVictoryScreen();
        } else if (currentEnergy <= 0) {
            gameOver("Sua energia se esgotou completamente!");
        }
    }


    function restartGame() {
        // Resetar variáveis
        currentEnergy = 100;
        currentPhaseId = 0;
        playerInventory = [];
        rankingScore = 0;
        difficultyMultiplier = 1;

        // Limpar intervalos
        stopTimer();
        stopMatrixEffect();
        playMusic(null); // Para qualquer música que esteja tocando

        // Remover classes de fundo
        document.body.className = '';

        // Renderizar a fase inicial (Menu)
        initializeGame(); // Volta para a tela inicial
    }

    // --- Funções de Salvar/Carregar Progresso (LocalStorage) ---
    function saveProgress() {
        const gameState = {
            currentEnergy,
            currentPhaseId,
            playerInventory,
            rankingScore
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
            playerInventory = gameState.playerInventory || []; // Garante que seja um array
            rankingScore = gameState.rankingScore;
            
            updateEnergy(0); // Atualiza visualmente a barra de energia
            updateInventoryDisplay(); // Atualiza visualização do inventário
            console.log("Progresso carregado!");
            return true; // Retorna true se carregou
        }
        console.log("Nenhum progresso salvo encontrado.");
        return false; // Retorna false se não carregou
    }

    // --- Inicialização do Jogo ---
    function initializeGame() {
        updateEnergy(0); // Atualiza a energia inicial (100%)
        renderPhase(phases[0]); // Renderiza a fase de introdução (Menu Inicial)
        
        // Tenta tocar uma música muda inicialmente para "ativar" o contexto de áudio
        // Isso ajuda a contornar restrições de autoplay em alguns navegadores
        if (ambientSound) {
            ambientSound.volume = 0;
            ambientSound.play().catch(e => console.log("Autoplay inicial bloqueado, ok."));
            // Volta o volume para o padrão após um breve momento
            setTimeout(() => {
                ambientSound.volume = 0.5; 
            }, 100); 
        }
    }
    
    // Inicia o jogo quando o DOM estiver pronto (exibindo o menu inicial)
    initializeGame();
});
