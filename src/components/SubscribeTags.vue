<template>
  <div class="subscribe-tags-bg">
    <div class="subscribe-tags-container">
      <h3>Subscribe to Bird Tags</h3>
      <div class="chips-input-row">
        <div class="chips-list">
          <span
            v-for="(tag, idx) in tagsToAdd"
            :key="tag"
            class="chip chip-new"
            :style="getChipStyle(tag)"
          >
            {{ tag }}
            <button @click="removeTagToAdd(idx)" class="chip-close" aria-label="Remove tag">×</button>
          </span>
          <input
            v-model="inputTag"
            @keydown.enter.prevent="handleInput"
            @keydown.tab.prevent="handleInput"
            @keydown.space.prevent="handleInput"
            @blur="handleInput"
            placeholder="Type tag and press Enter, Tab or Space"
            class="chip-input"
          />
        </div>
      </div>
      <button
        class="subscribe-btn"
        @click="subscribeTags"
        :disabled="tagsToAdd.length === 0 || loading"
      >
        {{ loading ? 'Subscribing...' : 'Subscribe' }}
      </button>

      <div class="subscribed-row">
        <div class="sub-title">Subscribed Tags:</div>
        <div class="chips-list">
          <span
            v-for="(tagObj, idx) in subscribedTags"
            :key="tagObj.arn + tagObj.tag"
            class="chip chip-subscribed clickable"
            :style="getChipStyle(tagObj.tag)"
            @click="searchByTag(tagObj)"
            :title="'Search images tagged ' + tagObj.tag"
          >
            {{ tagObj.tag }}
            <button @click.stop="removeSubscribedTag(tagObj, idx)" class="chip-close" aria-label="Unsubscribe tag">×</button>
          </span>
        </div>
      </div>
      <p v-if="successMsg" class="success">{{ successMsg }}</p>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
meta: { requiresAuth: true }
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const inputTag = ref("");
const tagsToAdd = ref([]);
const subscribedTags = ref([]);
const loading = ref(false);
const successMsg = ref("");
const errorMsg = ref("");
const router = useRouter();

const SNS_API = "https://g8vwukx8vk.execute-api.ap-southeast-2.amazonaws.com/subscribe"

// Assign color for a tag (hash to color, keep stable for the same tag)
function getChipStyle(tag) {
  // Simple hash to pick a color
  const palette = [
    "#b2e7ef", // mint
    "#ffecd2", // soft yellow
    "#b9e6b7", // green
    "#ffe6f3", // pink
    "#f7c1c1", // coral
    "#e3edff", // blue
    "#fcf5c7", // cream
    "#d5e5ef", // pale blue
    "#d2e8d2", // pale green
    "#f7dab1", // light orange
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % palette.length;
  return { background: palette[idx], color: "#1976d2" };
}

async function fetchSubscribedTags() {
  try {
    const { data } = await axios.post(SNS_API, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('id_token')}`
      }
    });
    console.log('DEBUG: fetchSubscribedTags got:', data);
    // Return format: { subscriptions: [ {SubscriptionArn, Protocol, Endpoint, Tags} ] }
    if (data && Array.isArray(data.subscriptions)) {
      // Show tag + arn
      let tags = []
      data.subscriptions.forEach(sub => {
        const subTags = sub.Tags || {};
        for (const tagName in subTags) {
          tags.push({
            arn: sub.SubscriptionArn,
            tag: tagName,
            protocol: sub.Protocol,
            endpoint: sub.Endpoint
          })
        }
      });
      subscribedTags.value = tags;
    } else {
      errorMsg.value = "Invalid data format from server";
      subscribedTags.value = [];
    }
  } catch (e) {
    errorMsg.value = "Failed to load subscribed tags: " + (e?.response?.data?.message || e.message);
    subscribedTags.value = [];
  }
}

function handleInput() {
  let tag = inputTag.value.trim().replace(/,/, "");
  if (
    tag &&
    !tagsToAdd.value.includes(tag) &&
    !subscribedTags.value.find(t => t.tag === tag)
  ) {
    tagsToAdd.value.push(tag);
  }
  inputTag.value = "";
}

function removeTagToAdd(idx) {
  tagsToAdd.value.splice(idx, 1);
}

async function subscribeTags() {
  if (tagsToAdd.value.length === 0) return;
  loading.value = true;
  errorMsg.value = "";
  successMsg.value = "";

  try {
    const endpoint = prompt("Enter your email address to subscribe to tags");
    if (!endpoint){
      errorMsg.value = "Email is required";
      loading.value = false;
      return;
    }
    
    for (const tag of tagsToAdd.value) {
      await axios.post(SNS_API, {
        protocol: "email",
        endpoint,
        tags: { [tag]: "1" },
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('id_token')}`
        }
      });
    }
    successMsg.value = "Tags subscribed successfully!";
    tagsToAdd.value = [];
    await fetchSubscribedTags();
  } catch (e) {
    errorMsg.value = "Failed to subscribe: " + (e?.response?.data?.message || e.message || "Unknown error");
  } finally {
    loading.value = false;
  }
  
}

