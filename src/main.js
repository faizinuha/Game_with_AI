import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import MenuScene from './scenes/MenuScene.js';
import PuzzleScene from './scenes/PuzzleScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MenuScene, GameScene, PuzzleScene]
};

window.addEventListener('load', () => {
  document.getElementById('loading').style.display = 'none';
  new Phaser.Game(config);
});
