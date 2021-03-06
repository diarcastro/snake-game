import SnakePiece from './snake-piece';
import { IGame, EDirections, ESnakeEvents } from './interfaces';
import debug from './debug';
import { Point } from './point';

const NUMBER_OF_PIECES_TO_START = 12;

export class SnakeEvent extends Event {
    special: boolean = false;
    isBorderCollision: boolean = false;
    gameOver: boolean = false;

    constructor (type: string, special: boolean = false) {
        super(type);
        this.special = special;
    }
}

export class Snake {

    pieces: SnakePiece[];

    private _gameContext: CanvasRenderingContext2D;
    private _game: IGame;
    private _direction:EDirections = EDirections.RIGHT;
    private _events: Function[];

    constructor (game: IGame) {
        this._game = game;
        this._gameContext = this._game.getContext();
    }

    get lastPiece(): SnakePiece | null {
        return this.pieces && this.pieces.length && this.pieces[this.pieces.length - 1];
    }

    get firstPiece(): SnakePiece | null {
        return this.pieces && this.pieces.length && this.pieces[0];
    }

    get direction(): EDirections {
        return this._direction;
    }

    get width(): number {
        const howManyPieces = this.pieces.length;
        const size = howManyPieces * this.firstPiece.width;
        return size;
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
        this._events = [];
        for (let i = 0; i< NUMBER_OF_PIECES_TO_START; i++) {
            this.addPiece(true);
        }
        this.update();
    }

    detectCollision (food: Point) {
        const collide = food.detectCollision(this.firstPiece);
        if (collide) {
            const collisionEvent = new SnakeEvent(ESnakeEvents.ON_COLLISION);
            this.triggerOnCollision(collisionEvent);
        }
        // Detect borders collisions
        const collisionEvent = new SnakeEvent(ESnakeEvents.ON_COLLISION);
        collisionEvent.isBorderCollision = true;
        let isCollision = false;
        if (this.firstPiece.x < 0){
            isCollision = true;
        } else if (this.firstPiece.y < 0) {
            isCollision = true;
        } else if (this.firstPiece.x + this.firstPiece.width > this._game.area.width) {
            isCollision = true;
        } else if (this.firstPiece.y + this.firstPiece.height > this._game.area.height) {
            isCollision = true;
        }

        // Detect itself collision
        for (let i = 2; i< this.pieces.length; i++){
            const piece = this.pieces[i];
            const collision = this.firstPiece.detectCollision(piece);
            if (collision) {
                isCollision = true;
                collisionEvent.gameOver = true;
                break;
            }
        }

        if (isCollision) {
            this.triggerOnCollision(collisionEvent);
        }
    }

    reverse () {
        this.pieces = this.pieces.reverse();
        switch (this._direction) {
            case EDirections.RIGHT:
                this._direction = EDirections.LEFT;
                this._moveAfterCollision();
                break;
            case EDirections.LEFT:
                this._direction = EDirections.RIGHT;
                break;
            case EDirections.TOP:
                this._direction = EDirections.BOTTOM;
                break;
            case EDirections.BOTTOM:
                this._direction = EDirections.TOP;
                this._moveAfterCollision();
                break;
        }
    }

    onCollision (callback: Function) {
        this._events.push(callback);
    }

    private triggerOnCollision (event: SnakeEvent) {
        for (let fnc of this._events) {
            fnc(event);
        }
    }

    changeDirection (newDirection: EDirections) {
        const direction = this._direction;
        if (direction === newDirection) {
            return;
        }

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

    private _moveAfterCollision () {
        this.pieces = this.pieces.map((piece) => {
            if (this._direction === EDirections.LEFT) {
                piece.x-= this._game.config.gameAreaDecrease + this.firstPiece.width;
            } else if (this._direction === EDirections.TOP) {
                piece.y-= this._game.config.gameAreaDecrease + this.firstPiece.height;
            }
            return piece;
        });
    }
}