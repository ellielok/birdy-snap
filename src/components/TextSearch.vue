<template>
    <div class="min-h-screen bg-[url('/images/Background.png')] bg-center bg-cover bg-no-repeat bg-fixed py-12">
        <div class="max-w-[1000px] mx-auto mb-8 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 px-5">
            <div class="bg-white/95 rounded-xl p-5 shadow-[0_4px_20px_rgba(30,80,200,0.1)] border border-[rgba(25,118,210,0.1)] transition-all duration-300 hover:shadow-[0_6px_25px_rgba(30,80,200,0.15)] hover:-translate-y-0.5">
                <div class="flex items-center gap-2.5 mb-[15px] pb-2.5 border-b-2 border-[#f0f4ff]">
                    <i class="fas fa-search text-[#1976d2] text-[1.2em]"></i>
                    <h3 class="m-0 text-[#333] text-[1.1em] font-semibold">Text Search</h3>
                </div>
                <div class="flex flex-col gap-3">
                    <input
                        v-model="keyword"
                        @keyup.enter="fetchFiles"
                        placeholder="(e.g. crow or crow:2,pigeon:1)"
                        class="w-full py-3 px-4 rounded-lg border border-[#ddd] text-base transition-all duration-200 box-border focus:outline-none focus:border-[#1976d2] focus:shadow-[0_0_0_3px_rgba(25,118,210,0.1)] disabled:bg-[#f5f5f5] disabled:text-[#999]"
                    />
                    <div class="flex gap-2 flex-wrap">
                        <button @click="fetchFiles" class="py-2.5 px-5 bg-gradient-to-br from-[#1976d2] to-[#1565c0] text-white border-none rounded-lg cursor-pointer text-[0.95em] font-medium transition-all duration-200 flex-1 min-w-[80px] hover:bg-gradient-to-br hover:from-[#1565c0] hover:to-[#0d47a1] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(25,118,210,0.3)]">Search</button>
                        <button @click="resetSearch(true)" v-if="keyword" class="py-2.5 px-5 bg-gradient-to-br from-[#f5f5f5] to-[#e0e0e0] text-[#666] border-none rounded-lg cursor-pointer text-[0.95em] font-medium transition-all duration-200 flex-1 min-w-[80px] hover:bg-gradient-to-br hover:from-[#e0e0e0] hover:to-[#d0d0d0] hover:-translate-y-px">Reset</button>
                    </div>
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
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { parseJwt } from "../utils/auth";
import FileResultsGrid from "./FileResultsGrid.vue";

const files = ref([]);
const loading = ref(false);
const error = ref(null);
const route = useRoute();
const keyword = ref(route.query.keyword || "");
const page = ref(1);
const pagesize = ref(20);
const noMore = ref(false);

const user = ref(null);

async function fetchFiles() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;

    const keywordStr = keyword.value.trim();

    if (!keywordStr.includes(":")) {
        const tagsArr = keywordStr.split(',').map(tag => tag.trim()).filter(Boolean);
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
        return;
    }

    else {
        const tagCounts = {}
        keywordStr.split(',').forEach(pair => {
            const [tag, count] = pair.split(':').map(x => x.trim());
            if (tag) tagCounts[tag] = Number(count) || 1;
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
        return;
    }
}

function resetSearch(isResetAll = false) {
    page.value = 1;
    noMore.value = false;
    files.value = [];
    if (isResetAll) {
        keyword.value = "";
    }
    fetchFiles();
}

watch(
    () => route.query.keyword,
    (newVal) => {
        keyword.value = newVal || "";
        resetSearch();
    }
);

onMounted(() => {
    const token = localStorage.getItem('id_token');
    if (token) {
        user.value = parseJwt(token);
    }
    resetSearch();
});
</script>
