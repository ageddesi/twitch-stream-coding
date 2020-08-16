<template>
  <div id="app">
    <Slots />
    <MessageDisplay />
  </div>
</template>

<script>
import MessageDisplay from "./components/Messages.vue";
import Slots from "./components/Slots";
import client from "./tmiclient.js";

export default {
  name: "App",
  components: {
    MessageDisplay,
    Slots,
  },
  mounted() {
    client.connect();
  },
};
</script>

<style>
body {
  background: transparent;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
