////////////////////////////////////////////////////////////////////////////////////
//
//  app.js
//  main code for Froggeresque
//  works with: engine.js, resources.js
//
////////////////////////////////////////////////////////////////////////////////////


// Global variable to hold onto global variables safely:
var app = app || {};
//
app.player_base_move = 30;
app.score = 0;
app.lives = 3;
app.WINNING_SCORE = 4; // arbitrary WIN condition
app.pngWidth = 56; //total width of png: 101
app.pngHeight = 56; // total height of png : 171
app.allEnemies = []; // holder for array of Enemies
app.allGems = []; // holder for Gems.
// global functions also go here.
app.parkEnemies = function() {
    // hide them offscreen until player is ready to restart
    for (var enemy = 0; enemy < app.allEnemies.length; enemy++) {
        app.allEnemies[enemy].x = -200;
        app.allEnemies[enemy].speed = 0;
    }
}

// Mover is base class for Players, Bugs and Gems because they have enough
//  common code to share some methods and functions
//  Note that now we'll pass the X, Y, AND the Sprite image file string
//  such as 'images/Gem Blue.png'.
//
var Mover = function(place_x, place_y, sprite) {
    this.x = place_x;
    this.y = place_y;
    this.sprite = sprite;
};

Mover.prototype.update = function(this_x, this_y) {
    this.x = this_x;
    this.y = this_y;
};

Mover.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Mover.prototype.sayHello = function() {
    console.log("Hello World!");
};
//var mover = new Mover(200, 200, "images/Heart.png")


/////////////////////////////////////////////////////////////////
// Enemies our player must avoid

function Enemy(enemy_x, enemy_y, sprite, startSpeed) {
    //Calling the parent contructor -- pass the first three items
    Mover.call(this, enemy_x, enemy_y, sprite);
    // Now initialize Enemy-specific property
    this.speed = startSpeed;
}

// Create the Enemy.prototype object that inherits from Mover
Enemy.prototype = Object.create(Mover.prototype);
// Set "constructor" property
Enemy.prototype.constructor = Enemy;

Enemy.prototype.sayHello = function() {
    console.log("I'm an enemy... my speed is " + this.speed);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.x = this.x + this.speed * dt;
    if (this.x > 505) {
        this.speed = this.reset();
    }
    // invoke collision detection
    this.findCollision();
    this.gemCollision();
};

Enemy.prototype.reset = function(speed) {
    this.x = -100;
    var speed = Math.floor(Math.random() * 140 + 40);
    //console.log("Bug reset, new speed is " + speed + "!");
    return speed;
};

//var enemyNEW = new Enemy(200, 200, "images/Heart.png", 50);

// method to handle collisions!
Enemy.prototype.findCollision = function() {

    if (player.x < this.x + app.pngWidth &&
        player.x + app.pngWidth > this.x &&
        player.y < this.y + app.pngHeight &&
        player.y + app.pngHeight > this.y) {
        //collision?
        //console.log("Enemy Collision!!!1!");
        app.lives--;
        document.getElementById("lives").value = app.lives;
        if (app.lives < 1) {
            app.parkEnemies();
            app.score = 0;
            app.lives = 0;
            gameMessage("<img src='images/enemy-bug.png' alt='Enemy Bug picture'><p>Sorry, you're out of lives!<br/>Start over?</p>");
            hideStart();
            hideRestart();
            showReplay();
        } else {
            player.reset(app.lives + " lives left, continue?");
        }
    }

};

// method to handle collisions!
Enemy.prototype.gemCollision = function() {

    // there are multiple gems!
    for (var gem = 0; gem < app.allGems.length; gem++) {
        if (app.allGems[gem].x < this.x + app.pngWidth &&
            app.allGems[gem].x + app.pngWidth > this.x &&
            app.allGems[gem].y < this.y + app.pngHeight &&
            app.allGems[gem].y + app.pngHeight > this.y) {
            //collision?
            //console.log("Gem Collision!!!1!");
            app.allGems[gem].reset();
        }
    }
};

/////////////////////////////////////////////////////////////////////////////
// Gems
var Gem = function(gem_x, gem_y) {
    this.x = gem_x;
    this.y = gem_y;
    //image sprite
    this.sprite = 'images/Gem Blue.png';
};

Gem.prototype.update = function(gem_x, gem_y) {
    this.x = gem_x;
    this.y = gem_y;
};

