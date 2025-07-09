document.addEventListener('DOMContentLoaded', () => {
  // 游戏配置
  let gameConfig = {
    size: '4x4',
    cards: [],
    matchedCards: [],
    flippedCards: [],
    moves: 0,
    timer: 0,
    timerInterval: null,
    isPlaying: false
  };

  // 卡片图标集合
  // 只保留Font Awesome 6 Free Solid/Regular中常见、确定能显示的图标
  const icons = [
    'fa-heart', 'fa-star', 'fa-diamond', 'fa-bolt', 'fa-leaf', 'fa-bicycle',
    'fa-car', 'fa-plane', 'fa-rocket', 'fa-tree', 'fa-anchor', 'fa-coffee',
    'fa-apple-alt', 'fa-bell', 'fa-camera', 'fa-gift', 'fa-key', 'fa-moon',
    'fa-sun', 'fa-umbrella', 'fa-home', 'fa-glass-martini', 'fa-utensils', 'fa-gamepad',
    'fa-headphones', 'fa-music', 'fa-paint-brush', 'fa-paw', 'fa-bomb', 'fa-graduation-cap',
    'fa-futbol', 'fa-shield-alt', 'fa-ship', 'fa-truck', 'fa-subway', 'fa-train',
    'fa-ambulance', 'fa-bus', 'fa-fire-extinguisher', 'fa-heartbeat', 'fa-film',
    'fa-video', 'fa-image', 'fa-microphone', 'fa-book', 'fa-book-open', 'fa-cube',
    'fa-cubes', 'fa-dice', 'fa-dice-five', 'fa-dice-six', 'fa-dice-d20', 'fa-dice-d6',
    'fa-feather', 'fa-fish', 'fa-flask', 'fa-gem', 'fa-globe', 'fa-hat-wizard',
    'fa-lemon', 'fa-lightbulb', 'fa-magnet', 'fa-mug-hot', 'fa-paper-plane', 'fa-pepper-hot',
    'fa-pizza-slice', 'fa-seedling', 'fa-snowflake', 'fa-spa', 'fa-star-half-alt', 'fa-trophy',
    'fa-tree', 'fa-user-astronaut', 'fa-user-ninja', 'fa-wine-glass'
  ];

  // DOM 元素
  const gameContainer = document.getElementById('game-container');
  const movesCounter = document.getElementById('moves');
  const timerDisplay = document.getElementById('timer');
  const restartButton = document.getElementById('restart');
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  const gameOverModal = document.getElementById('game-over-modal');
  const finalTimeDisplay = document.getElementById('final-time');
  const finalMovesDisplay = document.getElementById('final-moves');
  const playAgainButton = document.getElementById('play-again');

  // 初始化游戏
  function initGame() {
    resetGameState();
    const [rows, cols] = gameConfig.size.split('x').map(Number);
    const totalCards = rows * cols;
    const shuffledIcons = [...icons].sort(() => 0.5 - Math.random()).slice(0, totalCards / 2);
    const pairs = [...shuffledIcons, ...shuffledIcons];
    gameConfig.cards = pairs.sort(() => 0.5 - Math.random());
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    generateCards(rows, cols);
    startTimer();
  }

  function resetGameState() {
    gameConfig.matchedCards = [];
    gameConfig.flippedCards = [];
    gameConfig.moves = 0;
    gameConfig.timer = 0;
    movesCounter.textContent = '0';
    timerDisplay.textContent = '00:00';
    if (gameConfig.timerInterval) {
      clearInterval(gameConfig.timerInterval);
      gameConfig.timerInterval = null;
    }
    gameOverModal.classList.add('hidden');
    gameContainer.innerHTML = '';
  }

  function generateCards(rows, cols) {
    let iconSizeClass = 'text-base';
    let gapClass = 'gap-1';
    let gridClass = '';
    if (cols === 4) {
      iconSizeClass = 'text-3xl';
      gapClass = 'gap-2 sm:gap-3';
      gridClass = `grid grid-cols-4 ${gapClass}`;
    } else if (cols === 6) {
      iconSizeClass = 'text-xl';
      gapClass = 'gap-1.5 sm:gap-2';
      gridClass = `grid grid-cols-6 ${gapClass}`;
    } else if (cols === 8) {
      iconSizeClass = 'text-lg';
      gapClass = 'gap-1';
      gridClass = `grid grid-cols-8 ${gapClass}`;
    } else if (cols === 10) {
      iconSizeClass = 'text-base';
      gapClass = 'gap-0.5';
      gridClass = `grid grid-cols-10 ${gapClass}`;
    } else if (cols === 12) {
      iconSizeClass = 'text-xs';
      gapClass = 'gap-0.5';
      gridClass = `grid grid-cols-12 ${gapClass}`;
    } else {
      iconSizeClass = 'text-base';
      gapClass = 'gap-1';
      gridClass = `grid grid-cols-${cols} ${gapClass}`;
    }
    gameContainer.className = `${gridClass} mb-8`;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        const card = document.createElement('div');
        card.className = 'card-flip relative aspect-square cursor-pointer min-w-0 min-h-0';
        card.dataset.index = index;
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80 rounded-xl shadow flex items-center justify-center';
        cardFront.innerHTML = `<i class="fa fa-question text-white ${iconSizeClass}"></i>`;
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back absolute inset-0 bg-white rounded-xl shadow flex items-center justify-center';
        let iconClass = gameConfig.cards[index];
        let faPrefix = 'fa-solid';
        const regularIcons = [
          'fa-star', 'fa-moon', 'fa-sun', 'fa-image', 'fa-lightbulb', 'fa-gem', 'fa-lemon', 'fa-paper-plane', 'fa-snowflake', 'fa-star-half-alt', 'fa-futbol'
        ];
        if (regularIcons.includes(iconClass)) faPrefix = 'fa-regular';
        if (!iconClass || typeof iconClass !== 'string') {
          iconClass = 'fa-question-circle';
          faPrefix = 'fa-regular';
        }
        cardBack.innerHTML = `<i class="fa ${faPrefix} ${iconClass} ${iconSizeClass}"></i>`;
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        card.addEventListener('click', handleCardClick);
        gameContainer.appendChild(card);
      }
    }
  }

  function handleCardClick(e) {
    const card = e.currentTarget;
    const index = parseInt(card.dataset.index);
    if (gameConfig.flippedCards.length >= 2 ||
        gameConfig.matchedCards.includes(index) ||
        gameConfig.flippedCards.includes(index)) {
      return;
    }
    flipCard(card);
    gameConfig.flippedCards.push(index);
    if (gameConfig.flippedCards.length === 2) {
      setTimeout(checkForMatch, 500);
    }
  }

  function flipCard(card) {
    card.classList.add('card-flipped');
  }

  function checkForMatch() {
    const [card1Index, card2Index] = gameConfig.flippedCards;
    gameConfig.moves++;
    movesCounter.textContent = gameConfig.moves;
    if (gameConfig.cards[card1Index] === gameConfig.cards[card2Index]) {
      matchCards(card1Index, card2Index);
    } else {
      unflipCards(card1Index, card2Index);
    }
    gameConfig.flippedCards = [];
    checkGameOver();
  }

  function matchCards(card1Index, card2Index) {
    gameConfig.matchedCards.push(card1Index, card2Index);
    const card1 = document.querySelector(`[data-index="${card1Index}"]`);
    const card2 = document.querySelector(`[data-index="${card2Index}"]`);
    card1.classList.add('card-matched');
    card2.classList.add('card-matched');
    const card1Back = card1.querySelector('.card-back');
    const card2Back = card2.querySelector('.card-back');
    card1Back.classList.remove('bg-white');
    card2Back.classList.remove('bg-white');
    card1Back.classList.add('bg-green-100');
    card2Back.classList.add('bg-green-100');
    const card1Icon = card1Back.querySelector('i');
    const card2Icon = card2Back.querySelector('i');
    card1Icon.classList.add('text-green-600');
    card2Icon.classList.add('text-green-600');
  }

  function unflipCards(card1Index, card2Index) {
    const card1 = document.querySelector(`[data-index="${card1Index}"]`);
    const card2 = document.querySelector(`[data-index="${card2Index}"]`);
    setTimeout(() => {
      card1.classList.remove('card-flipped');
      card2.classList.remove('card-flipped');
    }, 300);
  }

  function checkGameOver() {
    const totalCards = gameConfig.cards.length;
    if (gameConfig.matchedCards.length === totalCards) {
      endGame();
    }
  }

  function startTimer() {
    if (gameConfig.timerInterval) {
      clearInterval(gameConfig.timerInterval);
    }
    gameConfig.timerInterval = setInterval(() => {
      gameConfig.timer++;
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(gameConfig.timer / 60);
    const seconds = gameConfig.timer % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function endGame() {
    clearInterval(gameConfig.timerInterval);
    finalTimeDisplay.textContent = timerDisplay.textContent;
    finalMovesDisplay.textContent = gameConfig.moves;
    gameOverModal.classList.remove('hidden');
  }

  restartButton.addEventListener('click', initGame);
  playAgainButton.addEventListener('click', initGame);

  difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
      difficultyButtons.forEach(btn => {
        btn.classList.remove('bg-primary');
        const size = btn.getAttribute('data-size');
        if (size === '4x4') {
          btn.classList.add('bg-primary/90');
        } else if (size === '6x6') {
          btn.classList.add('bg-primary/80');
        } else if (size === '8x8') {
          btn.classList.add('bg-primary/70');
        } else if (size === '10x10') {
          btn.classList.add('bg-primary/60');
        } else if (size === '12x12') {
          btn.classList.add('bg-primary/50');
        } else {
          btn.classList.add('bg-primary/30');
        }
      });
      button.classList.remove('bg-primary/90', 'bg-primary/80', 'bg-primary/70', 'bg-primary/60', 'bg-primary/50', 'bg-primary/40', 'bg-primary/30');
      button.classList.add('bg-primary');
      gameConfig.size = button.getAttribute('data-size');
      initGame();
    });
  });

  initGame();
});
