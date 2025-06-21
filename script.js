// script.js

// Variáveis globais do jogo
let vida = 100;
let forca = 10;
let mana = 10;
let reputacao = 0;
let faseAtual = 0;
let escolhasFeitas = {};
let inventario = [];
let player = {
    nickname: '',
    classe: '',
    forca: forca, // Inicializa com o valor global
    mana: mana    // Inicializa com o valor global
};
let subliminarInterval; // Variável para controlar o intervalo das mensagens subliminares

// Elementos do DOM
const gameScreen = document.getElementById('gameScreen');
const gameTitle = document.getElementById('gameTitle');
const vidaValue = document.getElementById('vidaValue');
const vidaFill = document.getElementById('vidaFill');
const forcaValue = document.getElementById('forcaValue');
const manaValue = document.getElementById('manaValue');
const reputacaoValue = document.getElementById('reputacaoValue');
const inventarioList = document.getElementById('inventarioList');
const inventarioContainer = document.getElementById('inventarioContainer');
const regrasObjetivosMissoesContainer = document.getElementById('regrasObjetivosMissoesContainer');
const regrasContent = document.getElementById('regrasContent');
const objetivosContent = document.getElementById('objetivosContent');
const missoesContent = document.getElementById('missoesContent');
const hud = document.getElementById('hud');
const rankingDisplay = document.getElementById('rankingDisplay');
const rankingList = document.getElementById('rankingList');

// Sons
const clickSound = document.getElementById('clickSound');
const attackSound = document.getElementById('attackSound');
const alertSound = document.getElementById('alertSound');
const ambientSound = document.getElementById('ambientSound');

// --- Efeito Matrix ---
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
let cw = window.innerWidth;
let ch = window.innerHeight;
let matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%';
matrix = matrix.split('');
let font_size = 10;
let columns = cw / font_size;
let drops = [];
for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#00ff99';
    ctx.font = font_size + 'px VT323';
    for (let i = 0; i < drops.length; i++) {
        let text = matrix[Math.floor(Math.random() * matrix.length)];
        ctx.fillText(text, i * font_size, drops[i] * font_size);
        if (drops[i] * font_size > ch && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
window.addEventListener('resize', () => {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
    columns = cw / font_size;
    drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
});
setInterval(drawMatrix, 35);
// --- Fim Efeito Matrix ---

// Função para tocar som de clique
function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play();
}

// Função para exibir mensagens subliminares
function exibirMensagemSubliminar() {
    const subliminarDiv = document.createElement('div');
    subliminarDiv.className = 'subliminar-message';
    // Nova URL para uma imagem mais dark/obscura de lanche open source
    const imageUrl = 'https://i.imgur.com/wS60l4F.png'; // Exemplo de um lanche com iluminação mais dramática/escura
    const messages = [
        'COMA SEU LANCHE OPEN SOURCE NA ESCURIDÃO',
        'ABRAÇO AOS CODERS LIVRES DA NOITE',
        'ALASCA: UM SABOR DIFERENTE NO GELO',
        'O KERNEL SUSSURRA SEGREDOS',
        'GLITCH É VIDA, CAOS É ARTE',
        'BATA UMA COXINHA ANTES DO APOCALIPSE',
        'CUIDADO COM AS FAKE NEWS DA CUCA, ELAS CONGELAM',
        'SEMPRE HÁ UMA PORTA TRASEIRA PARA O ABISMO'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    subliminarDiv.innerHTML = `<img src="${imageUrl}" alt="Lanche Open Source Sombrio"><p>${randomMessage}</p>`;
    document.body.appendChild(subliminarDiv);

    // Efeito de piscar rapidamente
    setTimeout(() => {
        subliminarDiv.style.opacity = '1';
        setTimeout(() => {
            subliminarDiv.style.opacity = '0';
            setTimeout(() => {
                subliminarDiv.remove();
            }, 200); // Remove após a transição
        }, 100); // Visível por 100ms
    }, 50); // Delay inicial antes de aparecer
}


// Função para iniciar as mensagens subliminares
function iniciarMensagensSubliminares() {
    // Garante que não haja múltiplos intervalos rodando
    if (subliminarInterval) {
        clearInterval(subliminarInterval);
    }
    // As mensagens aparecem a cada 5 a 15 segundos (5000 a 15000 ms)
    subliminarInterval = setInterval(() => {
        // As mensagens subliminares só aparecem nas fases de jogo (2 a 11)
        if (faseAtual >= 2 && faseAtual <= 11) {
            exibirMensagemSubliminar();
        }
    }, Math.random() * (15000 - 5000) + 5000);
}

// Função para parar as mensagens subliminares
function pararMensagensSubliminares() {
    if (subliminarInterval) {
        clearInterval(subliminarInterval);
        subliminarInterval = null;
    }
}


// Função para atualizar a HUD (Heads-Up Display)
function atualizarHUD() {
    vidaValue.textContent = vida;
    vidaFill.style.width = `${vida}%`;
    forcaValue.textContent = forca;
    manaValue.textContent = mana;
    reputacaoValue.textContent = reputacao;

    if (vida <= 0) {
        gameOver("Sua vida se esgotou. A escuridão digital o consumiu. Game Over.");
        return;
    }

    inventarioList.innerHTML = '';
    if (inventario.length === 0) {
        inventarioList.innerHTML = '<li>Vazio</li>';
    } else {
        inventario.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            inventarioList.appendChild(li);
        });
    }
}

// Função para adicionar item ao inventário
function adicionarItemInventario(item) {
    if (!inventario.includes(item)) {
        inventario.push(item);
        atualizarHUD();
        exibirMensagem(`Você adicionou "${item}" ao seu inventário!`, 'info');
    } else {
        exibirMensagem(`Você já tem "${item}" no seu inventário.`, 'normal');
    }
}

// Função para remover item do inventário
function removerItemInventario(item) {
    inventario = inventario.filter(i => i !== item);
    atualizarHUD();
}

// --- Nova Função: Gerenciar Inventário (para itens consumíveis) ---
function gerenciarInventario(proximaFase) {
    gameTitle.textContent = 'Gerenciar Inventário';
    gameScreen.innerHTML = `
        <p>O que você deseja fazer com seus itens?</p>
    `;
    gameScreen.style.backgroundImage = 'none'; // Sempre limpa o BG aqui
    hud.style.display = 'block'; // Garante que a HUD está visível ao gerenciar inventário
    inventarioContainer.style.display = 'block';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'none';

    const acoes = [];

    if (inventario.includes('Kit de Primeiros Socorros Digital')) {
        acoes.push({
            texto: 'Usar Kit de Primeiros Socorros Digital (+30 Vida)',
            acao: () => {
                vida = Math.min(100, vida + 30);
                removerItemInventario('Kit de Primeiros Socorros Digital');
                exibirMensagem('Você usou o kit e recuperou sua vida!', 'success');
                atualizarHUD();
                irParaFase(proximaFase);
            }
        });
    }

    if (inventario.includes('Bateria de Energia')) {
        acoes.push({
            texto: 'Usar Bateria de Energia (+20 Mana)',
            acao: () => {
                mana = Math.min(50, mana + 20); // Mana max de 50
                player.mana = mana;
                removerItemInventario('Bateria de Energia');
                exibirMensagem('Você usou a bateria e recarregou sua mana!', 'success');
                atualizarHUD();
                irParaFase(proximaFase);
            }
        });
    }

    if (acoes.length === 0) {
        gameScreen.innerHTML += '<p>Você não tem itens consumíveis no momento.</p>';
    }

    acoes.push({
        texto: 'Voltar ao Jogo',
        acao: () => irParaFase(proximaFase)
    });

    exibirEscolhas(acoes);
}


