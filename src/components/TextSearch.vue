<template>
    <div class="query-files-page">
        <div class="search-container">
            <div class="search-section">
                <div class="search-header">
                    <i class="fas fa-search"></i>
                    <h3>Text Search</h3>
                </div>
                <div class="search-content">
                    <input
                        v-model="keyword"
                        @keyup.enter="fetchFiles"
                        placeholder="(e.g. crow or crow:2,pigeon:1)"
                        class="search-input"
                    />
                    <div class="search-buttons">
                        <button @click="fetchFiles" class="btn-primary">Search</button>
                        <button @click="resetSearch(true)" v-if="keyword" class="btn-secondary">Reset</button>
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

<style scoped>
.query-files-page {
    min-height: 100vh;
    background: url('/images/Background.png') center center/cover no-repeat fixed;
    padding: 3rem 0;
}

.search-container {
    max-width: 1000px;
    margin: 0 auto 2rem auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    padding: 0 20px;
}

.search-section {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(30, 80, 200, 0.1);
    border: 1px solid rgba(25, 118, 210, 0.1);
    transition: all 0.3s ease;
}

.search-section:hover {
    box-shadow: 0 6px 25px rgba(30, 80, 200, 0.15);
    transform: translateY(-2px);
}

.search-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f4ff;
}

.search-header i {
    color: #1976d2;
    font-size: 1.2em;
}

.search-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.1em;
    font-weight: 600;
}

.search-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.search-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 1rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.search-input:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.search-input:disabled {
    background-color: #f5f5f5;
    color: #999;
}

.search-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-primary {
    padding: 10px 20px;
    background: linear-gradient(135deg, #1976d2, #1565c0);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95em;
    font-weight: 500;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 80px;
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #1565c0, #0d47a1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-primary:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.btn-secondary {
    padding: 10px 20px;
    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
    color: #666;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95em;
    font-weight: 500;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 80px;
}

.btn-secondary:hover {
    background: linear-gradient(135deg, #e0e0e0, #d0d0d0);
    transform: translateY(-1px);
}
</style>
