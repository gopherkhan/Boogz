// boogz.js
window.Boogz = (function Boogz() {
	var doc;
	var boogId = -1;
	var CELL_DIFF = 100;


	/* el hoa */
	function Booger(row, col, type) {
		var el = doc.createDocumentFragment();
		var boog = doc.createElement('div');
		var callback, animationClass;
		var DIRECTIONS = {
			UP: "up",
			DOWN: "down",
			RIGHT: "right",
			LEFT: "left",
			X2: "2x"
		}

		boog.classList.add('booger');
		if (type) {
			boog.classList.add(type);
		}

		boog.dataset.id = boogId++;
		updateCSSPosition();

		function updateCSSPosition() {
			var cssPosition = calcStylePosition(row, col);
			boog.style.left = cssPosition[1] + "px";
			boog.style.top = cssPosition[0] + "px";
		}



		function animationEndHandler() {
			if (callback) {
				callback();
				callback = null;
			}
			if (animationClass) {
				boog.classList.toggle(animationClass);
			}
			animationClass = null;
		}

		['animationend',
			'webkitAnimationEnd',
			'oanimationend',
			'MSAnimationEnd'].forEach(function(eventName) {
					boog.addEventListener(eventName, animationEndHandler);
		});

		el.appendChild(boog);

		function render() {
			return el;
		}

		function getPosition() {
			return { row: row, col:  col};
		}

		function calcStylePosition(row, col) {
			return [row * CELL_DIFF, col * CELL_DIFF];
		}

		function move(destination, onComplete) {
			animationClass = getAnimationClass(destination);
			console.log("TTT this is our moveClass: " + animationClass);
			callback = function() {
				row = destination.row;
				col = destination.col;
				onComplete();
				updateCSSPosition();
			}
			boog.classList.toggle(animationClass);

		}
		function select() {
			// This will move to delegation later
			boog.classList.toggle('selected');
		}

		function clone() {
			return new Booger(row, col, type);
		}

		function getId() {
			return boog.dataset.id;
		}

		function getType() {
			return type;
		}

		function getAnimationClass(dest) {
			var directions = [];
			if (row != dest.row) {
				if (row < dest.row) {
					directions.push(DIRECTIONS.DOWN);
				} else {
					directions.push(DIRECTIONS.UP);
				}
			}

			if (col != dest.col) {
				if (col < dest.col) {
					directions.push(DIRECTIONS.RIGHT);
				} else {
					directions.push(DIRECTIONS.LEFT);
				}
			}
			if (directions.length) {
				directions.unshift("move")
				if (Math.max(Math.abs(col - dest.col), Math.abs(row - dest.row)) > 1) {
					directions.push(DIRECTIONS.X2);
				}
			}
			return directions.join("-");
		}


		return {
			render: render,
			move: move,
			select: select,
			getPosition: getPosition,
			getId: getId,
			getType: getType,
			clone: clone
		}
	}

	function Board() {
		var height = 9, width = 9;
		var selected;

		var grid = new Array(height);

		for (var rowIdx = 0; rowIdx < grid.length; ++rowIdx) {
			grid[rowIdx] = new Array(width);
		}
		var red = 'red', green = 'green';
		var boogs = [];


		// convoluted, I know.
		// I'm going to clean this up
		grid[0][0] = grid[0][1] = green; // top-left corner
		grid[height - 1][width - 1] = grid[height - 1][width - 2] = green; // bottom-right corner

		grid[0][width - 1] = grid[0][width - 2] = red; // top-right corner
		grid[height - 1][0] = grid[height - 1][1] = red; // bottom-left corner

		var aBoogie;
		var boogies = {};
		for (var row = 0; row < height; ++row) {
			for  (var col = 0; col < width; ++col) {
				if (grid[row][col]) {
					addBooger(row, col, grid[row][col]);
				}
			}
		}

		function addBooger(row, col, type) {
			var aBoogie = new Booger(row, col, type);
			return manuallyAddBooger(aBoogie, row, col);
		}

		function manuallyAddBooger(toAdd, row, col) {
			boogs.push(toAdd);
			// replace  color with booger
			grid[row][col] = toAdd;
			boogies[toAdd.getId()] = toAdd;
			return toAdd;
		}

		var el = doc.createDocumentFragment();
		var board = doc.createElement('div');
		var tileStr = '';
		for (var tIdx = 0; tIdx < width * height; ++tIdx) {
			tileStr += "<div class='tile' data-tile='" + tIdx + "'></div>";
		}
		board.innerHTML = tileStr;
		board.classList.add("board");
		el.appendChild(board);

		board.addEventListener('click', handleClick, false);

		function canMove(tileIdx) {
			var selectedPos = selected.getPosition();
			var pos = getTilePosition(tileIdx);
			// if the piece is not within the moveable area...
			if (Math.abs(selectedPos.row - pos.row) > 2 || Math.abs(selectedPos.col - pos.col) > 2) {
				return false;
			}
			// if there's already something in that spot...
			if (grid[pos.row][pos.col]) {
				return false;
			}
			// everything looks good
			return true;
		}

		function moveIsSplit(source, dest) {
			return (Math.max(Math.abs(source.col - dest.col), Math.abs(source.row - dest.row)) == 1);
		}


		function handleClick(e) {
			if (e.target) {
				// if we currently have a selection
				if (e.target.classList.contains('tile') && selected) {
					if (!canMove(e.target.dataset.tile)) {
						return;
					}
					// Test logic at the moment.
					var dest = getTilePosition(e.target.dataset.tile);
					var isSplit = moveIsSplit(selected.getPosition(), dest);
					console.log("@@@ is this a split? " + isSplit);
					// var dirMag = getDirMag(selected.getPosition(), dest);
					// console.log("This is our dirMag: " + JSON.stringify(dirMag));
					// if (!dirMag.isSplit) {
					// 	console.log("moving this guy");
					// 	selected.move(dirMag, plopBoogie);
					// } else {
					// 	plopBoogie();
					// }
					if (isSplit) {
						var cloned = selected.clone();
						board.appendChild(cloned.render());
						cloned.move(dest, function() {
							console.log("ohhhh yeah");
							manuallyAddBooger(cloned, dest.row, dest.col);
						});
						selected.select();
						selected = null;
					} else {
						var oldPos = selected.getPosition();
						// shift the booger in the array
						var moving = selected;
						selected.move(dest, function() {
							grid[oldPos.row][oldPos.col] = null;
							grid[dest.row][dest.col] = moving;
						})
						selected.select();
						selected = null;

						// var freshboog = addBooger(dest.row, dest.col, selected.getType());
						// board.appendChild(freshboog.render());
						// selected.select();
						// selected = null;
					 }

				} else if (e.target.classList.contains('booger')) {
					var aBoogie = boogies[e.target.dataset.id];
					aBoogie.select();
					if (e.target.classList.contains('selected')) {
						selected = aBoogie;
					} else {
						selected = null;
					}

				}
			}
		}

		// function splitBooger(target, dest) {
		// 	var freshboog = addBooger(dest.row, dest.col, selected.getType());
		// 	board.appendChild(freshboog.render());
		// 	selected.select();
		// 	selected = null;

		// }

		function moveBooger(target, dest, magnitude, onComplete) {
			target.move()
		}

		function getTilePosition(tileIdx) {
			tileIdx = ~~tileIdx;
			return { row: Math.floor(tileIdx / 9), col: (tileIdx % 9)};
		}

		function render() {
			boogs.forEach(function(boog) {
				board.appendChild(boog.render());
				//console.log("@@@" + board.outerHTML);
			});

			return el;
		}

		return {
			render: render
		}
	}

	function Game(gameId) {
		var el = doc.getElementById(gameId);
		var board = new Board();

		function render() {
			el.appendChild(board.render());
		}

		return {
			render: render
		}
	}

	return {
		init: function(gameId, docSrc) {
			doc = docSrc;
			var game = new Game(gameId);
			game.render();

		}
	}
})();
