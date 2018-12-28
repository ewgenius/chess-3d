import {
  Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight,
  MeshBuilder, Material, StandardMaterial, Color3, Mesh
} from 'babylonjs';
import { debounce } from './utils';

const CELL_SIZE = 1;
const BOARD_HEIGHT = 0.2;
const CELLS_COUNT = 8;
const PIECE_SIZE = 0.6;

enum PieceType {
  King,
  Queen,
  Rock,
  Bishop,
  Knight,
  Pawn
}

interface PiecesSet {
  king: Piece;
  queen: Piece;
  bishopL: Piece;
  bishopR: Piece;
  RockL: Piece;
  RockR: Piece;
  KnightL: Piece;
  KnightR: Piece;
}

const piecesSet = [
  PieceType.Rock,
  PieceType.Knight,
  PieceType.Bishop,
  PieceType.King,
  PieceType.Queen,
  PieceType.Bishop,
  PieceType.Knight,
  PieceType.Rock,
  PieceType.Pawn,
  PieceType.Pawn,
  PieceType.Pawn,
  PieceType.Pawn,
  PieceType.Pawn,
  PieceType.Pawn,
  PieceType.Pawn,
  PieceType.Pawn
];

class Piece {
  private base: Mesh;

  constructor(type: PieceType, material: Material, scene: Scene) {
    this.base = MeshBuilder.CreateCylinder(`piece-${type}`, {
      diameterBottom: PIECE_SIZE,
      diameterTop: PIECE_SIZE,
      height: 0.2
    }, scene);

    this.base.position.y = BOARD_HEIGHT * 2;
    this.base.material = material;

    Piece.createPiece(this.base, scene, type, material);
  }

  move(x: number, y: number) {
    this.base.position.x = x * CELL_SIZE - (CELLS_COUNT - 1) / 2;
    this.base.position.z = y * CELL_SIZE - (CELLS_COUNT - 1) / 2;
  }

  public get mesh() {
    return this.base;
  }

  private static createPiece(base: Mesh, scene: Scene, type: PieceType, material: Material) {
    let figure: Mesh | null = null;
    let head: Mesh | null = null;
    switch (type) {
      case PieceType.King: {
        const height = 1
        figure = MeshBuilder.CreateCylinder('figure', {
          height: height,
          diameterTop: 0.2,
          diameterBottom: 0.5
        }, scene);
        figure.position.y = height / 2;
        head = MeshBuilder.CreateSphere('head', {
          segments: 8,
          diameter: 0.3
        }, scene);
        head.position.y = height;
        break;
      }

      case PieceType.Queen: {
        const height = 1
        figure = MeshBuilder.CreateCylinder('figure', {
          height: height,
          diameterTop: 0.1,
          diameterBottom: 0.5
        }, scene);
        figure.position.y = height / 2;
        head = MeshBuilder.CreateSphere('head', {
          segments: 8,
          diameter: 0.3
        }, scene);
        head.position.y = height;
        break;
      }

      case PieceType.Bishop: {
        const height = 0.7
        figure = MeshBuilder.CreateCylinder('figure', {
          height: height,
          diameterTop: 0.2,
          diameterBottom: 0.5
        }, scene);
        figure.position.y = height / 2;
        head = MeshBuilder.CreateCylinder('figure', {
          height: 0.4,
          diameterTop: 0,
          diameterBottom: 0.3
        }, scene);
        head.position.y = height + 0.2;
        break;
      }

      case PieceType.Knight: {
        const height = 0.8
        figure = MeshBuilder.CreateCylinder('figure', {
          height: height,
          diameterTop: 0.1,
          diameterBottom: 0.5
        }, scene);
        figure.position.y = height / 2;
        head = MeshBuilder.CreateSphere('head', {
          segments: 8,
          diameter: 0.3
        }, scene);
        head.position.y = height;
        break;
      }

      case PieceType.Rock: {
        const height = 0.7
        figure = MeshBuilder.CreateCylinder('figure', {
          height: height,
          diameterTop: 0.3,
          diameterBottom: 0.5
        }, scene);
        figure.position.y = height / 2;
        head = MeshBuilder.CreateCylinder('head', {
          height: 0.2,
          diameter: 0.4
        }, scene);
        head.position.y = height;
        break;
      }

      case PieceType.Pawn: {
        const height = 0.6
        figure = MeshBuilder.CreateCylinder('figure', {
          height: height,
          diameterTop: 0.1,
          diameterBottom: 0.5
        }, scene);
        figure.position.y = height / 2;
        head = MeshBuilder.CreateSphere('head', {
          segments: 8,
          diameter: 0.3
        }, scene);
        head.position.y = height;
        break;
      }
    }
    if (figure) {
      figure.material = material;
      figure.parent = base;
    }
    if (head) {
      head.material = material;
      head.parent = base;
    }
  }
}