async function removeSubscribedTag(tagObj, idx) {
  loading.value = true;
  errorMsg.value = "";
  successMsg.value = "";
  try {
    await axios.delete(`${SNS_API}/${encodeURIComponent(tagObj.arn)}`);
    successMsg.value = "Tag unsubscribed.";
    await fetchSubscribedTags();
  } catch (e) {
    errorMsg.value =
      "Failed to unsubscribe: " +
      (e?.response?.data?.message || e.message || "Unknown error");
  } finally {
    loading.value = false;
  }
}

// Click chip to search by tag: jump to QueryFiles.vue and trigger search
function searchByTag(tag) {
  router.push({ path: "/query", query: { keyword: tag.tag || tag } });
}

onMounted(fetchSubscribedTags);
</script>

<style scoped>
.subscribe-tags-bg {
  min-height: 100vh;
  width: 100vw;
  background: url('/images/Background.png') center center/cover no-repeat fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}
.subscribe-tags-container {
  padding: 2.5rem 2.2rem;
  max-width: 540px;
  min-width: 380px;
  border-radius: 16px;
  background: #f6faff;
  box-shadow: 0 4px 28px rgba(40,101,201,.13);
  text-align: center;
}
.chips-input-row {
  margin: 1.5em 0 1.1em 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chips-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px 8px;
  width: 100%;
}
.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 18px;
  padding: 4px 12px;
  font-size: 1em;
  margin-right: 4px;
  margin-bottom: 2px;
  user-select: none;
  animation: fadeIn .18s;
  box-shadow: 0 2px 8px rgba(20,90,150,0.08);
  transition: background .15s, transform .15s, box-shadow .2s;
}
.chip.clickable {
  cursor: pointer;
}
.chip.clickable:hover {
  background: #89ffc7 !important; /* light mint on hover */
  color: #096c3c;
  transform: scale(1.06);
  box-shadow: 0 4px 16px rgba(120, 255, 180, 0.18);
  z-index: 2;
}
.chip-new {
  background: #ffecb2;
  color: #d28b00;
}

.chip-close {
  background: none;
  border: none;
  color: #1976d2;
  margin-left: 7px;
  cursor: pointer;
  font-size: 1.18em;
  outline: none;
  line-height: 1;
  transition: color 0.2s;
}
.chip-close:hover {
  color: #e53935;
}
.chip-input {
  flex: 1;
  border: none;
  outline: none;
  min-width: 110px;
  font-size: 1em;
  padding: 6px 5px;
  background: transparent;
}
.subscribe-btn {
  padding: 10px 40px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.07em;
  margin-top: 1.2em;
  cursor: pointer;
  transition: background 0.2s;
}
.subscribe-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.subscribed-row {
  margin: 2.2em 0 0.5em 0;
  text-align: left;
}
.sub-title {
  font-size: 1.07em;
  font-weight: 600;
  margin-bottom: 7px;
  color: #143b5f;
}
.success {
  color: #12bb5a;
  margin-top: 1em;
}
.error {
  color: #e53935;
  margin-top: 1em;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97);}
  to   { opacity: 1; transform: scale(1);}
}
</style>
