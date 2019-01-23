import React from 'react';
import './App.css';

class App extends React.Component {
	constructor() {
		super();
		this.nbRow = 6;
		this.nbColumn = 7;
		this.nbRound = 0;
		this.widthCell = 80;
		this.roundOnGoing = false; // Lorsque le joueur a joué mais que le jeton tombe toujours
		this.currentTokenElt = null; // Le jeton actuellement au dessus de la grille de jeu
		const initState = {};
		for (let i = 0; i < this.nbRow; i++) {
			initState[i] = Array(this.nbColumn).fill('_');
		}
		this.state = {
			grid          : { ...initState },
			currentPlayer : 'X',
			hasWon        : null,
		};
		this.onHover = this.onHover.bind(this);
	}

	/**
	 * Permet d'afficher un jeton au dessus de la grille de jeu
	 * @param {number} j le numero de la colonne
	 */
	onHover(j) {
		if (this.roundOnGoing) return;
		const { currentPlayer } = this.state;
		if (this.currentTokenElt !== null) {
			this.currentTokenElt.classList.remove(currentPlayer);
		}
		this.currentTokenElt = document.getElementById(`${j}_rowChoice`);
		this.currentTokenElt.classList.add(currentPlayer);
	}

	/**
	 * Permet d'ajouter un jeton a la grille
	 * @param {number} j correspond a la colonne du jeton
	 */
	onAddToken(j) {
		// Le tour du joueur n'est pas fini
		if (this.roundOnGoing) return;
		// Si l'utilisateur clique, change de colonne pendant l'animation, ne bouge plus la souris et reclique
		// l'animation ne s'effectuait pas car le onMouseMouve n'aura pas été déclanché et n'affiché jamais
		// le jeton au dessus du jeu, appeler onHover permet de rajouter le jeton au clique
		this.onHover(j);
		this.roundOnGoing = true;
		const { grid, currentPlayer } = this.state;
		let { hasWon } = this.state;
		// Si il y a un gagnant ou que le joueur est entrain de joué l'animation
		if (hasWon) return;
		let i;
		// pour chaque ligne "i" on cherche la premiére cellule de la la colonne "j" qui n'est pas remplie
		for (i = 0; i < this.nbRow; i++) {
			const { [i]: line } = this.state.grid;
			// Lorsqu'on trouve une ligne "i" ayant une cellule "j" vide
			if (line[j] === '_') break;
		}
		// Si toute les cellule de la colonne "j" sont remplie alors i === this.nbRow. Impossible d'ajouter de jeton
		if (i === this.nbRow) return;
		const eltCell = document.getElementById(`${i}-${j}`);
		const eltToken = document.getElementById(`${j}_rowChoice`);
		const { y: yToken } = eltToken.getBoundingClientRect();
		const { y: yCell } = eltCell.getBoundingClientRect();
		// Ajout de la l'effet de chute du jeton
		eltToken.style.setProperty('transform', `translateY(${yCell - yToken}px)`);
		eltToken.style.setProperty('transition', '0.5s ease-in');
		const { [i] : tCurrentLine } = grid;
		tCurrentLine[j] = currentPlayer;
		this.nbRound++;
		// A partir du 8ème tour un joueur peut avoir placé assez de jeton pour gagner
		if (this.nbRound >= 7) {
			const winner = this.checkForWinner(i, j, grid, currentPlayer);
			if (winner) {
				hasWon = winner;
			}
		}
		const newCurrentPlayer = this.changePlayer(currentPlayer);
		setTimeout(() => {
			this.currentTokenElt.classList.remove(currentPlayer);
			// Suppression de l'effet de chute du jeton
			eltToken.style.removeProperty('transform');
			eltToken.style.removeProperty('transition');
			this.setState({
				grid          : { ...grid, [i]: tCurrentLine },
				currentPlayer : newCurrentPlayer,
				hasWon,
			}, () => {
				this.roundOnGoing = false;
				this.onHover(j);
			});
		}, 500);
	}

