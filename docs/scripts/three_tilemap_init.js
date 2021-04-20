// three_tilemap.js

let controls, stats, gui;

// ページの読み込みを待つ
// window.addEventListener('load', three_map_init);
function three_tilemap_init() {
  // console.log('initializing...');
  const container = document.querySelector('#container');
  let _canvas = document.createElement('canvas');
  _canvas.style.position = "absolute";
  _canvas.style.top = "0";
  _canvas.style.left = "0";
  container.appendChild(_canvas);

  // サイズを指定
  var width = window.innerWidth;
  var height = window.innerHeight / 2;

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({ canvas: _canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 0, 0);
  camera.lookAt(new THREE.Vector3(150, 150, 0));


  // 地面を作成
  // scene.add(new THREE.GridHelper(600));
  // scene.add(new THREE.AxesHelper(300));
  {
    let _tileMax = (tilemap.numX > tilemap.numY) ? tilemap.numX : tilemap.numY;
    if (_tileMax > 0) {
      // console.log(_tileMax);
      scene.add(new THREE.AxesHelper(1.2 * tilemap.tSize * _tileMax));
      scene.add(new THREE.GridHelper(2 * tilemap.tSize * _tileMax), 4 * _tileMax);
    }
  }

  // 環境光源を作成
  // new THREE.AmbientLight(色, 光の強さ)
  const light = new THREE.AmbientLight(0xFFFFFF, 1.0);
  scene.add(light);

  // グループを作る
  const group = new THREE.Group();
  // 3D空間にグループを追加する
  scene.add(group);

  let meshLists = [];
  {
    let tilemap = game.level.tilemap;
    let width   = game.level.mapWidth;
    let height  = game.level.mapHeight;
    let tSize   = game.level.tileSize;

    // 物体(Geometry, Material)を定義
    // const geometryO = new THREE.BoxGeometry(tSize, 20, tSize );
    // const geometryX = new THREE.BoxGeometry(tSize, 20, tSize );
    const geometryO = new THREE.BoxGeometry(tSize, 20, tSize);
    const geometryX = new THREE.ConeGeometry(tSize / 2, 20, 32);
    const materialO = new THREE.MeshNormalMaterial();
    const materialX = new THREE.MeshNormalMaterial();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let tile = game.level.tileAt(x, y);
        if (tile === 'O' || tile === 'X') {
          // console.log(` at (x,y) = (${x},${y}) : ${tile} (tileSize = ${tSize  })`);
          let mesh = (tile==='O') ? new THREE.Mesh(geometryO, materialO) : 
                                    new THREE.Mesh(geometryX, materialX); 
          mesh.position.set(
            y * tSize - (tSize / 2),          // x軸方向の位置
            15,                        // y軸方向の位置
            (width - x) * tSize - (tSize / 2) // z軸方向の位置
          );
          // グループに追加する
          group.add(mesh);
          meshLists.push(mesh);
        } else if (tile === 'S') {
          console.log(` at (x,y) = (${x},${y}) : ${tile} (tileSize = ${tSize  })`);
          // カメラ位置のセット
          camera.position.set(
            y * tSize - (tSize / 2),          // x軸方向の位置
            10,                               // y軸方向の位置
            (width - x) * tSize - (tSize / 2) // z軸方向の位置
          );
          camera.lookAt(new THREE.Vector3(0, 200, 0));
        }
      }
    }
  }


  // let meshLists = [];
  // for (let i = 0; i < 10; i++) {
  //   const material = new THREE.MeshNormalMaterial();
  //   // マテリアルにテクスチャーを設定
  //   // const material = new THREE.MeshStandardMaterial({ map: texture });
  //   // 球体を作成
  //   const geometry = new THREE.SphereGeometry(30, 30, 30);
  //   const mesh = new THREE.Mesh(geometry, material);

  //   // 配置座標を計算
  //   const radian = (i / 10) * Math.PI * 2;
  //   mesh.position.set(
  //     200 * Math.cos(radian), // X座標
  //     30, // Y座標
  //     200 * Math.sin(radian) // Z座標
  //   );

  //   // グループに追加する
  //   group.add(mesh);
  //   meshLists.push(mesh);
  // }
  // console.log('group : ' + JSON.stringify(group));

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    // group.rotation.x += 0.01;
    // group.rotation.y += 0.01;
    // group.rotation.z += 0.01;

    // update camera position
    let _tile_w = tilemap.numX * tilemap.tSize;
    // let _tile_h = tilemap.numY * tilemap.tSize;
    let _cam_px = game.player.pos.y;
    let _cam_py = 20;
    let _cam_pz = _tile_w - game.player.pos.x;
    let _cam_vx = _cam_px + 100 * sin(game.player.angle);
    let _cam_vy = 100 * sin(game.player.Zangle);
    let _cam_vz = _cam_pz - 100 * cos(game.player.angle); 
    camera.position.set(_cam_px, _cam_py, _cam_pz);
    camera.lookAt(new THREE.Vector3(_cam_vx, _cam_vy, _cam_vz));

    // camera.position.set(-100, 200, 500);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));

    // レンダリング
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // at window resize
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight / 2;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    // 再描画
    tick();
  });

}

