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
    // Substitua esta URL pela URL da sua imagem de lanche open source
    const imageUrl = 'https://i.imgur.com/your-open-source-burger.png'; // <-- SUBSTITUA ESTA URL!
    const messages = [
        'COMA SEU LANCHE OPEN SOURCE',
        'ABRAÇO AOS CODERS LIVRES',
        'ALASCA: UM SABOR DIFERENTE',
        'O KERNEL SABE',
        'GLITCH É VIDA',
        'BATA UMA COXINHA',
        'CUIDADO COM AS FAKE NEWS DA CUCA',
        'SEMPRE HÁ UMA PORTA TRASEIRA'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    subliminarDiv.innerHTML = `<img src="${imageUrl}" alt="Lanche Open Source"><p>${randomMessage}</p>`;
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
        gameOver("Sua vida se esgotou. Você não conseguiu sobreviver ao Alasca digital.");
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
        // Chamar evento aleatório APENAS entre fases de jogo (não no menu ou game over)
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
    gameTitle.textContent = 'Evento Inesperado!';
    gameScreen.style.backgroundImage = 'none'; // Eventos sempre com fundo neutro
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'none';

    const eventos = [
        {
            nome: 'Falha de Sistema Súbita',
            descricao: 'Um pulso eletromagnético atinge seu sistema! Você perde um pouco de vida.',
            efeito: () => {
                vida -= 10;
                exibirMensagem('Perca de 10 Vida!', 'alert');
            }
        },
        {
            nome: 'Carga de Dados Perdida',
            descricao: 'Você encontra um pacote de dados criptografado. Ao decifrá-lo, ganha mana.',
            efeito: () => {
                mana = Math.min(50, mana + 15); // Garante que não ultrapasse 50 de mana
                player.mana = mana;
                exibirMensagem('Ganho de 15 Mana!', 'success');
            }
        },
        {
            nome: 'Armadilha Digital',
            descricao: 'Você pisa em uma armadilha de spam. Seus sentidos ficam confusos por um tempo.',
            efeito: () => {
                mana = Math.max(0, mana - 5);
                forca = Math.max(0, forca - 5);
                player.mana = mana;
                player.forca = forca;
                exibirMensagem('Perca de 5 Mana e 5 Força!', 'alert');
            }
        },
        {
            nome: 'Cache de Energia',
            descricao: 'Você encontra um cache de energia residual em um nó de rede antigo.',
            efeito: () => {
                adicionarItemInventario('Bateria de Energia');
                exibirMensagem('Você encontrou uma Bateria de Energia!', 'info');
            }
        },
        {
            nome: 'Informação Crítica',
            descricao: 'Um snippet de código aparece na sua tela: "A Cuca teme a luz do Kernel".',
            efeito: () => {
                reputacao += 5;
                exibirMensagem('Ganho de 5 Reputação! Nova dica sobre a Cuca!', 'info');
            }
        }
    ];

    const eventoEscolhido = eventos[Math.floor(Math.random() * eventos.length)];

    gameScreen.innerHTML = `
        <p><b>${eventoEscolhido.nome}:</b> ${eventoEscolhido.descricao}</p>
        <button id="continuarEventoBtn">Continuar</button>
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
        <button onclick="reiniciarJogo()">Reiniciar Jogo</button>
    `;
    gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/05/27/76/89/1000_F_527768925_kGqX2i9xU1j7pL9022G18bM6xX0Y1Y1q.jpg")'; // Fundo do menu ou similar para Game Over
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
    button.textContent = 'Mostrar Dica (-5 Vida)';
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
            exibirMensagem('Você não tem vida suficiente para pedir uma dica!', 'alert');
        }
    };
    gameScreen.appendChild(button);
    hintButtonElement = button; // Armazena a referência do botão
}


// --- Telas Específicas do Jogo ---

