Bubble machine controller.

Uses NodeJS and socket.io to communicate to a server that will request it to emit bubbles.

Whilst emitting bubbles, it sets it's the state to busy and tells the server it's busy. 
When done, it tells the server it's done.

Main issues
* Stepper motor is very glitchy - needs more testing on breadboard
* Bubbles don't blow very far - need to add perforations around the bubble holes (wool, pipe cleaner, etc)
* Not currently connected to a real server - just running in test mode with testServer.js
* need to run index.js as root (bad rpi-gpio code monkeys..)