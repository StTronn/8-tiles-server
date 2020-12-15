import _ from "lodash";
import { getGridObj } from "./shuffle";

export default class Room {
  initialBoard = {};

  constructor(id) {
    this.id = id;
    this.users = {};
    this.start = false;
    this.initialBoard = getGridObj();
    this.gameOver = false;
    this.won = false;
    this.gameWinner = "";
  }

  canEmit() {
    return (
      _.size(this.users) == 2 &&
      _.values(this.users).every(({ ready }) => ready)
    );
  }

  addUser({ id }) {
    if (_.keys(this.users).length === 2) return;
    let userObj = {
      id,
      could_be_won: true,
      time: 0,
      solving: false,
      won: false,
    };
    userObj = { ...userObj, ...this.initialBoard };
    console.log(userObj);
    this.users[id] = userObj;
  }

  cleanUp (io){
    this.users = {};
    this.start = false;
    this.initialBoard = getGridObj();
    this.gameOver = false;
    this.won = false;
    io.to(this.id).emit("gameOver");

  }

  updateUser(socket, io, id, payload) {
    this.users[id] = { ...this.users[id], ...payload };
    if (this.canEmit() || this.start) {
      const users = _.values(this.users);
      if (!this.start) {
        //update user board
        this.start = true;
        console.log(users);
        const gameObj = JSON.parse(JSON.stringify(this));
        io.to(this.id).emit("initGame", gameObj);
        console.log("initGame");
        return;
      }

      socket.broadcast.to(this.id).emit("updateObj", this);
      
      // if initgame has happened make sure that 
      //calculate global state
      if (users.some((obj) => obj.won)) {
        this.cleanUp(io);
      }
      // if users left the game update state and call gameOver
      
      //send update through socket
      //calculate gameOver and winner
      //what if one user left the game
    }
  }

  

  deleteUser(id) {
    if (_.has(this.users, id)) {
      this.users = _.omit(this.users, id);
      this.start = false;
    }
  }

  isGameOver() {
    return false;
  }
}
