function startGame() {
    const name = document.getElementById('playerName').value;
    const race = document.getElementById('playerRace').value;
    const email = document.getElementById('playerEmail').value;

    if (name === "" || email === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const gameScreen = document.getElementById('gameScreen');
    gameScreen.innerHTML = `
        <h2>Bem-vindo(a), ${name}!</h2>
        <p>Raça: ${race}</p>
        <p>Email: ${email}</p>
        <p>Você está em uma plantação congelada no Alasca, com seu laptop hackeado por um espírito da floresta...</p>
        <p>O que deseja fazer?</p>
        <button onclick="chooseOption('abrigo')">Procurar abrigo</button>
        <button onclick="chooseOption('hackear')">Hackear estação meteorológica</button>
        <button onclick="chooseOption('invocar')">Invocar a Mula Sem Cabeça</button>
    `;
}

function chooseOption(option) {
    const gameScreen = document.getElementById('gameScreen');
    if (option === 'abrigo') {
        gameScreen.innerHTML = "<p>Você encontra uma caverna... mas ela está cheia de criaturas misteriosas! Fim de demonstração.</p>";
    } else if (option === 'hackear') {
        gameScreen.innerHTML = "<p>Você hackeou o sistema e descobriu uma tempestade vindo! Fim de demonstração.</p>";
    } else if (option === 'invocar') {
        gameScreen.innerHTML = "<p>A Mula Sem Cabeça aparece com chamas e... fim de demonstração!</p>";
    }
}
