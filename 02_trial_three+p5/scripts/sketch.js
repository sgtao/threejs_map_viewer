'use strict';

// グローバル変数 Global variables
let game;
let tilemap = new Tile;

// 読み込み時の処理（ファイルロード）
document.addEventListener('DOMContentLoaded', function () {
  load_tilemap('./assets/tilemap.txt');
});

async function load_tilemap(filename) {
  fetch(filename).then(function (response) {
    return response.text();
  }).then(function (textContent) {
    // console.log(textContent);
    tilemap.textSet(textContent);
    tilemap.show();
    // game.init(tilemap);
    init(tilemap);
  }).catch(function (err) {
    console.log('Fetch problem: ' + err.message);
  });
}

function init(tilemap) {
  game.reset();
  // tilemapの上書き
  game.level = new Level();
  game.level.addTilemap(
    tilemap.tiles.join(''),
    tilemap.numX, // 幅（横方向のタイルの数）
    tilemap.numY,// 高さ（縦方向のタイルの数）
    tilemap.tSize // タイルの大きさ（px）
  );
  game.level.addWorldEdges();
}

// 読み込み時の処理（p5js）
function setup() {
  createCanvas(320, 480);
  
  game = new Game();
  game.reset();
}

function draw() {
  game.update();

  noSmooth();

    // 背景
  background(64);

  // 壁を描画. Draw walls of the level
  game.level.draw_walls();

  // プレイヤーを描画. Draw the player
  game.player.draw_player();

  // 3Dビューを描画. Draw the 3dview.
  // let view_pos = new Vec2(tilemap.numX * tilemap.tSize + 20, 40);
  // game.draw_3Dview_Ray(view_pos);

  // ----- テキストを描画
  game.util.draw_msg('マウスドラッグ／カーソルで移動、\nA,Dキーで回転します');
 
}

