// script.js

// Variáveis globais do jogo
let energia = 100;
let reputacao = 0;
let faseAtual = 0;
let escolhasFeitas = {};
let temporizador; // Não está sendo usado no momento, mas mantido caso queira adicionar cronômetros
let segundosRestantes; // Não está sendo usado no momento
let inventario = []; // Novo: Inventário do jogador
let player = {
    nickname: '',
    classe: '',
    altura: ''
}; // Novo: Dados do jogador

// Elementos do DOM
const gameScreen = document.getElementById('gameScreen');
const gameTitle = document.getElementById('gameTitle');
const energiaValue = document.getElementById('energiaValue');
const energiaFill = document.getElementById('energiaFill');
const reputacaoValue = document.getElementById('reputacaoValue');
const inventarioList = document.getElementById('inventarioList');
const inventarioContainer = document.getElementById('inventarioContainer');
const regrasObjetivosMissoesContainer = document.getElementById('regrasObjetivosMissoesContainer');
const regrasContent = document.getElementById('regrasContent');
const objetivosContent = document.getElementById('objetivosContent');
const missoesContent = document.getElementById('missoesContent');
const hud = document.getElementById('hud');

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
    energiaValue.textContent = energia;
    energiaFill.style.width = `${energia}%`;
    reputacaoValue.textContent = reputacao;

    if (energia <= 0) {
        gameOver("Sua energia se esgotou. Você não conseguiu sobreviver ao Alasca digital.");
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
    if (!inventario.includes(item)) { // Evita itens duplicados
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
function irParaFase(proximaFase, delay = 1500) { // Aumenta o delay padrão
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
    opcoes.forEach(opcao => {
        const button = document.createElement('button');
        button.textContent = opcao.texto;
        button.onclick = () => {
            playClickSound();
            opcao.acao();
            // Não limpar gameScreen imediatamente para permitir mensagens antes da transição
        };
        gameScreen.appendChild(button);
    });
}

// Função para limpar o conteúdo da tela de jogo
function limparGameScreen() {
    gameScreen.innerHTML = '';
}

// Função de Game Over
function gameOver(mensagem) {
    clearInterval(temporizador); // Garante que qualquer temporizador seja parado
    gameScreen.innerHTML = `
        <p class="game-over-text">${mensagem}</p>
        <button onclick="reiniciarJogo()">Reiniciar Jogo</button>
    `;
    gameScreen.style.backgroundImage = 'none';
    ambientSound.pause();
    alertSound.play();
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none'; // Esconde inventário
    regrasObjetivosMissoesContainer.style.display = 'none'; // Esconde regras
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    playClickSound();
    energia = 100;
    reputacao = 0;
    faseAtual = 0;
    escolhasFeitas = {};
    inventario = [];
    player = { nickname: '', classe: '', altura: '' };
    gameScreen.innerHTML = '';
    hud.style.display = 'none';
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';
    ambientSound.pause();
    ambientSound.currentTime = 0;
    iniciarJogo();
}

// --- Telas Específicas do Jogo ---

// Fase 0: Criação de Personagem
function renderizarCriacaoPersonagem() {
    gameTitle.textContent = 'Crie Seu Personagem Hacker';
    gameScreen.style.backgroundImage = 'none'; // Sem imagem de fundo específica aqui
    hud.style.display = 'none'; // HUD escondida
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';

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

        <label for="alturaInput">Altura (cm):</label>
        <input type="number" id="alturaInput" placeholder="Ex: 175" min="100" max="250" required><br>

        <button id="iniciarAventuraBtn">Iniciar Aventura</button>
    `;

    document.getElementById('iniciarAventuraBtn').onclick = () => {
        const nickname = document.getElementById('nicknameInput').value;
        const classe = document.getElementById('classeSelect').value;
        const altura = document.getElementById('alturaInput').value;

        if (nickname.trim() === '' || altura.trim() === '') {
            exibirMensagem('Por favor, preencha todos os campos.', 'alert');
            return;
        }

        player.nickname = nickname;
        player.classe = classe;
        player.altura = altura;

        exibirMensagem(`Bem-vindo(a), ${player.nickname} (${player.classe})!`, 'info');
        irParaFase(1); // Vai para a fase do menu principal
    };
}

// Fase 1: Menu Principal
function renderizarMenuPrincipal() {
    gameTitle.textContent = '🌌 Menu Principal 🌌';
    gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/05/27/76/89/1000_F_527768925_kGqX2i9xU1j7pL9022G18bM6xX0Y1Y1q.jpg")'; // Exemplo de fundo
    hud.style.display = 'none'; // Esconde a HUD no menu
    inventarioContainer.style.display = 'none';
    regrasObjetivosMissoesContainer.style.display = 'none';

    gameScreen.innerHTML = `
        <p>Bem-vindo(a) ao RPG Folclore Hacker - Jornada no Alasca!</p>
        <button onclick="irParaFase(2)">Nova Aventura</button>
        <button onclick="exibirRegrasObjetivosMissoes()">Regras, Objetivos e Missões</button>
        <button onclick="exibirMensagem('Funcionalidade ainda não implementada.', 'info')">Continuar</button>
        <button onclick="exibirMensagem('Funcionalidade ainda não implementada.', 'info')">Ranking</button>
    `;
    ambientSound.play();
}

function exibirRegrasObjetivosMissoes() {
    gameTitle.textContent = 'Informações do Jogo';
    gameScreen.innerHTML = ''; // Limpa a tela de jogo
    hud.style.display = 'none'; // Garante que a HUD esteja escondida
    inventarioContainer.style.display = 'none';
    gameScreen.style.backgroundImage = 'none'; // Sem fundo para a tela de regras

    regrasObjetivosMissoesContainer.style.display = 'block';

    regrasContent.innerHTML = `
        <h4>Regras Básicas:</h4>
        <ul>
            <li>Gerencie sua energia: Cuidado com suas ações, pois algumas as diminuem.</li>
            <li>Suas escolhas importam: Elas afetarão sua reputação e o desenrolar da história.</li>
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

    // Remove botões antigos e adiciona o de voltar
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
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/05/80/25/80/1000_F_580258064_60q4v3fV7uY0L0A6h2p9kXqJ8J0X0D1v.jpg")';
    hud.style.display = 'block'; // Mostra a HUD
    inventarioContainer.style.display = 'block'; // Mostra o inventário

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
                    exibirMensagem('Incorreto. Você perde tempo e energia tentando entender. (-10 Energia)', 'alert');
                    energia -= 10;
                    atualizarHUD();
                    // Permite tentar novamente ou forçar a próxima fase
                    exibirEscolhas([
                         { texto: 'Tentar novamente', acao: () => renderizarFase2() },
                         { texto: 'Ignorar e seguir em frente', acao: () => { exibirMensagem('Você decide ignorar o enigma e seguir em frente.', 'normal'); irParaFase(3); } }
                    ]);
                }
            }
        },
        {
            texto: 'Ignorar o bilhete e seguir em frente aleatoriamente. (-20 Energia)',
            acao: () => {
                energia -= 20;
                exibirMensagem('Você se aventura sem rumo e gasta muita energia.', 'alert');
                atualizarHUD();
                irParaFase(3);
            }
        }
    ]);
}

