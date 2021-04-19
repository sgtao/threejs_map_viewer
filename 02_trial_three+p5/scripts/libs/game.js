class Vec2 {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  /**
   * @param {Vec2} b
   */
  add(b) {
    let a = this;
    return new Vec2(a.x + b.x, a.y + b.y);
  }
  /**
   * @param {Vec2} b
   */
  sub(b) {
    let a = this;
    return new Vec2(a.x - b.x, a.y - b.y);
  }
  copy() {
    return new Vec2(this.x, this.y);
  }
  /**
   * @param {number} s
   */
  mult(s) {
    return new Vec2(s * this.x, s * this.y);
  }
  mag() {
    return sqrt(this.x ** 2 + this.y ** 2);
  }
}

class Ray2 {
  /**
   * @param {Vec2} pos このレイの始点の位置ベクトル.
   * @param {Vec2} way このレイの始点から伸びる方向ベクトル.
   */
  constructor(pos, way) {
    this.pos = pos;
    this.way = way;
  }
  /**
   * @param {Vec2} begin
   * @param {Vec2} end
   */
  static withPoints(begin, end) {
    return new Ray2(begin, end.sub(begin));
  }
  get begin() {
    return this.pos;
  }
  get end() {
    return this.pos.add(this.way);
  }
  /**
   * @param {Ray2} r2
   */
  intersection(r2) {
    let r1 = this;
    // Y軸並行の線分はこのコードでは扱えないので、並行の場合は微妙にずらす
    // an dirty hack since this code cannot handle Y-axis parallel rays.
    if (abs(r1.way.x) < 0.01) r1.way.x = 0.01;
    if (abs(r2.way.x) < 0.01) r2.way.x = 0.01;

    // r1,r2を直線として見て、その交点を求める
    // Treat r1,r2 as straight lines and calc the intersection point.
    let t1 = r1.way.y / r1.way.x;
    let t2 = r2.way.y / r2.way.x;
    let x1 = r1.pos.x;
    let x2 = r2.pos.x;
    let y1 = r1.pos.y;
    let y2 = r2.pos.y;
    let sx = (t1 * x1 - t2 * x2 - y1 + y2) / (t1 - t2);
    let sy = t1 * (sx - x1) + y1;

    // 交点が線分上にないときはnullを返す
    // Return null if the intersection point is not on r1 and r2.
    if (
      sx > min(r1.begin.x, r1.end.x)
      && sx < max(r1.begin.x, r1.end.x)
      && sx > min(r2.begin.x, r2.end.x)
      && sx < max(r2.begin.x, r2.end.x)
    ) {
      return new Vec2(sx, sy);
    } else {
      return null;
    }
  }
}

class Player {
  constructor() {
    this.pos = new Vec2(0, 0);
    this.angle = 0;
    this.Zangle = 0;
  }
  draw_player() {
    push();
    stroke(224, 224, 0);
    strokeWeight(24);
    point(this.pos.x, this.pos.y);
    pop();
    // 視野角を描画
    {
      let fov = PI / 2;
      let _leftAngle = this.angle - fov / 2;
      let _rightAngle = this.angle + fov / 2;
      let _leftview = new Vec2(cos(_leftAngle), sin(_leftAngle)).mult(120);
      let _rightview = new Vec2(cos(_rightAngle), sin(_rightAngle)).mult(120);
      push();
      stroke(240);
      strokeWeight(1);
      noFill();
      triangle(this.pos.x, this.pos.y,
        _leftview.x + this.pos.x, _leftview.y + this.pos.y,
        _rightview.x + this.pos.x, _rightview.y + this.pos.y);
      pop();
    }
  }
}