// Fase 0: Criação de Personagem
function renderizarCriacaoPersonagem() {
    pararMensagensSubliminares(); // Garante que não haja mensagens subliminares aqui
    gameTitle.textContent = 'Crie Seu Personagem Hacker';
    gameScreen.style.backgroundImage = 'none'; // Sem imagem de fundo aqui
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Prepare-se para a Jornada no Alasca Digital!</p>
        <label for="nicknameInput">Nickname:</label>
        <input type="text" id="nicknameInput" placeholder="Seu nome de hacker" maxlength="15" required><br>

        <label for="classeSelect">Classe:</label>
        <select id="classeSelect">
            <option value="Hacker de Infiltração">Hacker de Infiltração</option>
            <option value="Hacker de Dados">Hacker de Dados</option>
            <option value="Hacker de Suporte">Hacker de Suporte</option>
            <option value="Hacker de Defesa">Hacker de Defesa</option>
        </select><br>

        <button id="iniciarAventuraBtn">Iniciar Aventura</button>
    `;

    document.getElementById('iniciarAventuraBtn').onclick = () => {
        const nickname = document.getElementById('nicknameInput').value;
        const classe = document.getElementById('classeSelect').value;

        if (nickname.trim() === '') {
            exibirMensagem('Por favor, preencha seu Nickname.', 'alert');
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
                exibirMensagem('Hacker de Infiltração: +5 Força e um Kit de Lockpick Digital!', 'info');
                break;
            case 'Hacker de Dados':
                mana += 5; // Mais mana para enigmas de dados
                adicionarItemInventario('Decodificador Portátil'); // Item inicial
                exibirMensagem('Hacker de Dados: +5 Mana e um Decodificador Portátil!', 'info');
                break;
            case 'Hacker de Suporte':
                vida += 10; // Mais vida para durabilidade
                adicionarItemInventario('Kit de Primeiros Socorros Digital'); // Item inicial
                exibirMensagem('Hacker de Suporte: +10 Vida e um Kit de Primeiros Socorros Digital!', 'info');
                break;
            case 'Hacker de Defesa':
                vida += 10; // Mais vida para durabilidade
                forca += 2; // Um pouco mais de força para defesa
                adicionarItemInventario('Escudo de Firewall Portátil'); // Item inicial
                exibirMensagem('Hacker de Defesa: +10 Vida, +2 Força e um Escudo de Firewall Portátil!', 'info');
                break;
        }
        player.forca = forca; // Atualiza o objeto player com os novos atributos
        player.mana = mana;

        exibirMensagem(`Bem-vindo(a), ${player.nickname} (${player.classe})! Sua aventura começa agora.`, 'info');
        irParaFase(1);
    };
}

// Fase 1: Menu Principal
function renderizarMenuPrincipal() {
    pararMensagensSubliminares(); // Garante que não haja mensagens subliminares aqui
    gameTitle.textContent = '🌌 Menu Principal 🌌';
    gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/05/27/76/89/1000_F_527768925_kGqX2i9xU1j7pL9022G18bM6xX0Y1Y1q.jpg")'; // Imagem de cidade futurista para menu
    gameScreen.style.backgroundSize = 'cover';
    gameScreen.style.backgroundPosition = 'center';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'block'; // Mostra o ranking

    gameScreen.innerHTML = `
        <p>Bem-vindo(a) ao RPG Folclore Hacker - Jornada no Alasca!</p>
        <button onclick="irParaFase(2); iniciarMensagensSubliminares();">Nova Aventura</button>
        <button onclick="exibirRegrasObjetivosMissoes()">Regras, Objetivos e Missões</button>
        <button onclick="gerenciarInventario(1)">Gerenciar Inventário</button>
        <button onclick="exibirMensagem('Funcionalidade ainda não implementada.', 'info')">Continuar</button>
        <button onclick="atualizarDisplayRanking(); exibirMensagem('Ranking atualizado!', 'info')">Ver Ranking</button>
    `;
    ambientSound.play();
    atualizarDisplayRanking(); // Atualiza o ranking ao entrar no menu
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

    regrasContent.innerHTML = `
        <h4>Regras Básicas:</h4>
        <ul>
            <li>Gerencie sua vida: Cuidado com suas ações, pois algumas as diminuem.</li>
            <li>Suas escolhas importam: Elas afetarão sua reputação e o desenrolar da história.</li>
            <li>Força e Mana: Atributos que podem ajudar em certas situações.</li>
            <li>Resolva enigmas: Decifre códigos e charadas para avançar.</li>
            <li>Coleta itens: Seu inventário será útil em momentos chave.</li>
        </ul>
    `;
    objetivosContent.innerHTML = `
        <h4>Objetivo Principal:</h4>
        <p>Desvendar o mistério do desaparecimento dos dados cruciais do Folclore Digital no Alasca e expor o responsável!</p>
    `;
    missoesContent.innerHTML = `
        <h4>Missões Atuais:</h4>
        <p>A cada fase, uma nova missão se revela. Fique atento(a)!</p>
        <ul>
            <li>**Fase 2:** Encontrar a cabana antiga para iniciar sua investigação.</li>
            <li>**Fase 3:** Decifrar a mensagem oculta na floresta.</li>
            <li>**Fase 4:** Invadir a cabana para coletar pistas.</li>
            <li>...e muitos outros mistérios!</li>
        </ul>
    `;

    const oldBackButton = regrasObjetivosMissoesContainer.querySelector('button');
    if (oldBackButton) oldBackButton.remove();

    const backButton = document.createElement('button');
    backButton.textContent = 'Voltar ao Menu';
    backButton.onclick = () => {
        regrasObjetivosMissoesContainer.style.display = 'none';
        renderizarMenuPrincipal();
    };
    regrasObjetivosMissoesContainer.appendChild(backButton);
}


// Fase 2: A Chegada Gélida (com enigma)
function renderizarFase2() {
    gameTitle.textContent = 'Fase 2: A Chegada Gélida';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares(); // Inicia as mensagens subliminares

    gameScreen.innerHTML = `
        <p>Você aterrissou em uma clareira isolada no coração do Alasca. O frio é intenso, e a neve cobre tudo. No seu bolso, você encontra um bilhete enigmático. Ele parece conter as primeiras pistas sobre o paradeiro da cabana.</p>
        <p><b>Bilhete:</b> "No gelo onde sussurros ecoam, a **cabana antiga** guarda o segredo. A rede te espera, mas o tempo é curto."</p>
        <p>O que você faz?</p>
    `;
    exibirEscolhas([
        {
            texto: 'Tentar decifrar o bilhete.',
            acao: () => {
                const resposta = prompt('Qual a palavra-chave que indica o seu destino? (Duas palavras)').toLowerCase();
                if (resposta === 'cabana antiga') {
                    exibirMensagem('Correto! Você sabe onde ir. O bilhete se desintegra em partículas digitais. (+5 Reputação)', 'success');
                    reputacao += 5;
                    irParaFase(3);
                } else {
                    exibirMensagem('Incorreto. Você perde tempo e vida tentando entender o bilhete enigmático, mas ele não faz sentido ainda.', 'alert');
                    vida -= 10;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Ignorar o bilhete e seguir em frente aleatoriamente. (-20 Vida)',
            acao: () => {
                vida -= 20;
                exibirMensagem('Você se aventura sem rumo e gasta muita vida antes de decidir que precisa de um plano.', 'alert');
                atualizarHUD();
                irParaFase(3);
            }
        },
        {
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual) // Permite gerenciar inventário na fase atual
        }
    ]);
    adicionarBotaoDica('A resposta está destacada no próprio bilhete. Não pense demais!');
}

// Fase 3: Floresta Sombria e Gélida (com enigma binário)
function renderizarFase3() {
    gameTitle.textContent = 'Fase 3: Floresta Sombria e Gélida';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você adentra uma floresta densa. O ar é pesado e um sussurro gélido parece vir de todas as direções. Você percebe que o sussurro é, na verdade, uma sequência binária que se repete no ar, como um eco digital.</p>
        <p><b>Sussurro:</b> "01001000 01100001 01100011 01101011"</p>
        <p>O que você faz?</p>
    `;
    exibirEscolhas([
        {
            texto: 'Tentar decifrar o código binário.',
            acao: () => {
                let sucesso = false;
                if (inventario.includes('Decodificador Portátil') || player.classe === 'Hacker de Dados') {
                    exibirMensagem('Seu Decodificador Portátil (ou sua inteligência nata de Hacker de Dados) decifra o binário instantaneamente! A palavra é "Hack". (+10 Reputação)', 'success');
                    reputacao += 10;
                    adicionarItemInventario('Mensagem "Hack" Decifrada');
                    sucesso = true;
                } else {
                    const resposta = prompt('Qual a palavra em texto que o código binário revela? (Uma palavra)').toLowerCase();
                    if (resposta === 'hack' || player.mana >= 15) {
                        exibirMensagem('Bingo! A palavra é "Hack". Você sentiu uma conexão estranha com a rede local. (+5 Reputação)', 'success');
                        reputacao += 5;
                        adicionarItemInventario('Mensagem "Hack" Decifrada');
                        sucesso = true;
                    } else {
                        exibirMensagem('Você falha em decifrar. O sussurro parece zombeteiro e a floresta te confunde mais. (-15 Vida)', 'alert');
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
            texto: 'Ignorar o sussurro e buscar a cabana.',
            acao: () => {
                exibirMensagem('Você decide ignorar o sussurro, mas sente que perdeu algo importante no fluxo de dados da floresta.', 'normal');
                irParaFase(4);
            }
        },
        {
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Pesquise por "tabela ASCII binário" para converter a sequência. Ou confie em suas ferramentas!');
}

// Fase 4: A Cabana Antiga (com enigma do teclado)
function renderizarFase4() {
    gameTitle.textContent = 'Fase 4: A Cabana Antiga';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você finalmente encontra a cabana antiga. A porta principal tem um teclado digital com uma sequência de números piscando e se auto-regenerando: <b>1, 2, 4, 7, 11, ?</b></p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar inserir o próximo número na sequência.',
            acao: () => {
                let sucesso = false;
                if (player.classe === 'Hacker de Dados' || player.mana >= 20) { // Bônus para Hacker de Dados ou alta Mana
                    exibirMensagem('Sua mente analítica de Hacker de Dados (ou sua Mana elevada) detecta o padrão facilmente!', 'info');
                    sucesso = true;
                } else {
                    const resposta = prompt('Qual é o próximo número na sequência?').trim();
                    if (resposta === '16') {
                        sucesso = true;
                    }
                }

                if (sucesso) {
                    exibirMensagem('A porta se abre com um clique suave, revelando a escuridão da cabana. Você conseguiu! (+10 Reputação)', 'success');
                    reputacao += 10;
                    irParaFase(5);
                } else {
                    exibirMensagem('O alarme silencioso da cabana é ativado por um instante. Você perde vida e o teclado se reinicia.', 'alert');
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
                    exibirMensagem('Com seu Kit de Lockpick Digital (ou sua Força/habilidade de Infiltração), a janela cede silenciosamente. Você entra furtivamente! (+5 Reputação)', 'success');
                    reputacao += 5;
                    sucesso = true;
                } else {
                    exibirMensagem('A janela range e você faz barulho ao tentar forçar, perdendo muita vida. (-30 Vida)', 'alert');
                    vida -= 30;
                    atualizarHUD();
                }
                if (sucesso) {
                    irParaFase(5);
                }
            }
        },
        {
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('A diferença entre os números aumenta em 1 a cada passo: +1, +2, +3... Para a entrada, pense em ferramentas ou habilidades específicas.');
}

// Fase 5: O Encontro com o "Saci Crackudo" (com enigma de perseguição/decriptação)
function renderizarFase5() {
    gameTitle.textContent = 'Fase 5: O Encontro com o "Saci Crackudo"';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Ao entrar na cabana, você sente uma brisa gelada e vê um vulto ágil e pequeno, pulando em uma perna só. É o **Saci Crackudo**, mas este parece feito de gelo e fumaça digital! Ele joga algo brilhante no chão e tenta fugir pela chaminé.</p>
        <p>O objeto brilhante é um "Módulo de Dados Encriptado".</p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar capturar o Saci Crackudo para interrogá-lo.',
            acao: () => {
                const sorte = Math.random();
                if (sorte > 0.6 || player.forca >= 15 || player.classe === "Hacker de Infiltração") { // Chance de capturar ou se Força/Infiltração for alta
                    exibirMensagem('Você é rápido(a) e consegue imobilizar o Saci Crackudo por um breve momento! Ele resmunga: "A verdade está onde o fluxo não congela..." e desaparece, deixando o Módulo de Dados. (+15 Reputação, +5 Força)', 'success');
                    reputacao += 15;
                    forca += 5;
                    player.forca = forca;
                    adicionarItemInventario('Sussurro do Saci Crackudo');
                    adicionarItemInventario('Módulo de Dados Encriptado');
                    adicionarItemInventario('Bateria de Energia'); // Adiciona uma bateria aqui
                    atualizarHUD();
                    irParaFase(6);
                } else {
                    exibirMensagem('O Saci Crackudo é ágil demais! Ele ri e desaparece na fumaça gélida, e você perde o rastro, sentindo-se exausto(a). (-25 Vida, -5 Reputação)', 'alert');
                    vida -= 25;
                    reputacao -= 5;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Pegar o "Módulo de Dados Encriptado" e tentar decifrá-lo imediatamente.',
            acao: () => {
                if (inventario.includes('Módulo de Dados Desencriptado')) {
                     exibirMensagem('Você já decifrou o Módulo. Siga em frente.', 'info');
                     irParaFase(6);
                     return;
                }
                exibirMensagem('Você pega o módulo. Uma tela holográfica surge e pede uma senha de 4 dígitos. Pense em algo que "abre" ou "desbloqueia" e é um valor comum em computação.', 'info');
                const senha = prompt('Digite a senha de 4 dígitos:');

                let sucesso = false;
                if (senha === '1024' || player.mana >= 15 || player.classe === "Hacker de Dados" || inventario.includes('Decodificador Portátil')) { // Senha ou atributos/item ajudam
                    sucesso = true;
                }

                if (sucesso) {
                    exibirMensagem('Acesso concedido! O módulo revela uma coordenada para uma "Base Militar Abandonada" e um diagrama de circuitos. (+10 Reputação, +5 Mana)', 'success');
                    reputacao += 10;
                    mana = Math.min(50, mana + 5);
                    player.mana = mana;
                    adicionarItemInventario('Módulo de Dados Desencriptado');
                    adicionarItemInventario('Coordenada da Base');
                    adicionarItemInventario('Diagrama de Circuitos'); // Novo item útil para Fase 7
                    atualizarHUD();
                    irParaFase(6);
                } else {
                    exibirMensagem('Senha incorreta. O módulo trava e se torna inútil, drenando sua vida com um pulso de energia. (-15 Vida, -5 Reputação)', 'alert');
                    vida -= 15;
                    reputacao -= 5;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('A senha é uma potência de 2, fundamental em sistemas de computação (1KB, 2KB, 4KB, etc.). Sua classe ou ferramentas podem ajudar!');
}


// Fase 6: Base Militar Abandonada (Exemplo de fase sem enigma direto, mas com escolha importante)
function renderizarFase6() {
    gameTitle.textContent = 'Fase 6: Base Militar Abandonada';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você chega a uma antiga base militar, coberta pela neve e pelo tempo. Parece desativada, mas a presença de sinais residuais de energia te alerta. Encontrar uma forma de entrar sem ativar os sistemas de segurança adormecidos é crucial.</p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Procurar por uma entrada de serviço oculta.',
            acao: () => {
                const chance = Math.random();
                // Hacker de Infiltração tem uma chance maior e não precisa de item
                if (chance > 0.4 || player.classe === "Hacker de Infiltração" || inventario.includes('Kit de Lockpick Digital')) {
                    exibirMensagem('Você encontra uma passagem secreta nos fundos da base! A entrada é discreta e leva diretamente para dentro, sem disparar alarmes. (+5 Reputação)', 'success');
                    reputacao += 5;
                    irParaFase(7);
                } else {
                    exibirMensagem('Você procura, mas não encontra nada, apenas paredes frias. Perde tempo e vida na busca frustrada.', 'alert');
                    vida -= 10;
                    atualizarHUD();
                }
            }
        },
        {
            texto: 'Tentar arrombar a porta principal com força bruta.',
            acao: () => {
                vida -= 20;
                exibirMensagem('Você tenta forçar a porta, fazendo barulho. Ela cede com um rangido metálico, mas você atraiu alguma atenção dos sistemas adormecidos. (-10 Reputação)', 'alert');
                reputacao -= 10;
                atualizarHUD();
                irParaFase(7);
            }
        },
        {
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Habilidades de infiltração ou um item de arrombamento podem fazer a diferença aqui.'); // Exemplo de dica para escolha
}

// Fase 7: Laboratório Subterrâneo (com enigma de conexão de circuitos) - Monark, o Guardião da Rede
function renderizarFase7() {
    gameTitle.textContent = 'Fase 7: Laboratório Subterrâneo';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você está em um laboratório subterrâneo, escuro e frio. No centro, um dispositivo de pesquisa antigo pulsa com energia residual. Para acessá-lo, você precisa conectar os circuitos corretamente em um painel.</p>
        <p>Enquanto examina o painel, uma figura encapuzada emerge das sombras. "Quem ousa invadir o domínio dos Guardiões da Rede?", a voz ecoa. É **Monark, o Guardião da Rede**!</p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar conversar com Monark, o Guardião da Rede.',
            acao: () => {
                gameScreen.innerHTML = `
                    <p>Você decide tentar uma abordagem pacífica.</p>
                `;
                if (reputacao >= 30) {
                    gameScreen.innerHTML += `
                        <p class="success">Monark observa sua aura de reputação. "Sua presença aqui não é de um invasor comum. Prossiga com a ativação do painel, mas esteja ciente: a verdade é mais complexa do que você imagina." Ele se dissolve nas sombras. (+10 Reputação)</p>
                    `;
                    reputacao += 10;
                    atualizarHUD();
                    setTimeout(() => tentarAtivarPainel(), 2000); // Avança para o enigma
                } else if (player.classe === 'Hacker de Suporte') {
                    gameScreen.innerHTML += `
                        <p class="info">Sua classe de Hacker de Suporte ajuda a acalmar Monark. "Seja rápido. Não temos tempo para intrusos lentos." Ele te dá um aviso e se retira. (+5 Mana)</p>
                    `;
                    mana = Math.min(50, mana + 5);
                    player.mana = mana;
                    atualizarHUD();
                    setTimeout(() => tentarAtivarPainel(), 2000);
                }
                else {
                    gameScreen.innerHTML += `
                        <p class="alert">Monark não se convence. "Intruso! Sua presença é uma ameaça!" Ele o atinge com um pulso de dados corruptos. (-20 Vida, -10 Reputação)</p>
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
                    <p>Você ignora Monark. Ele bufa e o atinge com um feixe de dados. (-15 Vida)</p>
                `;
                vida -= 15;
                atualizarHUD();
                setTimeout(() => tentarAtivarPainel(), 2000); // Ainda precisa resolver o enigma
            }
        },
        {
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);

    function tentarAtivarPainel() {
        gameScreen.innerHTML = `
            <p>O painel tem três cabos (Vermelho, Azul, Verde) e três portas (A, B, C).</p>
            <p><b>Dica do painel:</b> "O vermelho sempre vai antes do verde, e o azul nunca é o primeiro, mas o verde é o último."</p>
            ${inventario.includes('Diagrama de Circuitos') ? '<p class="info-text">Seu Diagrama de Circuitos emite um brilho fraco, mostrando a sequência correta. Ele parece ajudar sua mente a processar a informação.</p>' : ''}
            <p>Qual a ordem dos cabos nas portas? (Ex: Vermelho-Azul-Verde ou V-Az-Ve)</p>
        `;
        exibirEscolhas([
            {
                texto: 'Tentar a combinação de circuitos.',
                acao: () => {
                    let sucesso = false;
                    if (inventario.includes('Diagrama de Circuitos') || player.classe === 'Hacker de Dados' || player.mana >= 25) { // Item ou atributos ajudam
                        exibirMensagem('O Diagrama de Circuitos (ou sua inteligência de Hacker de Dados/Mana) revela a sequência perfeita. Os circuitos se encaixam automaticamente!', 'info');
                        sucesso = true;
                    } else {
                        const combinacaoInput = prompt('Digite a ordem dos cabos, separados por hífen (V-Az-Ve):');
                        if (!combinacaoInput) {
                            exibirMensagem('Operação cancelada. A energia do painel oscila.', 'info');
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
                        exibirMensagem('Os circuitos se conectam, e o dispositivo se ilumina! Uma tela holográfica exibe informações sobre um grupo hacker chamado "Guardiões do Folclore". (+20 Reputação, +5 Mana)', 'success');
                        reputacao += 20;
                        mana = Math.min(50, mana + 5);
                        player.mana = mana;
                        adicionarItemInventario('Dados da Organização "Guardiões do Folclore"');
                        atualizarHUD();
                        irParaFase(8);
                    } else {
                        exibirMensagem('Um choque elétrico! Os circuitos se sobrecarregam e você perde vida. O painel volta ao seu estado original. (-25 Vida)', 'alert');
                        vida -= 25;
                        atualizarHUD();
                    }
                }
            },
            {
                texto: 'Desistir e procurar outra coisa.',
                acao: () => {
                    exibirMensagem('Você decide não arriscar mais a vida e segue em frente, mas a sensação de ter perdido informações importantes permanece.', 'normal');
                    irParaFase(8);
                }
            },
            {
                texto: 'Gerenciar Inventário',
                acao: () => gerenciarInventario(faseAtual)
            }
        ]);
        adicionarBotaoDica('Se o verde é o último, e o azul não é o primeiro, o vermelho deve ser o primeiro. Pense na lógica combinatória! Seu Diagrama de Circuitos pode ser útil.');
    }
}


// Fase 8: O Enigma da Curupira Hacker (Enigma de lógica)
function renderizarFase8() {
    gameTitle.textContent = 'Fase 8: O Enigma da Curupira Hacker';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você encontra uma projeção etérea da **Curupira Hacker**, mas seus olhos brilham com códigos binários. Ela te desafia com um enigma para abrir um portal para a próxima dimensão da rede, onde ela escondeu uma parte do folclore digital.</p>
        <p><b>Enigma da Curupira:</b></p>
        <p>"Qual código abre as portas da floresta digital, onde os dados dançam e a verdade se oculta?</p>
        <p>Não é chave, nem senha, mas uma **diretriz** que o sistema aceita.</p>
        <p>Começa com 'C' e termina com 'O'."</p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar a resposta do enigma.',
            acao: () => {
                let sucesso = false;
                if (player.classe === 'Hacker de Dados' || player.mana >= 20) { // Bônus para Hacker de Dados ou alta Mana
                    exibirMensagem('Sua mente de Hacker de Dados (ou sua alta Mana) permite que você intua a resposta correta sem esforço.', 'info');
                    sucesso = true;
                } else {
                    const resposta = prompt('Qual é a diretriz?').toLowerCase();
                    if (resposta === 'comando') {
                        sucesso = true;
                    }
                }

                if (sucesso) {
                    exibirMensagem('O portal se abre, revelando uma paisagem distorcida de dados e luzes! A Curupira Hacker acena com a cabeça em aprovação e concede acesso. (+20 Reputação, +5 Mana)', 'success');
                    reputacao += 20;
                    mana = Math.min(50, mana + 5);
                    player.mana = mana;
                    atualizarHUD();
                    irParaFase(9);
                } else {
                    exibirMensagem('O portal se distorce violentamente e você é redirecionado para um loop de anúncios incessantes, perdendo tempo e vida. A Curupira Hacker ri.', 'alert');
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
                exibirMensagem('A Curupira Hacker ri. Seu brute force é inútil contra a magia digital dela. O portal o arremessa para a frente, mas você sente o impacto e a exaustão. (-10 Reputação)', 'alert');
                reputacao -= 10;
                atualizarHUD();
                irParaFase(9);
            }
        },
        {
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Pense em termos de programação ou sistemas operacionais. Sua classe ou mana podem ser sua chave! A resposta começa com "C" e termina com "O".');
}

// Fase 9: A Realidade Distorcida (Boto Cor-de-Rosa Digital) (Enigma de percepção/ilusão)
function renderizarFase9() {
    gameTitle.textContent = 'Fase 9: A Realidade Distorcida';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você entra em uma dimensão onde a realidade é fluida e distorcida. Imagens piscam, sons se misturam. Uma figura elegante, com traços de **Boto Cor-de-Rosa digital**, aparece e desaparece, criando ilusões para te desorientar.</p>
        <p>Para escapar, você deve identificar a **única imagem real** em meio a quatro ilusões. O Boto testará sua percepção digital. Olhe bem:</p>
        <p>1. Uma floresta de bytes cintilantes, com árvores feitas de código.</p>
        <p>2. Um terminal de computador flutuante, com a tela mostrando o pôr do sol do Alasca.</p>
        <p>3. Uma aurora boreal dançando ao som de códigos, com um pequeno **símbolo de uma chave** de fenda digital escondido nela.</p>
        <p>4. Uma cidade futurista construída com circuitos, flutuando no vazio.</p>
        <p>Qual das opções representa a realidade, indicando a saída?</p>
    `;

    function verificarIlusao(escolha) {
        if (escolha === '3') {
            exibirMensagem('A ilusão se desfaz, revelando o caminho para a Fortaleza de Gelo! Você percebeu a sutileza do Boto Cor-de-Rosa digital em meio ao caos digital. (+15 Reputação, +5 Mana)', 'success');
            reputacao += 15;
            mana = Math.min(50, mana + 5);
            player.mana = mana;
            atualizarHUD();
            irParaFase(10);
        } else {
            exibirMensagem('O Boto Cor-de-Rosa digital ri, e você se vê preso em um labirinto de ilusões, perdendo tempo e vida para se libertar do engano. (-20 Vida, -5 Reputacao)', 'alert');
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
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('A chave para a realidade está em algo familiar, mas com um detalhe sutil escondido. Procure por um objeto que simboliza "abrir" ou "consertar".');
}


// Fase 10: A Fortaleza do Gelo (Cuca) (Enigma de stealth/lógica)
function renderizarFase10() {
    gameTitle.textContent = 'Fase 10: A Fortaleza do Gelo';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>Você se depara com a Fortaleza do Gelo, uma estrutura imponente e gelada, defendida por sentinelas de gelo digital que patrulham incessantemente seus perímetros. A **Cuca**, em sua forma digital, parece estar dentro, manipulando os dados roubados.</p>
        <p>Para entrar sem ser detectado, você precisa encontrar um padrão nas patrulhas dos sentinelas e se mover no momento certo.</p>
        <p>Eles se movem em um padrão de 3-2-1-3-2-1 segundos (3 segundos visível, 2 segundos escondido atrás de barreiras de gelo, 1 segundo em alerta, e o padrão se repete).</p>
        <p>Qual o momento ideal para passar pela entrada principal sem ser visto?</p>
    `;

    function tentarEntrada(momento) {
        let sucesso = false;
        if (momento === 'escondido') {
            if (player.classe === "Hacker de Infiltração" || player.forca >= 20 || inventario.includes('Kit de Lockpick Digital')) {
                exibirMensagem('Sua habilidade de infiltração (ou sua Força/Kit de Lockpick) permite que você se mova com precisão cirúrgica e entre furtivamente na fortaleza. A Cuca não faz ideia da sua chegada! (+25 Reputação)', 'success');
                reputacao += 25;
                sucesso = true;
            } else {
                exibirMensagem('Você escolhe o momento certo, mas não é rápido ou furtivo o suficiente. A sentinela o detecta no último instante, mas você consegue entrar. (-15 Vida, -5 Reputação)', 'normal');
                vida -= 15;
                reputacao -= 5;
                sucesso = true; // Ainda entra, mas com custo
            }
        } else {
            exibirMensagem('Você foi detectado! As sentinelas ativam alarmes e você precisa lutar para entrar, sofrendo danos consideráveis! (-35 Vida, -15 Reputação)', 'alert');
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
        { texto: 'Passar nos 3 segundos visíveis (risco alto).', acao: () => tentarEntrada('visivel') },
        { texto: 'Passar nos 2 segundos escondidos (furtividade).', acao: () => tentarEntrada('escondido') },
        { texto: 'Passar no 1 segundo em alerta (risco médio).', acao: () => tentarEntrada('alerta') },
        {
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Um verdadeiro hacker se move quando ninguém está olhando, nem mesmo em alerta. Suas habilidades ou itens podem ser sua vantagem.');
}


// Fase 11: O Chefão Final (Cuca) (Batalha/Enigma Final)
function renderizarFase11() {
    gameTitle.textContent = 'Fase 11: Confronto Final com a Cuca';
    gameScreen.style.backgroundImage = 'none'; // Fundo padrão para as fases de jogo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';
    iniciarMensagensSubliminares();

    gameScreen.innerHTML = `
        <p>A **Cuca** surge diante de você, uma entidade colossal de dados corrompidos e gelo digital. Ela ri, seus olhos brilham com malícia e as informações roubadas pulsam ao seu redor.</p>
        <p>"Você chegou longe, hackerzinho(a), mas este é o fim da linha! Eu tenho os dados do Folclore Digital, e ninguém vai me impedir!"</p>
        <p>Para derrotá-la, você precisa desvendar a **fraqueza do algoritmo** dela e aplicar o comando certo.</p>
        <p>Dica: O algoritmo dela é forte contra força bruta, mas incrivelmente fraco contra a **lógica invertida**, pois isso bagunça seus próprios dados. Você tem alguma ferramenta para isso?</p>
        <p>Qual comando você usa para atacar?</p>
    `;

    function atacarCuca(ataque) {
        let sucesso = false;
        if (ataque === 'logica_invertida') {
            if (inventario.includes('Algoritmo de Inversão') || player.classe === 'Hacker de Dados' || player.mana >= 30) {
                exibirMensagem('O comando de inversão lógica (ou seu Algoritmo de Inversão/Mana) atinge o ponto fraco do algoritmo da Cuca! Ela grita em uma linguagem binária distorcida enquanto seus dados começam a se desintegrar. Você recupera os dados do Folclore Digital! (+50 Reputação, +10 Mana)', 'success');
                reputacao += 50;
                mana = Math.min(50, mana + 10);
                player.mana = mana;
                adicionarItemInventario('Dados do Folclore Digital Recuperados');
                sucesso = true;
            } else {
                exibirMensagem('Você tenta o comando de inversão lógica, mas não tem o poder ou a ferramenta para executá-lo completamente. A Cuca te atinge com um pulso de congelamento de dados. (-30 Vida, -10 Reputação)', 'alert');
                vida -= 30;
                reputacao -= 10;
            }
        } else if (ataque === 'forca') {
            exibirMensagem('Seu ataque bruto é absorvido pela armadura de dados da Cuca. Ela contra-ataca com um pulso eletromagnético devastador! (-40 Vida, -20 Reputação)', 'alert');
            vida -= 40;
            reputacao -= 20;
            attackSound.play();
        } else if (ataque === 'distracao') {
            exibirMensagem('A Cuca mal percebe sua distração e lança uma barreira de gelo digital, que o atinge de raspão. (-20 Vida, -10 Reputação)', 'normal');
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
            texto: 'Gerenciar Inventário',
            acao: () => gerenciarInventario(faseAtual)
        }
    ]);
    adicionarBotaoDica('Se a fraqueza é a "lógica invertida", qual das opções de ataque reflete isso? Lembre-se, suas ferramentas e habilidades podem te dar uma vantagem crítica aqui.');

    // Adiciona o Algoritmo de Inversão no inventário para o teste funcionar, se ainda não tiver
    // Isso é para teste, em um jogo real seria encontrado em fases anteriores
    // if (!inventario.includes('Algoritmo de Inversão')) {
    //      adicionarItemInventario('Algoritmo de Inversão'); // Comentar em jogo final
    // }
}

// Fase 12: Fim da Jornada (Tela de Vitória/Game Over)
function renderizarFase12() {
    pararMensagensSubliminares(); // Para as mensagens subliminares no final do jogo
    gameTitle.textContent = 'Fase 12: Fim da Jornada';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'block'; // Garante que o ranking aparece no final

    if (vida > 0) {
        // Mantém a mesma imagem de fundo do menu para vitória, para coesão
        gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/05/27/76/89/1000_F_527768925_kGqX2i9xU1j7pL9022G18bM6xX0Y1Y1q.jpg")';
        gameScreen.style.backgroundSize = 'cover';
        gameScreen.style.backgroundPosition = 'center';
        gameScreen.innerHTML = `
            <p class="final-text">Parabéns, ${player.nickname}!</p>
            <p class="final-text">Você desvendou o mistério e salvou os dados do Folclore Digital no Alasca, expondo a Cuca e seus planos! Sua reputação como hacker atingiu ${reputacao} pontos.</p>
            <p class="final-text">A rede agora está mais segura graças a você!</p>
            <button onclick="reiniciarJogo()">Jogar Novamente</button>
        `;
        salvarRanking(player.nickname, reputacao); // Salva a pontuação na vitória
    } else {
        // Se a vida já estiver zero, o gameOver já foi chamado
        // Este else é para garantir que o Game Over seja o estado final se a vida zerar aqui por algum motivo inesperado
        gameOver("Sua jornada terminou. Tente novamente para desvendar os mistérios do Alasca digital.");
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
        gameOver("Erro: Fase não encontrada!");
    }
}

// Iniciar o jogo
function iniciarJogo() {
    renderizarFase(0); // Começa na tela de criação de personagem
    atualizarDisplayRanking(); // Carrega o ranking ao iniciar o jogo
}

// Inicializa o jogo ao carregar a página
document.addEventListener('DOMContentLoaded', iniciarJogo);