// Fase 3: Floresta Sombria e Gélida (com enigma binário)
function renderizarFase3() {
    gameTitle.textContent = 'Fase 3: Floresta Sombria e Gélida';
    gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/06/71/53/80/1000_F_671538026_wWlC6y0Uq8tG0N9zC7b4HwP0jB5E3L2e.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

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
                    exibirMensagem('Você falha em decifrar. O sussurro parece zombeteiro. (-15 Energia)', 'alert');
                    energia -= 15;
                    atualizarHUD();
                    // Permite tentar novamente ou forçar a próxima fase
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
}

// Fase 4: A Cabana Antiga (com enigma do teclado)
function renderizarFase4() {
    gameTitle.textContent = 'Fase 4: A Cabana Antiga';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/06/77/39/63/1000_F_677396342_uG60FkY0vFf9c9J2h6y6sV4c7t2E3w0d.jpg")';
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

    gameScreen.innerHTML = `
        <p>Você finalmente encontra a cabana antiga. A porta principal tem um teclado digital com uma sequência de números piscando: <b>1, 2, 4, 7, 11, ?</b></p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar inserir o próximo número na sequência.',
            acao: () => {
                const resposta = prompt('Qual é o próximo número na sequência?').trim();
                // A sequência é 1 (+1) 2 (+2) 4 (+3) 7 (+4) 11 (+5) 16
                if (resposta === '16') {
                    exibirMensagem('A porta se abre com um clique suave. Você conseguiu! (+10 Reputação)', 'success');
                    reputacao += 10;
                    irParaFase(5);
                } else {
                    exibirMensagem('O alarme silencioso da cabana é ativado por um instante. Você perde energia. (-20 Energia)', 'alert');
                    energia -= 20;
                    atualizarHUD();
                    // Permite tentar novamente ou forçar a próxima fase
                    exibirEscolhas([
                        { texto: 'Tentar novamente', acao: () => renderizarFase4() },
                        { texto: 'Tentar forçar a entrada pela janela dos fundos. (-30 Energia)', acao: () => {
                            energia -= 30;
                            exibirMensagem('A janela range e você faz barulho, mas consegue entrar. Você perdeu bastante energia na tentativa.', 'alert');
                            atualizarHUD();
                            irParaFase(5);
                        }}
                    ]);
                }
            }
        },
        {
            texto: 'Tentar forçar a entrada pela janela dos fundos. (-30 Energia)',
            acao: () => {
                energia -= 30;
                exibirMensagem('A janela range e você faz barulho, mas consegue entrar. Você perdeu bastante energia na tentativa.', 'alert');
                atualizarHUD();
                irParaFase(5);
            }
        }
    ]);
}

// Fase 5: O Encontro com o "Homem da Neve" (Saci) (com enigma de perseguição/decriptação)
function renderizarFase5() {
    gameTitle.textContent = 'Fase 5: O Encontro com o Saci';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/86/02/75/1000_F_486027599_2N11vB0tG7h8VvL7qF0c5Q0T0W8Z7R5A.jpg")'; // Exemplo de fundo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

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
                if (sorte > 0.6) { // 40% de chance de capturar
                    exibirMensagem('Você é rápido(a) e consegue imobilizar o Saci por um breve momento! Ele resmunga: "A verdade está onde o fluxo não congela..." e desaparece, deixando o Módulo de Dados. (+15 Reputação)', 'success');
                    reputacao += 15;
                    adicionarItemInventario('Sussurro do Saci'); // Pista adicional
                    adicionarItemInventario('Módulo de Dados Encriptado');
                    irParaFase(6);
                } else {
                    exibirMensagem('O Saci é ágil demais! Ele ri e desaparece na fumaça gélida, levando o Módulo de Dados consigo. (-25 Energia, -5 Reputação)', 'alert');
                    energia -= 25;
                    reputacao -= 5;
                    atualizarHUD();
                    irParaFase(6); // Não pega o módulo
                }
            }
        },
        {
            texto: 'Pegar o "Módulo de Dados Encriptado" e tentar decifrá-lo imediatamente.',
            acao: () => {
                if (inventario.includes('Módulo de Dados Encriptado')) {
                     exibirMensagem('Você já possui o Módulo. Tente decifrá-lo no inventário ou siga em frente.', 'info');
                     // Poderia adicionar uma opção para tentar decifrar de novo
                     irParaFase(6); // Avança pois já pegou
                     return;
                }
                exibirMensagem('Você pega o módulo. Uma tela holográfica surge e pede uma senha de 4 dígitos. Pense em algo que "abre" ou "desbloqueia" e é um valor comum em computação.', 'info');
                const senha = prompt('Digite a senha de 4 dígitos (Ex: 1024):');
                if (senha === '1024') {
                    exibirMensagem('Acesso concedido! O módulo revela uma coordenada para uma "Base Militar Abandonada". (+10 Reputação)', 'success');
                    reputacao += 10;
                    adicionarItemInventario('Módulo de Dados Desencriptado');
                    adicionarItemInventario('Coordenada da Base');
                    irParaFase(6);
                } else {
                    exibirMensagem('Senha incorreta. O módulo trava e se torna inútil. Você perde um item importante! (-15 Energia, -5 Reputação)', 'alert');
                    energia -= 15;
                    reputacao -= 5;
                    atualizarHUD();
                    irParaFase(6);
                }
            }
        }
    ]);
}

// Fase 6: Base Militar Abandonada (Exemplo de fase sem enigma direto, mas com escolha importante)
function renderizarFase6() {
    gameTitle.textContent = 'Fase 6: Base Militar Abandonada';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")'; // Exemplo de fundo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

    gameScreen.innerHTML = `
        <p>Você chega a uma antiga base militar, coberta pela neve e pelo tempo. Parece desativada, mas a presença de sinais residuais de energia te alerta. Você precisa encontrar uma forma de entrar.</p>
        <p>O que você faz?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Procurar por uma entrada de serviço oculta.',
            acao: () => {
                const chance = Math.random();
                if (chance > 0.4) {
                    exibirMensagem('Você encontra uma passagem secreta nos fundos da base! A entrada é discreta e leva diretamente para dentro. (+5 Reputação)', 'success');
                    reputacao += 5;
                    irParaFase(7);
                } else {
                    exibirMensagem('Você procura, mas não encontra nada. Perde tempo e energia. (-10 Energia)', 'alert');
                    energia -= 10;
                    atualizarHUD();
                    // Permite tentar novamente ou escolher outra opção
                    renderizarFase6();
                }
            }
        },
        {
            texto: 'Tentar arrombar a porta principal. (-20 Energia)',
            acao: () => {
                energia -= 20;
                exibirMensagem('Você tenta forçar a porta, fazendo barulho. Ela cede, mas você atraiu alguma atenção... (-10 Reputação)', 'alert');
                reputacao -= 10;
                atualizarHUD();
                irParaFase(7);
            }
        }
    ]);
}