// Tilemap
class Tile {
  constructor() {
    this.numX = 0;
    this.numY = 0;
    this.tSize = 0;
    this.tiles = [];
  }
  reset() {
    this.numX = 0;
    this.numY = 0;
    this.tSize = 0;
    this.tiles = [];
  }
  preset() {
    this.numX = 8;
    this.numY = 10;
    this.tSize = 35;
    this.tiles = [
      '.....OOO',
      '........',
      '..OOO...',
      '..O.....',
      '...OOO..',
      '........',
      '........',
      '......O.',
      'OO...OO.',
      'OO...O..'];
  }
  textSet(textContent) {
    this.reset();
    // console.log(textContent);
    let tempArray = textContent.split("\n");
    let linenum = 1;
    // console.log(tempArray);
    tempArray.forEach(str => {
      let _str_array = str.split(/ |#|\n/);
      // console.log(_str_array);
      if (_str_array[0].length > 0) {
        switch (linenum) {
          case 1:
            this.numX = Number(_str_array[0]);
            linenum++; break;
          case 2:
            this.numY = Number(_str_array[0]);
            linenum++; break;
          case 3:
            this.tSize = Number(_str_array[0]);
            linenum++; break;
          default:
            this.tiles.push(_str_array[0].trim());
            linenum++; break;
        }
      }
    });
  }
  show() {
    console.log(` number of tiles : ${this.numX} * ${this.numY}`);
    console.log(` tiles maps :`);
    for (let i = 0; i < this.numY; i++) {
      console.log(this.tiles[i]);
    }
  }
}

class Level {
  constructor() {
    this.walls = [];
    this.tilemap = '';
    this.tileSize = 35;
    this.mapWidth = 0;
    this.mapHeight = 0;
  }
  tileAt(x, y) {
    return this.tilemap[this.mapWidth * y + x];
  }
  addWorldEdges() {
    let s = this.tileSize;
    let w = this.mapWidth;
    let h = this.mapHeight;
    this.walls.push(new Ray2(new Vec2(0, 0), new Vec2(s * w, 0)));
    this.walls.push(new Ray2(new Vec2(0, 0), new Vec2(0, s * h)));
    this.walls.push(new Ray2(new Vec2(s * w, s * h), new Vec2(-s * w, 0)));
    this.walls.push(new Ray2(new Vec2(s * w, s * h), new Vec2(0, -s * h)));
  }
  /**
   * @param {string} tilemap 
   * @param {number} width 
   * @param {number} height 
   * @param {number} size 
   */
  addTilemap(tilemap, width, height, size) {
    // console.log(tilemap, width, height, size);
    this.tilemap = tilemap;
    this.mapWidth = width;
    this.mapHeight = height;
    this.tileSize = size;
    let s = size;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let tile = this.tileAt(x, y);
        if (tile === 'O' || tile === 'X') {
          this.walls.push(new Ray2(new Vec2(s * x, s * y), new Vec2(s, 0)));
          this.walls.push(new Ray2(new Vec2(s * x, s * y), new Vec2(0, s)));
          if (this.tileAt(x, y + 1) === '.') {
            this.walls.push(new Ray2(new Vec2(s * x, s * y + s), new Vec2(s, 0)));
          }
          if (this.tileAt(x + 1, y) === '.') {
            this.walls.push(new Ray2(new Vec2(s * x + s, s * y), new Vec2(0, s)));
          }
          if (tile === 'X') {
            this.walls.push(new Ray2(new Vec2(s * x, s * y), new Vec2(s, s)));
            this.walls.push(new Ray2(new Vec2(s * x + s, s * y), new Vec2(-s, s)));
          }
        }
      }
    }
    // console.log(this.walls);
  }
  draw_walls() {
    // 壁を描画. Draw walls of the level
    push();
    strokeWeight(4);
    stroke(224);
    let walls = this.walls;
    for (let wall of walls) {
      line(wall.begin.x, wall.begin.y, wall.end.x, wall.end.y);
    }
    pop();
  }
}

class Util {
  cunstructor() {
    this.fontsize = 20;
  }
  draw_msg(s) {
    push();
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    fill(240);
    textSize(20);
    // text('マウスドラッグ／カーソルで移動、A,Dキーで回転します', 5, 400);
    text(s, 5, 400);
    pop();
  }
}

