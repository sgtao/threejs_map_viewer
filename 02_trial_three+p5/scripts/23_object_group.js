// 23_object_group.js
import * as THREE from './vendors/three.module.js';
import { OrbitControls } from './vendors/OrbitControls.module.js';

let controls, stats, gui;

// ページの読み込みを待つ
window.addEventListener('load', init);

function init() {
  // console.log('initializing...');
  const container = document.querySelector('#container');
  let _canvas = document.createElement('canvas');
  _canvas.style.position = "absolute";
  _canvas.style.top = "0";
  _canvas.style.left = "0";
  container.appendChild(_canvas);

  // サイズを指定
  const width = window.innerWidth / 2;
  const height = window.innerHeight / 2;

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({ canvas: _canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(-100, 150, 500);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  // カメラコントローラーを作成
  controls = new OrbitControls(camera, renderer.domElement);


  // 地面を作成
  scene.add(new THREE.GridHelper(600));
  scene.add(new THREE.AxesHelper(300));

  // グループを作る
  const group = new THREE.Group();
  // 3D空間にグループを追加する
  scene.add(group);

  // 画像を読み込む
  const loader = new THREE.TextureLoader();
  // const texture = loader.load('images/earthmap1k.jpg');
  // const texture = loader.load("https://ics-creative.github.io/tutorial-three/samples/imgs/earthmap1k.jpg");
  // console.log('texture : ' + JSON.stringify(texture));
  // console.log('load result : ' + loader.onError);

  let meshLists = [];
  for (let i = 0; i < 10; i++) {
    const material = new THREE.MeshNormalMaterial();
    // マテリアルにテクスチャーを設定
    // const material = new THREE.MeshStandardMaterial({ map: texture });
    // 球体を作成
    const geometry = new THREE.SphereGeometry(30, 30, 30);
    const mesh = new THREE.Mesh(geometry, material);

    // 配置座標を計算
    const radian = (i / 10) * Math.PI * 2;
    mesh.position.set(
      200 * Math.cos(radian), // X座標
      30, // Y座標
      200 * Math.sin(radian) // Z座標
    );

    // グループに追加する
    group.add(mesh);
    meshLists.push(mesh);
  }
  // console.log('group : ' + JSON.stringify(group));

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    // group.rotation.x += 0.01;
    group.rotation.y += 0.01;
    // group.rotation.z += 0.01;

    // meshLists.forEach( mesh => {
    //   mesh.rotation.y += 0.02;
    // });
    
    // レンダリング
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // at window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 再描画
    tick();
  });

}