// Fase 7: Laboratório Subterrâneo (com enigma de conexão de circuitos)
function renderizarFase7() {
    gameTitle.textContent = 'Fase 7: Laboratório Subterrâneo';
    gameScreen.style.backgroundImage = 'url("https://as2.ftcdn.net/v2/jpg/06/10/72/77/1000_F_610727763_kX0tqf2x9z0J9p8p0L4K0q0o4P0W0g1h.jpg")'; // Exemplo de fundo
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

    gameScreen.innerHTML = `
        <p>Você está em um laboratório subterrâneo, escuro e frio. No centro, um dispositivo de pesquisa antigo pulsa com energia residual. Para acessá-lo, você precisa conectar os circuitos corretamente.</p>
        <p>O painel tem três cabos (Vermelho, Azul, Verde) e três portas (A, B, C).</p>
        <p><b>Dica:</b> O vermelho sempre vai antes do verde, e o azul nunca é o primeiro, mas o verde é o último.</p>
        <p>Qual a ordem dos cabos nas portas?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Tentar a combinação de circuitos.',
            acao: () => {
                const combinacao = prompt('Digite a ordem dos cabos, separados por hífen (ex: Vermelho-Azul-Verde ou V-Az-Ve):').toLowerCase().split('-');
                // A única combinação que satisfaz é: Vermelho - Azul - Verde
                if (combinacao.length === 3 &&
                    (combinacao[0] === 'vermelho' || combinacao[0] === 'v') &&
                    (combinacao[1] === 'azul' || combinacao[1] === 'az') &&
                    (combinacao[2] === 'verde' || combinacao[2] === 've')) {
                    exibirMensagem('Os circuitos se conectam, e o dispositivo se ilumina! Uma tela holográfica exibe informações sobre um grupo hacker chamado "Guardiões do Folclore". (+20 Reputação)', 'success');
                    reputacao += 20;
                    adicionarItemInventario('Dados da Organização "Guardiões do Folclore"');
                    atualizarHUD();
                    irParaFase(8);
                } else {
                    exibirMensagem('Um choque elétrico! Os circuitos se sobrecarregam e você perde energia. (-25 Energia)', 'alert');
                    energia -= 25;
                    atualizarHUD();
                    // Permite tentar novamente
                    renderizarFase7();
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
}

// Fase 8: O Enigma da Curupira Hacker (Enigma de lógica)
function renderizarFase8() {
    gameTitle.textContent = 'Fase 8: O Enigma da Curupira Hacker';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")'; // Usando uma imagem genérica por enquanto
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

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
                    exibirMensagem('O portal se abre, revelando uma paisagem distorcida de dados e luzes! A Curupira acena com a cabeça em aprovação. (+20 Reputação)', 'success');
                    reputacao += 20;
                    atualizarHUD();
                    irParaFase(9);
                } else {
                    exibirMensagem('O portal se distorce e você é redirecionado para um loop de anúncios incessantes. Você perde tempo e energia. (-30 Energia, -10 Reputação)', 'alert');
                    energia -= 30;
                    reputacao -= 10;
                    atualizarHUD();
                    irParaFase(9); // Força o avanço, mas com penalidade
                }
            }
        },
        {
            texto: 'Tentar forçar o portal com um brute force. (-40 Energia)',
            acao: () => {
                energia -= 40;
                exibirMensagem('A Curupira ri. Seu brute force é inútil contra a magia digital dela. O portal o arremessa para a frente, mas você sente o impacto. (-10 Reputação)', 'alert');
                reputacao -= 10;
                atualizarHUD();
                irParaFase(9);
            }
        }
    ]);
}

// Fase 9: A Realidade Distorcida (Boto) (Enigma de percepção/ilusão)
function renderizarFase9() {
    gameTitle.textContent = 'Fase 9: A Realidade Distorcida';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")'; // Usando uma imagem genérica por enquanto
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

    gameScreen.innerHTML = `
        <p>Você entra em uma dimensão onde a realidade é fluida e distorcida. Imagens piscam, sons se misturam. Uma figura elegante, com traços de botos digitais, aparece e desaparece, criando ilusões.</p>
        <p>Para escapar, você deve identificar a **única imagem real** em meio a três ilusões. Olhe bem:</p>
        <p>1. Uma floresta de bytes cintilantes.</p>
        <p>2. Um terminal de computador flutuante, com a tela mostrando o pôr do sol do Alasca.</p>
        <p>3. Uma aurora boreal dançando ao som de códigos, com um pequeno **símbolo de uma chave** escondido nela.</p>
        <p>4. Uma cidade futurista construída com circuitos.</p>
        <p>Qual das opções representa a realidade, indicando a saída?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Escolher a imagem 1.',
            acao: () => verificarIlusao('1')
        },
        {
            texto: 'Escolher a imagem 2.',
            acao: () => verificarIlusao('2')
        },
        {
            texto: 'Escolher a imagem 3.',
            acao: () => verificarIlusao('3')
        },
        {
            texto: 'Escolher a imagem 4.',
            acao: () => verificarIlusao('4')
        }
    ]);

    function verificarIlusao(escolha) {
        if (escolha === '3') {
            exibirMensagem('A ilusão se desfaz, revelando o caminho para a Fortaleza de Gelo! Você percebeu a sutileza do Boto. (+15 Reputação)', 'success');
            reputacao += 15;
            atualizarHUD();
            irParaFase(10);
        } else {
            exibirMensagem('O Boto ri, e você se vê preso em um labirinto de ilusões. Você gasta energia para se libertar. (-20 Energia, -5 Reputação)', 'alert');
            energia -= 20;
            reputacao -= 5;
            atualizarHUD();
            irParaFase(10); // Força o avanço, mas com penalidade
        }
    }
}

