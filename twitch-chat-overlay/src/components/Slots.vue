<template>
  <div id="main-slot-container" class="slots-container">
    <div class="slot-row">
      <div class="slot-column">{{gameObjects[0]}}</div>
      <div class="slot-column">{{gameObjects[1]}}</div>
      <div class="slot-column">{{gameObjects[2]}}</div>
      <div class="slot-column">{{gameObjects[3]}}</div>
      <div class="slot-column">{{gameObjects[4]}}</div>
      <div
        class="win-line blink-me"
        v-if="showWinningLine"
        v-bind:style="{ width: winningLineWidth + 'px' }"
      ></div>
    </div>
    <div>
      <button @click="startSpin()">Spin</button>
    </div>
  </div>
</template>

<script>
import client from "../tmiclient.js";
import { mapGetters } from "vuex";

export default {
  name: "slots",
  data() {
    return {
      gameObjects: ["😡", "😡", "😡", "😡", "😡"],
      weight1: [
        ["😡", 50, 0],
        ["🥶", 15, 1],
        ["🤢", 5, 4],
        ["🥵", 4, 5],
        ["🤩", 3, 10],
        ["🥳", 2, 20],
        ["🌟", 2, 60],
        ["💍", 1, 200],
      ],
      timer: 50,
      spinningAudio: null,
      winAudio: null,
      loseAudio: null,
      isSpinning: false,
      showWinningLine: true,
      winningLineWidth: 0,
      currentPlayer: null,
    };
  },
  computed: {
    ...mapGetters(["users", "messages", "slotQueue"]),
  },
  mounted() {
    this.spinningAudio = new Audio("slot-machine.wav");
    this.winAudio = new Audio("win.wav");
    this.loseAudio = new Audio("lose.wav");

    document.getElementById("main-slot-container").style.backgroundImage =
      "url('machine.png')";

    client.on("message", (channel, tags, message, self) => {
      let userId = tags["user-id"];

      if (self) return;
      // !slot 10
      var commands = message.split(" ");

      if (commands[0] == "!spin") {
        // Check if you are already on the queue
        let isInQueue = this.slotQueue.find((slot) => slot.userId === userId);
        if (isInQueue) {
          client.say(
            channel,
            `@${tags.username}, You are already in the queue to play slots`
          );
          return;
        }

        // Check if you have enough to gamble with
        let userInfo = this.users.find((user) => user.userId === userId);
        if (!userInfo) {
          return;
        }

        let hasEnoughPoints = userInfo.points >= parseInt(commands[1]);
        console.log(hasEnoughPoints);
        if (!hasEnoughPoints) {
          client.say(
            channel,
            `@${tags.username}, You do not have enough points to gamble, you currently only have ${userInfo.points}`
          );
          return;
        }

        if (commands[1]) {
          this.$store.commit("addToSlotQueue", {
            userId: tags["user-id"],
            username: tags["username"],
            amount: commands[1],
          });
          client.say(
            channel,
            `@${tags.username}, You have been added to the slot play group`
          );
        }
      }
    });

    this.checkForNextPlayer();
  },
  methods: {
    getRandomWeightedEmoji() {
      // First, we loop the main dataset to count up the total weight. We're starting the counter at one because the upper boundary of Math.random() is exclusive.
      let total = 1;
      for (let i = 0; i < this.weight1.length; ++i) {
        total += this.weight1[i][1];
      }

      // Total in hand, we can now pick a random value akin to our
      // random index from before.
      const threshold = Math.floor(Math.random() * total);

      // Now we just need to loop through the main data one more time
      // until we discover which value would live within this
      // particular threshold. We need to keep a running count of
      // weights as we go, so let's just reuse the "total" variable
      // since it was already declared.
      total = 0;
      for (let i = 0; i < this.weight1.length; ++i) {
        // Add the weight to our running total.
        total += this.weight1[i][1];

        // If this value falls within the threshold, we're done!
        if (total >= threshold) {
          return this.weight1[i][0];
        }
      }
    },
    checkForNextPlayer() {
      // Check if the slot is already running,
      if (
        !this.isSpinning &&
        this.slotQueue.length >= 1 &&
        this.spinningAudio.paused
      ) {
        this.currentPlayer = this.slotQueue[0];
        this.startSpin();
      }
      setTimeout(this.checkForNextPlayer, 5000);
    },
    playWinSound() {
      if (this.winAudio.paused) {
        this.winAudio.play();
      }

      let pointsToAward = parseInt(this.currentPlayer.amount) + 10;
      console.log("Points to award: " + pointsToAward);

      // Update the players points
      this.$store.commit("addPoints", {
        userId: this.currentPlayer.userId,
        points: pointsToAward,
      });

      this.$store.commit("removeFromQueuePos", 0);
      this.currentPlayer = null;
      this.spinning = false;
    },
    playLoseSound() {
      if (this.loseAudio.paused) {
        this.loseAudio.play();
      }

      this.$store.commit("removeFromQueuePos", 0);
      this.currentPlayer = null;
      this.isSpinning = false;
    },
    setWinState(lineWin, lineWidth) {
      this.winningLineWidth = lineWidth;
    },
    checkWin() {
      let ga = this.gameObjects;
      if (
        ga[0] === ga[1] &&
        ga[1] === ga[2] &&
        ga[2] === ga[3] &&
        ga[3] === ga[4]
      ) {
        this.setWinState(5, 330);
        this.playWinSound();
      } else if (ga[0] === ga[1] && ga[1] === ga[2] && ga[2] === ga[3]) {
        this.setWinState(4, 260);
        this.playWinSound();
      } else if (ga[0] === ga[1] && ga[1] === ga[2]) {
        this.setWinState(3, 190);
        this.playWinSound();
      } else if (ga[0] === ga[1]) {
        this.setWinState(2, 120);
        this.playWinSound();
      } else {
        this.setWinState(0, 0);
        this.playLoseSound();
      }
    },
    spin() {
      if (this.timer > 35) {
        this.timer--;
        setTimeout(this.spin, 105);
        return;
      }

      if (this.timer > 0) {
        this.$set(this.gameObjects, "0", this.getRandomWeightedEmoji());
        this.$set(this.gameObjects, "1", this.getRandomWeightedEmoji());
        this.$set(this.gameObjects, "2", this.getRandomWeightedEmoji());
        this.$set(this.gameObjects, "3", this.getRandomWeightedEmoji());
        this.$set(this.gameObjects, "4", this.getRandomWeightedEmoji());
        this.timer--;
        setTimeout(this.spin, 100);
      } else {
        this.checkWin();
        this.timer = 50;
      }
    },
    startSpin() {
      this.winningLineWidth = 0;
      this.isSpinning = true;
      this.spinningAudio.play();
      this.spin();
    },
  },
};
</script>

<style>
.slots-container {
  position: absolute;
  width: 390px;
  height: 95px;
  bottom: 50px;
  right: 50px;
}

.slot-row {
  display: flex;
  padding: 10px;
  padding-top: 20px;
  padding-left: 23px;
  padding-right: 15px;
}

.win-line {
  height: 5px;
  width: 200px;
  background-color: gold;
  border-bottom: 5px solid orange;
  position: absolute;
  margin-top: 30px;
  margin-left: 10px;
}

.slot-column {
  width: 20px;
  height: 50px;
  margin: 5px;
  flex: 1;
  font-size: 35px;
  transition: all 0.1s ease-in-out;
}

.blink-me {
  animation: blinker 1s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>