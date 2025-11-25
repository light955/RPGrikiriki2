//キャンバスの設定
var winW = window.innerWidth; // ウィンドウの幅
var canvas = document.getElementById("bg"); // キャンバス要素の取得
var cnt = canvas.getContext("2d"); // 2D描画コンテキストの取得
var SCALE; // スケール係数（画面サイズ調整用）
var CWIDTH  = 640; // キャンバスの基準幅
var CHEIGHT = 480; // キャンバスの基準高さ
winW = toInt(winW*0.96);//キャンバス右端がブラウザのスクロールバーに隠れないように
canvas.width = winW; // キャンバスの幅を設定
canvas.height = winW*CHEIGHT/CWIDTH; // キャンバスの高さを設定
SCALE = winW / CWIDTH; // スケール係数を計算
cnt.scale( SCALE, SCALE ); // 描画コンテキストにスケールを適用
cnt.textAlign = "center"; // テキストの水平位置を中央に設定
cnt.textBaseline = "middle"; // テキストの垂直位置を中央に設定

//マウスとタップの判定
var tapX = 0, tapY = 0, tapC = 0; // tapX: タップ/クリックのX座標, tapY: Y座標, tapC: タップ/クリック状態

canvas.addEventListener( "touchstart", touchStart ); // タッチ開始イベント
canvas.addEventListener( "touchmove", touchMove ); // タッチ移動イベント
canvas.addEventListener( "touchend", touchEnd ); // タッチ終了イベント
canvas.addEventListener( "touchcancel", touchCancel ); // タッチキャンセルイベント
function touchStart(event) {
 event.preventDefault(); // デフォルト動作を無効化
 var rect = event.target.getBoundingClientRect(); // キャンバスの位置を取得
 tapX = event.touches[0].clientX-rect.left; // タッチ位置のX座標を計算
 tapY = event.touches[0].clientY-rect.top; // タッチ位置のY座標を計算
 transformXY(); // 座標変換
 tapC = 1; // タッチ状態を設定
 setMap(); // マップ設定処理
}
function touchMove(event) {
 event.preventDefault(); // デフォルト動作を無効化
 var rect = event.target.getBoundingClientRect(); // キャンバスの位置を取得
 tapX = event.touches[0].clientX-rect.left; // タッチ位置のX座標を計算
 tapY = event.touches[0].clientY-rect.top; // タッチ位置のY座標を計算
 transformXY(); // 座標変換
 setMap(); // マップ設定処理
}
function touchEnd(event) { tapC = 0; } // タッチ終了時の処理
function touchCancel(event) { tapC = 0; } // タッチキャンセル時の処理

canvas.addEventListener( "mousedown", mouseDown ); // マウスダウンイベント
canvas.addEventListener( "mousemove", mouseMove ); // マウス移動イベント
canvas.addEventListener( "mouseup", mouseUp ); // マウスアップイベント
function mouseDown(event) {
 var rect = event.target.getBoundingClientRect(); // キャンバスの位置を取得
 tapX = event.clientX-rect.left; // マウス位置のX座標を計算
 tapY = event.clientY-rect.top; // マウス位置のY座標を計算
 transformXY(); // 座標変換
 tapC = 1; // クリック状態を設定
 setMap(); // マップ設定処理
}
function mouseMove(event) {
 var rect = event.target.getBoundingClientRect(); // キャンバスの位置を取得
 tapX = event.clientX-rect.left; // マウス位置のX座標を計算
 tapY = event.clientY-rect.top; // マウス位置のY座標を計算
 transformXY(); // 座標変換
 setMap(); // マップ設定処理
}
function mouseUp(event) { tapC = 0; } // マウスアップ時の処理

function transformXY() {//実座標→仮想座標への変換
 tapX = toInt(tapX/SCALE); // スケールを考慮してX座標を変換
 tapY = toInt(tapY/SCALE); // スケールを考慮してY座標を変換
}

//キー入力
var key = 0; // 現在押されているキーのキーコード
window.onkeydown = function(event) { key = event.keyCode; } // キーが押された時の処理
window.onkeyup = function(event) { key = 0; } // キーが離された時の処理