Gem.prototype.reset = function() {
    var place_x = Math.floor(Math.random() * 450 + 30);
    var place_y = Math.floor(Math.random() * 250 + 30);
    //console.log("Gem reset, now x:" + place_x + " y:" + place_y + "!");
    this.update(place_x, place_y);
};
// Draw the enemy on the screen, required method for game
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// place the gems
for (var gem = 0; gem < 3; gem++) {
    var place_x = Math.floor(Math.random() * 300 + 30);
    var place_y = Math.floor(Math.random() * 300 + 30);
    var newGem = new Gem(place_x, place_y);
    //console.log(newGem);
    app.allGems.push(newGem);
}
//console.log(app.allGems);

// if we restart the game, all gems have to be replaced on teh board
function resetAllGems() {
    for (var gem = 0; gem < 3; gem++) {
        app.allGems[gem].y = Math.floor(Math.random() * 300 + 30);
        app.allGems[gem].x = Math.floor(Math.random() * 300 + 30);
    }
}


// Now write your own player class ////////////////////////////////////////////
// This class requires an update(), render() and
// a handleInput() method.
// Now write your own player class
var Player = function() {
    this.x = 200;
    this.y = 410;
    // NOTE: default player is a girl!
    this.sprite = 'images/char-pink-girl.png';
};

Player.prototype.update = function() {
    //check to see if we've scored a gem.
    this.gemCollision();
    //NOTE: incrementing the score inside here means that it updates multiple times!
};

// event is win or lose, restart the player back to start square
//  and, send on the game message.
Player.prototype.reset = function(msg) {
    this.x = 200;
    this.y = 410;
    //console.log("Player starts over!");

    gameMessage(msg);
    // get enemies into position to start over
    app.parkEnemies();

}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(event) {
    this.ctlKey = event;
    //console.log(this.ctlKey);

    if (this.ctlKey === 'left' && this.x > 0) {
        this.x -= app.player_base_move;
    } else if (this.ctlKey === 'right' && this.x < 410) {
        this.x = this.x + app.player_base_move;
    } else if (this.ctlKey === 'up' && this.y > 18) {
        this.y = this.y - app.player_base_move;
    } else if (this.ctlKey === 'down' && this.y < 410) {
        this.y = this.y + app.player_base_move;
    }

    if (player.y === -10) {
        adjustScore();
        var leftToGo = app.WINNING_SCORE - app.score;
        if (app.score >= app.WINNING_SCORE || leftToGo === 0) {
            restartGame();
        } else {
            player.reset("You WON this round!<br/>Only " + leftToGo + " points to go!");
        }
    }
    //console.log(this.ctlKey + ": I am at x" + this.x + ", y" + this.y);
};

// method to handle collisions!
Player.prototype.gemCollision = function() {

    // there are multiple gems!
    for (var gem = 0; gem < app.allGems.length; gem++) {
        if (app.allGems[gem].x < this.x + app.pngWidth &&
            app.allGems[gem].x + app.pngWidth > this.x &&
            app.allGems[gem].y < this.y + app.pngHeight &&
            app.allGems[gem].y + app.pngHeight > this.y) {
            //collision?
           // console.log("Player Gem Collision!!!1!");
            // move the gem offscreen where it won't count anymore
            app.allGems[gem].y = 1000;
            // increment the score
            adjustScore();
            // test if we've gotten to WIN...
            if (app.score >= app.WINNING_SCORE) {
                restartGame();
            }
        }
    }

};

////////////////////////////////////////////////////////////////////////////
// Game functions
////////////////////////////////////////////////////////////////////////////

// decided I wanted predictable paths for bugs, hence the array.
var paths = [65, 145, 226];

for (var path = 0; path < paths.length; path++) {
    //var speed = Math.floor(Math.random() * 140 + 40);
    //var startingLine = Math.floor(Math.random() * 300 + 100);
    // now we START all enemies offscreen, and let the player 'restart' them
    // when they are ready to actually START
    var newEnemy = new Enemy(-200, paths[path],'images/enemy-bug.png', 0);
    //console.log(newEnemy);
    app.allEnemies.push(newEnemy);
}
//console.log(allEnemies);

// all bugs start off at 0 speed offscreen, only get moving when we tell them to
function startEnemies() {
    // add activity to offscreen enemies
    for (var enemy = 0; enemy < app.allEnemies.length; enemy++) {
        var speed = Math.floor(Math.random() * 140 + 40);
        var startingLine = Math.floor(Math.random() * 300 + 100);
        app.allEnemies[enemy].x = -startingLine;
        app.allEnemies[enemy].speed = speed;
    }
    //console.log("Restarted enemies!");
    //console.log(app.allEnemies);
}


//this is all it takes to start the player object.
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

// increment the score
function adjustScore() {
    app.score++;
    document.getElementById("score").value = app.score;
}