	/**
	 * Permet de vérifier si un joueur a gagner la partie
	 * @param {number} line correspond a la ligne du jeton
	 * @param {number} column correspond a la colonne du jeton
	 * @param {object} grid grille du jeu
	 * @param {string} column X ou O en fonction du joueur
	 * @returns {string|null} retourne le gagnant ou null
	 */
	checkForWinner(line, column, grid, currentPlayer) {
		const checkLine = this.checkForLine(line, grid, currentPlayer);
		const checkColumn = this.checkForColumn(column, grid, currentPlayer);
		const checkDiagonal = this.checkForDiagonal(line, column, grid, currentPlayer);
		if (checkLine || checkColumn || checkDiagonal) {
			return currentPlayer;
		}
		return null;
	}

	/**
	 * Permet de vérifier si la ligne sur lequel le jeton a été placé comporte un gagnant
	 * @param {number} line correspond a la ligne du jeton
	 * @param {object} grid grille du jeu
	 * @param {string} currentPlayer X ou O en fonction du joueur
	 * @returns {boolean} si le joueur a gagné ou non
	 */
	checkForLine(line, grid, currentPlayer) {
		const { [line] : tCurrentLine } = grid;
		return this.hasWon(tCurrentLine, currentPlayer);
	}

	/**
	 * Permet de vérifier si la colonne sur lequel le jeton a été placé comporte un gagnant
	 * @param {number} column correspond a la colonne du jeton
	 * @param {object} grid grille du jeu
	 * @param {string} currentPlayer X ou O en fonction du joueur
	 * @returns {boolean} si le joueur a gagné ou non
	 */
	checkForColumn(column, grid, currentPlayer) {
		const tCurrentColumn = [];
		Object.keys(grid).forEach(line => tCurrentColumn.push(grid[line][column]));
		return this.hasWon(tCurrentColumn, currentPlayer);
	}

	/**
	 * Permet de vérifier si les diagonales sur lequel le jeton a été placé comporte un gagnant
	 * @param {number} line correspond a la ligne du jeton
	 * @param {number} column correspond a la colonne du jeton
	 * @param {object} grid grille du jeu
	 * @param {string} currentPlayer X ou O en fonction du joueur
	 * @returns {boolean} si le joueur a gagné ou non
	 */
	checkForDiagonal(line, column, grid, currentPlayer) {
		const checkLeftToRight = this.checkForDiagonalLeftToRight(line, column, grid, currentPlayer);
		const checkRightToLeft = this.checkForDiagonalRightToLeft(line, column, grid, currentPlayer);
		if (checkLeftToRight || checkRightToLeft) {
			return true;
		}
		return false;
	}

	/**
	 * Permet de vérifier si la diagonale partant du bas gauche et allant en haut a droite comporte un gagnant
	 * @param {number} line correspond a la ligne du jeton
	 * @param {number} column correspond a la colonne du jeton
	 * @param {object} grid grille du jeu
	 * @param {string} currentPlayer X ou O en fonction du joueur
	 * @returns {boolean} si le joueur a gagné ou non
	 */
	checkForDiagonalLeftToRight(line, column, grid, currentPlayer) {
		const tDiagonal = [];
		let tmpLine = line;
		let tmpColumn = column;
		let hasWon = false;
		// On récupére la ligne et la colonne du debut de la diagonale
		while (tmpLine > 0 && tmpColumn > 0) {
			tmpLine--;
			tmpColumn--;
		}
		// On itére sur le cellule de la diagonale et on ajoute au tDiagonal les jetons
		while (tmpLine < this.nbRow && tmpColumn < this.nbColumn) {
			const { [tmpLine]: currentLine } = grid;
			tDiagonal.push(currentLine[tmpColumn]);
			tmpLine++;
			tmpColumn++;
		}
		if (tDiagonal.length > 3) {
			hasWon = this.hasWon(tDiagonal, currentPlayer);
		}
		return hasWon;
	}

