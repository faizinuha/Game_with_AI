import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.text(width / 2, height / 3, 'THE HAUNTED ASYLUM', {
      fontSize: '48px',
      color: '#8b0000',
      fontFamily: 'Georgia, serif',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 40, 'A place where nightmares come alive...', {
      fontSize: '20px',
      color: '#ff6666',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    const startButton = this.add.text(width / 2, height / 2 + 60, '[ START GAME ]', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerover', () => {
      startButton.setColor('#ff0000');
      startButton.setScale(1.1);
    });

    startButton.on('pointerout', () => {
      startButton.setColor('#ffffff');
      startButton.setScale(1);
    });

    startButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.time.delayedCall(1000, () => {
        this.scene.start('GameScene');
      });
    });

    this.add.text(width / 2, height - 100, 'Use WASD or Arrow Keys to move\nE to interact', {
      fontSize: '16px',
      color: '#666666',
      fontFamily: 'Courier New, monospace',
      align: 'center'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }
}
