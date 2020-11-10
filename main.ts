// When the other micro: bit receives the signal that the ball was created
radio.onReceivedNumber(function (receivedNumber) {
    // Create the ball on other micro:bit display
    ball = game.createSprite(receivedNumber, 0)
    // Turn the direction of the ball to a random one chosen from array
    ball.turn(Direction.Right, dir_array[randint(1, 3)])
    // The ball exists on the og micro:bit
    ball_val_local = true
    // Set the speed of the ball to 
    // Round the number
    // Convert the strength of packet to a number between 1 and 3
    speed_sel = Math.trunc(Math.map(Math.abs(radio.receivedPacket(RadioPacketProperty.SignalStrength)), 42, 128, 0, 3))
    // Depending on the numbers 1 though 3 select a speed for the ball
    if (speed_sel == 0) {
        speed = 750
    } else if (speed_sel == 1) {
        speed = 1000
    } else {
        speed = 1500
    }
    radio.setTransmitPower(7)
    // Send a signal to other micro:bit that ball exists
    radio.sendValue("ball_val", 1)
})
// The users will move the sprite paddle left by one
input.onButtonPressed(Button.A, function () {
    if (pad_x != 0) {
        pad.change(LedSpriteProperty.X, -1)
        pad_x += -1
    }
})
// Buttons A+B start the game by creating a ping pong ball sprite to play with
input.onButtonPressed(Button.AB, function () {
    // If the sprite doesn't already exist
    if (!(ball_val_local) && !(ball_val_dist)) {
        // Create a ball sprite at a random location
        ball = game.createSprite(randint(0, 4), randint(0, 3))
        // Send the ball in a random direction
        ball.turn(Direction.Right, dir_array[randint(0, 7)])
        // Says the ball sprite is real on the og micro:bit
        ball_val_local = true
        // Set the radio transmitter power to 7
        radio.setTransmitPower(7)
        // Send the fact the ball is real to the other micro:bit
        radio.sendValue("ball_val", 1)
    }
})
// Button B moves the paddle sprite right by one
input.onButtonPressed(Button.B, function () {
    if (pad_x != 4) {
        pad.change(LedSpriteProperty.X, 1)
        pad_x += 1
    }
})
// When a name value is sent to another micro:bit
radio.onReceivedValue(function (name, value) {
    // Depending on if the name is equal to the ball existing or the ball having gone over the display
    if (name == "ball_val") {
        // If the ball exists, then it exists on the micro:bit and doesn't on the other
        if (value == 1) {
            ball_val_dist = true
        } else {
            ball_val_dist = false
        }
    } else if (name == "gover") {
        // If ball has gone off display, the game is over
        if (value == 1) {
            game.gameOver()
        }
    }
})
// When the program is started
let speed_sel = 0
let ball: game.LedSprite = null
let pad_x = 0
let pad: game.LedSprite = null
let dir_array: number[] = []
let ball_val_dist = false
let ball_val_local = false
let speed = 0
// Create an ID for the micro:bits to play this game
radio.setGroup(50)
// Start the game
radio.sendString("START")
// The game hasn't started yet
radio.setTransmitSerialNumber(false)
// Set the lives to 1
game.setLife(1)
// Set the score to 0 in the beginning
game.setScore(0)
speed = 1000
// The ball doesn't exist yet
ball_val_local = false
ball_val_dist = false
// An array of angle values for the directions for the ball sprite to be sent in
dir_array = [0, 45, 90, 135, 180, 225, 270, 315]
// The starting point for the paddle sprites
pad = game.createSprite(2, 4)
// The x value of the paddle sprite is 2
pad_x = 2
basic.forever(function () {
    basic.pause(speed)
    // If the ball is on one person's micro:bit
    if (ball_val_local) {
        // Move the ball sprite by 1 led
        ball.move(1)
        // If the ball's y value is 4, if it's 0 or if it's anywhere else on board
        if (ball.get(LedSpriteProperty.Y) == 4) {
            // If the ball's y value is 4 and is not touching the paddle or if it is
            if (!(ball.isTouching(pad))) {
                // Pause the micro:bit
                basic.pause(speed)
                // Send a signal to the other micro:bit
                radio.setTransmitPower(7)
                // Tell it the game is over
                radio.sendValue("gover", 1)
                // Delete the ball sprite
                ball.delete()
                // Remove the life
                game.removeLife(1)
            } else {
                // If the ball is touching the paddle add to score
                game.addScore(1)
                // If the ball is touching the edge of the display, bounce
                ball.ifOnEdgeBounce()
            }
        } else if (ball.get(LedSpriteProperty.Y) == 0) {
            // If the balls' y value is 0, pause
            basic.pause(speed)
            // Delete the ball sprite
            ball.delete()
            // Tell micro: bit the sprite is no longer on the display
            ball_val_local = false
            // Send that fact to the other micro:bit
            radio.sendValue("ball_val", 0)
            // Choose random transmission power 
            radio.setTransmitPower(randint(0, 7))
            // Send the x value of the sprite to other micro:bit
            radio.sendNumber(ball.get(LedSpriteProperty.X))
        } else {
            // If ball is touching edge of display
            if (ball.isTouchingEdge()) {
                // And the balls' x value is either 4 or 0
                if (ball.get(LedSpriteProperty.X) == 4) {
                    // If the ball's x value is 4, then turn it right by a random value on the direction array
                    ball.turn(Direction.Right, dir_array[randint(3, 5)])
                } else if (ball.get(LedSpriteProperty.X) == 0) {
                    // If the ball's x value is 0, then turn it left by a random value on the direction array
                    ball.turn(Direction.Left, dir_array[randint(3, 5)])
                }
            }
        }
    }
})
