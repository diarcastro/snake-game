import SnakePiece from './snake-piece';
import { IGame, EDirections } from './interfaces';
import debug from './debug';

const NUMBER_OF_PIECES_TO_START = 4;

export default class Snake {

    pieces: SnakePiece[];

    private _gameContext: CanvasRenderingContext2D;
    private _game: IGame;
    private _direction:EDirections = EDirections.RIGHT;

    constructor (game: IGame) {
        this._game = game;
        this._gameContext = this._game.getContext();
    }

    get lastPiece(): SnakePiece | null {
        return this.pieces && this.pieces.length && this.pieces[this.pieces.length - 1];
    }

    addPiece (init: boolean = false) {
        const piece = new SnakePiece(this._gameContext);
        const lastPiece = this.lastPiece;
        if (lastPiece) {
            const x = init ? lastPiece.x - piece.width : lastPiece.x;
            piece.x = x;
            piece.y = lastPiece.y;
        } else {
            const x = (this._game.config.width / 2 - piece.width / 2);
            const y = (this._game.config.height / 2) - (piece.height / 2);
            piece.x = x;
            piece.y = y;
        }

        this.pieces.push(piece);
    }

    update () {
        this._move();
        for (let piece of this.pieces) {
            piece.draw();
        }
    }

    init () {
        this.pieces = [];
        for (let i = 0; i< NUMBER_OF_PIECES_TO_START; i++) {
            this.addPiece(true);
        }
        this.update();
    }

    changeDirection (newDirection: EDirections) {
        const direction = this._direction;
        if (direction === newDirection) {
            return;
        }

        debug.log('Current Direction', direction, 'New Snake Direction', newDirection);

        switch (newDirection) {
            case EDirections.RIGHT:
                if (direction !== EDirections.LEFT) {
                    this._direction = newDirection;
                }
                break;
            case EDirections.LEFT:
                if (direction !== EDirections.RIGHT) {
                    this._direction = newDirection;
                }
                break;
            case EDirections.TOP:
                if (direction !== EDirections.BOTTOM) {
                    this._direction = newDirection;
                }
                break;
            case EDirections.BOTTOM:
                if (direction !== EDirections.TOP) {
                    this._direction = newDirection;
                }
                break;
        }
    }

    private _move () {
        let lastPiece = {x: 0, y: 0};
        this.pieces = this.pieces.map((piece) => {
            let x = piece.x;
            let y = piece.y;

            if (lastPiece.x) {
                piece.x = lastPiece.x;
                piece.y = lastPiece.y;
                lastPiece = {x, y}
                return piece;
            }
            lastPiece = {x, y}

            switch (this._direction) {
                case EDirections.LEFT:
                    piece.x-= piece.width;
                    return piece;
                case EDirections.TOP:
                    piece.y-= piece.height;
                    return piece;
                case EDirections.BOTTOM:
                    piece.y+= piece.height;
                    return piece;
                default:
                case EDirections.RIGHT:
                    piece.x+= piece.width;
                    return piece;
            }
        });
    }
}