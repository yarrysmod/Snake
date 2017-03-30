var Snake = function Snake () {
  this.$canvas = document.getElementsByTagName('canvas')[0];
  this.bounds = [this.$canvas.width, this.$canvas.height];
  this.coordinates = [0, 0];
  this.blockSize = [40, 40];
  this.snakeSize = [25, 25];
  this.moveDelay = 500;
  this.snakeLength = 1;
  this.snakeColor = '#3bf';
  this.snakePoleColor = '#f3b';
  this.lastTurnPoints = [];

  this.drawSnake();
};

Snake.prototype.directionMappings = {
  LEFT: [65, 97], // a A
  UP: [87, 119], // w W
  RIGHT: [68, 100], // d D
  DOWN: [83, 115] // s S
};
Snake.prototype.directions = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
}
Snake.prototype.verticalDirections = [
  Snake.prototype.directions.UP,
  Snake.prototype.directions.DOWN
];
Snake.prototype.horizontalDirections = [
    Snake.prototype.directions.LEFT,
    Snake.prototype.directions.RIGHT
];

Snake.prototype.operations = {
  DECREASE: 43,
  INCREASE: 45
};
Snake.prototype.speedOperations = [
  Snake.prototype.operations.DECREASE,
  Snake.prototype.operations.INCREASE
];

Snake.prototype.tryDirectionMap = function tryDirectionMap (keyCode) {
  var directionMappings = this.directionMappings;
  var directions = this.directions;

  Object.keys(directionMappings).some(function processMappingKey (mappingKey) {
    if (directionMappings[mappingKey].indexOf(keyCode) !== -1) {
      keyCode = directions[mappingKey];

      return true;
    }
  });

  return keyCode;
};

Snake.prototype.moveSnake = function moveSnake (direction, ignoreCheck) {
  if (!direction) {
    return;
  }

  var bounds = this.bounds;
  var blockSize = this.blockSize;
  var isDirectionNew = this.lastDirection !== direction;
  var newCoordinates = this.getNewCoordinates(direction, ignoreCheck, null);

  if (
      newCoordinates[0] >= 0 && newCoordinates[0] <= (bounds[0] - blockSize[0]) &&
      newCoordinates[1] >= 0 && newCoordinates[1] <= (bounds[1] - blockSize[1])
  ) {
    if (isDirectionNew) {
      this.lastDirection = direction;
      this.lastTurnPoints.push({
        coordinates: this.coordinates,
        direction: direction
      })
    }

    this.coordinates = newCoordinates;

    this.drawSnake();
    this.setIntervalDirection(direction);
  } else {
    clearInterval(this.moveInterval);
  }
};

Snake.prototype.getNewCoordinates = function getNewCoordinates (direction, ignoreCheck, lastCoordinates) {
  var coordinates = lastCoordinates || this.coordinates;
  var blockSize = this.blockSize;
  var newCoordinates;

  if (this.horizontalDirections.contains(direction)) {
    if (!ignoreCheck && this.horizontalDirections.contains(this.lastDirection)) {
      return;
    }

    newCoordinates = [
      coordinates[0] + (direction === this.directions.LEFT ? -blockSize[0] : blockSize[0]),
      coordinates[1]
    ];
  } else {
    if (!ignoreCheck && this.verticalDirections.contains(this.lastDirection)) {
      return;
    }

    newCoordinates = [
      coordinates[0],
      coordinates[1] + (direction === this.directions.UP ? -blockSize[1] : blockSize[1])
    ];
  }

  return newCoordinates;
};

Snake.prototype.drawSnake = function drawSnake () {
  var self = this;
  var directions = self.directions;
  var lastDirection = this.lastDirection;
  var lastTurnPoints = this.lastTurnPoints;
  var lastCoordinates = null;

  this.clearCanvas();

  this.drawSnakeSegment(this.getSnakeSegmentProperties(lastDirection, this.coordinates), this.snakePoleColor);

  if (lastTurnPoints.length) {
    return function renderLastTurns (lastTurnIndex, additionalDirection) {
      var turnPoint = lastTurnPoints[lastTurnIndex];
      var turnPointDirection = turnPoint.direction;
      var turnPointCoordinates = turnPoint.coordinates;
      var drawDirection;

      if (self.horizontalDirections.contains(turnPointDirection)) {
        drawDirection = turnPointDirection === directions.LEFT ? directions.RIGHT : directions.LEFT;
      } else {
        drawDirection = turnPointDirection === directions.UP ? directions.DOWN : directions.UP;
      }

      lastCoordinates = self.getNewCoordinates(drawDirection, true, lastCoordinates);

      if (lastCoordinates[0] === turnPointCoordinates[0] && lastCoordinates[1] === turnPointCoordinates[1]) {
        lastTurnIndex--;
        additionalDirection = lastTurnPoints[lastTurnIndex] && lastTurnPoints[lastTurnIndex].direction;
      } else {
        additionalDirection = null;
      }

      self.drawSnakeSegment(self.getSnakeSegmentProperties(turnPointDirection, lastCoordinates));

      if (lastTurnIndex >= 0) {
        if (additionalDirection) {
          self.drawSnakeSegment(self.getSnakeSegmentProperties(additionalDirection, lastCoordinates));
        }

        return renderLastTurns(lastTurnIndex);
      }
    }(lastTurnPoints.length - 1, lastDirection);
  }
};

Snake.prototype.getSnakeSegmentProperties = function getSnakeSegmentProperties (direction, coordinates) {
  var xSnakeOffset = this.blockSize[0] - this.snakeSize[0];
  var ySnakeOffset = this.blockSize[1] - this.snakeSize[1];
  var xPositionOffset = xSnakeOffset;
  var yPositionOffset = ySnakeOffset;

  return [
    coordinates[0] + (this.horizontalDirections.contains(direction) ? 0 : xPositionOffset),
    coordinates[1] + (this.verticalDirections.contains(direction) ? 0 : yPositionOffset),
    this.snakeSize[0] + (this.horizontalDirections.contains(direction) ? xSnakeOffset : -xSnakeOffset),
    this.snakeSize[1] + (this.verticalDirections.contains(direction) ? ySnakeOffset : -ySnakeOffset)
  ];
};

Snake.prototype.drawSnakeSegment = function drawSnakeSegment (snakeSegmentProperties, snakeColor) {
  snakeColor = snakeColor || this.snakeColor;

  var snakeSegment = this.$canvas.getContext('2d');

  snakeSegment.beginPath();
  snakeSegment.rect.apply(snakeSegment, snakeSegmentProperties);
  snakeSegment.fillStyle = snakeColor;
  snakeSegment.fill();
  snakeSegment.closePath();
};

Snake.prototype.clearCanvas = function clearCanvas () {
  this.$canvas.width = this.$canvas.width;
};

Snake.prototype.setIntervalDirection = function setIntervalDirection (direction) {
  clearInterval(this.moveInterval);

  this.moveInterval = setInterval(this.moveSnake.bind(this, direction, true), this.moveDelay);
};

Snake.prototype.changeIntervalSpeed = function changeIntervalSpeed (operation) {
  var newDelay;

  newDelay = this.moveDelay + (operation === this.operations.INCREASE ? 125: -125);

  if (newDelay >= 100) {
    this.moveDelay = newDelay;
  }

  if (this.lastDirection) {
    this.setIntervalDirection(this.lastDirection);
  }
};

Array.prototype.contains = function arrayContainsFunction (element) {
  return this.indexOf(element) !== -1;
};
