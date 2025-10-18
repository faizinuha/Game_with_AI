import Phaser from 'phaser';
import { puzzles } from '../data/puzzles.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.interactKey = null;
    this.rooms = [];
    this.currentRoom = 0;
    this.doors = [];
    this.unlockedDoors = new Set();
    this.collectedItems = new Set();
    this.dialogBox = null;
    this.isShowingDialog = false;
    this.ambientSound = null;
    this.lightRadius = 150;
  }

  create() {
    const { width, height } = this.cameras.main;

    this.createRooms();
    this.createPlayer();
    this.createDoors();
    this.createItems();
    this.createLighting();
    this.setupControls();
    this.createUI();

    this.cameras.main.fadeIn(2000, 0, 0, 0);

    this.showDialog('You wake up in a dark asylum...\nFind a way to escape.\nPress E to interact with objects.', 4000);

    this.time.addEvent({
      delay: 15000,
      callback: () => {
        this.showScaryEffect();
      },
      loop: true
    });
  }

  createRooms() {
    const { width, height } = this.cameras.main;

    const roomConfigs = [
      { color: 0x1a1a1a, name: 'Entrance Hall' },
      { color: 0x0d1b2a, name: 'Morgue' },
      { color: 0x1b1a0d, name: 'Operating Room' },
      { color: 0x1a0d0d, name: 'Chapel' }
    ];

    roomConfigs.forEach((config, index) => {
      const room = this.add.rectangle(width / 2, height / 2, width - 100, height - 100, config.color);
      room.setStrokeStyle(2, 0x444444);
      room.visible = index === 0;
      this.rooms.push({ graphics: room, name: config.name });
    });

    this.roomNameText = this.add.text(width / 2, 40, this.rooms[0].name, {
      fontSize: '24px',
      color: '#666666',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5).setDepth(100);
  }

  createPlayer() {
    const { width, height } = this.cameras.main;

    this.player = this.add.circle(width / 2, height / 2, 15, 0xffffff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
  }

  createDoors() {
    const { width, height } = this.cameras.main;

    const doorPositions = [
      { x: width - 100, y: height / 2, next: 1, puzzle: 0 },
      { x: width - 100, y: height / 2, next: 2, puzzle: 1 },
      { x: width - 100, y: height / 2, next: 3, puzzle: 2 }
    ];

    doorPositions.forEach((pos, index) => {
      const door = this.add.rectangle(pos.x, pos.y, 60, 120, 0x4a4a4a);
      door.setStrokeStyle(3, 0x8b4513);
      door.visible = index === this.currentRoom;
      this.physics.add.existing(door, true);

      const doorText = this.add.text(pos.x, pos.y, '🚪', {
        fontSize: '48px'
      }).setOrigin(0.5);
      doorText.visible = index === this.currentRoom;

      this.doors.push({
        graphics: door,
        text: doorText,
        next: pos.next,
        puzzle: pos.puzzle,
        index: index
      });
    });
  }

  createItems() {
    const { width, height } = this.cameras.main;

    this.items = [
      { x: 200, y: 300, type: 'note', emoji: '📄', room: 0, message: 'Note: "The password is hidden in the shadows..."' },
      { x: 800, y: 400, type: 'key', emoji: '🔑', room: 1, message: 'You found a rusty key!' },
      { x: 300, y: 500, type: 'skull', emoji: '💀', room: 1, message: 'A human skull... this place is cursed.' },
      { x: 600, y: 250, type: 'candle', emoji: '🕯️', room: 2, message: 'A flickering candle provides little comfort.' },
      { x: 400, y: 400, type: 'bible', emoji: '📖', room: 3, message: 'An old bible with a riddle inside...' }
    ];

    this.itemGraphics = this.items.map(item => {
      const text = this.add.text(item.x, item.y, item.emoji, {
        fontSize: '32px'
      }).setOrigin(0.5);
      text.visible = item.room === this.currentRoom;
      this.physics.add.existing(text);
      text.body.setSize(32, 32);
      return { ...item, graphics: text };
    });
  }

  createLighting() {
    const { width, height } = this.cameras.main;

    this.darkOverlay = this.add.graphics();
    this.darkOverlay.fillStyle(0x000000, 0.85);
    this.darkOverlay.fillRect(0, 0, width, height);
    this.darkOverlay.setDepth(50);

    this.lightMask = this.add.graphics();
    this.lightMask.setDepth(51);
  }

  createUI() {
    const { width, height } = this.cameras.main;

    this.inventoryText = this.add.text(20, 20, 'Items: 0', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);

    this.hintText = this.add.text(width / 2, height - 30, '', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(100);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update() {
    if (!this.player || this.isShowingDialog) return;

    const speed = 200;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    this.updateLighting();
    this.checkInteractions();
  }

  updateLighting() {
    this.lightMask.clear();
    this.lightMask.fillStyle(0x000000);

    const gradient = this.lightMask.createRadialGradient(
      this.player.x, this.player.y, 0,
      this.player.x, this.player.y, this.lightRadius
    );

    this.lightMask.fillCircle(this.player.x, this.player.y, this.lightRadius);
    this.lightMask.blendMode = Phaser.BlendModes.ERASE;
  }

  checkInteractions() {
    this.hintText.setText('');

    this.doors.forEach(door => {
      if (!door.graphics.visible) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        door.graphics.x, door.graphics.y
      );

      if (distance < 80) {
        if (this.unlockedDoors.has(door.index)) {
          this.hintText.setText('Press E to enter');
          if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.enterNextRoom(door.next);
          }
        } else {
          this.hintText.setText('Press E to unlock door (needs puzzle)');
          if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.startPuzzle(door.puzzle, door.index);
          }
        }
      }
    });

    this.itemGraphics.forEach((item, index) => {
      if (!item.graphics.visible || this.collectedItems.has(index)) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        item.graphics.x, item.graphics.y
      );

      if (distance < 60) {
        this.hintText.setText('Press E to examine');
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
          this.collectItem(index);
        }
      }
    });
  }

  collectItem(index) {
    const item = this.itemGraphics[index];
    this.collectedItems.add(index);
    item.graphics.destroy();

    this.tweens.add({
      targets: this.inventoryText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true
    });

    this.inventoryText.setText(`Items: ${this.collectedItems.size}`);
    this.showDialog(item.message, 3000);
  }

  startPuzzle(puzzleIndex, doorIndex) {
    this.scene.pause();
    this.scene.launch('PuzzleScene', {
      puzzle: puzzles[puzzleIndex],
      onComplete: () => {
        this.unlockedDoors.add(doorIndex);
        this.showDialog('Door unlocked!', 2000);
        this.scene.resume();
      },
      onFail: () => {
        this.showDialog('Wrong answer... try again.', 2000);
        this.scene.resume();
      }
    });
  }

  enterNextRoom(roomIndex) {
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.time.delayedCall(1000, () => {
      this.rooms[this.currentRoom].graphics.visible = false;
      this.doors[this.currentRoom].graphics.visible = false;
      this.doors[this.currentRoom].text.visible = false;

      this.itemGraphics.forEach(item => {
        if (item.room === this.currentRoom) {
          item.graphics.visible = false;
        }
      });

      this.currentRoom = roomIndex;
      this.rooms[this.currentRoom].graphics.visible = true;

      if (this.currentRoom < this.doors.length) {
        this.doors[this.currentRoom].graphics.visible = true;
        this.doors[this.currentRoom].text.visible = true;
      }

      this.itemGraphics.forEach(item => {
        if (item.room === this.currentRoom && !this.collectedItems.has(this.itemGraphics.indexOf(item))) {
          item.graphics.visible = true;
        }
      });

      this.roomNameText.setText(this.rooms[this.currentRoom].name);

      const { width, height } = this.cameras.main;
      this.player.setPosition(150, height / 2);

      if (roomIndex === 3) {
        this.showDialog('You found the exit! You escaped the asylum!', 5000);
        this.time.delayedCall(6000, () => {
          this.scene.start('MenuScene');
        });
      } else {
        this.showDialog(`Entered: ${this.rooms[this.currentRoom].name}`, 2000);
      }

      this.cameras.main.fadeIn(1000, 0, 0, 0);
    });
  }

  showDialog(message, duration) {
    if (this.dialogBox) {
      this.dialogBox.destroy();
      this.dialogText.destroy();
    }

    this.isShowingDialog = true;
    const { width, height } = this.cameras.main;

    this.dialogBox = this.add.rectangle(width / 2, height - 100, width - 200, 100, 0x000000, 0.9);
    this.dialogBox.setStrokeStyle(2, 0x8b0000);
    this.dialogBox.setDepth(200);

    this.dialogText = this.add.text(width / 2, height - 100, message, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace',
      align: 'center',
      wordWrap: { width: width - 240 }
    }).setOrigin(0.5).setDepth(201);

    this.time.delayedCall(duration, () => {
      if (this.dialogBox) {
        this.dialogBox.destroy();
        this.dialogText.destroy();
        this.dialogBox = null;
        this.isShowingDialog = false;
      }
    });
  }

  showScaryEffect() {
    this.cameras.main.shake(500, 0.01);

    const { width, height } = this.cameras.main;
    const ghost = this.add.text(
      Phaser.Math.Between(100, width - 100),
      Phaser.Math.Between(100, height - 100),
      '👻',
      { fontSize: '64px' }
    ).setAlpha(0.3).setDepth(100);

    this.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 2000,
      onComplete: () => ghost.destroy()
    });
  }
}
