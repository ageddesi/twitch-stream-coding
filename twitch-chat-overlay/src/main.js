import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    messages: [],
    users: [],
    slotQueue: [],
  },
  getters: {
    messages: (state) => {
      return state.messages;
    },
    users: (state) => {
      return state.users;
    },
    slotQueue: (state) => {
      return state.slotQueue;
    },
  },
  mutations: {
    removeFromQueuePos(state, loc) {
      state.slotQueue.shift();
      console.log(loc);
    },
    addPoints(state, payload) {
      var foundUser = state.users.find(
        (user) => user.userId === payload.userId
      );
      if (foundUser) {
        foundUser.points += payload.points;
      }
    },
    addToSlotQueue(state, payload) {
      state.slotQueue.push(payload);
    },
    addUser(state, payload) {
      var foundUser = state.users.find(
        (user) => user.userId === payload.userId
      );

      if (foundUser) {
        return;
      }

      state.users.push({
        userId: payload.userId,
        username: payload.username,
        points: 100,
      });
    },
    addMessage(state, payload) {
      state.messages.push({
        tags: payload.tags,
        message: payload.message,
      });
    },
  },
  plugins: [createPersistedState()],
});

new Vue({
  store: store,
  render: (h) => h(App),
}).$mount("#app");
