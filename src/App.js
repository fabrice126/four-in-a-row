import React from 'react';
import './App.css';

class App extends React.Component {
	constructor() {
		super();
		this.nbRow = 6;
		this.nbColumn = 7;
		this.nbRound = 0;
		this.widthCell = 60;
		this.currentElt = null;
		const initState = {};
		this.currentPlayer = 'X';
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

	onHover(e) {
		const { currentPlayer } = this.state;
		if (this.currentElt !== null) {
			this.currentElt.classList.remove(currentPlayer);
		}
		const name = e.target.getAttribute('name');
		if (!name) return;
		const columnOver = name.split('-')[1];
		this.currentElt = document.querySelector(`#rowChoice th:nth-child(${Number(columnOver) + 1}) div`);
		this.currentElt.classList.add(currentPlayer);
	}

	/**
	 * Permet d'ajouter un jeton a la grille
	 * @param {number} j correspond a la colonne du jeton
	 */
	onAddToken(j) {
		const { grid, currentPlayer } = this.state;
		let { hasWon } = this.state;
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
		const { [i] : tCurrentLine } = grid;
		tCurrentLine[j] = currentPlayer;
		this.nbRound++;
		this.currentElt.classList.remove(currentPlayer);
		// A partir du 8ème tour un joueur peut avoir placé assez de jeton pour gagner
		if (this.nbRound >= 7) {
			const winner = this.checkForWinner(i, j, grid, currentPlayer);
			if (winner) {
				hasWon = winner;
			}
		}
		const newCurrentPlayer = this.changePlayer(currentPlayer);
		this.setState({
			grid : {
				...grid,
				[i] : tCurrentLine,
			},
			currentPlayer : newCurrentPlayer,
			hasWon,
		});
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
		if (checkLine || checkColumn) {
			return currentPlayer;
		}
		return null;
	}

	/**
	 *
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
	 *
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
				<td key={`${i}-${j}`} name={`${i}-${j}`} onClick={() => this.onAddToken(j)} onMouseOver={this.onHover} style={{ height: this.widthCell, width: this.widthCell }}>
					<div name={`${i}-${j}`} className={`cell ${background}`} />
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
		const { hasWon } = this.state;
		return (
			<div className="App">
				<header className="App-header">
					<table>
						<thead>
							<tr id="rowChoice">
								<th className="no-border" style={{ height: this.widthCell, width: this.widthCell }}><div /></th>
								<th className="no-border" style={{ height: this.widthCell, width: this.widthCell }}><div /></th>
								<th className="no-border" style={{ height: this.widthCell, width: this.widthCell }}><div /></th>
								<th className="no-border" style={{ height: this.widthCell, width: this.widthCell }}><div /></th>
								<th className="no-border" style={{ height: this.widthCell, width: this.widthCell }}><div /></th>
								<th className="no-border" style={{ height: this.widthCell, width: this.widthCell }}><div /></th>
								<th className="no-border" style={{ height: this.widthCell, width: this.widthCell }}><div /></th>
							</tr>
						</thead>
						<tbody>
							{this.createRow()}
						</tbody>
					</table>
					{
						hasWon
							? <h1>Le joueur {hasWon === 'X' ? 'jaune' : 'rouge'} a gagné</h1>
							: <h1>Aucun gagant</h1>
					}
				</header>
			</div>
		);
	}
}

export default App;
