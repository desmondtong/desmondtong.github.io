// Declaring selector
const body = document.querySelector("body");
const startMenu = document.querySelector(".start-menu");
const gameScreen = document.querySelector(".game-screen");

const playBtn = document.querySelectorAll(".play-btn");
const exitBtn = document.querySelectorAll(".exit-btn");
const resumeBtn = document.querySelector(".resume-btn");
const btn = document.querySelectorAll(".btn");

const timer = document.querySelector(".timer");
const counter = document.querySelectorAll(".counter");
const powerDiceDeck = document.querySelector(".power-dice-deck");
const powerDiceBtn = document.querySelector("#power-dice-btn");

const playerCannon = document.querySelector("#player-cannon");
const cannons = {
  p1Cannon: document.querySelector("#p1-cannon"),
  p1CannonBtn: document.querySelector("#p1-cannon-btn"),
  p1CannonDice: document.querySelector("#p1-cannon-dice"),
  p2Cannon: document.querySelector("#p2-cannon"),
  p2CannonBtn: document.querySelector("#p2-cannon-btn"),
  p2CannonDice: document.querySelector("#p2-cannon-dice"),
};

const towers = {
  p1Tower: document.querySelector("#p1-tower"),
  p2Tower: document.querySelector("#p2-tower"),
};
const towerHp = {
  p1Hp: document.querySelector("#p1-hp"),
  p2Hp: document.querySelector("#p2-hp"),
};

const startGameOverlay = document.querySelector(".start-game-overlay");
const startGameMsg = document.querySelector(".start-game-msg");
const roundMsg = document.querySelector(".round-msg");
const resultMsg = document.querySelector(".result-msg");
const diceMsg = document.querySelector(".dice-msg");

const dispP1Name = document.querySelector("#disp-p1");
const dispP2Name = document.querySelector("#disp-p2");

const stat = {
  p1Stat: document.querySelector("#p1-stat"),
  p2Stat: document.querySelector("#p2-stat"),
};

const clickSound = new Audio("../Assets/click2.mp3");
const destroyTowerSound = new Audio("../Assets/destroy-tower-short.mp3");
const getItemSound = new Audio("../Assets/get-item.mp3");
const healSound = new Audio("../Assets/heal-dice.mp3");
const healSound2 = new Audio("../Assets/heal-dice-2.wav");
const swapSound = new Audio("../Assets/swap-dice.mp3");
const swapSound2 = new Audio("../Assets/swap-dice-2.mp3");
const shieldSound = new Audio("../Assets/shield-dice.mp3");
const ricoSound = new Audio("../Assets/ricochet-dice.mp3");
const gameBgm = new Audio("../Assets/game-music.mp3");

// Initialize variables
const timeEachRound = 10;
const maxHP = 50;
let interval, randomPowerDice, takeDamage, towerArr, towerNew, hpHeal, healed;
let resultDisplayed, pauseDisplayed;
let cannonDice = [];
let round = 1;
let currPlayer = 1;
let gameTime = timeEachRound;
let playerName = {};

// Function
function init() {
  round = 1;
  currPlayer = 1;
  gameTime = timeEachRound;
  resultDisplayed = false;
  pauseDisplayed = false;

  for (let el = 1; el < counter.length; el++) {
    counter[el].classList.add("inactive");
  }

  timer.textContent = gameTime;

  powerDiceDeck.classList.add("inactive");
  powerDiceBtn.classList.add("disabled");

  cannons.p1Cannon.classList.remove("inactive");
  cannons.p1CannonBtn.classList.remove("disabled");
  cannons.p1CannonDice.classList.remove("inactive");
  cannons.p2Cannon.classList.add("inactive");
  cannons.p2CannonBtn.classList.add("disabled");
  cannons.p2CannonDice.classList.remove("inactive");

  for (const tower of Object.values(towers)) {
    tower.innerHTML = generateTower(maxHP);
  }

  towerHp.p1Hp.textContent = maxHP;
  towerHp.p2Hp.textContent = maxHP;

  cannons.p1CannonDice.innerHTML = generateCannonDice(1);
  cannons.p2CannonDice.innerHTML = generateCannonDice(2);

  stat.p1Stat.innerHTML = "";
  stat.p2Stat.innerHTML = "";
  towers.p1Tower.classList.remove("shield");
  towers.p1Tower.classList.remove("ricochet");
  towers.p2Tower.classList.remove("shield");
  towers.p2Tower.classList.remove("ricochet");

  // init power dice deck
  for (let i = 1; i <= 4; i++) {
    document.querySelector(`#power-dice-${i}`).classList.remove("chosen");
  }

  displayRoundMsg();
}