// Função para exibir mensagens na tela (com tempo de transição)
function exibirMensagem(mensagem, tipo = 'normal') {
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.textContent = mensagem;
    gameScreen.appendChild(mensagemDiv);

    setTimeout(() => {
        mensagemDiv.style.opacity = '0';
        mensagemDiv.style.transition = 'opacity 1s ease-out';
        setTimeout(() => {
            mensagemDiv.remove();
        }, 1000);
    }, 3000);
}

// Função de transição para a próxima fase (agora pode incluir evento aleatório)
function irParaFase(proximaFase, delay = 1500) {
    playClickSound();
    gameScreen.style.opacity = '0';
    gameScreen.style.transition = 'opacity 1.5s ease-in-out';

    setTimeout(() => {
        gameScreen.innerHTML = '';
        faseAtual = proximaFase;
        // Chamar evento aleatório APENAS entre fases de jogo (2 a 11)
        if (faseAtual > 1 && faseAtual < 12 && Math.random() < 0.25) { // 25% de chance de evento aleatório
            eventoAleatorio(faseAtual); // Passa a próxima fase como destino após o evento
        } else {
            renderizarFase(faseAtual);
        }
        gameScreen.style.opacity = '1';
        gameScreen.style.transition = 'opacity 1.5s ease-in-out';
        atualizarHUD();
    }, delay);
}

// --- Nova Função: Evento Aleatório ---
function eventoAleatorio(proximaFaseReal) {
    gameTitle.textContent = 'Evento Inesperado nas Sombras!';
    gameScreen.style.backgroundImage = 'none'; // Eventos sempre com fundo neutro
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'none';

    const eventos = [
        {
            nome: 'Falha de Sistema Súbita',
            descricao: 'Um pulso eletromagnético atinge seu sistema! Você sente uma pontada de dor digital.',
            efeito: () => {
                vida -= 10;
                exibirMensagem('Perda de 10 Vida!', 'alert');
            }
        },
        {
            nome: 'Carga de Dados Perdida',
            descricao: 'Você encontra um pacote de dados criptografado pulsando no chão. Ao decifrá-lo, uma onda de mana o revigora.',
            efeito: () => {
                mana = Math.min(50, mana + 15); // Garante que não ultrapasse 50 de mana
                player.mana = mana;
                exibirMensagem('Ganho de 15 Mana!', 'success');
            }
        },
        {
            nome: 'Armadilha Digital Oculta',
            descricao: 'Você pisa em uma armadilha de spam com dados corrosivos. Seus sentidos ficam momentaneamente confusos.',
            efeito: () => {
                mana = Math.max(0, mana - 5);
                forca = Math.max(0, forca - 5);
                player.mana = mana;
                player.forca = forca;
                exibirMensagem('Perda de 5 Mana e 5 Força!', 'alert');
            }
        },
        {
            nome: 'Cache de Energia Residual',
            descricao: 'Um brilho fraco chama sua atenção. Você encontra um cache de energia residual em um nó de rede antigo.',
            efeito: () => {
                adicionarItemInventario('Bateria de Energia');
                exibirMensagem('Você encontrou uma Bateria de Energia!', 'info');
            }
        },
        {
            nome: 'Fragmento de Informação Crítica',
            descricao: 'Um snippet de código sombrio aparece na sua tela: "A Cuca teme a luz do Kernel".',
            efeito: () => {
                reputacao += 5;
                exibirMensagem('Ganho de 5 Reputação! Uma nova dica sobre a Cuca sussurra em sua mente.', 'info');
            }
        }
    ];

    const eventoEscolhido = eventos[Math.floor(Math.random() * eventos.length)];

    gameScreen.innerHTML = `
        <p><b>${eventoEscolhido.nome}:</b> ${eventoEscolhido.descricao}</p>
        <button id="continuarEventoBtn">Continuar na Sombra</button>
    `;

    document.getElementById('continuarEventoBtn').onclick = () => {
        playClickSound();
        eventoEscolhido.efeito();
        atualizarHUD();
        irParaFase(proximaFaseReal, 500); // Continua para a fase que deveria ir
    };
}


// Função para exibir escolhas ao jogador
function exibirEscolhas(opcoes) {
    // Limpa escolhas anteriores
    const oldButtons = gameScreen.querySelectorAll('button:not(.hint-button)'); // Não remove o botão de dica
    oldButtons.forEach(button => button.remove());

    opcoes.forEach(opcao => {
        const button = document.createElement('button');
        button.textContent = opcao.texto;
        button.onclick = () => {
            playClickSound();
            opcao.acao();
        };
        gameScreen.appendChild(button);
    });
}

// --- Funções de Ranking ---
function carregarRanking() {
    const rankingSalvo = JSON.parse(localStorage.getItem('rpgRanking')) || [];
    return rankingSalvo.sort((a, b) => b.reputacao - a.reputacao); // Ordena por reputação
}

function salvarRanking(nickname, reputacaoFinal) {
    const ranking = carregarRanking();
    ranking.push({ nickname, reputacao: reputacaoFinal });
    ranking.sort((a, b) => b.reputacao - a.reputacao);
    // Limita o ranking aos 10 melhores
    localStorage.setItem('rpgRanking', JSON.stringify(ranking.slice(0, 10)));
    atualizarDisplayRanking();
}

