Bubble machine controller.

Uses NodeJS and socket.io to communicate to a server that will request it to emit bubbles.

Whilst emitting bubbles, it sets it's the state to busy and tells the server it's busy. 
When done, it tells the server it's done.