function generateTower(maxHP) {
  let content = [];
  for (let i = 0; i < maxHP; i++) {
    content.push(
      `<img src="../Assets/dice/dice-${Math.ceil(
        Math.random() * 6
      )}.png" class="dice-png" />`
    );
  }
  return content.join("\n");
}

function generateCannonDice(player) {
  cannonDice[0] = Math.ceil(Math.random() * 6);
  cannonDice[1] = Math.ceil(Math.random() * 6);
  return `<img src="../Assets/brown dice/${cannonDice[0]}.png" class="brown-dice-png" />
      <p class="cannon-dice">X</p>
      <img src="../Assets/brown dice/${cannonDice[1]}.png" class="brown-dice-png" />
      <p class="cannon-dice">=</p>
      <p class="cannon-dice" id="p${player}-shots">?</p>`;
}

function displayStartMsg(p1, p2) {
  startGameMsg.innerHTML = `<span class="display-msg">START!</span><br />${p1} VS ${p2}`;
}

function startGame(e) {
  e.preventDefault();
  if (e.target.tagName !== "BUTTON") return;

  gameBgm.play();
  gameBgm.loop = true;
  gameBgm.volume = 0.2;

  playerName = {
    p1Name: document.querySelector("#p1Name").value,
    p2Name: document.querySelector("#p2Name").value,
  };

  dispP1Name.textContent = playerName.p1Name;
  dispP2Name.textContent = playerName.p2Name;

  startMenu.classList.add("hidden");
  body.style.background = "url(' ')";
  body.style.backgroundColor = "var(--pastel-brown)";

  gameScreen.classList.remove("hidden");
  startGameOverlay.classList.remove("hidden");
  displayStartMsg(playerName.p1Name, playerName.p2Name);

  init();
  setTimeout(() => {
    startGameOverlay.classList.add("fade-out");
    gameTimer();
  }, 2000);
  setTimeout(() => {
    startGameOverlay.classList.add("hidden");
    startGameOverlay.classList.remove("fade-out");
  }, 3000);
}

function gameTimer(pause = false) {
  interval = setInterval(() => {
    if (pause) {
      if (round === 3 || round === 6) return;
    }

    if (
      (timer.textContent == 0 && round <= 8) ||
      cannons[`p${currPlayer}CannonBtn`].classList.contains("disabled")
    ) {
      timer.textContent = gameTime;
      switchPlayer();
    } else if (timer.textContent > 0 && round <= 8) {
      timer.textContent--;
    } else {
      timer.textContent = 0;
      displayResult(true);
      clearInterval(interval);
    }
  }, 1000);
}

function switchPlayer() {
  // disable current player button
  cannons[`p${currPlayer}Cannon`].classList.add("inactive");
  cannons[`p${currPlayer}CannonBtn`].classList.add("disabled");
  cannons[`p${currPlayer}CannonDice`].classList.add("inactive");

  // update round counter
  if (currPlayer === 2 && round < 8) {
    counter[round].classList.remove("inactive");
    round++;
    console.log(`now is round ${round}`);
  } else if (currPlayer === 2 && round === 8) {
    console.log("GAME FINISHED");
    round++;
    return;
  }

  // switch player
  currPlayer = currPlayer === 1 ? 2 : 1;

  // enable power dice deck
  if (round === 3 || round === 6) {
    cannons["p1Cannon"].classList.add("inactive");
    cannons["p1CannonBtn"].classList.add("disabled");
    cannons["p1CannonDice"].classList.add("inactive");
    cannons["p2Cannon"].classList.add("inactive");
    cannons["p2CannonBtn"].classList.add("disabled");
    cannons["p2CannonDice"].classList.add("inactive");

    powerDiceDeck.classList.remove("inactive");
    powerDiceBtn.classList.remove("disabled");
    displayRoundMsg(true);

    // init power dice deck
    for (let i = 1; i <= 4; i++) {
      document.querySelector(`#power-dice-${i}`).classList.remove("chosen");
    }

    clearInterval(interval);
    return;
  }

  // enable next player button
  cannons[`p${currPlayer}Cannon`].classList.remove("inactive");
  cannons[`p${currPlayer}CannonBtn`].classList.remove("disabled");
  cannons[`p${currPlayer}CannonDice`].classList.remove("inactive");
  displayRoundMsg();
}