function toInt( val ) {//整数を返す関数
 return parseInt(val);
}

function placeNum( val, pla ) {//数字を指定する桁数にする関数
 return ("0000000000"+val).slice(-pla);
}

//画像ファイルの処理
var img = [], imgPre = []; // img: 画像オブジェクト配列, imgPre: 画像読み込み完了フラグ配列

function loadImg( n ) {//画像を読み込む
 imgPre[n] = false; // 読み込み完了フラグをfalseに初期化
 img[n] = new Image(); // 新しい画像オブジェクトを作成
 img[n].src = "chip/" + placeNum(n,3) + ".png"; // 画像ファイルのパスを設定
 img[n].onload = function() { imgPre[n] = true; } // 画像読み込み完了時の処理
}

function drawChip( cn, dx, dy ) {//マップチップを表示
 if( imgPre[0] == true ) cnt.drawImage( img[cn], dx, dy ); // 画像が読み込み完了していれば描画
}

function fText( str, x, y, siz, col ) {//文字表示
 cnt.font = siz + "px monospace"; // フォントサイズとファミリーを設定
 cnt.fillStyle = col; // 文字色を設定
 cnt.fillText( str, x, y ); // 文字を描画
}

function fRect( x, y, w, h, col ) {//矩形（塗り潰し）
 cnt.fillStyle = col; // 塗り潰し色を設定
 cnt.fillRect( x, y, w, h ); // 矩形を描画
}

function sRect( x, y, w, h, col ) {//矩形（枠）
 cnt.lineWidth = 2; // 線の太さを設定
 cnt.strokeStyle = col; // 線の色を設定
 cnt.strokeRect( x, y, w, h ); // 矩形の枠を描画
}

//ボタンを表示（中心座標、幅、高さ）
function drawBtn( str, x, y, w, h ) {
 var ret = false; // 戻り値（ボタンが押されたかどうか）
 var col = "#24f"; // 通常時の色
 if( x-w/2 < tapX && tapX < x+w/2 && y-h/2 < tapY && tapY < y+h/2 ) { // マウス/タッチがボタン上にある場合
  col = "#48f"; // ホバー時の色
  if( tapC > 0 ) { col = "#cff"; ret = true; }//ボタンが押されている
 }
 fRect( x-w/2, y-h/2, w, h, col ); // ボタンの背景を描画
 fText( str, x, y, 24, "white" ); // ボタンの文字を描画
 return ret; // ボタンの押下状態を返す
}

//定数の宣言
var FCHIP_W = toInt(480/CHIP_SIZE);//フィールドのチップを横に何個描くか
var FCHIP_H = toInt(480/CHIP_SIZE);//フィールドのチップを縦に何個描くか
var SCHIP_N = toInt(160/CHIP_SIZE);//選択用のチップを横に何個描くか
var WMAP_X = 480+(160-FIELD_W)/2;//全体マップの表示位置X
var WMAP_Y = 420-FIELD_H; // 全体マップの表示位置Y

//変数の宣言
var idx = 0; // 処理状態管理
var sel = 0; // 選択中のチップ番号
var fTop = 0; // フィールド表示の上端位置
var fLeft = 0; // フィールド表示の左端位置

//二次元配列の作成
var map = new Array(); // マップデータの二次元配列
for( var y = 0; y < FIELD_H; y ++ ) {
 map[y] = new Array(); // 各行の配列を作成
 for( var x = 0; x < FIELD_W; x ++ ) map[y][x] = 0; // 全要素を0（床）で初期化
}

function setMap() {//画面をクリック（タップ）した時の処理
 var c, x, y;
 if( tapC == 0 ) return; // タップ/クリックされていない場合は何もしない
 if( tapX < 480 ) {//マップチップを置く
  x = toInt(tapX/CHIP_SIZE); // クリック位置のX座標をチップ座標に変換
  y = toInt(tapY/CHIP_SIZE); // クリック位置のY座標をチップ座標に変換
  map[fTop+y][fLeft+x] = sel; // 選択中のチップを配置
 }
 else {//マップチップを選ぶ
  x = toInt((tapX-480)/CHIP_SIZE); // 選択エリアのX座標を計算
  y = toInt(tapY/CHIP_SIZE); // 選択エリアのY座標を計算
  c = x + y * SCHIP_N; // 選択されたチップ番号を計算
  if( c < CHIP_MAX ) sel = c; // 有効なチップ番号の場合、選択チップを更新
 }
}

