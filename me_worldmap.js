// 日本地図（簡易）: 海=9, 草原=1, 岩(山)=4
var MAPDAT = Array.from({ length: FIELD_H }, () => Array(FIELD_W).fill(9));

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