	/**
	 * Permet de vérifier si la diagonale partant du bas droite et allant en haut a gauche comporte un gagnant
	 * @param {number} line correspond a la ligne du jeton
	 * @param {number} column correspond a la colonne du jeton
	 * @param {object} grid grille du jeu
	 * @param {string} currentPlayer X ou O en fonction du joueur
	 * @returns {boolean} si le joueur a gagné ou non
	 */
	checkForDiagonalRightToLeft(line, column, grid, currentPlayer) {
		const tDiagonal = [];
		let tmpLine = line;
		let tmpColumn = column;
		let hasWon = false;
		// On récupére la ligne et la colonne du debut de la diagonale
		while (tmpLine > 0 && tmpColumn < this.nbColumn - 1) {
			tmpLine--;
			tmpColumn++;
		}
		while (tmpLine < this.nbRow && tmpColumn >= 0) {
			const { [tmpLine]: currentLine } = grid;
			tDiagonal.push(currentLine[tmpColumn]);
			tmpLine++;
			tmpColumn--;
		}
		// On itére sur le cellule de la diagonale et on ajoute au tDiagonal les jetons
		if (tDiagonal.length > 3) {
			hasWon = this.hasWon(tDiagonal, currentPlayer);
		}
		return hasWon;
	}

	/**
	 * Retourne true si la partie a été gagné par le currentPlayer ou false
	 * @param {array} tDatasGrid tableau représentant une ligne, une colonne ou une diagonale ex pour une ligne: ['X','0','_','_','0','X','X']
	 * @param {string} currentPlayer X ou O en fonction du joueur
	 * @returns {boolean} si tDatasGrid contient un gagnant ou non
	 */
	hasWon(tDatasGrid, currentPlayer) {
		const strDatas = tDatasGrid.join('');
		const regex = new RegExp(`[${currentPlayer}]{4}`, 'g');
		const hasWon = strDatas.match(regex);
		if (hasWon) return true;
		return false;
	}

	/**
	 * Permet de switcher de joueur courant. Lorsque le jour 'X' a joué, le joueur courant devient le jour 'O'
	 * @param {string} currentPlayer X ou O en fonction du joueur
	 * @returns {string} si X est passé en currentPlayer alors O sera retourné et inversement
	 */
	changePlayer(currentPlayer) {
		if (currentPlayer === 'X') {
			return 'O';
		}
		return 'X';
	}

	createCell(i) {
		const { [i]: tCurrentLine } = this.state.grid;
		const tCells = [];
		for (let j = 0; j < this.nbColumn; j++) {
			let background = '';
			if (tCurrentLine[j] !== '_') {
				if (tCurrentLine[j] === 'X') background = 'backgroundYellow';
				else background = 'backgroundRed';
			}
			const cell = (
				<td key={`${i}-${j}`} name={`${i}-${j}`} onClick={() => this.onAddToken(j)} onMouseMove={() => this.onHover(j)} style={{ height: this.widthCell, width: this.widthCell }}>
					<div name={`${i}-${j}`} id={`${i}-${j}`} className={`cell ${background}`} />
				</td>
			);
			tCells.push(cell);
		}
		return tCells;
	}

	createRow() {
		const tRows = [];
		for (let i = this.nbRow - 1; i >= 0; i--) {
			const row = (
				<tr key={i}>
					{this.createCell(i)}
				</tr>
			);
			tRows.push(row);
		}
		return tRows;
	}

	render() {
		const { hasWon, currentPlayer } = this.state;
		return (
			<div className="App">
				<header className="App-header">
					<div className="XAnime" />
					<div id="rowChoice">
						{
							[...Array(this.nbColumn)].map((elt, j) => (
								<div key={`${j}_rowChoice`} className="no-border flex-justify-center" style={{ height: this.widthCell, width: this.widthCell }}>
									<div id={`${j}_rowChoice`} />
								</div>
							))
						}
					</div>
					<table>
						<tbody>
							{this.createRow()}
						</tbody>
					</table>
					{
						hasWon
							? <h1>Le joueur {hasWon === 'X' ? 'jaune' : 'rouge'} a gagné</h1>
							: <h1>C'est au joueur {currentPlayer === 'X' ? 'jaune' : 'rouge'}</h1>
					}
				</header>
			</div>
		);
	}
}

export default App;