// Fase 10: A Fortaleza do Gelo (Cuca) (Enigma de stealth/lógica)
function renderizarFase10() {
    gameTitle.textContent = 'Fase 10: A Fortaleza do Gelo';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")'; // Usando uma imagem genérica por enquanto
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

    gameScreen.innerHTML = `
        <p>Você se depara com a Fortaleza do Gelo, uma estrutura imponente e gelada, defendida por sentinelas de gelo que patrulham incessantemente. A Cuca, em sua forma digital, parece estar dentro, manipulando os dados roubados.</p>
        <p>Para entrar sem ser detectado, você precisa encontrar um padrão nas patrulhas dos sentinelas.</p>
        <p>Eles se movem em um padrão de 3-2-1-3-2-1 (3 segundos visível, 2 segundos escondido, 1 segundo em alerta, e repete).</p>
        <p>Qual o momento ideal para passar pela entrada principal sem ser visto?</p>
    `;

    exibirEscolhas([
        {
            texto: 'Passar nos 3 segundos visíveis.',
            acao: () => tentarEntrada('visivel')
        },
        {
            texto: 'Passar nos 2 segundos escondidos.',
            acao: () => tentarEntrada('escondido')
        },
        {
            texto: 'Passar no 1 segundo em alerta.',
            acao: () => tentarEntrada('alerta')
        }
    ]);

    function tentarEntrada(momento) {
        if (momento === 'escondido') {
            exibirMensagem('Você se move com precisão cirúrgica e entra furtivamente na fortaleza. A Cuca não faz ideia da sua chegada! (+25 Reputação)', 'success');
            reputacao += 25;
            atualizarHUD();
            irParaFase(11);
        } else {
            exibirMensagem('Você foi detectado! As sentinelas ativam alarmes e você precisa lutar para entrar. (-35 Energia, -15 Reputação)', 'alert');
            energia -= 35;
            reputacao -= 15;
            attackSound.play();
            atualizarHUD();
            irParaFase(11);
        }
    }
}

