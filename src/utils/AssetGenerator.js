export class AssetGenerator {
  static generatePlayerSprite(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    const frames = {
      down: [],
      up: [],
      left: [],
      right: []
    };

    for (let frame = 0; frame < 4; frame++) {
      ['down', 'up', 'left', 'right'].forEach(direction => {
        graphics.clear();

        const offsetX = frame * 32;
        const offsetY = direction === 'down' ? 0 : direction === 'up' ? 32 : direction === 'left' ? 64 : 96;

        const bodyColor = 0x2a4a5a;
        const skinColor = 0xffdbac;
        const hairColor = 0x3d2817;

        if (direction === 'down') {
          graphics.fillStyle(hairColor, 1);
          graphics.fillCircle(16, 8, 6);

          graphics.fillStyle(skinColor, 1);
          graphics.fillCircle(16, 10, 5);

          graphics.fillStyle(0x000000, 1);
          graphics.fillCircle(14, 10, 1);
          graphics.fillCircle(18, 10, 1);

          graphics.fillStyle(0xff6b6b, 1);
          graphics.fillRect(15, 13, 2, 1);
        } else if (direction === 'up') {
          graphics.fillStyle(hairColor, 1);
          graphics.fillCircle(16, 8, 6);

          graphics.fillStyle(skinColor, 1);
          graphics.fillCircle(16, 10, 5);
        } else if (direction === 'left') {
          graphics.fillStyle(hairColor, 1);
          graphics.fillCircle(16, 8, 6);

          graphics.fillStyle(skinColor, 1);
          graphics.fillCircle(15, 10, 5);

          graphics.fillStyle(0x000000, 1);
          graphics.fillCircle(13, 10, 1);
        } else {
          graphics.fillStyle(hairColor, 1);
          graphics.fillCircle(16, 8, 6);

          graphics.fillStyle(skinColor, 1);
          graphics.fillCircle(17, 10, 5);

          graphics.fillStyle(0x000000, 1);
          graphics.fillCircle(19, 10, 1);
        }

        graphics.fillStyle(bodyColor, 1);
        graphics.fillRect(12, 16, 8, 10);

        graphics.fillStyle(0x1a2a3a, 1);
        graphics.fillRect(12, 16, 8, 2);

        const legOffset = frame % 2 === 0 ? 0 : frame === 1 ? -1 : 1;
        graphics.fillStyle(0x0a1a2a, 1);
        graphics.fillRect(13, 26 + legOffset, 2, 4);
        graphics.fillRect(17, 26 - legOffset, 2, 4);

        graphics.fillStyle(0x1a1a1a, 1);
        graphics.fillRect(13, 29 + legOffset, 2, 2);
        graphics.fillRect(17, 29 - legOffset, 2, 2);

        const armOffset = frame % 2 === 0 ? 0 : frame === 1 ? 1 : -1;
        graphics.fillStyle(skinColor, 1);
        graphics.fillRect(10, 18 + armOffset, 2, 4);
        graphics.fillRect(20, 18 - armOffset, 2, 4);

        graphics.generateTexture(`player_${direction}_${frame}`, 32, 32);
        frames[direction].push({ key: `player_${direction}_${frame}` });
      });
    }

    return frames;
  }

  static generateTileset(scene) {
    const tileSize = 32;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.lineStyle(1, 0x404040, 1);
    graphics.strokeRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('wall', tileSize, tileSize);

    graphics.clear();
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.fillStyle(0x2a2a2a, 0.3);
    for (let i = 0; i < 3; i++) {
      graphics.fillRect(Math.random() * tileSize, Math.random() * tileSize, 4, 4);
    }
    graphics.generateTexture('floor', tileSize, tileSize);

    graphics.clear();
    graphics.fillStyle(0x4a2a1a, 1);
    graphics.fillRect(0, 0, tileSize * 2, tileSize * 3);
    graphics.lineStyle(3, 0x3a1a0a, 1);
    graphics.strokeRect(0, 0, tileSize * 2, tileSize * 3);
    graphics.fillStyle(0x3a1a0a, 1);
    graphics.fillCircle(tileSize * 1.7, tileSize * 1.5, 4);
    graphics.generateTexture('door', tileSize * 2, tileSize * 3);

    graphics.clear();
    graphics.fillStyle(0xff0000, 0.8);
    graphics.fillCircle(16, 16, 8);
    graphics.fillStyle(0xff6666, 0.6);
    graphics.fillCircle(16, 16, 12);
    graphics.fillStyle(0xff9999, 0.4);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('light', 32, 32);
  }

  static generateItems(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0xf4e4c1, 1);
    graphics.fillRect(4, 2, 24, 28);
    graphics.fillStyle(0x1a1a1a, 0.8);
    for (let i = 0; i < 5; i++) {
      graphics.fillRect(8, 6 + i * 4, 16, 1);
    }
    graphics.generateTexture('note', 32, 32);

    graphics.clear();
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(16, 12, 6);
    graphics.fillRect(14, 12, 4, 8);
    graphics.fillRect(14, 18, 8, 2);
    graphics.fillRect(18, 16, 2, 2);
    graphics.generateTexture('key', 32, 32);

    graphics.clear();
    graphics.fillStyle(0xe8d4b8, 1);
    graphics.fillCircle(16, 14, 8);
    graphics.fillRect(10, 14, 12, 8);
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillCircle(12, 12, 2);
    graphics.fillCircle(20, 12, 2);
    graphics.fillRect(14, 22, 4, 6);
    graphics.fillRect(18, 24, 4, 4);
    graphics.generateTexture('skull', 32, 32);

    graphics.clear();
    graphics.fillStyle(0xffd700, 1);
    graphics.fillRect(14, 16, 4, 12);
    graphics.fillStyle(0xff6600, 1);
    graphics.beginPath();
    graphics.arc(16, 16, 4, 0, Math.PI * 2);
    graphics.fillPath();
    graphics.fillStyle(0xffff00, 1);
    graphics.beginPath();
    graphics.arc(16, 14, 2, 0, Math.PI * 2);
    graphics.fillPath();
    graphics.generateTexture('candle', 32, 32);

    graphics.clear();
    graphics.fillStyle(0x4a1a1a, 1);
    graphics.fillRect(8, 6, 16, 20);
    graphics.lineStyle(2, 0x2a0a0a, 1);
    graphics.strokeRect(8, 6, 16, 20);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillRect(12, 10, 8, 1);
    graphics.fillRect(12, 14, 8, 1);
    graphics.fillRect(12, 18, 8, 1);
    graphics.generateTexture('bible', 32, 32);
  }

  static generateGhost(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillCircle(32, 24, 16);

    graphics.beginPath();
    graphics.moveTo(16, 32);
    graphics.lineTo(16, 56);
    graphics.lineTo(20, 52);
    graphics.lineTo(24, 56);
    graphics.lineTo(28, 52);
    graphics.lineTo(32, 56);
    graphics.lineTo(36, 52);
    graphics.lineTo(40, 56);
    graphics.lineTo(44, 52);
    graphics.lineTo(48, 56);
    graphics.lineTo(48, 32);
    graphics.closePath();
    graphics.fillPath();

    graphics.fillStyle(0x000000, 0.6);
    graphics.fillCircle(24, 24, 4);
    graphics.fillCircle(40, 24, 4);

    graphics.fillCircle(32, 36, 6);

    graphics.generateTexture('ghost', 64, 64);
  }

  static generateDecoration(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(24, 8, 16, 48);
    graphics.lineStyle(2, 0x0a0a0a, 1);
    graphics.strokeRect(24, 8, 16, 48);
    graphics.fillStyle(0x2a2a2a, 1);
    graphics.fillRect(28, 12, 8, 40);
    graphics.generateTexture('window', 64, 64);

    graphics.clear();
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(8, 40, 48, 24);
    graphics.fillRect(16, 32, 32, 8);
    graphics.lineStyle(2, 0x5a2a0a, 1);
    graphics.strokeRect(8, 40, 48, 24);
    graphics.fillStyle(0x4a2a0a, 1);
    graphics.fillRect(12, 44, 40, 2);
    graphics.generateTexture('table', 64, 64);

    graphics.clear();
    graphics.fillStyle(0x4a4a4a, 1);
    graphics.fillRect(16, 8, 32, 48);
    graphics.lineStyle(2, 0x2a2a2a, 1);
    graphics.strokeRect(16, 8, 32, 48);
    graphics.fillStyle(0x1a1a1a, 0.9);
    graphics.fillRect(20, 12, 24, 40);
    graphics.generateTexture('painting', 64, 64);

    graphics.clear();
    graphics.fillStyle(0x8b0000, 1);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const size = Math.random() * 8 + 2;
      graphics.fillCircle(x, y, size);
    }
    graphics.generateTexture('blood', 64, 64);
  }
}