class Game {
  constructor() {
    this.player = new Player();
    this.level = new Level();
    this.util = new Util();
  }
  reset() {
    this.player.pos = new Vec2(118, 201);
    this.player.angle = -PI / 2;
  }
  init(tilemap) {
    this.reset();
    // tilemapの上書き
    this.level = new Level();
    gthisame.level.addTilemap(
      tilemap.tiles.join(''),
      tilemap.numX, // 幅（横方向のタイルの数）
      tilemap.numY,// 高さ（縦方向のタイルの数）
      tilemap.tSize // タイルの大きさ（px）
    );
    this.level.addWorldEdges();
  }
  update() {
    // 更新前のPlayerの位置
    let _pre_pos = new Vec2(this.player.pos.x, this.player.pos.y);

    // 視点を移動
    if (mouseIsPressed) {
      this.player.pos.x = mouseX;
      this.player.pos.y = mouseY;
    }

    if (keyIsPressed === true) {
      // keycodeは、https://keycode.info/  を参照
      // 視点を回転
      if (keyIsDown(68)) this.player.angle += PI / 180; // Dキー
      if (keyIsDown(65)) this.player.angle -= PI / 180; // Aキー
      if (keyIsDown(87)) this.player.Zangle += PI / 180; // Wキー
      if (keyIsDown(83)) this.player.Zangle -= PI / 180; // Sキー

      // 移動（上下左右）
      if (keyIsDown(37)) this.player.pos.x -= 1; // 左キー
      if (keyIsDown(38)) this.player.pos.y -= 1; // 上キー
      if (keyIsDown(39)) this.player.pos.x += 1; // 右キー
      if (keyIsDown(40)) this.player.pos.y += 1; // 下キー
    }

    // Playerの位置を補正する(余分に 5px分を制限する)
    {
      let _max_x = this.level.mapWidth * this.level.tileSize - 5;
      let _max_y = this.level.mapHeight * this.level.tileSize - 5;
      if (this.player.pos.x < 5) this.player.pos.x = 5;
      if (this.player.pos.x > _max_x) this.player.pos.x = _max_x;
      if (this.player.pos.y < 5) this.player.pos.y = 5;
      if (this.player.pos.y > _max_y) this.player.pos.y = _max_y;
    }

    // 更新場所にタイルがあるか？
    {
      let _tile_x = floor(this.player.pos.x / this.level.tileSize);
      let _tile_y = floor(this.player.pos.y / this.level.tileSize);
      let _tileAt = this.level.tileAt(_tile_x, _tile_y);
      if (_tileAt === 'O' || _tileAt === 'X') {
        this.player.pos.x = _pre_pos.x;
        this.player.pos.y = _pre_pos.y;
      }
    }

    // 視野角の回転を補正・制限
    {
      this.player.angle = this.player.angle % (2 * PI);
      let _Zangle = this.player.Zangle;
      if (_Zangle <= 0) this.player.Zangle = 0;
      if (_Zangle >= PI / 2) this.player.Zangle = PI / 2;
    }
  }
  draw_3Dview_Ray(vpos = new Vec2(305, 40)) {
    // 3Dビューを描画. Draw the 3dview.
    let walls = this.level.walls;
    let player = this.player;
    // let viewRect = new Ray2(new Vec2(305, 40), new Vec2(320, 240));
    let viewRect = new Ray2(vpos, new Vec2(320, 240));

    let fov = PI / 2;
    let centerAngle = player.angle;
    let leftAngle = centerAngle - fov / 2;
    let rightAngle = centerAngle + fov / 2;
    let beamTotal = 40;
    let beamIndex = -1;

    // 3Dビューの枠を描画. Draw border lines of the 3dview.
    push();
    noFill();
    stroke(66, 200, 251);
    strokeWeight(6);
    rect(viewRect.pos.x, viewRect.pos.y, viewRect.way.x, viewRect.way.y);
    pop();

    // 3Dの物体と光線を描画する
    push();
    for (let angle = leftAngle; angle < rightAngle - 0.01; angle += fov / beamTotal) {
      beamIndex++;
      let beam = new Ray2(
        player.pos.copy(),
        new Vec2(cos(angle), sin(angle)).mult(120)
      );

      // 光線が2枚以上の壁にあたっていたら、一番近いものを採用する。
      // Adapt the nearest beam.
      let allHitBeamWays = walls.map(wall => beam.intersection(wall))
        .filter(pos => pos !== null)
        .map(pos => pos.sub(beam.begin));
      if (allHitBeamWays.length === 0) {
        stroke(96, 96, 0);
        strokeWeight(1);
        line(beam.begin.x, beam.begin.y, beam.end.x, beam.end.y);
        continue;
      }
      let hitBeam = allHitBeamWays.reduce((a, b) => a.mag() < b.mag() ? a : b);

      // 3Dビューに縦線を1本描画する draw a line into 3dview
      let hitPos = hitBeam.add(beam.begin);
      let wallDist = hitBeam.mag();
      let wallPerpDist = wallDist * cos(angle - centerAngle);
      let lineHeight = constrain(3500 / wallPerpDist, 0, viewRect.way.y);
      lineHeight -= lineHeight % 8;
      let lineBegin = viewRect.begin.add(
        new Vec2(
          viewRect.way.x / beamTotal * beamIndex,
          viewRect.way.y / 2 - lineHeight / 2
        )
      );
      let lightness = 224;
      let lmft = 1.3; //lightness multiplier for topview
      let tileSize = game.level.tileSize;
      let pillarSize = 5;
      if (
        ((hitPos.x % tileSize < pillarSize) || (hitPos.x % tileSize > tileSize - pillarSize))
        && ((hitPos.y % tileSize < pillarSize) || (hitPos.y % tileSize > tileSize - pillarSize))
      ) {
        stroke(215 * lmft, 179 * lmft, 111 * lmft); //wooden pillar color
        fill(215, 179, 111);
      } else {
        stroke(lightness * lmft); //concrete wall color
        fill(lightness);
      }
      strokeWeight(0);
      rect(lineBegin.x, lineBegin.y, 7, lineHeight);

      // ↑の縦線に対応した光線を、俯瞰図に描画する.
      // draw a beam correspond to above 3dview line into the topview.
      strokeWeight(1);
      line(player.pos.x, player.pos.y, player.pos.add(hitBeam).x, player.pos.add(hitBeam).y);
    }
    pop();

  }
}

