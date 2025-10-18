import Phaser from 'phaser';

export default class PuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PuzzleScene' });
  }

  init(data) {
    this.puzzleData = data.puzzle;
    this.onComplete = data.onComplete;
    this.onFail = data.onFail;
  }

  create() {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.95);
    overlay.setDepth(0);

    const panel = this.add.rectangle(width / 2, height / 2, 700, 500, 0x1a1a1a);
    panel.setStrokeStyle(4, 0x8b0000);
    panel.setDepth(1);

    const title = this.add.text(width / 2, height / 2 - 200, this.puzzleData.title, {
      fontSize: '28px',
      color: '#ff0000',
      fontFamily: 'Georgia, serif',
      align: 'center'
    }).setOrigin(0.5).setDepth(2);

    const question = this.add.text(width / 2, height / 2 - 130, this.puzzleData.question, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5).setDepth(2);

    const startY = height / 2 - 30;
    const spacing = 70;

    this.puzzleData.options.forEach((option, index) => {
      const button = this.add.rectangle(
        width / 2,
        startY + index * spacing,
        600,
        60,
        0x2a2a2a
      );
      button.setStrokeStyle(2, 0x666666);
      button.setDepth(1);
      button.setInteractive();

      const buttonText = this.add.text(
        width / 2,
        startY + index * spacing,
        `${String.fromCharCode(65 + index)}. ${option}`,
        {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'Courier New, monospace'
        }
      ).setOrigin(0.5).setDepth(2);

      button.on('pointerover', () => {
        button.setFillStyle(0x3a3a3a);
        buttonText.setColor('#ffff00');
      });

      button.on('pointerout', () => {
        button.setFillStyle(0x2a2a2a);
        buttonText.setColor('#ffffff');
      });

      button.on('pointerdown', () => {
        this.checkAnswer(index);
      });
    });

    const hint = this.add.text(width / 2, height / 2 + 220, 'Click an answer to continue...', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(2);

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  checkAnswer(selectedIndex) {
    if (selectedIndex === this.puzzleData.correct) {
      this.showResult('CORRECT!', '#00ff00', () => {
        this.cameras.main.fadeOut(500);
        this.time.delayedCall(500, () => {
          this.onComplete();
          this.scene.stop();
        });
      });
    } else {
      this.showResult('WRONG!', '#ff0000', () => {
        this.cameras.main.fadeOut(500);
        this.time.delayedCall(500, () => {
          this.onFail();
          this.scene.stop();
        });
      });
    }
  }

  showResult(text, color, callback) {
    const { width, height } = this.cameras.main;

    const resultText = this.add.text(width / 2, height / 2, text, {
      fontSize: '64px',
      color: color,
      fontFamily: 'Impact, sans-serif',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    this.tweens.add({
      targets: resultText,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1000, callback);
      }
    });

    this.cameras.main.shake(300, 0.02);
  }
}
