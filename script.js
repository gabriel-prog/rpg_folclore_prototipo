function startGame() {
    const name = document.getElementById('playerName').value;
    const race = document.getElementById('playerRace').value;
    const email = document.getElementById('playerEmail').value;

    if (name === "" || email === "") {
        alert("⚠️ Por favor, preencha todos os campos!");
        return;
    }

    const gameScreen = document.getElementById('gameScreen');
    gameScreen.innerHTML = `
        <h2>👾 Bem-vindo(a), ${name}!</h2>
        <p>Raça: ${race}</p>
        <p>Email: ${email}</p>
        <p>📍 Você está no meio de uma plantação congelada no Alasca... Um sinal de rádio estranho invade seu laptop hackeado por entidades folclóricas.</p>
        <p>O que deseja fazer?</p>
        <button onclick="chooseOption('abrigo')">🏕️ Procurar abrigo</button>
        <button onclick="chooseOption('hackear')">💻 Hackear estação meteorológica</button>
        <button onclick="chooseOption('invocar')">🔥 Invocar a Mula Sem Cabeça</button>
    `;
}

function chooseOption(option) {
    const gameScreen = document.getElementById('gameScreen');
    if (option === 'abrigo') {
        gameScreen.innerHTML = "<p>🏕️ Você encontrou uma caverna... mas ela está cheia de entidades misteriosas! 👻 Fim da demonstração.</p>";
    } else if (option === 'hackear') {
        gameScreen.innerHTML = "<p>💻 Você hackeou o sistema e descobriu uma tempestade se aproximando! 🌨️ Fim da demonstração.</p>";
    } else if (option === 'invocar') {
        gameScreen.innerHTML = "<p>🔥 A Mula Sem Cabeça surge em chamas! Você sente o chão tremer... Fim da demonstração!</p>";
    }
}