function atualizarDisplayRanking() {
    const ranking = carregarRanking();
    rankingList.innerHTML = '';
    if (ranking.length === 0) {
        rankingList.innerHTML = '<li>Nenhum hacker no ranking ainda.</li>';
    } else {
        ranking.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${index + 1}. ${entry.nickname}</span> <span>${entry.reputacao} REP</span>`;
            rankingList.appendChild(li);
        });
    }
}

// Função de Game Over
function gameOver(mensagem) {
    pararMensagensSubliminares(); // Para as mensagens subliminares no Game Over
    gameScreen.innerHTML = `
        <p class="game-over-text">${mensagem}</p>
        <button onclick="reiniciarJogo()">Reiniciar Jornada</button>
    `;
    // Imagem de fundo mais sombria para Game Over
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/rL7tK9v.jpeg")'; // Exemplo: cidade distópica escura
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';

    ambientSound.pause();
    alertSound.play();
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'block'; // Mostra o ranking no Game Over
    salvarRanking(player.nickname, reputacao); // Salva a pontuação do jogador
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    playClickSound();
    pararMensagensSubliminares(); // Para as mensagens subliminares ao reiniciar
    // Resetar para valores base antes de aplicar bônus de classe na próxima criação
    vida = 100;
    forca = 10;
    mana = 10;
    reputacao = 0;
    faseAtual = 0;
    escolhasFeitas = {};
    inventario = [];
    player = { nickname: '', classe: '', forca: 10, mana: 10 }; // Reseta atributos do player
    gameScreen.innerHTML = '';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'none';
    ambientSound.pause();
    ambientSound.currentTime = 0;
    iniciarJogo();
}

// Variável para controlar o botão de dica e evitar duplicação
let hintButtonElement = null;

// Função para adicionar botão de dica (aprimorada para evitar duplicação e remover-se)
function adicionarBotaoDica(hintText) {
    if (hintButtonElement && gameScreen.contains(hintButtonElement)) {
        return; // Botão de dica já presente, não adiciona novamente
    }

    const button = document.createElement('button');
    button.textContent = 'Mostrar Dica Sombria (-5 Vida)';
    button.className = 'hint-button'; // Adiciona uma classe para identificação
    button.onclick = () => {
        playClickSound();
        if (vida > 5) {
            exibirMensagem(`Dica: ${hintText}`, 'info');
            vida -= 5;
            atualizarHUD();
            // Remove o botão de dica após ser clicado
            if (button.parentNode) {
                button.remove();
            }
            hintButtonElement = null; // Reseta a referência global
        } else {
            exibirMensagem('Sua energia vital é muito baixa para decifrar esta dica!', 'alert');
        }
    };
    gameScreen.appendChild(button);
    hintButtonElement = button; // Armazena a referência do botão
}


// --- Telas Específicas do Jogo ---

// Fase 0: Criação de Personagem
function renderizarCriacaoPersonagem() {
    pararMensagensSubliminares(); // Garante que não haja mensagens subliminares aqui
    gameTitle.textContent = 'Forje Seu Avatar Hacker';
    gameScreen.style.backgroundImage = 'none'; // Sem imagem de fundo aqui
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Prepare-se para a imersão na Jornada no Alasca Digital!</p>
        <label for="nicknameInput">Nickname (Seu Codinome):</label>
        <input type="text" id="nicknameInput" placeholder="Ex: ShadowByte, GlitchHunter" maxlength="15" required><br>

        <label for="classeSelect">Escolha Sua Classe:</label>
        <select id="classeSelect">
            <option value="Hacker de Infiltração">Hacker de Infiltração</option>
            <option value="Hacker de Dados">Hacker de Dados</option>
            <option value="Hacker de Suporte">Hacker de Suporte</option>
            <option value="Hacker de Defesa">Hacker de Defesa</option>
        </select><br>
        <p style="font-size: 0.9em; margin-top: 10px; color: #aaa;">
            **Infiltração:** Furtividade e acesso.<br>
            **Dados:** Enigmas e manipulação de rede.<br>
            **Suporte:** Resistência e recuperação.<br>
            **Defesa:** Combate e proteção.
        </p>

        <button id="iniciarAventuraBtn">Iniciar a Imersão</button>
    `;

    document.getElementById('iniciarAventuraBtn').onclick = () => {
        const nickname = document.getElementById('nicknameInput').value;
        const classe = document.getElementById('classeSelect').value;

        if (nickname.trim() === '') {
            exibirMensagem('Por favor, defina seu Nickname antes de mergulhar nas sombras.', 'alert');
            return;
        }

        player.nickname = nickname;
        player.classe = classe;

        // Resetar atributos globais para seus valores base antes de aplicar bônus de classe
        vida = 100;
        forca = 10;
        mana = 10; // Mana máxima 50
        inventario = []; // Limpa o inventário para um novo jogo

        // Aplicar bônus de classe
        switch (player.classe) {
            case 'Hacker de Infiltração':
                forca += 5; // Mais força para ações físicas/furtivas
                adicionarItemInventario('Kit de Lockpick Digital'); // Item inicial
                exibirMensagem('Hacker de Infiltração: Furtividade aprimorada e um Kit de Lockpick Digital!', 'info');
                break;
            case 'Hacker de Dados':
                mana += 5; // Mais mana para enigmas de dados
                adicionarItemInventario('Decodificador Portátil'); // Item inicial
                exibirMensagem('Hacker de Dados: Mente afiada e um Decodificador Portátil para os segredos da rede!', 'info');
                break;
            case 'Hacker de Suporte':
                vida += 10; // Mais vida para durabilidade
                adicionarItemInventario('Kit de Primeiros Socorros Digital'); // Item inicial
                exibirMensagem('Hacker de Suporte: Resiliência reforçada e um Kit de Primeiros Socorros Digital!', 'info');
                break;
            case 'Hacker de Defesa':
                vida += 10; // Mais vida para durabilidade
                forca += 2; // Um pouco mais de força para defesa
                adicionarItemInventario('Escudo de Firewall Portátil'); // Item inicial
                exibirMensagem('Hacker de Defesa: Resistência inabalável, Força extra e um Escudo de Firewall Portátil!', 'info');
                break;
        }
        player.forca = forca; // Atualiza o objeto player com os novos atributos
        player.mana = mana;

        exibirMensagem(`Bem-vindo(a), ${player.nickname} (${player.classe})! Sua jornada nas sombras começa agora.`, 'info');
        irParaFase(1);
    };
}

// Fase 1: Menu Principal
function renderizarMenuPrincipal() {
    pararMensagensSubliminares(); // Garante que não haja mensagens subliminares aqui
    gameTitle.textContent = '🌌 Rede Principal: Alasca Digital 🌌';
    // Nova imagem de fundo para o menu principal: cidade cibernética sombria/futurista
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/vHqJ6wI.jpeg")'; // Exemplo: cityscape futurista noturna com neon
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'block'; // Mostra o ranking

    gameScreen.innerHTML = `
        <p>Abrace a escuridão do RPG Folclore Hacker - Jornada no Alasca!</p>
        <button onclick="irParaFase(2); iniciarMensagensSubliminares();">Iniciar Nova Infiltração</button>
        <button onclick="exibirRegrasObjetivosMissoes()">Protocolos, Objetivos e Missões</button>
        <button onclick="gerenciarInventario(1)">Gerenciar Equipamentos</button>
        <button onclick="exibirMensagem('Funcionalidade ainda não implementada.', 'info')">Continuar Infiltração</button>
        <button onclick="atualizarDisplayRanking(); exibirMensagem('Ranking dos Desbravadores atualizado!', 'info')">Ver Registro de Elite</button>
    `;
    ambientSound.play();
    atualizarDisplayRanking(); // Atualiza o ranking ao entrar no menu
}

// Função para exibir as abas de Regras, Objetivos e Missões
function showTab(tabId) {
    const tabs = ['regras', 'objetivos', 'missoes'];
    tabs.forEach(tab => {
        document.getElementById(`${tab}Content`).classList.remove('active');
        document.querySelector(`.tab-button[onclick="showTab('${tab}')"]`).classList.remove('active');
    });
    document.getElementById(`${tabId}Content`).classList.add('active');
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

function exibirRegrasObjetivosMissoes() {
    pararMensagensSubliminares(); // Garante que não haja mensagens subliminares aqui
    gameTitle.textContent = 'Informações do Jogo';
    gameScreen.innerHTML = '';
    gameScreen.style.backgroundImage = 'none'; // Sem imagem aqui
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    rankingDisplay.style.display = 'none';

    regrasObjetivosMissoesContainer.style.display = 'block';
    showTab('regras'); // Abre a aba de regras por padrão

    // --- REGRAS DO JOGO DEFINIDAS AQUI ---
    regrasContent.innerHTML = `
        <h4>Regras Básicas:</h4>
        <ul>
            <li>**Seu objetivo:** Desvendar o mistério e resgatar o folclore digital das garras da corrupção.</li>
            <li>**Vida (HP):** Sua barra de vida. Diminui com escolhas erradas, confrontos e perigos da rede. Se chegar a zero, a **escuridão digital** o consome, e é Game Over.</li>
            <li>**Força:** Capacidade de superar desafios físicos ou que exigem impacto direto no mundo digital, como quebrar firewalls ou lidar com entidades agressivas.</li>
            <li>**Mana:** Sua energia mental e digital. Essencial para decifrar enigmas complexos, usar habilidades especiais e navegar por dados corrompidos.</li>
            <li>**Reputação:** Seu prestígio no submundo hacker. Aumenta com sucessos e escolhas sábias, e é fundamental para o seu lugar no Ranking dos Desbravadores.</li>
            <li>**Inventário:** Colete itens dispersos na rede. Eles podem ser consumidos para restaurar atributos ou usados para auxiliar em missões. Gerencie-o com cautela.</li>
            <li>**Escolhas e Consequências:** Cada decisão molda sua jornada. Escolhas impensadas podem ter resultados catastróficos, enquanto a sagacidade o levará à verdade.</li>
            <li>**Eventos Inesperados:** O Alasca digital é imprevisível. Eventos aleatórios podem surgir entre as fases, oferecendo tanto perigos quanto oportunidades.</li>
            <li>**Dicas Sombrias:** Se a escuridão o cercar em um enigma, um botão de dica pode surgir. Usá-lo custará um fragmento de sua vida, mas pode iluminar o caminho.</li>
        </ul>
        <h4>Classes e Vantagens:</h4>
        <ul>
            <li>**Hacker de Infiltração:** Foco em furtividade e acesso. (+5 Força, começa com Kit de Lockpick Digital). Ideal para bypasses e movimentos sorrateiros.</li>
            <li>**Hacker de Dados:** Foco em decifração e análise. (+5 Mana, começa com Decodificador Portátil). Mestre em enigmas lógicos e manipulação de informações.</li>
            <li>**Hacker de Suporte:** Foco em durabilidade e recuperação. (+10 Vida, começa com Kit de Primeiros Socorros Digital). Robusto e com capacidade de prolongar a jornada.</li>
            <li>**Hacker de Defesa:** Foco em resistência e contra-ataque. (+10 Vida, +2 Força, começa com Escudo de Firewall Portátil). Perfeito para absorver danos e lutar.</li>
        </ul>
    `;

    objetivosContent.innerHTML = `
        <h4>Objetivo Principal:</h4>
        <p>Aprofundar-se nos recessos do Alasca digital para descobrir quem está por trás do roubo e corrupção dos dados do Folclore Digital, e restaurar a verdade!</p>
    `;
    missoesContent.innerHTML = `
        <h4>Missões Atuais:</h4>
        <p>A cada passo nas sombras, uma nova verdade se revela. Sua jornada é uma teia de mistérios:</p>
        <ul>
            <li>**Fase 2:** Encontrar o ponto de entrada inicial: a cabana esquecida.</li>
            <li>**Fase 3:** Decifrar os sussurros binários da floresta gélida.</li>
            <li>**Fase 4:** Infiltrar-se na cabana para desenterrar as primeiras pistas.</li>
            <li>**Fase 5:** Confrontar o Saci Crackudo e recuperar o Módulo de Dados.</li>
            <li>**Fase 6:** Infiltrar-se na Base Militar Abandonada, um ninho de segredos.</li>
            <li>**Fase 7:** Ativar o Laboratório Subterrâneo e confrontar Monark.</li>
            <li>**Fase 8:** Desvendar o enigma da Curupira Hacker para abrir novos caminhos.</li>
            <li>**Fase 9:** Navegar pelas ilusões do Boto Cor-de-Rosa Digital.</li>
            <li>**Fase 10:** Infiltrar-se na Fortaleza de Gelo, o covil da Cuca.</li>
            <li>**Fase 11:** Confronto final com a Cuca e resgate dos dados.</li>
            <li>**Fase 12:** Vitória ou o fim sombrio da sua jornada.</li>
        </ul>
    `;

    const oldBackButton = regrasObjetivosMissoesContainer.querySelector('button');
    if (oldBackButton) oldBackButton.remove();

    const backButton = document.createElement('button');
    backButton.textContent = 'Retornar à Rede Principal';
    backButton.onclick = () => {
        regrasObjetivosMissoesContainer.style.display = 'none';
        renderizarMenuPrincipal();
    };
    regrasObjetivosMissoesContainer.appendChild(backButton);
}


// Fase 2: A Chegada Gélida (com enigma)
function renderizarFase2() {
    gameTitle.textContent = 'Fase 2: A Chegada Gélida';
    // Imagem para Fase 2: Paisagem de Alasca com elementos de interface de usuário embaçados
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/k6lP0Jg.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares(); // Inicia as mensagens subliminares

    gameScreen.innerHTML = `
        <p>Você aterrissou em uma clareira isolada no coração gelado do Alasca digital. O frio é cortante, e a neve cobre a paisagem com uma aura de segredo. Em seu dispositivo, um bilhete enigmático pisca. Ele parece conter as primeiras coordenadas para a cabana.</p>
        <p><b>Bilhete Cifrado:</b> "No gelo onde sussurros ecoam, a **cabana antiga** guarda o segredo. A rede te espera, mas o tempo é curto."</p>
        <p>Como você irá decifrar esta mensagem?</p>
    `;
    exibirEscolhas([
        {
            texto: 'Tentar decifrar o bilhete manualmente.',
            acao: () => {
                const resposta = prompt('Qual a palavra-chave que indica o seu destino? (Duas palavras)').toLowerCase();
                if (resposta === 'cabana antiga') {
                    exibirMensagem('Correto! A verdade se revela. O bilhete se desintegra em partículas digitais no ar. (+5 Reputação)', 'success');
                    reputacao += 5;
                    irParaFase(3);
                } else {
                    exibirMensagem('Incorreto. A mensagem permanece obscura. Você sente o tempo e a vida escaparem enquanto tenta em vão.', 'alert');
                    vida -= 10;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Ignorar o bilhete e seguir em frente aleatoriamente. (-20 Vida)',
            acao: () => {
                vida -= 20;
                exibirMensagem('Você se aventura sem rumo, perdido(a) na vastidão gélida, até perceber que precisa de um plano.', 'alert');
                atualizarHUD();
                irParaFase(3);
            }
        },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual) // Permite gerenciar inventário na fase atual
        }
    ]);
    adicionarBotaoDica('A chave para o segredo está visível, mas pode estar oculta em plena vista. Preste atenção nas palavras destacadas.');
}

// Fase 3: Floresta Sombria e Gélida (com enigma binário)
function renderizarFase3() {
    gameTitle.textContent = 'Fase 3: Floresta Sombria e Gélida';
    // Imagem para Fase 3: Floresta escura com neve e distorções digitais sutis
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/rS2XnQy.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você adentra uma floresta digitalmente densa, onde árvores de dados retorcidos se estendem para o céu noturno. O ar é pesado e um sussurro gélido parece vir de todas as direções, formando uma sequência binária que se repete como um eco distorcido na rede.</p>
        <p><b>Sussurro Etéreo:</b> "01001000 01100001 01100011 01101011"</p>
        <p>Qual a sua abordagem para este enigma digital?</p>
    `;
    exibirEscolhas([
        {
            texto: 'Tentar decifrar o código binário.',
            acao: () => {
                let sucesso = false;
                if (inventario.includes('Decodificador Portátil') || player.classe === 'Hacker de Dados') {
                    exibirMensagem('Seu Decodificador Portátil (ou sua inteligência nata de Hacker de Dados) corta o mistério. A palavra é "Hack". Uma conexão etérea com a rede se abre. (+10 Reputação)', 'success');
                    reputacao += 10;
                    adicionarItemInventario('Mensagem "Hack" Decifrada');
                    sucesso = true;
                } else {
                    const resposta = prompt('Qual a palavra em texto que o código binário revela? (Uma palavra)').toLowerCase();
                    if (resposta === 'hack' || player.mana >= 15) {
                        exibirMensagem('A névoa se dissipa. A palavra é "Hack". Você sentiu uma estranha conexão com os sussurros da rede local. (+5 Reputação)', 'success');
                        reputacao += 5;
                        adicionarItemInventario('Mensagem "Hack" Decifrada');
                        sucesso = true;
                    } else {
                        exibirMensagem('Você falha em decifrar a cacofonia binária. O sussurro zomba e a floresta te confunde mais, drenando sua essência. (-15 Vida)', 'alert');
                        vida -= 15;
                        atualizarHUD();
                    }
                }
                if (sucesso) {
                    irParaFase(4);
                }
            }
        },
        {
            texto: 'Ignorar o sussurro e buscar a cabana no escuro.',
            acao: () => {
                exibirMensagem('Você decide ignorar o eco digital, mas sente que uma peça vital da rede escapou de sua compreensão.', 'normal');
                irParaFase(4);
            }
        },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Consulte a tabela ASCII para converter binário em texto. Ou deixe suas ferramentas e sua classe fazerem o trabalho pesado.');
}

// Fase 4: A Cabana Antiga (com enigma do teclado)
function renderizarFase4() {
    gameTitle.textContent = 'Fase 4: A Cabana Antiga';
    // Imagem para Fase 4: Cabana escura na neve, com uma luz misteriosa vindo da porta
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/gK2J9Bf.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você finalmente encontra a cabana antiga, coberta por uma aura de obsolescência digital. A porta principal possui um teclado com uma sequência de números piscando e se auto-regenerando: <b>1, 2, 4, 7, 11, ?</b></p>
        <p>O que você faz para acessar os segredos lá dentro?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar inserir o próximo número na sequência.',
            acao: () => {
                let sucesso = false;
                if (player.classe === 'Hacker de Dados' || player.mana >= 20) { // Bônus para Hacker de Dados ou alta Mana
                    exibirMensagem('Sua mente analítica de Hacker de Dados (ou sua Mana elevada) detecta o padrão numérico sem falhas!', 'info');
                    sucesso = true;
                } else {
                    const resposta = prompt('Qual é o próximo número na sequência?').trim();
                    if (resposta === '16') {
                        sucesso = true;
                    }
                }

                if (sucesso) {
                    exibirMensagem('Um clique eletrônico ressoa e a porta range, revelando a escuridão convidativa da cabana. Você a desvendou! (+10 Reputação)', 'success');
                    reputacao += 10;
                    irParaFase(5);
                } else {
                    exibirMensagem('O alarme silencioso da cabana é ativado por um instante. Um pulso de energia te atinge e o teclado reinicia, zombando de sua falha.', 'alert');
                    vida -= 20;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Tentar forçar a entrada pela janela dos fundos.',
            acao: () => {
                let sucesso = false;
                if (inventario.includes('Kit de Lockpick Digital') || player.classe === 'Hacker de Infiltração' || player.forca >= 15) {
                    exibirMensagem('Com seu Kit de Lockpick Digital (ou sua Força/habilidade de Infiltração), a janela cede com um lamento eletrônico. Você desliza furtivamente para dentro! (+5 Reputação)', 'success');
                    reputacao += 5;
                    sucesso = true;
                } else {
                    exibirMensagem('A janela range e você faz barulho ao tentar forçar, atraindo a atenção de sistemas adormecidos e perdendo muita vida.', 'alert');
                    vida -= 30;
                    atualizarHUD();
                }
                if (sucesso) {
                    irParaFase(5);
                }
            }
        },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('A diferença entre os números aumenta sequencialmente: +1, +2, +3... E para entrar, talvez suas habilidades de Infiltração sejam o caminho mais suave.');
}

// Fase 5: O Encontro com o "Saci Crackudo" (com enigma de perseguição/decriptação)
function renderizarFase5() {
    gameTitle.textContent = 'Fase 5: O Encontro com o "Saci Crackudo"';
    // Imagem para Fase 5: Interior de cabana escura com vulto fugindo (foco no módulo de dados brilhante)
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/A6jZ4D1.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Ao adentrar a cabana, uma brisa gelada o envolve e você vislumbra um vulto ágil e pequeno, pulando em uma perna só. É o **Saci Crackudo**, uma projeção de gelo e fumaça digital! Ele arremessa algo brilhante no chão e tenta escapar pela chaminé.</p>
        <p>O objeto cintilante é um "Módulo de Dados Encriptado".</p>
        <p>Qual será seu próximo passo nesta confrontação inesperada?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar capturar o Saci Crackudo para interrogá-lo.',
            acao: () => {
                const sorte = Math.random();
                if (sorte > 0.6 || player.forca >= 15 || player.classe === "Hacker de Infiltração") { // Chance de capturar ou se Força/Infiltração for alta
                    exibirMensagem('Você é veloz e consegue imobilizar o Saci Crackudo por um instante! Ele murmura: "A verdade jaz onde o fluxo não congela..." antes de se dissolver, deixando o Módulo e uma Bateria de Energia. (+15 Reputação, +5 Força)', 'success');
                    reputacao += 15;
                    forca += 5;
                    player.forca = forca;
                    adicionarItemInventario('Sussurro do Saci Crackudo');
                    adicionarItemInventario('Módulo de Dados Encriptado');
                    adicionarItemInventario('Bateria de Energia');
                    atualizarHUD();
                    irParaFase(6);
                } else {
                    exibirMensagem('O Saci Crackudo é um borrão. Ele zomba enquanto desaparece na fumaça gélida, e você perde o rastro, sentindo-se exausto(a) e ludibriado(a). (-25 Vida, -5 Reputação)', 'alert');
                    vida -= 25;
                    reputacao -= 5;
                    atualizarHUD();
                    irParaFase(6); // Falhou em capturar, mas avança, sem o item/bônus
                }
            }
        },
        {
            texto: 'Pegar o "Módulo de Dados Encriptado" e tentar decifrá-lo imediatamente.',
            acao: () => {
                if (inventario.includes('Módulo de Dados Desencriptado')) {
                     exibirMensagem('Você já decifrou o Módulo. Siga em frente na sombra.', 'info');
                     irParaFase(6);
                     return;
                }
                exibirMensagem('Você pega o módulo. Uma tela holográfica surge e exige uma senha de 4 dígitos. Pense em algo que "abre" ou "desbloqueia" e é um valor comum em computação.', 'info');
                const senha = prompt('Digite a senha de 4 dígitos:');

                let sucesso = false;
                if (senha === '1024' || player.mana >= 15 || player.classe === "Hacker de Dados" || inventario.includes('Decodificador Portátil')) { // Senha ou atributos/item ajudam
                    sucesso = true;
                }

                if (sucesso) {
                    exibirMensagem('Acesso concedido! O módulo revela uma coordenada para uma "Base Militar Abandonada" e um diagrama de circuitos obscurecido. (+10 Reputação, +5 Mana)', 'success');
                    reputacao += 10;
                    mana = Math.min(50, mana + 5);
                    player.mana = mana;
                    adicionarItemInventario('Módulo de Dados Desencriptado');
                    adicionarItemInventario('Coordenada da Base');
                    adicionarItemInventario('Diagrama de Circuitos'); // Novo item útil para Fase 7
                    atualizarHUD();
                    irParaFase(6);
                } else {
                    exibirMensagem('Senha incorreta. O módulo trava e se torna inútil, drenando sua vida com um pulso de energia corrupta. (-15 Vida, -5 Reputação)', 'alert');
                    vida -= 15;
                    reputacao -= 5;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('A senha é uma potência de 2, fundamental em sistemas de computação. Ou talvez sua classe e ferramentas possam "forçar" a entrada digital.');
}


// Fase 6: Base Militar Abandonada (Exemplo de fase sem enigma direto, mas com escolha importante)
function renderizarFase6() {
    gameTitle.textContent = 'Fase 6: Base Militar Abandonada';
    // Imagem para Fase 6: Base militar sombria, coberta de neve e com iluminação fraca
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/k6KxT6L.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você chega a uma antiga base militar, um esqueleto de concreto e metal, coberta pela neve e pelo tempo. Parece desativada, mas a presença de sinais residuais de energia te alerta. Encontrar uma forma de penetrar sem ativar os sistemas de segurança adormecidos é crucial.</p>
        <p>Como você irá se infiltrar neste complexo silente?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Procurar por uma entrada de serviço oculta.',
            acao: () => {
                const chance = Math.random();
                // Hacker de Infiltração tem uma chance maior e não precisa de item
                if (chance > 0.4 || player.classe === "Hacker de Infiltração" || inventario.includes('Kit de Lockpick Digital')) {
                    exibirMensagem('Você encontra uma passagem secreta nos fundos da base, oculta pelas sombras! A entrada é discreta e leva diretamente para dentro, sem disparar alarmes. (+5 Reputação)', 'success');
                    reputacao += 5;
                    irParaFase(7);
                } else {
                    exibirMensagem('Você procura, mas apenas encontra paredes frias e seladas. Perde tempo e vida na busca frustrada.', 'alert');
                    vida -= 10;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Tentar arrombar a porta principal com força bruta.',
            acao: () => {
                vida -= 20;
                exibirMensagem('Você tenta forçar a porta, fazendo um ruído estrondoso. Ela cede com um rangido metálico, mas você atraiu a atenção dos sistemas de defesa adormecidos. (-10 Reputação)', 'alert');
                reputacao -= 10;
                atualizarHUD();
                irParaFase(7);
            }
        },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Habilidades de infiltração ou um item de arrombamento podem ser sua melhor aposta contra os guardiões silenciosos desta base.');
}

// Fase 7: Laboratório Subterrâneo (com enigma de conexão de circuitos) - Monark, o Guardião da Rede
function renderizarFase7() {
    gameTitle.textContent = 'Fase 7: Laboratório Subterrâneo Oculto';
    // Imagem para Fase 7: Laboratório escuro com equipamentos antigos e brilhos neon distorcidos
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/eE1Xv2Y.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você está em um laboratório subterrâneo, escuro e gelado. No centro, um dispositivo de pesquisa antigo pulsa com uma energia residual sinistra. Para acessá-lo, você precisa conectar os circuitos corretamente em um painel obscuro.</p>
        <p>Enquanto examina o painel, uma figura encapuzada emerge das sombras, sua voz ecoando com autoridade: "Quem ousa invadir o domínio dos Guardiões da Rede?" É **Monark, o Guardião da Rede**!</p>
        <p>Como você irá lidar com esta presença enigmática?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar conversar com Monark, o Guardião da Rede.',
            acao: () => {
                gameScreen.innerHTML = `
                    <p>Você decide tentar uma abordagem pacífica, uma negociação na escuridão.</p>
                `;
                if (reputacao >= 30) {
                    gameScreen.innerHTML += `
                        <p class="success">Monark observa sua aura de reputação, um brilho de reconhecimento em seus olhos sombrios. "Sua presença aqui não é a de um invasor comum. Prossiga com a ativação do painel, mas esteja ciente: a verdade é mais complexa do que você imagina." Ele se dissolve nas sombras. (+10 Reputação)</p>
                    `;
                    reputacao += 10;
                    atualizarHUD();
                    setTimeout(() => tentarAtivarPainel(), 2000); // Avança para o enigma
                } else if (player.classe === 'Hacker de Suporte') {
                    gameScreen.innerHTML += `
                        <p class="info">Sua classe de Hacker de Suporte emite uma frequência de estabilidade. Monark parece suavizar. "Seja rápido. Não temos tempo para intrusos lentos." Ele te dá um aviso e se retira para as profundezas. (+5 Mana)</p>
                    `;
                    mana = Math.min(50, mana + 5);
                    player.mana = mana;
                    atualizarHUD();
                    setTimeout(() => tentarAtivarPainel(), 2000);
                }
                else {
                    gameScreen.innerHTML += `
                        <p class="alert">Monark não se convence. "Intruso! Sua presença é uma ameaça!" Ele o atinge com um pulso de dados corruptos, drenando sua vitalidade. (-20 Vida, -10 Reputação)</p>
                    `;
                    vida -= 20;
                    reputacao -= 10;
                    atualizarHUD();
                    setTimeout(() => tentarAtivarPainel(), 2000); // Ainda precisa resolver o enigma
                }
            }
        },
        {
            texto: 'Ignorar Monark e ir direto para o painel de circuitos.',
            acao: () => {
                gameScreen.innerHTML = `
                    <p>Você ignora a figura sombria. Ele bufa e o atinge com um feixe de dados gélido. (-15 Vida)</p>
                `;
                vida -= 15;
                atualizarHUD();
                setTimeout(() => tentarAtivarPainel(), 2000); // Ainda precisa resolver o enigma
            }
        },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);

    function tentarAtivarPainel() {
        gameScreen.innerHTML = `
            <p>O painel tem três cabos (Vermelho, Azul, Verde) e três portas (A, B, C).</p>
            <p><b>Dica do painel, gravada em luzes tremeluzentes:</b> "O vermelho sempre vai antes do verde, e o azul nunca é o primeiro, mas o verde é o último."</p>
            ${inventario.includes('Diagrama de Circuitos') ? '<p class="info-text">Seu Diagrama de Circuitos emite um brilho fraco, traçando a sequência correta. A luz guia sua mente através da escuridão dos fios.</p>' : ''}
            <p>Qual a ordem sombria dos cabos nas portas? (Ex: Vermelho-Azul-Verde ou V-Az-Ve)</p>
        `;
        exibirEscolhas([
            {
                texto: 'Tentar a combinação de circuitos.',
                acao: () => {
                    let sucesso = false;
                    if (inventario.includes('Diagrama de Circuitos') || player.classe === 'Hacker de Dados' || player.mana >= 25) { // Item ou atributos ajudam
                        exibirMensagem('O Diagrama de Circuitos (ou sua inteligência de Hacker de Dados/Mana) revela a sequência perfeita, as conexões se encaixam com um zumbido sinistro!', 'info');
                        sucesso = true;
                    } else {
                        const combinacaoInput = prompt('Digite a ordem dos cabos, separados por hífen (V-Az-Ve):');
                        if (!combinacaoInput) {
                            exibirMensagem('Operação cancelada. A energia do painel oscila, mantendo seus segredos.', 'info');
                            return;
                        }
                        const combinacao = combinacaoInput.toLowerCase().split('-');

                        if (combinacao.length === 3 &&
                            (combinacao[0] === 'v' || combinacao[0] === 'vermelho') &&
                            (combinacao[1] === 'az' || combinacao[1] === 'azul') &&
                            (combinacao[2] === 've' || combinacao[2] === 'verde')) {
                            sucesso = true;
                        }
                    }

                    if (sucesso) {
                        exibirMensagem('Os circuitos se conectam, e o dispositivo se ilumina com uma luz fantasmagórica! Uma tela holográfica exibe informações sobre uma seita hacker sombria: os "Guardiões do Folclore". (+20 Reputação, +5 Mana)', 'success');
                        reputacao += 20;
                        mana = Math.min(50, mana + 5);
                        player.mana = mana;
                        adicionarItemInventario('Dados da Organização "Guardiões do Folclore"');
                        atualizarHUD();
                        irParaFase(8);
                    } else {
                        exibirMensagem('Um choque elétrico! Os circuitos se sobrecarregam e você sente a dor digital. O painel volta ao seu estado original, zombando de sua falha. (-25 Vida)', 'alert');
                        vida -= 25;
                        atualizarHUD();
                    }
                }
            },
            {
                texto: 'Desistir e procurar outro caminho na escuridão.',
                acao: () => {
                    exibirMensagem('Você decide não arriscar mais a vida nos circuitos, sentindo que perdeu uma peça vital do quebra-cabeça.', 'normal');
                    irParaFase(8);
                }
            },
            {
                texto: 'Gerenciar Equipamentos',
                acao: () => gerenciarInventario(faseAtual)
            }
        ]);
        adicionarBotaoDica('Pense na lógica sequencial. O verde é o final, o azul não é o começo. Seus diagramas ou intuição de dados são cruciais.');
    }
}


// Fase 8: O Enigma da Curupira Hacker (Enigma de lógica)
function renderizarFase8() {
    gameTitle.textContent = 'Fase 8: O Enigma da Curupira Hacker';
    // Imagem para Fase 8: Floresta distorcida com códigos e uma figura etérea da Curupira
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/eH2qX8d.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você encontra uma projeção etérea da **Curupira Hacker**, mas seus olhos brilham com códigos binários sinistros. Ela te desafia com um enigma para abrir um portal para a próxima dimensão da rede, onde ela escondeu uma parte do folclore digital.</p>
        <p><b>Enigma da Curupira, sussurrado em seu subconsciente:</b></p>
        <p>"Qual código abre as portas da floresta digital, onde os dados dançam e a verdade se oculta?</p>
        <p>Não é chave, nem senha, mas uma **diretriz** que o sistema aceita.</p>
        <p>Começa com 'C' e termina com 'O'."</p>
        <p>Como você irá decifrar esta charada sombria?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar a resposta do enigma.',
            acao: () => {
                let sucesso = false;
                if (player.classe === 'Hacker de Dados' || player.mana >= 20) { // Bônus para Hacker de Dados ou alta Mana
                    exibirMensagem('Sua mente de Hacker de Dados (ou sua alta Mana) desvenda a charada sem esforço, a verdade surge da neblina.', 'info');
                    sucesso = true;
                } else {
                    const resposta = prompt('Qual é a diretriz?').toLowerCase();
                    if (resposta === 'comando') {
                        sucesso = true;
                    }
                }

                if (sucesso) {
                    exibirMensagem('O portal se abre com um zumbido arrepiante, revelando uma paisagem distorcida de dados e luzes espectrais! A Curupira Hacker acena com a cabeça em aprovação e concede acesso. (+20 Reputação, +5 Mana)', 'success');
                    reputacao += 20;
                    mana = Math.min(50, mana + 5);
                    player.mana = mana;
                    atualizarHUD();
                    irParaFase(9);
                } else {
                    exibirMensagem('O portal se distorce violentamente e você é arremessado para um loop de anúncios incessantes, perdendo tempo e vida. A Curupira Hacker ri com uma voz digital distorcida.', 'alert');
                    vida -= 30;
                    reputacao -= 10;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Tentar forçar o portal com um brute force.',
            acao: () => {
                vida -= 40;
                exibirMensagem('A Curupira Hacker ri. Seu brute force é inútil contra a magia digital dela. O portal o arremessa para a frente, mas você sente o impacto e a exaustão dominá-lo. (-10 Reputação)', 'alert');
                reputacao -= 10;
                atualizarHUD();
                irParaFase(9);
            }
        },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Pense em termos de programação ou sistemas operacionais. Sua classe ou mana podem ser sua chave! Começa com "C" e termina com "O".');
}

// Fase 9: A Realidade Distorcida (Boto Cor-de-Rosa Digital) (Enigma de percepção/ilusão)
function renderizarFase9() {
    gameTitle.textContent = 'Fase 9: A Realidade Distorcida';
    // Imagem para Fase 9: Cenário de dados distorcidos, com um brilho rosa pálido e formas fugidias
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/k9bT6E2.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você entra em uma dimensão onde a realidade é fluida e distorcida, como um sonho corrompido. Imagens piscam, sons se misturam em uma cacofonia digital. Uma figura elegante, com traços de **Boto Cor-de-Rosa digital**, aparece e desaparece, tecendo ilusões para te desorientar.</p>
        <p>Para escapar, você deve identificar a **única imagem real** em meio a quatro ilusões. O Boto testará sua percepção digital. Olhe bem, a verdade está oculta na anomalia:</p>
        <p>1. Uma floresta de bytes cintilantes, com árvores feitas de código.</p>
        <p>2. Um terminal de computador flutuante, com a tela mostrando o pôr do sol do Alasca.</p>
        <p>3. Uma aurora boreal dançando ao som de códigos, com um pequeno **símbolo de uma chave** de fenda digital escondido nela.</p>
        <p>4. Uma cidade futurista construída com circuitos, flutuando no vazio.</p>
        <p>Qual das opções representa a realidade, indicando a saída deste pesadelo digital?</p>
    `;

    function verificarIlusao(escolha) {
        if (escolha === '3') {
            exibirMensagem('A ilusão se desfaz, revelando o caminho para a Fortaleza de Gelo! Você percebeu a sutileza do Boto Cor-de-Rosa digital em meio ao caos digital, encontrando a anomalia na verdade. (+15 Reputação, +5 Mana)', 'success');
            reputacao += 15;
            mana = Math.min(50, mana + 5);
            player.mana = mana;
            atualizarHUD();
            irParaFase(10);
        } else {
            exibirMensagem('O Boto Cor-de-Rosa digital ri, e você se vê preso em um labirinto de ilusões, perdendo tempo e vida para se libertar do engano do espectro. (-20 Vida, -5 Reputacao)', 'alert');
            vida -= 20;
            reputacao -= 5;
            atualizarHUD();
        }
    }

    exibirEscolhas([
        { texto: 'Escolher a imagem 1 (Floresta de Bytes).', acao: () => verificarIlusao('1') },
        { texto: 'Escolher a imagem 2 (Terminal Flutuante).', acao: () => verificarIlusao('2') },
        { texto: 'Escolher a imagem 3 (Aurora com Símbolo).', acao: () => verificarIlusao('3') },
        { texto: 'Escolher a imagem 4 (Cidade de Circuitos).', acao: () => verificarIlusao('4') },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('A chave para a realidade está em algo familiar, mas com um detalhe sutil e prático. Procure por um objeto que simboliza "abrir" ou "consertar", mas que pareça deslocado.');
}


// Fase 10: A Fortaleza do Gelo (Cuca) (Enigma de stealth/lógica)
function renderizarFase10() {
    gameTitle.textContent = 'Fase 10: A Fortaleza do Gelo Infame';
    // Imagem para Fase 10: Fortaleza de gelo imponente e escura, com sentinelas digitais piscando
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/L7pY6H8.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você se depara com a Fortaleza do Gelo, uma estrutura imponente e gélida que pulsa com energia corrompida. É defendida por sentinelas de gelo digital que patrulham incessantemente seus perímetros, suas luzes varrendo a escuridão. A **Cuca**, em sua forma digital, parece estar dentro, manipulando os dados roubados do Folclore.</p>
        <p>Para entrar sem ser detectado, você precisa encontrar um padrão nos movimentos dos sentinelas e se mover no momento exato.</p>
        <p>Eles se movem em um padrão de 3-2-1-3-2-1 segundos (3 segundos visível em patrulha, 2 segundos escondido atrás de barreiras de gelo, 1 segundo em alerta, e o padrão se repete).</p>
        <p>Qual o momento ideal para passar pela entrada principal sem ser notado(a) pelos olhos digitais da fortaleza?</p>
    `;

    function tentarEntrada(momento) {
        let sucesso = false;
        if (momento === 'escondido') {
            if (player.classe === "Hacker de Infiltração" || player.forca >= 20 || inventario.includes('Kit de Lockpick Digital')) {
                exibirMensagem('Sua habilidade de infiltração (ou sua Força/Kit de Lockpick) permite que você se mova com precisão cirúrgica e deslize furtivamente para a fortaleza. A Cuca não faz ideia de sua presença! (+25 Reputação)', 'success');
                reputacao += 25;
                sucesso = true;
            } else {
                exibirMensagem('Você escolhe o momento certo, mas sua agilidade não é suficiente. A sentinela o detecta no último instante, mas você consegue invadir, embora com o custo de um choque. (-15 Vida, -5 Reputação)', 'normal');
                vida -= 15;
                reputacao -= 5;
                sucesso = true; // Ainda entra, mas com custo
            }
        } else {
            exibirMensagem('Você foi detectado! As sentinelas ativam alarmes e você precisa lutar para abrir caminho, sofrendo danos consideráveis! Um grito digital ecoa. (-35 Vida, -15 Reputação)', 'alert');
            vida -= 35;
            reputacao -= 15;
            attackSound.play();
        }
        atualizarHUD();
        if (sucesso) {
            irParaFase(11);
        }
    }

    exibirEscolhas([
        { texto: 'Passar nos 3 segundos visíveis (risco extremo).', acao: () => tentarEntrada('visivel') },
        { texto: 'Passar nos 2 segundos escondidos (furtividade máxima).', acao: () => tentarEntrada('escondido') },
        { texto: 'Passar no 1 segundo em alerta (risco perigoso).', acao: () => tentarEntrada('alerta') },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Um verdadeiro hacker se move quando a sombra é mais densa, quando o inimigo não está em alerta, mas sim oculto. Suas habilidades ou itens podem ser sua vantagem decisiva.');
}


// Fase 11: O Chefão Final (Cuca) (Batalha/Enigma Final)
function renderizarFase11() {
    gameTitle.textContent = 'Fase 11: Confronto Final com a Cuca Digital';
    // Imagem para Fase 11: Cuca como uma entidade digital colossal, com dados corrompidos ao redor, em um ambiente de batalha sombrio e gelado
    gameScreen.style.backgroundImage = 'url("https://i.imgur.com/E9t3M5n.jpeg")';
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>A **Cuca** surge diante de você, uma entidade colossal de dados corrompidos e gelo digital. Seus olhos brilham com uma malícia antiga e as informações roubadas pulsam caoticamente ao seu redor.</p>
        <p>"Você chegou longe, hackerzinho(a), mas este é o fim da linha! Eu tenho os dados do Folclore Digital, e ninguém vai me impedir de reescrever a realidade!"</p>
        <p>Para derrotá-la, você precisa desvendar a **fraqueza do algoritmo** dela e aplicar o comando certo para desintegrá-la.</p>
        <p>Dica: O algoritmo dela é forte contra força bruta, mas incrivelmente fraco contra a **lógica invertida**, pois isso bagunça seus próprios dados. Você tem alguma ferramenta ou conhecimento para aplicar isso?</p>
        <p>Qual comando você usa para atacar esta abominação digital?</p>
    `;

    function atacarCuca(ataque) {
        let sucesso = false;
        if (ataque === 'logica_invertida') {
            if (inventario.includes('Algoritmo de Inversão') || player.classe === 'Hacker de Dados' || player.mana >= 30) {
                exibirMensagem('O comando de inversão lógica (ou seu Algoritmo de Inversão/Mana) atinge o ponto fraco do algoritmo da Cuca! Ela grita em uma linguagem binária distorcida enquanto seus dados começam a se desintegrar. Os fragmentos do Folclore Digital se reformam! (+50 Reputação, +10 Mana)', 'success');
                reputacao += 50;
                mana = Math.min(50, mana + 10);
                player.mana = mana;
                adicionarItemInventario('Dados do Folclore Digital Recuperados');
                sucesso = true;
            } else {
                exibirMensagem('Você tenta o comando de inversão lógica, mas não tem o poder ou a ferramenta para executá-lo completamente. A Cuca te atinge com um pulso de congelamento de dados, drenando sua vida. (-30 Vida, -10 Reputação)', 'alert');
                vida -= 30;
                reputacao -= 10;
            }
        } else if (ataque === 'forca') {
            exibirMensagem('Seu ataque bruto é absorvido pela armadura de dados da Cuca. Ela contra-ataca com um pulso eletromagnético devastador! A dor é aguda. (-40 Vida, -20 Reputação)', 'alert');
            vida -= 40;
            reputacao -= 20;
            attackSound.play();
        } else if (ataque === 'distracao') {
            exibirMensagem('A Cuca mal percebe sua distração e lança uma barreira de gelo digital, que o atinge de raspão. Não é suficiente para enganar esta entidade. (-20 Vida, -10 Reputação)', 'normal');
            vida -= 20;
            reputacao -= 10;
        }
        atualizarHUD();
        if (sucesso) {
            irParaFase(12); // Vitória
        } else {
             // Se falhou e vida <= 0, game over será chamado por atualizarHUD
             // Se falhou e vida > 0, o jogador pode tentar novamente com as mesmas opções
        }
    }

    exibirEscolhas([
        { texto: 'Comando de Ataque Bruto (FORCA_TOTAL)', acao: () => atacarCuca('forca') },
        { texto: 'Comando de Inversão Lógica (DECRYPT_ALGORITMO)', acao: () => atacarCuca('logica_invertida') },
        { texto: 'Comando de Distração (FALSO_POSITIVO)', acao: () => atacarCuca('distracao') },
        {
            texto: 'Gerenciar Equipamentos',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Se a fraqueza é a "lógica invertida", qual das opções de ataque reflete isso? Lembre-se, suas ferramentas e habilidades de dados são cruciais aqui.');

    // Adiciona o Algoritmo de Inversão no inventário para o teste funcionar, se ainda não tiver
    // if (!inventario.includes('Algoritmo de Inversão')) {
    //      adicionarItemInventario('Algoritmo de Inversão'); // Comentar em jogo final
    // }
}

// Fase 12: Fim da Jornada (Tela de Vitória/Game Over)
function renderizarFase12() {
    pararMensagensSubliminares(); // Para as mensagens subliminares no final do jogo
    gameTitle.textContent = 'Fase 12: O Legado do Hacker';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'block'; // Garante que o ranking aparece no final

    if (vida > 0) {
        // Nova imagem de fundo para a tela de vitória: algo mais sombrio, mas triunfante e cibernético
        gameScreen.style.backgroundImage = 'url("https://i.imgur.com/J3qE6jN.jpeg")'; // Exemplo: horizonte cibernético com feixe de luz
        gameScreen.style.backgroundSize = 'cover';
        gameScreen.style.backgroundPosition = 'center';
        gameScreen.innerHTML = `
            <p class="final-text">Parabéns, ${player.nickname}!</p>
            <p class="final-text">Você desvendou o mistério e salvou os dados do Folclore Digital no Alasca, expondo a Cuca e seus planos sombrios! Sua reputação como hacker atingiu **${reputacao}** pontos.</p>
            <p class="final-text">A rede agora está mais segura e o folclore, restaurado, graças à sua bravura nas sombras digitais!</p>
            <button onclick="reiniciarJogo()">Iniciar Nova Infiltração</button>
        `;
        salvarRanking(player.nickname, reputacao); // Salva a pontuação na vitória
    } else {
        // Se a vida já estiver zero, o gameOver já foi chamado
        // Este else é para garantir que o Game Over seja o estado final se a vida zerar aqui por algum motivo inesperado
        gameOver("Sua jornada terminou. A escuridão do Alasca digital o consumiu. Tente novamente para desvendar os mistérios.");
    }
}


// Mapeamento de fases
const fases = {
    0: renderizarCriacaoPersonagem,
    1: renderizarMenuPrincipal,
    2: renderizarFase2,
    3: renderizarFase3,
    4: renderizarFase4,
    5: renderizarFase5,
    6: renderizarFase6,
    7: renderizarFase7, // Fase com Monark, o Guardião da Rede
    8: renderizarFase8, // Fase com Curupira Hacker
    9: renderizarFase9, // Fase com Boto Cor-de-Rosa Digital
    10: renderizarFase10,
    11: renderizarFase11, // Fase com Cuca
    12: renderizarFase12,
};

// Renderiza a fase inicial
function renderizarFase(numeroFase) {
    if (fases[numeroFase]) {
        fases[numeroFase]();
    } else {
        gameOver("Erro Crítico: Dimensão de Fase Não Encontrada!");
    }
}

// Inicializar o jogo
function iniciarJogo() {
    renderizarFase(0); // Começa na tela de criação de personagem
    atualizarDisplayRanking(); // Carrega o ranking ao iniciar o jogo
}

// Inicializa o jogo ao carregar a página
document.addEventListener('DOMContentLoaded', iniciarJogo);