///////////////////////////////////////////////////////////////////////////////
// Game Messaging

// take the success/failure/whatever message and send it on to the headline div
function gameMessage(msg) {
    document.getElementById("headline").style.display = "block";
    document.getElementById("headline").innerHTML = msg;
    document.getElementById("game").style.display = "none";
}


// 'Start' button to begin game binding
document.getElementById("start").addEventListener("click", function() {
    showStart();
    hideRestart();
    document.getElementById("game").style.display = "inline";
    document.getElementById("headline").style.display = "none";
    startEnemies();
});

// Next turn button binding
document.getElementById("restart").addEventListener("click", function() {
    showReplay();
    document.getElementById("game").style.display = "inline";
    document.getElementById("headline").style.display = "none";
    startEnemies();
});

// Start over button binding
document.getElementById("replay").addEventListener("click", function() {
    restartGame();
});

// Choose Avatar Button
document.getElementById("chooseAvatar").addEventListener("click", function() {
    //console.log("Calling avatar function");
    chooseAvatar();
});

// ABOUT button...
document.getElementById("about").addEventListener("click", function() {
    document.getElementById("aboutThisGame").style.display = "block";
});
// close ABOUT button...
document.getElementById("closeAbout").addEventListener("click", function() {
    document.getElementById("aboutThisGame").style.display = "none";
});

// make the restart a function so that we can call it from player.reset too.
function restartGame() {
    //console.log("Resetting game over, score: " + app.score + " / lives: " + app.lives);
    if (app.lives === 0) {
        document.getElementById("headline").style.display = "none";
        document.getElementById("game").style.display = "inline";
    } else {
        document.getElementById("headline").style.display = "block";
        // get current player icon (it can have been changeed) and display it with
        //  won msg
        var sprite = player.sprite;
        var playerPic = "<img src='" + sprite + "' alt='Current player icon'>";
        document.getElementById("headline").innerHTML = playerPic +
            "<p>Terrific! You WON!<br/> Play Again?</p>";
        document.getElementById("game").style.display = "none";
    }
    hideReplay();
    hideRestart();
    showStart();
    player.x = 200;
    player.y = 410;
    app.score = 0;
    document.getElementById("score").value = app.score;
    //console.log("score reset to " + app.score);
    app.lives = 3;
    document.getElementById("lives").value = app.lives;
    //startEnemies();
    resetAllGems();

}

// what the Choose Player Avatar button DOES
//
function chooseAvatar() {
    document.getElementById("avatar").style.display = "block";
    document.getElementById("gameArea").style.display = "none";
    document.getElementById("menu").style.display = "none";
}

function hideRestart() {
    document.getElementById("restart").style.display = "none";
}

function showRestart() {
    document.getElementById("restart").style.display = "inline";
}

function showReplay() {
    document.getElementById("replay").style.display = "inline";
}

function hideReplay() {
    document.getElementById("replay").style.display = "none";
}

function showStart() {
    document.getElementById("start").style.display = "inline";
}

function hideStart() {
    document.getElementById("start").style.display = "none";
}

/////////////////////////////////////////////////////////////////////////////
// Avatars-specific
// first, narrow down the buttons that get the click event added -- only
// the "characters" buttons

var allButtons = document.getElementsByTagName("button");
var characterButtons = [];
for (var btn = 0; btn < allButtons.length; btn++) {
    if (allButtons[btn].parentNode.id === "characters") {
        characterButtons.push(allButtons[btn]);
    }
}
//console.log(characterButtons);

// now take that set of character buttons and assign click actions to them
// but we'll have to make it a CLOSURE FUNCTION

// actual action called by callback
function changeCharacter(playerIcon) {
    player.sprite = "images/char-" + playerIcon + ".png";
    //And when we've changed the image, put the screen back the way it was...
    document.getElementById("avatar").style.display = "none";
    document.getElementById("menu").style.display = "inline";
    document.getElementById("gameArea").style.display = "block";
}

// callback to send on the data to the sprite change
function makeChangeCallback(playerIcon) {
    return function() {
        changeCharacter(playerIcon);
    };
}

// function to go through the character buttons, set up the value to be passed
// on to the callback, and instantiate the onclick eventlistener.
function setupPlayerIcon() {

    for (var btn = 0; btn < characterButtons.length; btn++) {
        var playerIcon = characterButtons[btn].id;
        //console.log("Setting up onclick for " + playerIcon);
        characterButtons[btn].onclick = makeChangeCallback(playerIcon);
    }
}

// and run the function now!
setupPlayerIcon();