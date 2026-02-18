<template>
    <div class="min-h-screen bg-[url('/images/Background.png')] bg-center bg-cover bg-no-repeat bg-fixed py-12">
        <div class="max-w-150 mx-auto mb-8 px-5">
            <div class="bg-white/95 rounded-xl p-6 shadow-[0_4px_20px_rgba(30,80,200,0.1)] border border-[rgba(25,118,210,0.1)]">
                <div class="flex items-center gap-2.5 mb-4 pb-2.5 border-b-2 border-[#f0f4ff]">
                    <i class="fas fa-search text-[#1976d2] text-[1.2em]"></i>
                    <h3 class="m-0 text-[#333] text-[1.1em] font-semibold">Text Search</h3>
                </div>

                <!-- Search items -->
                <div class="flex flex-col gap-3 mb-4">
                    <div v-for="(item, index) in searchItems" :key="index" class="flex items-center gap-2">
                        <input
                            v-model="item.name"
                            maxlength="50"
                            placeholder="Bird name (e.g. crow)"
                            class="flex-1 py-2.5 px-4 rounded-lg border border-[#ddd] text-base transition-all duration-200 box-border focus:outline-none focus:border-[#1976d2] focus:shadow-[0_0_0_3px_rgba(25,118,210,0.1)]"
                            @keyup.enter="fetchFiles"
                        />
                        <input
                            v-model.number="item.count"
                            type="number"
                            min="1"
                            max="99"
                            placeholder="Count"
                            class="w-20 py-2.5 px-3 rounded-lg border border-[#ddd] text-base text-center transition-all duration-200 box-border focus:outline-none focus:border-[#1976d2] focus:shadow-[0_0_0_3px_rgba(25,118,210,0.1)]"
                            @keyup.enter="fetchFiles"
                        />
                        <button
                            v-if="searchItems.length > 1"
                            @click="removeItem(index)"
                            class="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-none text-[#999] text-lg cursor-pointer transition-colors duration-200 hover:bg-[#ffebee] hover:text-[#e53935] shrink-0"
                            aria-label="Remove"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Add item button -->
                <button
                    v-if="searchItems.length < 10"
                    @click="addItem"
                    class="w-full py-2 border-2 border-dashed border-[#ccc] rounded-lg bg-transparent text-[#888] text-sm cursor-pointer transition-all duration-200 hover:border-[#1976d2] hover:text-[#1976d2] hover:bg-[#f0f7ff] mb-4"
                >
                    <i class="fas fa-plus mr-1"></i> Add bird species ({{ searchItems.length }}/10)
                </button>
                <div v-else class="text-center text-[#999] text-sm mb-4">Maximum 10 species reached</div>

                <!-- Action buttons -->
                <div class="flex gap-2 flex-wrap">
                    <button
                        @click="fetchFiles"
                        :disabled="!hasValidItem"
                        class="py-2.5 px-5 bg-gradient-to-br from-[#1976d2] to-[#1565c0] text-white border-none rounded-lg cursor-pointer text-[0.95em] font-medium transition-all duration-200 flex-1 min-w-20 hover:from-[#1565c0] hover:to-[#0d47a1] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(25,118,210,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >Search</button>
                    <button
                        @click="resetSearch"
                        v-if="hasValidItem"
                        class="py-2.5 px-5 bg-gradient-to-br from-[#f5f5f5] to-[#e0e0e0] text-[#666] border-none rounded-lg cursor-pointer text-[0.95em] font-medium transition-all duration-200 flex-1 min-w-20 hover:from-[#e0e0e0] hover:to-[#d0d0d0] hover:-translate-y-px"
                    >Reset</button>
                </div>
            </div>
        </div>

        <FileResultsGrid
            :files="files"
            :loading="loading"
            :error="error"
            :noMore="noMore"
            emptyMessage="No files found."
            @update:files="files = $event"
            @deleted="resetSearch()"
        />
    </div>
</template>

<script setup>
meta: { requiresAuth: true }
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { parseJwt } from "../utils/auth";
import FileResultsGrid from "./FileResultsGrid.vue";

const files = ref([]);
const loading = ref(false);
const error = ref(null);
const route = useRoute();
const noMore = ref(false);
const user = ref(null);

const searchItems = ref([{ name: '', count: 1 }]);

const hasValidItem = computed(() => searchItems.value.some(item => item.name.trim()));

function addItem() {
    if (searchItems.value.length < 10) {
        searchItems.value.push({ name: '', count: 1 });
    }
}

function removeItem(index) {
    searchItems.value.splice(index, 1);
}

async function fetchFiles() {
    const validItems = searchItems.value
        .filter(item => item.name.trim())
        .map(item => ({ name: item.name.trim().slice(0, 50), count: Math.min(Math.max(item.count || 1, 1), 99) }));
    if (!validItems.length || loading.value) return;

    loading.value = true;
    error.value = null;

    const hasCount = validItems.some(item => item.count > 1);

    if (!hasCount) {
        // Simple tag search
        const tagsArr = validItems.map(item => item.name.trim());
        try {
            const { data } = await axios.post(
                "https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/SearchByTagsSimple",
                { tags: tagsArr },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('id_token')}`
                    }
                }
            );
            files.value = (data.results || []).map(item => ({
                url: item.thumbnail_url || item.file_url || item.url,
                tags: item.tags || []
            }));
            noMore.value = true;
        } catch (e) {
            error.value = "Failed to load files.";
            files.value = [];
        } finally {
            loading.value = false;
        }
    } else {
        // Tag with count search
        const tagCounts = {};
        validItems.forEach(item => {
            tagCounts[item.name.trim()] = item.count || 1;
        });
        try {
            const { data } = await axios.post(
                "https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/SearchByTagsWithCount",
                { tags: tagCounts },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('id_token')}`
                    }
                }
            );
            files.value = (data.results || []).map(item => ({
                url: item.thumbnail_url || item.file_url || item.url,
                tags: item.tags || []
            }));
            noMore.value = true;
        } catch (e) {
            error.value = "Failed to load files.";
            files.value = [];
        } finally {
            loading.value = false;
        }
    }
}

function resetSearch() {
    noMore.value = false;
    files.value = [];
    searchItems.value = [{ name: '', count: 1 }];
}

// Support ?keyword= query param from other pages (e.g. SubscribeTags)
watch(
    () => route.query.keyword,
    (newVal) => {
        if (newVal) {
            searchItems.value = [{ name: newVal, count: 1 }];
            fetchFiles();
        }
    }
);

onMounted(() => {
    const token = localStorage.getItem('id_token');
    if (token) {
        user.value = parseJwt(token);
    }
    if (route.query.keyword) {
        searchItems.value = [{ name: route.query.keyword, count: 1 }];
        fetchFiles();
    }
});
</script>
