//boogz.js
window.Boogz = (function Boogz() {
	var doc;

/* el hoa */	
	function Booger(rowPos, colPos, type) {
		var position = [rowPos,colPos];
		var el = doc.createDocumentFragment();
		var boog = doc.createElement('div');
		
		boog.classList.add('booger');
		if (type) {
			boog.classList.add(type);
		}
		boog.style.left = colPos + "px";
		boog.style.top = rowPos + "px";
		boog.addEventListener('click', handleClick, false);

		el.appendChild(boog);

		function render() {
			return el;
		}

		function move() {

		}
		function handleClick(e) {
			// This will move to delegation later
			boog.classList.toggle('selected');
		}
		return {
			render: render,
			move: move
		}
	}

	function Board() {
		var height = 9, width = 9;

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

		for (var row = 0; row < height; ++row) {
			for  (var col = 0; col < width; ++col) {
				if (grid[row][col]) {
					var pos = calcPosition(row, col);
					boogs.push(new Booger(pos[0], pos[1], grid[row][col]));
					console.log("@@@ dropped a boogie");
				}
			}
		}

		var el = doc.createDocumentFragment();
		var board = doc.createElement('div');
		var tileStr = '';
		for (var tIdx = 0; tIdx < width * height; ++ tIdx) {
			tileStr += "<div class='tile'></div>";
		}
		board.innerHTML = tileStr;
		board.classList.add("board");
		el.appendChild(board);
		
		function calcPosition(row, col) {
			return [row * 100, col * 100];
		}
		

		function render() {
			boogs.forEach(function(boog) { 
				board.appendChild(boog.render());
				console.log("@@@" + board.outerHTML); 
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