// Based on https://github.com/guruahn/vue3-google-oauth2-front-sample/blob/master/src/components/HelloWorld.vue

<template>
  <span>
    <button v-if="!user" @click="handleClickSignIn">sign in</button>
    <button v-if="user" @click="handleClickSignOut">sign out</button>
  </span>
</template>

<script>
import { inject, toRefs } from "vue";

export default {
  name: "GoogleAuth",
  props: {
    msg: String,
  },

  data() {
    return {
      user: "",
      id_token: "",
    };
  },

  emits: ["sign-in", "sign-out"],

  methods: {
    async handleClickSignIn() {
      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }
        console.log("googleUser", googleUser);
        this.user = googleUser.getBasicProfile().getEmail();
        this.id_token = this.$gAuth.instance.currentUser
          .get()
          .getAuthResponse().id_token;
        this.$emit("sign-in", { user: this.user, id_token: this.id_token });
      } catch (error) {
        //on fail do something
        console.error(error);
        return null;
      }
    },

    async handleClickGetAuthCode() {
      try {
        const authCode = await this.$gAuth.getAuthCode();
        console.log("authCode", authCode);
      } catch (error) {
        //on fail do something
        console.error(error);
        return null;
      }
    },

    async handleClickSignOut() {
      try {
        await this.$gAuth.signOut();
        // console.log("isAuthorized", this.Vue3GoogleOauth.isAuthorized);
        this.user = "";
        this.id_token = "";
        this.$emit("sign-out");
      } catch (error) {
        console.error(error);
      }
    },

    handleClickDisconnect() {
      window.location.href = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=${window.location.href}`;
    },
  },
  setup(props) {
    const { isSignIn } = toRefs(props);
    const Vue3GoogleOauth = inject("Vue3GoogleOauth");

    const handleClickLogin = () => {};
    return {
      Vue3GoogleOauth,
      handleClickLogin,
      isSignIn,
    };
  },
};
</script>

<style>
button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  -webkit-transition: 0.1s;
  transition: 0.1s;
  font-weight: 500;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
  margin-right: 1em;
}

button:disabled {
  background: #fff;
  color: #ddd;
  cursor: not-allowed;
}
</style>