function attackTower(nosOfShots) {
  // check if can ricochet
  if (towers[`p${currPlayer}Tower`].classList.contains("ricochet")) {
    takeDamage = currPlayer;
    stat[`p${takeDamage == 1 ? 2 : 1}Stat`].innerHTML = "";
    ricoSound.play();

    diceActionMsg("ricochet", playerName[`p${takeDamage == 1 ? 2 : 1}Name`]);
  } else {
    takeDamage = currPlayer === 1 ? 2 : 1;
  }
  // check if have shield
  if (towers[`p${takeDamage}Tower`].classList.contains("shield")) {
    nosOfShots = Math.ceil(nosOfShots / 2);
    stat[`p${takeDamage}Stat`].innerHTML = "";
    shieldSound.play();

    diceActionMsg("shield", playerName[`p${takeDamage}Name`]);
  }

  towerHp[`p${takeDamage}Hp`].textContent = Math.max(
    towerHp[`p${takeDamage}Hp`].textContent - nosOfShots,
    0
  );

  // update tower dice
  updateTower(nosOfShots);

  // remove power dice class
  towers[`p${takeDamage}Tower`].classList.remove("shield");
  towers[`p${currPlayer}Tower`].classList.remove("ricochet");

  if (towerHp[`p${takeDamage}Hp`].textContent == 0) {
    clearInterval(interval);

    displayResult();
    return true;
  }
}

function powerDice() {
  randomPowerDice = Math.ceil(Math.random() * 4);
  document
    .querySelector(`#power-dice-${randomPowerDice}`)
    .classList.add("chosen");

  switch (randomPowerDice) {
    case 1: // shield dice
      towers[`p${currPlayer}Tower`].classList.add("shield");
      stat[`p${currPlayer}Stat`].innerHTML = `<div><img
      src="../Assets/power-dice/shield-dice.png"
      class="power-dice-icon"
    /></div>`;
      getItemSound.play();
      displayRoundMsg(true, "Shield Dice");
      break;
    case 2: // ricochet dice
      // add rico class to opponent
      towers[`p${currPlayer === 1 ? 2 : 1}Tower`].classList.add("ricochet");
      stat[`p${currPlayer}Stat`].innerHTML = `<div><img
      src="../Assets/power-dice/ricochet-dice.png"
      class="power-dice-icon"
    /></div>`;
      getItemSound.play();
      displayRoundMsg(true, "Ricochet Dice");
      break;
    case 3: // heal dice
      hpHeal = Math.max(Math.ceil(Math.random() * 20), 10);
      towerHp[`p${currPlayer}Hp`].textContent = Math.min(
        Number(towerHp[`p${currPlayer}Hp`].textContent) + hpHeal,
        maxHP
      );
      displayRoundMsg(true, "Heal Dice");
      setTimeout(() => {
        updateTower(hpHeal, true);
        healSound.play();
        healSound2.play();
      }, 1000);
      break;
    case 4: // swap dice
      setTimeout(() => {
        a = [towerHp.p1Hp.textContent, towerHp.p2Hp.textContent];
        towerHp.p1Hp.textContent = a[1];
        towerHp.p2Hp.textContent = a[0];

        b = [towers.p1Tower.innerHTML, towers.p2Tower.innerHTML];
        towers.p1Tower.innerHTML = b[1];
        towers.p2Tower.innerHTML = b[0];

        swapSound.play();
        swapSound2.play();
      }, 1000);
      displayRoundMsg(true, "Swap Dice");
      diceActionMsg("swap", playerName[`p${currPlayer}Name`]);
      break;
  }
}

function updateTower(hp, heal = false) {
  if (heal) {
    towerArr = towers[`p${currPlayer}Tower`].innerHTML.split("\n");
    hp = Math.min(maxHP - towerArr.length, hp);

    towerNew =
      towers[`p${currPlayer}Tower`].innerHTML + "\n" + generateTower(hp);
    towers[`p${currPlayer}Tower`].innerHTML = towerNew;

    diceActionMsg("heal", playerName[`p${currPlayer}Name`], hp);
  } else {
    towerArr = towers[`p${takeDamage}Tower`].innerHTML.split("\n");
    for (let i = 1; i <= hp; i++) {
      setTimeout(() => {
        towerNew = towerArr
          .toSpliced(
            i == 1 ? towerArr.length - 1 : towerNew.split("\n").length - 1
          )
          .join("\n");
        towers[`p${takeDamage}Tower`].innerHTML = towerNew;
      }, 60 * i);
    }
    destroyTowerSound.play();
  }
}