class Game {
  private scene: Scene;
  private engine: Engine;
  private materials: { [key: string]: Material }

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas);

    this.scene = new Scene(this.engine);
    const camera = new ArcRotateCamera('camera', 0, 0.5, 20, Vector3.Zero(), this.scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, false);

    new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

    const black = new StandardMaterial('black', this.scene);
    black.diffuseColor = Color3.Black();

    const white = new StandardMaterial('white', this.scene);
    white.diffuseColor = Color3.White();

    const blackPiece = new StandardMaterial('black-piece', this.scene);
    blackPiece.diffuseColor = new Color3(0.2, 0.2, 0.2);

    const whitePiece = new StandardMaterial('white-piece', this.scene);
    whitePiece.diffuseColor = new Color3(0.8, 0.8, 0.8);

    this.materials = {
      black,
      white,
      blackPiece,
      whitePiece
    };
  }

  public start() {
    this.initChessBoard(this.materials.black, this.materials.white);
    this.engine.runRenderLoop(this.render);
  }

  private render = () => {
    this.scene.render();
  }

  public resize = debounce(() => this.engine.resize(), 200);

  private addCell(x: number, z: number, material: Material, parent: Mesh) {
    const cell = MeshBuilder.CreateBox(`cell-${x}-${z}`, {
      width: CELL_SIZE,
      size: CELL_SIZE,
      height: BOARD_HEIGHT
    }, this.scene);
    cell.material = material;
    cell.parent = parent;
    return cell;
  }

  private initChessBoard(black: Material, white: Material) {
    const board = MeshBuilder.CreateBox('board', {
      size: CELL_SIZE * CELLS_COUNT,
      width: CELL_SIZE * CELLS_COUNT,
      height: BOARD_HEIGHT
    }, this.scene);

    for (let i = 0; i < CELLS_COUNT; i++) {
      for (let j = 0; j < CELLS_COUNT; j++) {
        const cell = this.addCell(i, j, (i + j) % 2 === 0 ? black : white, board);
        cell.position.x = i - (CELLS_COUNT - 1) * CELL_SIZE / 2;
        cell.position.z = j - (CELLS_COUNT - 1) * CELL_SIZE / 2;
        cell.position.y = BOARD_HEIGHT;
      }
    }

    piecesSet.forEach((type, i) => {
      const pieceB = this.addPiece(type, board, this.materials.blackPiece);
      pieceB.move(i % 8, i >= 8 ? 1 : 0);
      const pieceW = this.addPiece(type, board, this.materials.whitePiece);
      pieceW.move(i % 8, i >= 8 ? 6 : 7);

    });

    return board;
  }

  private addPiece(type: PieceType, board: Mesh, material: Material) {
    const piece = new Piece(type, material, this.scene);
    piece.mesh.parent = board;

    return piece;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const game = new Game(canvas);
  game.start();

  window.addEventListener('resize', () => game.resize());
});
