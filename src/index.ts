import {
  Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight,
  MeshBuilder, Material, StandardMaterial, Color3, Mesh
} from 'babylonjs';
import { debounce } from './utils';

const CELL_WIDTH = 1;
const CELL_HEIGHT = 1;
const BOARD_HEIGHT = 0.2;
const CELLS_COUNT = 8;

function addCell(x: number, z: number, material: Material, scene: Scene, parent: Mesh) {
  const cell = MeshBuilder.CreateBox(`cell-${x}-${z}`, {
    width: CELL_WIDTH,
    size: CELL_HEIGHT,
    height: BOARD_HEIGHT
  }, scene);
  cell.material = material;
  cell.parent = parent;
  return cell;
}

function addBoard(scene: Scene) {
  const black = new StandardMaterial('black', scene);
  black.diffuseColor = Color3.Black();
  const white = new StandardMaterial('white', scene);
  white.diffuseColor = Color3.White();

  const board = MeshBuilder.CreateBox('board', {
    size: CELL_HEIGHT * CELLS_COUNT,
    width: CELL_WIDTH * CELLS_COUNT,
    height: BOARD_HEIGHT
  }, scene);

  for (let i = 0; i < CELLS_COUNT; i++) {
    for (let j = 0; j < CELLS_COUNT; j++) {
      const cell = addCell(i, j, (i + j) % 2 === 0 ? black : white, scene, board);
      cell.position.x = i - (CELLS_COUNT - 1) * CELL_HEIGHT / 2;
      cell.position.z = j - (CELLS_COUNT - 1) * CELL_HEIGHT / 2;
      cell.position.y = BOARD_HEIGHT;
    }
  }

  return board;
}

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const engine = new Engine(canvas);

  const scene = new Scene(engine);
  const camera = new ArcRotateCamera('camera', 0, 0.5, 20, Vector3.Zero(), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, false);

  const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);

  addBoard(scene);

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', debounce(() => engine.resize(), 200));
});