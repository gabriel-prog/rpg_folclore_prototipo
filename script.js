// script.js

// Variáveis globais do jogo
let vida = 100; // Renomeado de energia para vida
let forca = 10; // Novo atributo
let mana = 10;  // Novo atributo
let reputacao = 0;
let faseAtual = 0;
let escolhasFeitas = {};
let temporizador;
let segundosRestantes;
let inventario = [];
let player = {
    nickname: '',
    classe: '',
    // altura foi removida
    forca: forca, // Inicializa com o valor global
    mana: mana    // Inicializa com o valor global
};

// Elementos do DOM
const gameScreen = document.getElementById('gameScreen');
const gameTitle = document.getElementById('gameTitle');
const vidaValue = document.getElementById('vidaValue'); // Alterado para vida
const vidaFill = document.getElementById('vidaFill');   // Alterado para vida
const forcaValue = document.getElementById('forcaValue'); // Novo
const manaValue = document.getElementById('manaValue');   // Novo
const reputacaoValue = document.getElementById('reputacaoValue');
const inventarioList = document.getElementById('inventarioList');
const inventarioContainer = document.getElementById('inventarioContainer');
const regrasObjetivosMissoesContainer = document.getElementById('regrasObjetivosMissoesContainer');
const regrasContent = document.getElementById('regrasContent');
const objetivosContent = document.getElementById('objetivosContent');
const missoesContent = document.getElementById('missoesContent');
const hud = document.getElementById('hud');
const rankingDisplay = document.getElementById('rankingDisplay'); // Novo
const rankingList = document.getElementById('rankingList');       // Novo

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

// Função de transição para a próxima fase
function irParaFase(proximaFase, delay = 1500) {
    playClickSound();
    gameScreen.style.opacity = '0';
    gameScreen.style.transition = 'opacity 1.5s ease-in-out';

    setTimeout(() => {
        gameScreen.innerHTML = '';
        faseAtual = proximaFase;
        renderizarFase(faseAtual);
        gameScreen.style.opacity = '1';
        gameScreen.style.transition = 'opacity 1.5s ease-in-out';
        atualizarHUD();
    }, delay);
}

// Função para exibir escolhas ao jogador
function exibirEscolhas(opcoes) {
    // Limpa escolhas anteriores
    const oldButtons = gameScreen.querySelectorAll('button');
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

// Função para limpar o conteúdo da tela de jogo
function limparGameScreen() {
    gameScreen.innerHTML = '';
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
    // Limita o ranking aos 10 melhores, por exemplo
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
    clearInterval(temporizador);
    gameScreen.innerHTML = `
        <p class="game-over-text">${mensagem}</p>
        <button onclick="reiniciarJogo()">Reiniciar Jogo</button>
    `;
    gameScreen.style.backgroundImage = 'none';
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
    vida = 100;
    forca = 10;
    mana = 10;
    reputacao = 0;
    faseAtual = 0;
    escolhasFeitas = {};
    inventario = [];
    player = { nickname: '', classe: '', forca: 10, mana: 10 }; // Reseta atributos
    gameScreen.innerHTML = '';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'none'; // Esconde o ranking no início
    ambientSound.pause();
    ambientSound.currentTime = 0;
    iniciarJogo();
}

// --- Telas Específicas do Jogo ---

// Fase 0: Criação de Personagem
function renderizarCriacaoPersonagem() {
    gameTitle.textContent = 'Crie Seu Personagem Hacker';
    gameScreen.style.backgroundImage = 'none';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'none'; // Esconde o ranking

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
        player.forca = 10; // Valores iniciais fixos por enquanto
        player.mana = 10;

        exibirMensagem(`Bem-vindo(a), ${player.nickname} (${player.classe})!`, 'info');
        irParaFase(1);
    };
}

