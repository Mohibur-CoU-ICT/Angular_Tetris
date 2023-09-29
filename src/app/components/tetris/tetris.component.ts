import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.scss'],
})
export class TetrisComponent {
  row: number = 10;
  column: number = 9;
  PADDING: number = 2;
  BLOCK_SIZE: number = 3; // 3 X 3
  step: number = 0;
  midY!: number;
  maxMidY: number = 0;
  score: number = 0;
  status: string;
  gameStoped: boolean = false;
  gameStarted: boolean = false;
  noOfGeneratedBlocks: number = 0;
  xArr: number[][] = [];
  board: number[][] = [];
  tetriminos: any[][] = [];
  currentBlock: number[][] = [];

  constructor() {
    this.status = 'Constructor';
    console.log('constructor');
    this.tetriminos = [
      // I-Tetrimino (Straight Block)
      [
        [1, 1, 1],
        [0, 0, 0],
        [0, 0, 0],
      ],
      // J-Tetrimino
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      // L-Tetrimino
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      // O-Tetrimino (Square Block)
      [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 0],
      ],
      // S-Tetrimino
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      // T-Tetrimino
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      // Z-Tetrimino
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
    ];
  }

  // when generate button is clicked
  generateBoard() {
    this.status = 'Generating Board';
    if (this.row < 5 || this.column < 5 || this.column % 2 !== 1) {
      return;
    }
    // 2 extra row for bottom
    // 4 extra column for left & right side
    this.board = Array(this.row + this.PADDING).fill(
      Array(this.column + this.PADDING * 2).fill(0)
    );
    console.log('board =', this.board);
  }

  // when start game button is clicked starting a new game
  async startGame() {
    this.status = 'Game Started';
    this.gameStarted = true;
    this.noOfGeneratedBlocks++;
    // console.log('noOfGeneratedBlocks =', this.noOfGeneratedBlocks);
    await this.generateCurrentBlock();
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    // 0, 0, 0, 1, 1, 1, 0, 0, 0, 0
    let x = JSON.parse(JSON.stringify(this.board));
    let y = JSON.parse(JSON.stringify(this.currentBlock));
    await this.moveYThroughX(x, y);
    await this.clearFilledRows();
    await this.checkGameEnd();
    if (!this.gameStoped) {
      this.startGame();
    }
  }

  // generate a new tetrimino block
  async generateCurrentBlock(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.status = 'Generating new block';
      let i = Math.floor(Math.random() * this.tetriminos.length);
      // this.currentBlock = this.tetriminos[0];
      this.currentBlock = this.tetriminos[i];
      resolve();
    });
  }

  /*
  x = 0 0 0 0 0 0 0
      0 0 0 0 0 0 0
      0 0 0 0 0 0 0
      0 0 0 0 0 0 0
      0 0 0 0 0 0 0
  y = 0 0 0
      0 1 0
      1 1 1
  */

  // move current block through the board towards down
  async moveYThroughX(x: number[][], y: number[][]): Promise<void> {
    return new Promise((resolve, reject) => {
      const xRows = x.length;
      const xColumns = x[0].length;
      const yRows = y.length;
      const yColumns = y[0].length;
      this.midY = Math.floor(xColumns / 2) - Math.floor(yColumns / 2);
      this.step = 0;

      let intervalId = setInterval(() => {
        this.status = 'Moving current block through the board';
        let tempBoard = JSON.parse(JSON.stringify(x));
        let validMove: boolean = true;
        for (let row = 0; row < yRows; row++) {
          for (let col = 0; col < yColumns; col++) {
            const xRow = row + this.step;
            const xCol = col + this.midY;

            if (!this.isValid(xRow, xCol, xRows, xColumns)) {
              console.log('invalid position: ', xRow, xCol, xRows, xColumns);
              validMove = false;
              break;
            }

            if (y[row][col] === 1 && x[xRow][xCol] !== 1) {
              x[xRow][xCol] = y[row][col];
            } else if (y[row][col] === 1 && x[xRow][xCol] === 1) {
              validMove = false;
              break;
            }
          }
          if (!validMove) {
            break;
          }
        }
        // console.log(`x after ${step} th step`);
        // console.table(x);
        // let validMove = this.isMovable(x, y);
        let xClone = JSON.parse(JSON.stringify(x));
        this.xArr = JSON.parse(JSON.stringify(x));
        if (this.isOutSideBlockFilled(xClone)) {
          validMove = false;
        }
        this.status = 'Moving current block through the board';
        if (validMove === true) {
          this.board = x;
        } else {
          clearInterval(intervalId);
          resolve();
        }
        // console.table(this.board);
        x = tempBoard;
        this.step++;
      }, 500);
    });
  }

  // check if the current block can move
  isMovable(x: number[][], y: number[][]): boolean {
    debugger
    let isMovable: boolean = true;
    const xRows = x.length;
    const xColumns = x[0].length;
    const yRows = y.length;
    const yColumns = y[0].length;
    // this.midY = Math.floor(xColumns / 2) - Math.floor(yColumns / 2);
    // let step: number = 0;

    for (let row = 0; row < yRows; row++) {
      for (let col = 0; col < yColumns; col++) {
        const xRow = row + this.step;
        const xCol = col + this.midY;

        if (!this.isValid(xRow, xCol, xRows, xColumns)) {
          console.log('invalid position: ', xRow, xCol, xRows, xColumns);
          isMovable = false;
          break;
        }

        if (y[row][col] === 1 && x[xRow][xCol] !== 1) {
          x[xRow][xCol] = y[row][col];
        } else if (y[row][col] === 1 && x[xRow][xCol] === 1) {
          isMovable = false;
          break;
        }
      }
      if (!isMovable) {
        break;
      }
    }
    return isMovable;
  }

  // checking outside block is filled or not
  isOutSideBlockFilled(x: number[][]): boolean {
    this.status = 'Checking outside block filled or not';
    // console.log('outside block filled');
    // console.log(x);
    for (let i = 0; i < x.length; i++) {
      // console.log('i =', i);
      // let jArr: number[] = [];
      for (let j = 0; j < x[0].length; j++) {
        if (
          j > 1 &&
          j < x[0].length - this.PADDING &&
          i < x.length - this.PADDING
        ) {
          continue;
        }
        // jArr.push(j);
        if (x[i][j] === 1) {
          // console.log('true');
          return true;
        }
      }
      // console.log('j =', jArr);
    }
    // console.log('false');
    return false;
  }

  // checking for valid position
  isValid(x: number, y: number, row: number, col: number): boolean {
    this.status = 'Checking valid position condition';
    return x >= 0 && x < row && y >= 0 && y < col;
  }

  // listening for key event
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log('event.key =', event.key);
    // console.log(this.midY, this.column);
    debugger;
    if (this.gameStarted && !this.gameStoped) {
      let x = JSON.parse(JSON.stringify(this.board));
      let y = JSON.parse(JSON.stringify(this.currentBlock));
      if (event.key === 'ArrowLeft') {
        console.log('left arrow pressed');
        if (this.midY - 1 > 1) {
          this.midY--;
          if (!this.isMovable(x, y)) {
            this.midY++;
          }
        }
      } else if (event.key === 'ArrowRight') {
        console.log('right arrow pressed');
        if (this.midY + this.BLOCK_SIZE < this.board[0].length - this.PADDING) {
          this.midY++;
          if (!this.isMovable(x, y)) {
            this.midY--;
          }
          this.maxMidY = Math.max(this.maxMidY, this.midY);
        }
      }
    }
  }

  // clear filled rows i.e rows with all columns filled with 1
  async clearFilledRows(): Promise<void> {
    console.log('clearFilterRows() called');
    console.log(this.board);
    return new Promise((resolve, reject) => {
      this.status = 'Clearing filled rows';
      this.board.forEach((row, rowIndex) => {
        let boardAreaColumns: number[] = row.slice(
          this.PADDING,
          row.length - this.PADDING
        );
        if (boardAreaColumns.every((col) => col === 1)) {
          this.score += this.column;
          this.board.splice(rowIndex, 1);
          this.board.unshift(Array(this.column + this.PADDING * 2).fill(0));
        }
      });
      resolve();
    });
  }

  // check the game is over or not
  async checkGameEnd(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.status = 'Checking game end condition';
      let firstRow = this.board[0].slice(
        this.PADDING,
        this.column + this.PADDING
      );
      this.gameStoped = firstRow.some((col) => col === 1);
      if (this.gameStoped) {
        this.gameStarted = false;
        this.status = 'Game Ended';
      }
      resolve();
    });
  }

  // restart the game
  restartGame() {
    this.row = 10;
    this.column = 9;
    this.PADDING = 2;
    this.BLOCK_SIZE = 3; // 3 X 3
    this.midY = 0;
    this.maxMidY = 0;
    this.score = 0;
    this.status = '';
    this.gameStoped = false;
    this.gameStarted = false;
    this.noOfGeneratedBlocks = 0;
    this.xArr = [];
    this.board = [];
    this.currentBlock = [];
  }
}
