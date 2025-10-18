import Phaser from 'phaser';
import { AssetGenerator } from '../utils/AssetGenerator.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.cameras.main;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading Assets...', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x8b0000, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  create() {
    AssetGenerator.generatePlayerSprite(this);
    AssetGenerator.generateTileset(this);
    AssetGenerator.generateItems(this);
    AssetGenerator.generateGhost(this);
    AssetGenerator.generateDecoration(this);

    this.createAnimations();

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }

  createAnimations() {
    ['down', 'up', 'left', 'right'].forEach(direction => {
      this.anims.create({
        key: `walk_${direction}`,
        frames: [
          { key: `player_${direction}_0` },
          { key: `player_${direction}_1` },
          { key: `player_${direction}_2` },
          { key: `player_${direction}_3` }
        ],
        frameRate: 8,
        repeat: -1
      });

      this.anims.create({
        key: `idle_${direction}`,
        frames: [{ key: `player_${direction}_0` }],
        frameRate: 1
      });
    });
  }
}