function putMapData() {//データを出力する
 var x, y;
 var dat = ""; // 出力用データ文字列
 for( y = 0; y < FIELD_H; y ++ ) {
  for( x = 0; x < FIELD_W; x ++ ) dat = dat + map[y][x] + ","; // マップデータをカンマ区切りで連結
 }
 document.getElementById("ta").value = dat; // テキストエリアに出力
}

window.onload = mainProc(); // ページ読み込み完了時にメイン処理を開始
function mainProc() {
 var i, x, y;

 switch( idx ) {
  case 0://初期化処理
  for( i = 0; i < CHIP_MAX; i ++ ) loadImg(i); // 全画像ファイルを読み込み
  idx = 1; // 次の状態に移行
  break;

  case 1:
  if( key == 65 ) { // Aキーが押された場合
   if( confirm("選択しているチップで画面を埋めます。よろしいですか？") == true ) { // 確認ダイアログ
    for( y = 0; y < FCHIP_H; y ++ ) {
     for( x = 0; x < FCHIP_W; x ++ ) map[fTop+y][fLeft+x] = sel; // 表示範囲を選択チップで埋める
    }
   }
   key = 0; // キー入力をリセット
  }
  if( key == 38 ) { if( fTop > 0 ) fTop --; } // 上矢印キー: 表示位置を上に移動
  if( key == 40 ) { if( fTop < FIELD_H-FCHIP_H ) fTop ++; } // 下矢印キー: 表示位置を下に移動
  if( key == 37 ) { if( fLeft > 0 ) fLeft --; } // 左矢印キー: 表示位置を左に移動
  if( key == 39 ) { if( fLeft < FIELD_W-FCHIP_W ) fLeft ++; } // 右矢印キー: 表示位置を右に移動

  //フィールドのマップチップを描く
  for( y = 0; y < FCHIP_H; y ++ ) {
   for( x = 0; x < FCHIP_W; x ++ ) drawChip( map[fTop+y][fLeft+x], x*CHIP_SIZE, y*CHIP_SIZE ); // マップチップを描画
  }

  //選択用のチップを描く
  fRect( 480, 0, 160, 480, "black" ); // 選択エリアの背景を描画
  x = 0;
  y = 0;
  for( i = 0; i < CHIP_MAX; i ++ ) {
   var cx = x*CHIP_SIZE + 480; // 選択エリアのX座標
   var cy = y*CHIP_SIZE; // 選択エリアのY座標
   drawChip( i, cx, cy ); // チップを描画
   if( i == sel ) sRect( cx+1, cy+1, CHIP_SIZE-2, CHIP_SIZE-2, "red" );//選択しているチップを赤枠で囲む
   x ++;
   if( x == SCHIP_N ) { x = 0; y ++; } // 次の行に移動
  }

  //全体マップ
  fRect( WMAP_X, WMAP_Y, FIELD_W, FIELD_H, "#888" ); // 全体マップの背景を描画
  sRect( WMAP_X+fLeft, WMAP_Y+fTop, FCHIP_W, FCHIP_H, "#8ff" ); // 現在表示中の範囲を青枠で表示
  fText( "X="+fLeft+" Y="+fTop, 560, WMAP_Y-20, 20, "#fff" ); // 現在位置を表示

  if( drawBtn( "出力", 560, 455, 150, 40 ) == true ) { // 出力ボタンが押された場合
    putMapData(); // マップデータを出力
    tapC = 0; // タップ状態をリセット
  }
  break;
 }

 setTimeout( mainProc, 80 ); // 80ミリ秒後に再帰呼び出し（約12FPS）
}