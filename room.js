import _ from "lodash";

export default class Room {
  constructor(id) {
    this.id = id;
    this.intialBoard = {};
    this.users = {};
    this.start = false;
    this.gameOver = false;
  }

  addUser({ username, id }) {
    if (Object.keys(this.users).length === 2) return;
    const userObj = {
      id,
      username,
      grid: this.intialBoard,
      could_be_won: false,
      time: 0,
      solving: false,
    };
    this.users[id] = userObj;
  }

  deleteUser(id) {
    if (_.has(this.users, id)) {
      this.users = _.omit(this.users, id);
    }
  }

  updateUser({ userObj }) {
    this.users = { ...this.users, ...{ [userObj.id]: userObj } };
  }

  isGameOver() {
    return false;
  }
}
