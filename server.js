const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the 'example34' directory
app.use(express.static(path.join(__dirname)));

let players = {};
let nextPlayerId = 0;

// --- Map Data (from me_data.js and me_worldmap.js) ---
const FIELD_W = 40;
const FIELD_H = 30;

let MAPDAT = Array.from({ length: FIELD_H }, () => Array(FIELD_W).fill(9));
const set = (x, y, v = 1) => {
  if (x >= 0 && x < FIELD_W && y >= 0 && y < FIELD_H) MAPDAT[y][x] = v;
};
const fillRect = (x, y, w, h, v = 1) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, v);
};
const clearRect = (x, y, w, h) => fillRect(x, y, w, h, 9);

// 北海道
fillRect(26, 4, 9, 5, 1);
fillRect(24, 6, 3, 3, 1);
fillRect(32, 6, 3, 3, 1);
set(35, 4, 1); set(25, 5, 1);
// 石狩〜大雪山（山）
set(28, 6, 4); set(29, 6, 4); set(30, 6, 4); set(29, 7, 4);

// 本州（東北→関東→中部→近畿→中国）
fillRect(23, 8, 8, 6, 1);   // 東北
fillRect(26, 14, 7, 4, 1);  // 関東
fillRect(20, 12, 7, 6, 1);  // 中部
fillRect(17, 16, 6, 4, 1);  // 近畿
fillRect(12, 16, 6, 4, 1);  // 中国

// くびれ調整・海峡
clearRect(24, 10, 2, 2);    // 津軽海峡
clearRect(26, 15, 2, 1);    // 関東湾口
clearRect(18, 16, 1, 2);    // 若狭湾っぽく

// 日本アルプス（山）
for (let d = 0; d < 6; d++) set(20 + d, 12 + d, 4);
set(22, 15, 4);
set(25, 17, 1); // 関東南西の岩を草原に変更

// 四国
fillRect(19, 21, 6, 3, 1);
clearRect(21, 21, 2, 1); // 瀬戸内海にくびれ

// 九州
fillRect(12, 21, 6, 5, 1);
fillRect(10, 22, 3, 3, 1);
clearRect(14, 23, 1, 2); // 有明海っぽく
// 九州の山
set(14, 22, 4); set(15, 23, 4);

// 瀬戸内海（本州-四国間を少し海に）
clearRect(18, 20, 8, 1);
clearRect(22, 21, 1, 1);

// 沖縄（点在）
set(6, 27, 1); set(7, 27, 1); set(8, 28, 1);

const getChip = (x, y) => {
    if (x < 0 || x >= FIELD_W || y < 0 || y >= FIELD_H) return 4;
    return MAPDAT[y][x];
};

const isWalkable = (x, y) => {
    const chip = getChip(x, y);
    return chip <= 3; // 1(草原) is walkable. 4(山) and 9(海) are not.
};

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function broadcastToOthers(ws, data) {
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', (ws) => {
  console.log('A new client connected, awaiting join message.');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // The first message from a client must be 'join'
    if (!ws.playerId && data.type !== 'join') {
        ws.send(JSON.stringify({ type: 'error', message: 'You must join the game first.' }));
        return;
    }

    switch (data.type) {
        case 'join':
            if (ws.playerId) {
                ws.send(JSON.stringify({ type: 'error', message: 'You have already joined.' }));
                return;
            }
            const playerId = nextPlayerId++;
            const playerName = data.name || `Player ${playerId}`;
            players[playerId] = { id: playerId, name: playerName, x: 29, y: 15, d: 0, hp: 100, attack: 10, defense: 5, experience: 0, level: 1 };
            ws.playerId = playerId;

            console.log(`Player ${playerId} (${playerName}) joined`);

            // Send the new player their ID and the current list of all players
            ws.send(JSON.stringify({ type: 'init', id: ws.playerId, players: players }));

            // Notify all other players about the new player
            broadcastToOthers(ws, { type: 'connect', player: players[playerId] });
            break;

        case 'chat':
            if (players[ws.playerId]) {
                // Broadcast chat messages to all clients
                broadcast({ type: 'chat', id: ws.playerId, message: data.message });
            }
            break;

        case 'move':
            const player = players[ws.playerId];
            if (player) {
                let newX = player.x;
                let newY = player.y;
                const dir = data.d; // direction of intent from client

                if (dir === 0) newY--; // Up
                if (dir === 1) newY++; // Down
                if (dir === 2) newX--; // Left
                if (dir === 3) newX++; // Right
                
                // Server-side validation of the intended move
                if (isWalkable(newX, newY)) {
                    player.x = newX;
                    player.y = newY;
                    player.d = dir;
                }
                
                // Whether move was valid or not, broadcast the player's TRUE position to everyone
                broadcast({ type: 'move', player: player });
            }
            break;

        case 'attack':
            const attacker = players[ws.playerId];
            const targetPlayerId = data.targetId;
            const defender = players[targetPlayerId];

            if (attacker && defender && attacker.id !== defender.id) {
                // Simple damage calculation
                const damage = Math.max(0, attacker.attack - defender.defense);
                defender.hp -= damage;

                // Broadcast attack message
                broadcast({
                    type: 'chat',
                    id: 'SERVER',
                    message: `${attacker.name} attacked ${defender.name} for ${damage} damage!`
                });
                broadcast({
                    type: 'playerUpdate',
                    player: defender
                });

                if (defender.hp <= 0) {
                    // Player defeated
                    broadcast({
                        type: 'chat',
                        id: 'SERVER',
                        message: `${defender.name} has been defeated by ${attacker.name}!`
                    });
                    // For now, just reset HP and position for simplicity.
                    // Later, we might want to respawn or remove the player.
                    defender.hp = 100;
                    defender.x = Math.floor(Math.random() * 60); // Random respawn
                    defender.y = Math.floor(Math.random() * 30);
                    broadcast({
                        type: 'playerUpdate',
                        player: defender
                    });

                    // Award experience (simple for now)
                    attacker.experience += 10; // Gain 10 experience for defeating a player
                    broadcast({
                        type: 'chat',
                        id: 'SERVER',
                        message: `${attacker.name} gained 10 experience points.`
                    });
                    broadcast({
                        type: 'playerUpdate',
                        player: attacker
                    });
                }
            }
            break;

    }
  });

  ws.on('close', () => {
    const disconnectedPlayer = players[ws.playerId];
    if (disconnectedPlayer) {
      console.log(`Player ${disconnectedPlayer.id} (${disconnectedPlayer.name}) disconnected`);
      delete players[ws.playerId];
      broadcast({ type: 'disconnect', id: ws.playerId });
    } else {
      console.log('A client disconnected before joining.');
    }
  });
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