function displayResult(tie = false) {
  if (tie) {
    resultMsg.innerText = `IT'S A TIE!`;
    new bootstrap.Modal(document.querySelector("#resultModal")).show();
    resultDisplayed = true;
  } else {
    resultMsg.textContent =
      playerName[`p${towerHp.p1Hp.textContent == 0 ? 2 : 1}Name`] +
      " WIN THE GAME!";
    new bootstrap.Modal(document.querySelector("#resultModal")).show();
    resultDisplayed = true;
  }
}

function displayRoundMsg(powerDice = false, diceName = "") {
  if (powerDice) {
    if (diceName !== "") {
      roundMsg.textContent = `${
        playerName[`p${currPlayer}Name`]
      } get a ${diceName}!`;
    } else {
      roundMsg.textContent = `${
        playerName[`p${currPlayer}Name`]
      }'s turn! Try your luck!`;
    }
  } else {
    roundMsg.textContent = `${
      playerName[`p${currPlayer}Name`]
    }'s turn! Roll your Cannon Dice!`;
  }
}

function diceActionMsg(x, ...arg) {
  switch (x) {
    case "shield":
      diceMsg.textContent = `${arg[0]}'s tower took only half the damage!`;
      break;
    case "ricochet":
      diceMsg.textContent = `${arg[0]} reflected the damage to the opponent!`;
      break;
    case "heal":
      diceMsg.textContent = `${arg[0]}'s tower revived by ${arg[1]} HP!`;
      break;
    case "swap":
      diceMsg.textContent = `${arg[0]} swapped the tower's HP with the opponent!`;
      break;
  }
  diceMsg.classList.remove("fade-out");
  setInterval(() => {
    diceMsg.classList.add("fade-out");
  }, 2000);
}

// Event button
for (const each of btn)
  each.addEventListener("click", function (e) {
    clickSound.play();
  });

for (const btn of playBtn) [btn.addEventListener("click", startGame)];

powerDiceBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.tagName !== "BUTTON") return;

  powerDice();

  setTimeout(() => {
    powerDiceDeck.classList.add("inactive");
  }, 2000);
  powerDiceBtn.classList.add("disabled");

  // after roll power dice then enable currPlayer button
  setTimeout(() => {
    cannons[`p${currPlayer}Cannon`].classList.remove("inactive");
    cannons[`p${currPlayer}CannonBtn`].classList.remove("disabled");
    cannons[`p${currPlayer}CannonDice`].classList.remove("inactive");
    displayRoundMsg();

    gameTimer();
  }, 2000);
});

playerCannon.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.tagName !== "BUTTON") return;

  // disable button after click & stop time
  cannons[`p${currPlayer}CannonBtn`].classList.add("disabled");
  clearInterval(interval);

  // updated cannon dice equation
  cannons[`p${currPlayer}CannonDice`].innerHTML =
    generateCannonDice(currPlayer);
  document.querySelector(`#p${currPlayer}-shots`).textContent =
    cannonDice[0] * cannonDice[1];

  if (attackTower(cannonDice[0] * cannonDice[1])) return;

  gameTimer();
});

for (const btn of exitBtn) {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.tagName !== "BUTTON") return;

    startMenu.classList.remove("hidden");
    body.style.background = "url('../Assets/start-menu.png')";
    body.style.backgroundSize = "cover";

    gameScreen.classList.add("hidden");
    startGameOverlay.classList.add("hidden");

    gameBgm.pause();
  });
}

resumeBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.tagName !== "BUTTON") return;

  pauseDisplayed = false;
  gameTimer(true);
});

document.addEventListener("keydown", function (e) {
  if (pauseDisplayed) return;
  if (
    e.key === "Escape" &&
    !gameScreen.classList.contains("hidden") &&
    resultDisplayed === false
  ) {
    clearInterval(interval);
    pauseDisplayed = true;
    new bootstrap.Modal(document.querySelector("#pauseModal")).show();
    clickSound.play();
  }
});

// init();
// gameTimer();
