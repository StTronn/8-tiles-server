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
    return _.size(this.users) == 2;
  }

  addUser({ username, id }) {
    if (_.keys(this.users).length === 2) return;
    let userObj = {
      id,
      username,
      could_be_won: true,
      time: 0,
      solving: false,
      won: false,
    };
    userObj = { ...userObj, ...this.initialBoard };
    this.users[id] = userObj;
  }

  updateUser(socket, io, id, payload) {
    this.users[id] = { ...this.users[id], ...payload };
    if (this.canEmit() || this.start) {
      const users = _.values(this.users);
      if (!this.start) {
        //update user board
        users.map((obj) => {
          obj = { ...obj, ...this.intialBoard };
        });
        this.start = true;
        const gameObj = JSON.parse(JSON.stringify(this));
        io.to(this.id).emit("initGame", gameObj);
        console.log("emitgame");
        return;
      }

      socket.broadcast.to(this.id).emit("updateObj", this);
      //calculate global state
      if (users.some((obj) => obj.won)) {
        io.to(this.id).emit("gameOver");
      }
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
