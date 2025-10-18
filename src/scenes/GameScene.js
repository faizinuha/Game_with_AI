import Phaser from 'phaser';
import { puzzles } from '../data/puzzles.js';
import { AudioGenerator } from '../utils/AudioGenerator.js';

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
    this.lightRadius = 150;
    this.currentDirection = 'down';
    this.decorations = [];
    this.ambientInterval = null;
    this.lastFootstepTime = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    this.createRooms();
    this.createPlayer();
    this.createDoors();
    this.createItems();
    this.createDecorations();
    this.createLighting();
    this.setupControls();
    this.createUI();

    this.cameras.main.fadeIn(2000, 0, 0, 0);

    const ambientSound = AudioGenerator.createAmbientSound(this);
    this.ambientInterval = ambientSound.play();

    this.showDialog('You wake up in a dark asylum...\nFind a way to escape.\nUse WASD or Arrow Keys to move\nPress E to interact with objects.', 5000);

    this.time.addEvent({
      delay: 20000,
      callback: () => {
        this.showScaryEffect();
      },
      loop: true
    });
  }

  createRooms() {
    const { width, height } = this.cameras.main;
    const tileSize = 32;

    const roomConfigs = [
      { color: 0x1a1a1a, name: 'Entrance Hall', walls: 0x2a2a2a },
      { color: 0x0d1b2a, name: 'Morgue', walls: 0x1a2a3a },
      { color: 0x1b1a0d, name: 'Operating Room', walls: 0x2a2a1a },
      { color: 0x1a0d0d, name: 'Chapel', walls: 0x2a1a1a }
    ];

    roomConfigs.forEach((config, index) => {
      const roomContainer = this.add.container(0, 0);

      for (let x = 50; x < width - 50; x += tileSize) {
        for (let y = 50; y < height - 50; y += tileSize) {
          const floor = this.add.image(x, y, 'floor');
          floor.setTint(config.color);
          roomContainer.add(floor);
        }
      }

      for (let x = 50; x < width - 50; x += tileSize) {
        const wallTop = this.add.image(x, 50, 'wall');
        wallTop.setTint(config.walls);
        roomContainer.add(wallTop);

        const wallBottom = this.add.image(x, height - 50, 'wall');
        wallBottom.setTint(config.walls);
        roomContainer.add(wallBottom);
      }

      for (let y = 50; y < height - 50; y += tileSize) {
        const wallLeft = this.add.image(50, y, 'wall');
        wallLeft.setTint(config.walls);
        roomContainer.add(wallLeft);

        const wallRight = this.add.image(width - 50, y, 'wall');
        wallRight.setTint(config.walls);
        roomContainer.add(wallRight);
      }

      roomContainer.visible = index === 0;
      this.rooms.push({ graphics: roomContainer, name: config.name });
    });

    this.roomNameText = this.add.text(width / 2, 40, this.rooms[0].name, {
      fontSize: '28px',
      color: '#8b0000',
      fontFamily: 'Georgia, serif',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);
  }

  createPlayer() {
    const { width, height } = this.cameras.main;

    this.player = this.add.sprite(width / 2, height / 2, 'player_down_0');
    this.player.setScale(1.5);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(20, 20);
    this.player.setDepth(10);
  }

  createDoors() {
    const { width, height } = this.cameras.main;

    const doorPositions = [
      { x: width - 130, y: height / 2, next: 1, puzzle: 0 },
      { x: width - 130, y: height / 2, next: 2, puzzle: 1 },
      { x: width - 130, y: height / 2, next: 3, puzzle: 2 }
    ];

    doorPositions.forEach((pos, index) => {
      const door = this.add.image(pos.x, pos.y, 'door');
      door.setScale(1.2);
      door.visible = index === this.currentRoom;
      door.setDepth(5);
      this.physics.add.existing(door, true);
      door.body.setSize(50, 80);

      const lockIcon = this.add.text(pos.x, pos.y, '🔒', {
        fontSize: '32px'
      }).setOrigin(0.5).setDepth(6);
      lockIcon.visible = index === this.currentRoom;

      this.doors.push({
        graphics: door,
        lockIcon: lockIcon,
        next: pos.next,
        puzzle: pos.puzzle,
        index: index
      });
    });
  }

  createItems() {
    const { width, height } = this.cameras.main;

    this.items = [
      { x: 200, y: 300, type: 'note', room: 0, message: 'Note: "The password is hidden in the shadows..."' },
      { x: 800, y: 400, type: 'key', room: 1, message: 'You found a rusty key!' },
      { x: 300, y: 500, type: 'skull', room: 1, message: 'A human skull... this place is cursed.' },
      { x: 600, y: 250, type: 'candle', room: 2, message: 'A flickering candle provides little comfort.' },
      { x: 400, y: 400, type: 'bible', room: 3, message: 'An old bible with a riddle inside...' }
    ];

    this.itemGraphics = this.items.map(item => {
      const sprite = this.add.image(item.x, item.y, item.type);
      sprite.setScale(1.5);
      sprite.visible = item.room === this.currentRoom;
      sprite.setDepth(5);
      this.physics.add.existing(sprite);
      sprite.body.setSize(24, 24);

      this.tweens.add({
        targets: sprite,
        y: sprite.y - 10,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      return { ...item, graphics: sprite };
    });
  }

  createDecorations() {
    const { width, height } = this.cameras.main;

    const decorationConfigs = [
      [
        { x: 150, y: 150, type: 'window' },
        { x: 150, y: height - 150, type: 'window' },
        { x: 400, y: 200, type: 'table' }
      ],
      [
        { x: 300, y: 150, type: 'table' },
        { x: 600, y: 200, type: 'blood' },
        { x: 450, y: height - 150, type: 'blood' }
      ],
      [
        { x: 200, y: 350, type: 'table' },
        { x: 700, y: 300, type: 'blood' }
      ],
      [
        { x: 300, y: 200, type: 'painting' },
        { x: 500, y: height / 2, type: 'table' }
      ]
    ];

    decorationConfigs.forEach((roomDeco, roomIndex) => {
      const roomDecorations = [];
      roomDeco.forEach(deco => {
        const sprite = this.add.image(deco.x, deco.y, deco.type);
        sprite.setScale(1);
        sprite.visible = roomIndex === this.currentRoom;
        sprite.setDepth(1);
        sprite.setAlpha(0.7);
        roomDecorations.push(sprite);
      });
      this.decorations.push(roomDecorations);
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

    this.lights.enable();
    this.lights.setAmbientColor(0x404040);

    const light = this.lights.addLight(this.player.x, this.player.y, this.lightRadius, 0xff9933, 2);
    this.playerLight = light;
  }

  createUI() {
    const { width, height } = this.cameras.main;

    this.inventoryText = this.add.text(20, 20, 'Items: 0 / 5', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 12, y: 8 },
      fontFamily: 'Courier New, monospace'
    }).setDepth(100);

    this.hintText = this.add.text(width / 2, height - 40, '', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#000000',
      padding: { x: 12, y: 8 }
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

    let moving = false;
    let newDirection = this.currentDirection;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-speed);
      newDirection = 'left';
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(speed);
      newDirection = 'right';
      moving = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.body.setVelocityY(-speed);
      newDirection = 'up';
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.body.setVelocityY(-speed);
      newDirection = 'down';
      moving = true;
    }

    if (moving) {
      if (this.currentDirection !== newDirection) {
        this.currentDirection = newDirection;
      }
      this.player.anims.play(`walk_${this.currentDirection}`, true);

      const currentTime = this.time.now;
      if (currentTime - this.lastFootstepTime > 400) {
        AudioGenerator.playFootstepSound();
        this.lastFootstepTime = currentTime;
      }
    } else {
      this.player.anims.play(`idle_${this.currentDirection}`, true);
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

    if (this.playerLight) {
      this.playerLight.setPosition(this.player.x, this.player.y);
    }
  }

  checkInteractions() {
    this.hintText.setText('');

    this.doors.forEach(door => {
      if (!door.graphics.visible) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        door.graphics.x, door.graphics.y
      );

      if (distance < 100) {
        if (this.unlockedDoors.has(door.index)) {
          this.hintText.setText('Press E to enter next room');
          if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.enterNextRoom(door.next);
          }
        } else {
          this.hintText.setText('Press E to solve puzzle and unlock door');
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

      if (distance < 70) {
        this.hintText.setText('Press E to examine item');
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
          this.collectItem(index);
        }
      }
    });
  }

  collectItem(index) {
    const item = this.itemGraphics[index];
    this.collectedItems.add(index);

    AudioGenerator.playPickupSound();

    this.tweens.add({
      targets: item.graphics,
      scale: 0,
      alpha: 0,
      duration: 500,
      ease: 'Back.easeIn',
      onComplete: () => {
        item.graphics.destroy();
      }
    });

    this.tweens.add({
      targets: this.inventoryText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true
    });

    this.inventoryText.setText(`Items: ${this.collectedItems.size} / 5`);
    this.showDialog(item.message, 3000);

    this.cameras.main.flash(300, 255, 215, 0);
  }

  startPuzzle(puzzleIndex, doorIndex) {
    this.scene.pause();
    this.scene.launch('PuzzleScene', {
      puzzle: puzzles[puzzleIndex],
      onComplete: () => {
        this.unlockedDoors.add(doorIndex);
        this.doors[doorIndex].lockIcon.setText('🔓');
        AudioGenerator.playUnlockSound();
        this.cameras.main.flash(500, 0, 255, 0);
        this.showDialog('Door unlocked! You may proceed.', 2500);
        this.scene.resume();
      },
      onFail: () => {
        this.cameras.main.shake(500, 0.01);
        this.showDialog('Wrong answer... The door remains locked.', 2500);
        this.scene.resume();
      }
    });
  }

  enterNextRoom(roomIndex) {
    AudioGenerator.playDoorSound();
    this.cameras.main.fadeOut(1500, 0, 0, 0);

    this.time.delayedCall(1500, () => {
      this.rooms[this.currentRoom].graphics.visible = false;
      this.doors[this.currentRoom].graphics.visible = false;
      this.doors[this.currentRoom].lockIcon.visible = false;

      this.itemGraphics.forEach(item => {
        if (item.room === this.currentRoom) {
          item.graphics.visible = false;
        }
      });

      this.decorations[this.currentRoom].forEach(deco => {
        deco.visible = false;
      });

      this.currentRoom = roomIndex;
      this.rooms[this.currentRoom].graphics.visible = true;

      if (this.currentRoom < this.doors.length) {
        this.doors[this.currentRoom].graphics.visible = true;
        this.doors[this.currentRoom].lockIcon.visible = true;
      }

      this.itemGraphics.forEach(item => {
        if (item.room === this.currentRoom && !this.collectedItems.has(this.itemGraphics.indexOf(item))) {
          item.graphics.visible = true;
        }
      });

      this.decorations[this.currentRoom].forEach(deco => {
        deco.visible = true;
      });

      this.roomNameText.setText(this.rooms[this.currentRoom].name);

      const { width, height } = this.cameras.main;
      this.player.setPosition(150, height / 2);

      if (roomIndex === 3) {
        this.cameras.main.fadeIn(1500, 0, 0, 0);
        this.showDialog('YOU ESCAPED THE ASYLUM!\n\nYou found the exit and survived the horror.', 6000);
        this.time.delayedCall(7000, () => {
          this.scene.start('MenuScene');
        });
      } else {
        this.showDialog(`Entered: ${this.rooms[this.currentRoom].name}\nBe careful... something feels wrong here.`, 3000);
        this.cameras.main.fadeIn(1500, 0, 0, 0);
      }
    });
  }

  showDialog(message, duration) {
    if (this.dialogBox) {
      this.dialogBox.destroy();
      this.dialogText.destroy();
    }

    this.isShowingDialog = true;
    const { width, height } = this.cameras.main;

    this.dialogBox = this.add.rectangle(width / 2, height - 100, width - 200, 120, 0x000000, 0.95);
    this.dialogBox.setStrokeStyle(3, 0x8b0000);
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
        this.tweens.add({
          targets: [this.dialogBox, this.dialogText],
          alpha: 0,
          duration: 500,
          onComplete: () => {
            if (this.dialogBox) {
              this.dialogBox.destroy();
              this.dialogText.destroy();
              this.dialogBox = null;
              this.isShowingDialog = false;
            }
          }
        });
      }
    });
  }

  showScaryEffect() {
    AudioGenerator.playScarySound();
    this.cameras.main.shake(600, 0.015);

    const { width, height } = this.cameras.main;
    const ghost = this.add.image(
      Phaser.Math.Between(200, width - 200),
      Phaser.Math.Between(200, height - 200),
      'ghost'
    ).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: ghost,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      onComplete: () => ghost.destroy()
    });

    this.tweens.add({
      targets: ghost,
      y: ghost.y + 50,
      duration: 2000,
      ease: 'Sine.easeInOut'
    });
  }
}