// Fase 11: O Chefão Final (Cuca) (Batalha/Enigma Final)
function renderizarFase11() {
    gameTitle.textContent = 'Fase 11: Confronto Final com a Cuca';
    gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")'; // Usando uma imagem genérica por enquanto
    hud.style.display = 'block';
    inventarioContainer.style.display = 'block';

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
            acao: () => atacarCuca('forca')
        },
        {
            texto: 'Comando de Inversão Lógica (DECRYPT_ALGORITMO)',
            acao: () => atacarCuca('logica_invertida')
        },
        {
            texto: 'Comando de Distração (FALSO_POSITIVO)',
            acao: () => atacarCuca('distracao')
        }
    ]);

    function atacarCuca(ataque) {
        if (ataque === 'logica_invertida') {
            exibirMensagem('O comando de inversão lógica atinge o ponto fraco do algoritmo da Cuca! Ela grita em uma linguagem binária distorcida enquanto seus dados começam a se desintegrar. Você recupera os dados do Folclore Digital! (+50 Reputação)', 'success');
            reputacao += 50;
            adicionarItemInventario('Dados do Folclore Digital Recuperados');
            atualizarHUD();
            irParaFase(12); // Vitória
        } else if (ataque === 'forca') {
            exibirMensagem('Seu ataque bruto é absorvido pela armadura de dados da Cuca. Ela contra-ataca com um pulso eletromagnético! (-40 Energia, -20 Reputação)', 'alert');
            energia -= 40;
            reputacao -= 20;
            attackSound.play();
            atualizarHUD();
            if (energia > 0) {
                renderizarFase11(); // Permite tentar novamente
            }
        } else if (ataque === 'distracao') {
            exibirMensagem('A Cuca mal percebe sua distração e lança uma barreira de gelo digital. (-20 Energia, -10 Reputação)', 'normal');
            energia -= 20;
            reputacao -= 10;
            atualizarHUD();
            if (energia > 0) {
                renderizarFase11(); // Permite tentar novamente
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

    if (energia > 0) {
        gameScreen.style.backgroundImage = 'url("https://as1.ftcdn.net/v2/jpg/04/85/38/54/1000_F_485385461_b4R7S93E5L9D3q6yR7V6m6X0V6h5H7Y5.jpg")'; // Usando uma imagem genérica por enquanto
        gameScreen.innerHTML = `
            <p class="final-text">Parabéns, ${player.nickname}!</p>
            <p class="final-text">Você desvendou o mistério e salvou os dados do Folclore Digital! Sua reputação como hacker no Alasca atingiu ${reputacao} pontos.</p>
            <p class="final-text">A rede agora está mais segura graças a você!</p>
            <button onclick="reiniciarJogo()">Jogar Novamente</button>
        `;
    } else {
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
}

// Inicializa o jogo ao carregar a página
document.addEventListener('DOMContentLoaded', iniciarJogo);
