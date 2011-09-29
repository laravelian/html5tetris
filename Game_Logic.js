
/**
* @returns {[Number]} the line numbers of all the completed rows
*/ 
Game.prototype.getRows = function () {
    var i,
    rows = [],
    res = [],
    curRow;

    // initialize the rows to 0
    for (i = 0; i < 20; i++) {
	rows[i] = 0;
    }
    // for each block
    for (i = 0; i < this.blocks.length; i++) {
	// increment the appropriate row
	curRow = this.blocks[i].getY();
	rows[curRow] += 1;
	// if the row is full
	if (rows[curRow] === 10) {
	    res.push(curRow);
	}
    }

    return res;
}

/**
* Removes the rows and applies them to the score and row count
*/
Game.prototype.removeRows = function (rows) {
    var dropDist = [],
    i, j,
    remove = {},
    curBlock,
    curY;

    // initialize drops to 0
    for (i = 0; i < 20; i++) {
	dropDist[i] = 0;
    }

    // for each removed row
    for (i = 0; i < rows.length; i++) {
	remove[rows[i]] = true;
	
	// every row above this should be dropped another spot
	for (j = 0; j < rows[i]; j++) {
	    dropDist[j]++;
	}
    }

    // for each block
    for (i = 0; i < this.blocks.length; i++) {
	curBlock = this.blocks[i];
	curY = curBlock.getY();

	// if it is being removed
	if (remove[curY]) {
	    // remove the block
	    this.removeBlock(i);
	    i -= 1;
	} else {
	    // it is being dropped
	    curBlock.setPosition(curBlock.getX(), curBlock.getY() + dropDist[curY]);
	}
    }

    // apply the score
    this.scoreTracker.updateScore({lines: rows.length});
}

Game.prototype.removeBlock = function(index) {
    return this.blocks.splice(index, 1);
}

Game.prototype.applyGravity = function (dTime) {
    this.timeToNextDrop -= dTime;

    // drop until there is a positive time until the next drop time is positive, or the control group s bottomed out
    while (this.timeToNextDrop < 0 && (!this.controlGroup.isBottomed())) {
	this.dropBlock(true);
	this.timeToNextDrop += this.dropPeriod;
    }

    // if it exited through bottoming, reset the drop period
    if (this.controlGroup.isBottomed()) {
	this.timeToNextDrop = this.dropPeriod;
    }
};

/**
* Changes the shapes of the preview along the side
* @param {[Char]} queue - the queue of pieces
*/
Game.prototype.updatePreviews = function(queue) {
    var i;
    for (i = 0; i < queue.length; i++) {
	this.previewGroups[i].setShape(queue[i]);
    }
}

/**
* called when the user attempts to swap a block
*/
Game.prototype.swap = function() {
    var i, j,
    newShape,
    oldShape = this.controlGroup.getShape(),
    oldBlocks = this.controlGroup.getBlocks(),
    newBlocks = [],
    thisObject = this;

    // can only be called once per drop
    if (!this.swapAllowed) {
	return;
    }
    this.swapAllowed = false;

    // remove the blocks
    // for each block on the field
    for (i = 0; i < this.blocks.length; i++) {
	// if the block is part of the control group, remove it
	for (j = 0; j < 4; j++) {
	    if (oldBlocks[j] === this.blocks[i]) {
		this.removeBlock(i);
		i -= 1;
	    }
	}
    }
    
    // if there is a block waiting
    if (this.swapGroup) {
	newShape = this.swapGroup.getShape();
	for (i = 0; i < 4; i++) {
	    newBlocks.push(new Block({x:-1, y:-1, shape: newShape}));
	    this.blocks.push(newBlocks[i]);
	}
	
	this.controlGroup = new ControlGroup(newBlocks, newShape, function(x, y){
	    return thisObject.isLegalPosition(x, y);
	});

	this.swapGroup.setShape(oldShape);

	return;
    }

    // if there is no block waiting
    this.swapGroup = new PreviewGroup(-80, 100);
    this.swapGroup.setShape(oldShape);
    this.newBlock(true);    

}