// Fase 1: Menu Principal
function renderizarMenuPrincipal() {
    gameTitle.textContent = '🌌 Menu Principal 🌌';
    gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/05/27/76/89/1000_F_527768925_kGqX2i9xU1j7pL9022G18bM6xX0Y1Y1q.jpg")';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'block'; // Mostra o ranking

    gameScreen.innerHTML = `
        <p>Bem-vindo(a) ao RPG Folclore Hacker - Jornada no Alasca!</p>
        <button onclick="irParaFase(2)">Nova Aventura</button>
        <button onclick="exibirRegrasObjetivosMissoes()">Regras, Objetivos e Missões</button>
        <button onclick="exibirMensagem('Funcionalidade ainda não implementada.', 'info')">Continuar</button>
        <button onclick="atualizarDisplayRanking(); exibirMensagem('Ranking atualizado!', 'info')">Ver Ranking</button>
    `;
    ambientSound.play();
    atualizarDisplayRanking(); // Atualiza o ranking ao entrar no menu
}

function exibirRegrasObjetivosMissoes() {
    gameTitle.textContent = 'Informações do Jogo';
    gameScreen.innerHTML = '';
    gameScreen.style.backgroundImage = 'none';
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

// Função genérica para adicionar botão de dica
function adicionarBotaoDica(faseCallback, hintText) {
    const hintButton = document.createElement('button');
    hintButton.textContent = 'Mostrar Dica';
    hintButton.onclick = () => {
        playClickSound();
        exibirMensagem(`Dica: ${hintText} (-5 Vida)`, 'info');
        vida -= 5;
        atualizarHUD();
        // Remove a dica após mostrar para evitar spam
        hintButton.remove();
        // Permite ao jogador interagir novamente com as opções da fase
        faseCallback();
    };
    gameScreen.appendChild(hintButton);
}


// Fase 2: A Chegada Gélida (com enigma)
function renderizarFase2() {
    gameTitle.textContent = 'Fase 2: A Chegada Gélida';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/05/80/25/80/1000_F_580258064_60q4v3fV7uY0L0A6h2p9kXqJ8J0X0D1v.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none'; // Esconde ranking durante o jogo

    gameScreen.innerHTML = `
        <p>Você aterrissou em uma clareira isolada no coração do Alasca. O frio é intenso, e a neve cobre tudo. No seu bolso, você encontra um bilhete enigmático.</p>
        <p><b>Bilhete:</b> "No gelo onde sussurros ecoam, a **cabana antiga** guarda o segredo. A rede te espera, mas o tempo é curto."</p>
        <p>O que você faz?</p>
    `;
    exibirEscolhas([
        {
            texto: 'Tentar decifrar o bilhete.',
            acao: () => {
                const resposta = prompt('Qual a palavra-chave que indica o seu destino? (Duas palavras)').toLowerCase();
                if (resposta === 'cabana antiga') {
                    exibirMensagem('Correto! Você sabe onde ir. (+5 Reputação)', 'success');
                    reputacao += 5;
                    adicionarItemInventario('Bilhete Decifrado');
                    irParaFase(3);
                } else {
                    exibirMensagem('Incorreto. Você perde tempo e vida tentando entender. (-10 Vida)', 'alert');
                    vida -= 10;
                    atualizarHUD();
                    // Oferece a dica após o erro
                    adicionarBotaoDica(() => renderizarFase2(), 'A resposta está destacada no próprio bilhete.');
                    exibirEscolhas([ // Reapresenta as escolhas
                         { texto: 'Tentar novamente', acao: () => renderizarFase2() },
                         { texto: 'Ignorar e seguir em frente', acao: () => { exibirMensagem('Você decide ignorar o enigma e seguir em frente.', 'normal'); irParaFase(3); } }
                    ]);
                }
            }
        },
        {
            texto: 'Ignorar o bilhete e seguir em frente aleatoriamente. (-20 Vida)',
            acao: () => {
                vida -= 20;
                exibirMensagem('Você se aventura sem rumo e gasta muita vida.', 'alert');
                atualizarHUD();
                irParaFase(3);
            }
        }
    ]);
    adicionarBotaoDica(() => renderizarFase2(), 'A palavra-chave está visivelmente marcada no texto do bilhete.');
}

// Fase 3: Floresta Sombria e Gélida (com enigma binário)
function renderizarFase3() {
    gameTitle.textContent = 'Fase 3: Floresta Sombria e Gélida';
    gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/06/71/53/80/1000_F_671538026_wWlC6y0Uq8tG0N9zC7b4HwP0jB5E3L2e.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Você adentra uma floresta densa. O ar é pesado e um sussurro gélido parece vir de todas as direções. Você percebe que o sussurro é, na verdade, uma sequência binária que se repete.</p>
        <p><b>Sussurro:</b> "01001000 01100001 01100011 01101011"</p>
        <p>O que você faz?</p>
    `;
    exibirEscolhas([
        {
            texto: 'Tentar decifrar o código binário.',
            acao: () => {
                const resposta = prompt('Qual a palavra em texto que o código binário revela? (Uma palavra)').toLowerCase();
                if (resposta === 'hack') {
                    exibirMensagem('Bingo! A palavra é "Hack". Você sentiu uma conexão estranha com a rede local. (+5 Reputação)', 'success');
                    reputacao += 5;
                    adicionarItemInventario('Mensagem "Hack" Decifrada');
                    irParaFase(4);
                } else {
                    exibirMensagem('Você falha em decifrar. O sussurro parece zombeteiro. (-15 Vida)', 'alert');
                    vida -= 15;
                    atualizarHUD();
                    adicionarBotaoDica(() => renderizarFase3(), 'Cada grupo de 8 dígitos binários corresponde a uma letra ASCII. Converta um por um.');
                    exibirEscolhas([
                        { texto: 'Tentar novamente', acao: () => renderizarFase3() },
                        { texto: 'Ignorar e seguir em frente', acao: () => { exibirMensagem('Você decide ignorar o enigma e seguir em frente.', 'normal'); irParaFase(4); } }
                    ]);
                }
            }
        },
        {
            texto: 'Ignorar o sussurro e buscar a cabana.',
            acao: () => {
                exibirMensagem('Você decide ignorar o sussurro, mas sente que perdeu algo importante.', 'normal');
                irParaFase(4);
            }
        }
    ]);
    adicionarBotaoDica(() => renderizarFase3(), 'Pesquise por "tabela ASCII binário" para converter a sequência.');
}

// Fase 4: A Cabana Antiga (com enigma do teclado)
function renderizarFase4() {
    gameTitle.textContent = 'Fase 4: A Cabana Antiga';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/06/77/39/63/1000_F_677396342_uG60FkY0vFf9c9J2h6y6sV4c7t2E3w0d.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Você finalmente encontra a cabana antiga. A porta principal tem um teclado digital com uma sequência de números piscando: <b>1, 2, 4, 7, 11, ?</b></p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar inserir o próximo número na sequência.',
            acao: () => {
                const resposta = prompt('Qual é o próximo número na sequência?').trim();
                if (resposta === '16') {
                    exibirMensagem('A porta se abre com um clique suave. Você conseguiu! (+10 Reputação)', 'success');
                    reputacao += 10;
                    irParaFase(5);
                } else {
                    exibirMensagem('O alarme silencioso da cabana é ativado por um instante. Você perde vida. (-20 Vida)', 'alert');
                    vida -= 20;
                    atualizarHUD();
                    adicionarBotaoDica(() => renderizarFase4(), 'A diferença entre os números aumenta em 1 a cada passo: +1, +2, +3...');
                    exibirEscolhas([
                        { texto: 'Tentar novamente', acao: () => renderizarFase4() },
                        { texto: 'Tentar forçar a entrada pela janela dos fundos. (-30 Vida)', acao: () => {
                            vida -= 30;
                            exibirMensagem('A janela range e você faz barulho, mas consegue entrar. Você perdeu bastante vida na tentativa.', 'alert');
                            atualizarHUD();
                            irParaFase(5);
                        }}
                    ]);
                }
            }
        },
        {
            texto: 'Tentar forçar a entrada pela janela dos fundos. (-30 Vida)',
            acao: () => {
                vida -= 30;
                exibirMensagem('A janela range e você faz barulho, mas consegue entrar. Você perdeu bastante vida na tentativa.', 'alert');
                atualizarHUD();
                irParaFase(5);
            }
        }
    ]);
    adicionarBotaoDica(() => renderizarFase4(), 'Pense na progressão dos números. Qual o padrão de soma?');
}

// Fase 5: O Encontro com o "Homem da Neve" (Saci) (com enigma de perseguição/decriptação)
function renderizarFase5() {
    gameTitle.textContent = 'Fase 5: O Encontro com o Saci';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/86/02/75/1000_F_486027599_2N11vB0tG7h8VvL7qF0c5Q0T0W8Z7R5A.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Ao entrar na cabana, você sente uma brisa gelada e vê um vulto ágil e pequeno, pulando em uma perna só. É o Saci, mas este parece feito de gelo e fumaça! Ele joga algo brilhante no chão e tenta fugir.</p>
        <p>O objeto brilhante é um "Módulo de Dados Encriptado".</p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar capturar o Saci para interrogá-lo.',
            acao: () => {
                const sorte = Math.random();
                if (sorte > 0.6 || player.forca > 15) { // Chance de capturar ou se Força for alta
                    exibirMensagem('Você é rápido(a) e consegue imobilizar o Saci por um breve momento! Ele resmunga: "A verdade está onde o fluxo não congela..." e desaparece, deixando o Módulo de Dados. (+15 Reputação, +5 Força)', 'success');
                    reputacao += 15;
                    player.forca += 5; // Ganho de força
                    adicionarItemInventario('Sussurro do Saci');
                    adicionarItemInventario('Módulo de Dados Encriptado');
                    irParaFase(6);
                } else {
                    exibirMensagem('O Saci é ágil demais! Ele ri e desaparece na fumaça gélida, levando o Módulo de Dados consigo. (-25 Vida, -5 Reputação)', 'alert');
                    vida -= 25;
                    reputacao -= 5;
                    atualizarHUD();
                    irParaFase(6);
                }
            }
        },
        {
            texto: 'Pegar o "Módulo de Dados Encriptado" e tentar decifrá-lo imediatamente.',
            acao: () => {
                if (inventario.includes('Módulo de Dados Encriptado')) {
                     exibirMensagem('Você já possui o Módulo. Tente decifrá-lo no inventário ou siga em frente.', 'info');
                     irParaFase(6);
                     return;
                }
                exibirMensagem('Você pega o módulo. Uma tela holográfica surge e pede uma senha de 4 dígitos. Pense em algo que "abre" ou "desbloqueia" e é um valor comum em computação.', 'info');
                const senha = prompt('Digite a senha de 4 dígitos:');
                if (senha === '1024' || player.mana > 15) { // Senha ou se Mana for alta
                    exibirMensagem('Acesso concedido! O módulo revela uma coordenada para uma "Base Militar Abandonada". (+10 Reputação, +5 Mana)', 'success');
                    reputacao += 10;
                    player.mana += 5; // Ganho de mana
                    adicionarItemInventario('Módulo de Dados Desencriptado');
                    adicionarItemInventario('Coordenada da Base');
                    irParaFase(6);
                } else {
                    exibirMensagem('Senha incorreta. O módulo trava e se torna inútil. Você perde um item importante! (-15 Vida, -5 Reputação)', 'alert');
                    vida -= 15;
                    reputacao -= 5;
                    atualizarHUD();
                    irParaFase(6);
                }
            }
        }
    ]);
    adicionarBotaoDica(() => renderizarFase5(), 'O número da senha é uma potência de 2, fundamental em sistemas de computação.');
}


// Fase 6: Base Militar Abandonada (Exemplo de fase sem enigma direto, mas com escolha importante)
function renderizarFase6() {
    gameTitle.textContent = 'Fase 6: Base Militar Abandonada';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Você chega a uma antiga base militar, coberta pela neve e pelo tempo. Parece desativada, mas a presença de sinais residuais de energia te alerta. Você precisa encontrar uma forma de entrar.</p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Procurar por uma entrada de serviço oculta.',
            acao: () => {
                const chance = Math.random();
                if (chance > 0.4 || player.classe === "Hacker de Infiltração") { // Infiltração tem mais chance
                    exibirMensagem('Você encontra uma passagem secreta nos fundos da base! A entrada é discreta e leva diretamente para dentro. (+5 Reputação)', 'success');
                    reputacao += 5;
                    irParaFase(7);
                } else {
                    exibirMensagem('Você procura, mas não encontra nada. Perde tempo e vida. (-10 Vida)', 'alert');
                    vida -= 10;
                    atualizarHUD();
                    renderizarFase6(); // Permite tentar novamente ou escolher outra opção
                }
            }
        },
        {
            texto: 'Tentar arrombar a porta principal. (-20 Vida)',
            acao: () => {
                vida -= 20;
                exibirMensagem('Você tenta forçar a porta, fazendo barulho. Ela cede, mas você atraiu alguma atenção... (-10 Reputação)', 'alert');
                reputacao -= 10;
                atualizarHUD();
                irParaFase(7);
            }
        }
    ]);
    adicionarBotaoDica(() => renderizarFase6(), 'Hacks de infiltração podem ser mais úteis aqui.');
}

// Fase 7: Laboratório Subterrâneo (com enigma de conexão de circuitos)
function renderizarFase7() {
    gameTitle.textContent = 'Fase 7: Laboratório Subterrâneo';
    gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/06/10/72/77/1000_F_610727763_kX0tqf2x9z0J9p8p0L4K0q0o4P0W0g1h.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Você está em um laboratório subterrâneo, escuro e frio. No centro, um dispositivo de pesquisa antigo pulsa com energia residual. Para acessá-lo, você precisa conectar os circuitos corretamente.</p>
        <p>O painel tem três cabos (Vermelho, Azul, Verde) e três portas (A, B, C).</p>
        <p><b>Dica:</b> O vermelho sempre vai antes do verde, e o azul nunca é o primeiro, mas o verde é o último.</p>
        <p>Qual a ordem dos cabos nas portas? (Ex: Vermelho-Azul-Verde ou V-Az-Ve)</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar a combinação de circuitos.',
            acao: () => {
                const combinacao = prompt('Digite a ordem dos cabos, separados por hífen (V-Az-Ve):').toLowerCase().split('-');
                if (combinacao.length === 3 &&
                    (combinacao[0] === 'v' || combinacao[0] === 'vermelho') &&
                    (combinacao[1] === 'az' || combinacao[1] === 'azul') &&
                    (combinacao[2] === 've' || combinacao[2] === 'verde')) {
                    exibirMensagem('Os circuitos se conectam, e o dispositivo se ilumina! Uma tela holográfica exibe informações sobre um grupo hacker chamado "Guardiões do Folclore". (+20 Reputação)', 'success');
                    reputacao += 20;
                    adicionarItemInventario('Dados da Organização "Guardiões do Folclore"');
                    irParaFase(8);
                } else {
                    exibirMensagem('Um choque elétrico! Os circuitos se sobrecarregam e você perde vida. (-25 Vida)', 'alert');
                    vida -= 25;
                    atualizarHUD();
                    adicionarBotaoDica(() => renderizarFase7(), 'A dica diz que vermelho vem antes do verde. Se o verde é o último, e o azul não é o primeiro, qual a única sequência possível?');
                    renderizarFase7(); // Permite tentar novamente
                }
            }
        },
        {
            texto: 'Desistir e procurar outra coisa.',
            acao: () => {
                exibirMensagem('Você decide não arriscar mais e segue em frente, mas a sensação de ter perdido algo importante permanece.', 'normal');
                irParaFase(8);
            }
        }
    ]);
    adicionarBotaoDica(() => renderizarFase7(), 'Se o verde é o último, e o azul não é o primeiro, o vermelho deve ser o primeiro. A sequência se monta a partir daí.');
}


// Fase 8: O Enigma da Curupira Hacker (Enigma de lógica)
function renderizarFase8() {
    gameTitle.textContent = 'Fase 8: O Enigma da Curupira Hacker';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Você encontra uma projeção etérea da Curupira, mas seus olhos brilham com códigos binários. Ela te desafia com um enigma para abrir um portal para a próxima dimensão da rede.</p>
        <p><b>Enigma da Curupira:</b></p>
        <p>"Qual código abre as portas da floresta digital, onde os dados dançam e a verdade se oculta?</p>
        <p>Não é chave, nem senha, mas uma **diretriz** que o sistema aceita.</p>
        <p>Começa com 'C' e termina com 'D'."</p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar a resposta do enigma.',
            acao: () => {
                const resposta = prompt('Qual é a diretriz?').toLowerCase();
                if (resposta === 'comando') {
                    exibirMensagem('O portal se abre, revelando uma paisagem distorcida de dados e luzes! A Curupira acena com a cabeça em aprovação. (+20 Reputação, +5 Mana)', 'success');
                    reputacao += 20;
                    player.mana += 5;
                    atualizarHUD();
                    irParaFase(9);
                } else {
                    exibirMensagem('O portal se distorce e você é redirecionado para um loop de anúncios incessantes. Você perde tempo e vida. (-30 Vida, -10 Reputação)', 'alert');
                    vida -= 30;
                    reputacao -= 10;
                    atualizarHUD();
                    adicionarBotaoDica(() => renderizarFase8(), 'Em sistemas, uma "diretriz" que começa com C e termina com D é frequentemente uma forma de instrução.');
                    exibirEscolhas([
                        { texto: 'Tentar novamente', acao: () => renderizarFase8() },
                        { texto: 'Tentar forçar o portal com um brute force. (-40 Vida)', acao: () => {
                            vida -= 40;
                            exibirMensagem('A Curupira ri. Seu brute force é inútil contra a magia digital dela. O portal o arremessa para a frente, mas você sente o impacto. (-10 Reputação)', 'alert');
                            reputacao -= 10;
                            atualizarHUD();
                            irParaFase(9);
                        }}
                    ]);
                }
            }
        },
        {
            texto: 'Tentar forçar o portal com um brute force. (-40 Vida)',
            acao: () => {
                vida -= 40;
                exibirMensagem('A Curupira ri. Seu brute force é inútil contra a magia digital dela. O portal o arremessa para a frente, mas você sente o impacto. (-10 Reputação)', 'alert');
                reputacao -= 10;
                atualizarHUD();
                irParaFase(9);
            }
        }
    ]);
    adicionarBotaoDica(() => renderizarFase8(), 'Pense em termos de programação ou sistemas operacionais.');
}

// Fase 9: A Realidade Distorcida (Boto) (Enigma de percepção/ilusão)
function renderizarFase9() {
    gameTitle.textContent = 'Fase 9: A Realidade Distorcida';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Você entra em uma dimensão onde a realidade é fluida e distorcida. Imagens piscam, sons se misturam. Uma figura elegante, com traços de botos digitais, aparece e desaparece, criando ilusões.</p>
        <p>Para escapar, você deve identificar a **única imagem real** em meio a quatro ilusões. Olhe bem:</p>
        <p>1. Uma floresta de bytes cintilantes.</p>
        <p>2. Um terminal de computador flutuante, com a tela mostrando o pôr do sol do Alasca.</p>
        <p>3. Uma aurora boreal dançando ao som de códigos, com um pequeno **símbolo de uma chave** escondido nela.</p>
        <p>4. Uma cidade futurista construída com circuitos.</p>
        <p>Qual das opções representa a realidade, indicando a saída?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Escolher a imagem 1.',
            acao: () => verificarIlusao('1', () => renderizarFase9())
        },
        {
            texto: 'Escolher a imagem 2.',
            acao: () => verificarIlusao('2', () => renderizarFase9())
        },
        {
            texto: 'Escolher a imagem 3.',
            acao: () => verificarIlusao('3', () => renderizarFase9())
        },
        {
            texto: 'Escolher a imagem 4.',
            acao: () => verificarIlusao('4', () => renderizarFase9())
        },
        {
            texto: 'Mostrar Dica',
            acao: () => {
                exibirMensagem('Dica: O Boto é astuto. A chave para a realidade está em algo familiar, mas com um detalhe sutil escondido.', 'info');
                vida -= 5;
                atualizarHUD();
            }
        }
    ]);

    function verificarIlusao(escolha, retryCallback) {
        if (escolha === '3') {
            exibirMensagem('A ilusão se desfaz, revelando o caminho para a Fortaleza de Gelo! Você percebeu a sutileza do Boto. (+15 Reputação, +5 Mana)', 'success');
            reputacao += 15;
            player.mana += 5;
            atualizarHUD();
            irParaFase(10);
        } else {
            exibirMensagem('O Boto ri, e você se vê preso em um labirinto de ilusões. Você gasta vida para se libertar. (-20 Vida, -5 Reputação)', 'alert');
            vida -= 20;
            reputacao -= 5;
            atualizarHUD();
            retryCallback(); // Permite tentar novamente na mesma fase
        }
    }
}


// Fase 10: A Fortaleza do Gelo (Cuca) (Enigma de stealth/lógica)
function renderizarFase10() {
    gameTitle.textContent = 'Fase 10: A Fortaleza do Gelo';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Você se depara com a Fortaleza do Gelo, uma estrutura imponente e gelada, defendida por sentinelas de gelo que patrulham incessantemente. A Cuca, em sua forma digital, parece estar dentro, manipulando os dados roubados.</p>
        <p>Para entrar sem ser detectado, você precisa encontrar um padrão nas patrulhas dos sentinelas.</p>
        <p>Eles se movem em um padrão de 3-2-1-3-2-1 (3 segundos visível, 2 segundos escondido, 1 segundo em alerta, e repete).</p>
        <p>Qual o momento ideal para passar pela entrada principal sem ser visto?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Passar nos 3 segundos visíveis.',
            acao: () => tentarEntrada('visivel', () => renderizarFase10())
        },
        {
            texto: 'Passar nos 2 segundos escondidos.',
            acao: () => tentarEntrada('escondido', () => renderizarFase10())
        },
        {
            texto: 'Passar no 1 segundo em alerta.',
            acao: () => tentarEntrada('alerta', () => renderizarFase10())
        },
        {
            texto: 'Mostrar Dica',
            acao: () => {
                exibirMensagem('Dica: Um verdadeiro hacker se move quando ninguém está olhando, nem mesmo em alerta.', 'info');
                vida -= 5;
                atualizarHUD();
            }
        }
    ]);

    function tentarEntrada(momento, retryCallback) {
        if (momento === 'escondido') {
            exibirMensagem('Você se move com precisão cirúrgica e entra furtivamente na fortaleza. A Cuca não faz ideia da sua chegada! (+25 Reputação, +5 Força)', 'success');
            reputacao += 25;
            player.forca += 5;
            atualizarHUD();
            irParaFase(11);
        } else {
            exibirMensagem('Você foi detectado! As sentinelas ativam alarmes e você precisa lutar para entrar. (-35 Vida, -15 Reputação)', 'alert');
            vida -= 35;
            reputacao -= 15;
            attackSound.play();
            atualizarHUD();
            if (vida > 0) {
                retryCallback(); // Permite tentar novamente
            } else {
                gameOver("Sua vida se esgotou lutando contra os sentinelas da Cuca.");
            }
        }
    }
}


// Fase 11: O Chefão Final (Cuca) (Batalha/Enigma Final)
function renderizarFase11() {
    gameTitle.textContent = 'Fase 11: Confronto Final com a Cuca';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';
    rankingDisplay.style.display = 'none';

    gameScreen.innerHTML = `
        <p>A Cuca surge diante de você, uma entidade colossal de dados corrompidos e gelo digital. Ela ri, seus olhos brilham com malícia.</p>
        <p>"Você chegou longe, hackerzinho(a), mas este é o fim da linha! Eu tenho os dados do Folclore Digital, e ninguém vai me impedir!"</p>
        <p>Para derrotá-la, você precisa desvendar a **fraqueza do algoritmo** dela.</p>
        <p>Dica: O algoritmo dela é forte contra força, mas fraco contra a **lógica invertida**.</p>
        <p>Qual comando você usa para atacar?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Comando de Ataque Bruto (FORÇA_TOTAL)',
            acao: () => atacarCuca('forca', () => renderizarFase11())
        },
        {
            texto: 'Comando de Inversão Lógica (DECRYPT_ALGORITMO)',
            acao: () => atacarCuca('logica_invertida', () => renderizarFase11())
        },
        {
            texto: 'Comando de Distração (FALSO_POSITIVO)',
            acao: () => atacarCuca('distracao', () => renderizarFase11())
        },
        {
            texto: 'Mostrar Dica',
            acao: () => {
                exibirMensagem('Dica: Se a fraqueza é a "lógica invertida", qual das opções de ataque reflete isso?', 'info');
                vida -= 5;
                atualizarHUD();
            }
        }
    ]);

    function atacarCuca(ataque, retryCallback) {
        if (ataque === 'logica_invertida') {
            exibirMensagem('O comando de inversão lógica atinge o ponto fraco do algoritmo da Cuca! Ela grita em uma linguagem binária distorcida enquanto seus dados começam a se desintegrar. Você recupera os dados do Folclore Digital! (+50 Reputação)', 'success');
            reputacao += 50;
            adicionarItemInventario('Dados do Folclore Digital Recuperados');
            atualizarHUD();
            irParaFase(12); // Vitória
        } else if (ataque === 'forca') {
            exibirMensagem('Seu ataque bruto é absorvido pela armadura de dados da Cuca. Ela contra-ataca com um pulso eletromagnético! (-40 Vida, -20 Reputação)', 'alert');
            vida -= 40;
            reputacao -= 20;
            attackSound.play();
            atualizarHUD();
            if (vida > 0) {
                retryCallback();
            } else {
                gameOver("Sua vida se esgotou na batalha final contra a Cuca.");
            }
        } else if (ataque === 'distracao') {
            exibirMensagem('A Cuca mal percebe sua distração e lança uma barreira de gelo digital. (-20 Vida, -10 Reputação)', 'normal');
            vida -= 20;
            reputacao -= 10;
            atualizarHUD();
            if (vida > 0) {
                retryCallback();
            } else {
                gameOver("Sua vida se esgotou na batalha final contra a Cuca.");
            }
        }
    }
}

// Fase 12: Fim da Jornada (Tela de Vitória/Game Over)
function renderizarFase12() {
    gameTitle.textContent = 'Fase 12: Fim da Jornada';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    rankingDisplay.style.display = 'block'; // Garante que o ranking aparece no final

    if (vida > 0) {
        gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")'; // Exemplo de imagem de vitória
        gameScreen.innerHTML = `
            <p class="final-text">Parabéns, ${player.nickname}!</p>
            <p class="final-text">Você desvendou o mistério e salvou os dados do Folclore Digital! Sua reputação como hacker no Alasca atingiu ${reputacao} pontos.</p>
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
    7: renderizarFase7,
    8: renderizarFase8,
    9: renderizarFase9,
    10: renderizarFase10,
    11: renderizarFase11,
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
