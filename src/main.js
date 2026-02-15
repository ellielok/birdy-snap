// import outputs from "../amplify_outputs.json";
// import { Amplify } from "@aws-amplify/core";

// Amplify.configure(outputs);

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "/src/assets/css/main.css";

// const oauth = awsconfig.Auth?.Cognito?.loginWith?.oauth;
// if (oauth) {
//   if (!Array.isArray(oauth.scope)) oauth.scope = [oauth.scope].filter(Boolean);
//   if (!Array.isArray(oauth.redirectSignIn)) oauth.redirectSignIn = [oauth.redirectSignIn].filter(Boolean);
//   if (!Array.isArray(oauth.redirectSignOut)) oauth.redirectSignOut = [oauth.redirectSignOut].filter(Boolean);
// }

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.mount("#app");
