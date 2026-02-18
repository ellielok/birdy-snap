<template>
    <div class="min-h-screen bg-[url('/images/Background.png')] bg-center bg-cover bg-no-repeat bg-fixed py-12">
        <div class="max-w-[1000px] mx-auto mb-8 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 px-5">
            <!-- Text Search Section -->
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
                        <button @click="resetSearch" v-if="keyword" class="py-2.5 px-5 bg-gradient-to-br from-[#f5f5f5] to-[#e0e0e0] text-[#666] border-none rounded-lg cursor-pointer text-[0.95em] font-medium transition-all duration-200 flex-1 min-w-[80px] hover:bg-gradient-to-br hover:from-[#e0e0e0] hover:to-[#d0d0d0] hover:-translate-y-px">Reset</button>
                    </div>
                </div>
            </div>

            <!-- Image Upload Search Section -->
            <div class="bg-white/95 rounded-xl p-5 shadow-[0_4px_20px_rgba(30,80,200,0.1)] border border-[rgba(25,118,210,0.1)] transition-all duration-300 hover:shadow-[0_6px_25px_rgba(30,80,200,0.15)] hover:-translate-y-0.5">
                <div class="flex items-center gap-2.5 mb-[15px] pb-2.5 border-b-2 border-[#f0f4ff]">
                    <i class="fas fa-image text-[#1976d2] text-[1.2em]"></i>
                    <h3 class="m-0 text-[#333] text-[1.1em] font-semibold">Image Search</h3>
                </div>
                <div class="flex flex-col gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        @change="onSearchImage"
                        style="display: none;"
                        ref="imageInput"
                    />
                    <button @click="triggerImageInput" class="py-3 px-5 bg-gradient-to-br from-[#4caf50] to-[#45a049] text-white border-none rounded-lg cursor-pointer text-[0.95em] font-medium transition-all duration-200 flex items-center justify-center gap-2 w-full hover:bg-gradient-to-br hover:from-[#45a049] hover:to-[#3d8b40] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(76,175,80,0.3)]">
                        <i class="fas fa-upload text-[1em]"></i>
                        Upload & Search
                    </button>
                </div>
            </div>

            <!-- Thumbnail URL Search Section (removed) -->
            <!--
            <div class="search-section">
                ...
            </div>
            -->
        </div>

        <div v-if="mySelectedFiles.length > 0" class="max-w-[1000px] mx-auto mb-6 px-5 sticky top-5 z-[100]">
            <div class="bg-gradient-to-br from-white to-[#f8f9fa] border border-[rgba(25,118,210,0.2)] rounded-xl py-4 px-5 shadow-[0_4px_20px_rgba(0,0,0,0.1),0_2px_8px_rgba(25,118,210,0.15)] flex items-center justify-between gap-5 flex-wrap backdrop-blur-[10px] animate-slideDown max-md:flex-col max-md:items-stretch max-md:gap-[15px]">
                <div class="flex items-center gap-2.5 text-[#1976d2] font-semibold">
                    <i class="fas fa-check-circle text-[1.2em] text-[#4caf50]"></i>
                    <span class="text-base text-[#333]">{{ mySelectedFiles.length }} file{{ mySelectedFiles.length !== 1 ? 's' : '' }} selected</span>
                </div>
                <div class="flex gap-3 flex-wrap items-center max-md:justify-center">
                    <button @click="deselectAll" class="bulk-btn py-2.5 px-4 border-none rounded-lg text-[0.9em] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 min-w-[120px] justify-center relative overflow-hidden bg-gradient-to-br from-[#f5f5f5] to-[#e0e0e0] text-[#555] border border-[#ddd] hover:bg-gradient-to-br hover:from-[#e8e8e8] hover:to-[#d0d0d0] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(0,0,0,0.2)] max-md:flex-1 max-md:min-w-0">
                        <i class="fas fa-times-circle text-[0.9em]"></i>
                        Deselect All
                    </button>
                    <button @click="confirmBulkDelete" class="bulk-btn py-2.5 px-4 border-none rounded-lg text-[0.9em] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 min-w-[120px] justify-center relative overflow-hidden bg-gradient-to-br from-[#f44336] to-[#d32f2f] text-white border border-[#d32f2f] hover:bg-gradient-to-br hover:from-[#d32f2f] hover:to-[#b71c1c] hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(244,67,54,0.4)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(0,0,0,0.2)] max-md:flex-1 max-md:min-w-0">
                        <i class="fas fa-trash-alt text-[0.9em]"></i>
                        Delete Selected
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-[1000px] mx-auto">
            <div v-if="loading && files.length === 0" class="text-center text-[#666] my-12 text-[1.1em] font-medium">Loading...</div>
            <div v-else-if="error" class="text-center text-[#d32f2f] bg-[rgba(211,47,47,0.1)] p-4 rounded-xl border border-[rgba(211,47,47,0.2)] my-8 mx-auto max-w-[500px]">{{ error }}</div>
            <div v-else-if="files.length === 0 && !loading" class="text-center text-[#666] my-12 text-[1.1em] font-medium">No files found.</div>
            <div v-else>
                <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 px-5 max-md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] max-md:gap-4">
                    <!-- Show files with thumbnail -->
                    <div
                        v-for="file in files"
                        :key="file.url"
                        class="file-card bg-gradient-to-br from-white to-[#f8f9fa] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08),0_4px_16px_rgba(25,118,210,0.05)] p-5 flex flex-col relative transition-all duration-300 border border-white/80 backdrop-blur-[10px] overflow-hidden min-h-[340px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15),0_8px_24px_rgba(25,118,210,0.1)] max-md:min-h-[320px] max-md:p-4"
                        :class="{ 'selected': !!mySelectedMap[file.url] }"
                    >
                        <!-- Media Container -->
                        <div class="w-full h-[160px] bg-gradient-to-br from-[#f5f5f5] to-[#e0e0e0] rounded-xl mb-4 overflow-hidden relative flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] max-md:h-[140px]">
                            <img
                                v-if="file.url.match(/\.(jpg|jpeg|png|gif)(\?.*)?$/i)"
                                :src="file.url"
                                @click="showFullImage(file)"
                                class="max-w-full max-h-full rounded-lg object-cover cursor-pointer"
                                alt="thumbnail"
                            />
                            <video
                                v-else-if="file.url.match(/\.(mp4|mov|avi|webm)(\?.*)?$/i)"
                                :src="file.url"
                                controls
                                class="max-w-full max-h-full rounded-lg object-cover cursor-pointer"
                            />
                        </div>

                        <!-- File Info Section -->
                        <div class="flex-1 flex flex-col gap-3">
                            <div class="flex items-center justify-center gap-2 mb-2 p-2 bg-black/[0.02] rounded-lg border border-black/[0.05]">
                                <div class="font-medium text-[0.8em] text-[#555] leading-[1.2] break-all line-clamp-2 flex-1 text-left opacity-80">{{ file.file_name || file.url }}</div>
                                <button
                                    @click="copyToClipboard(file.url)"
                                    class="bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] text-[#1976d2] border-none rounded-md py-1.5 px-2 cursor-pointer transition-all duration-200 flex items-center justify-center min-w-[32px] h-8 shrink-0 hover:bg-gradient-to-br hover:from-[#bbdefb] hover:to-[#90caf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(25,118,210,0.2)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(25,118,210,0.3)]"
                                    title="Copy URL"
                                >
                                    <i class="fas fa-copy text-[0.9em]"></i>
                                </button>
                            </div>

                            <div class="w-full flex flex-col gap-2 items-center">
                                <div class="flex flex-wrap gap-1.5 justify-center mb-2" v-if="file.tags && file.tags.length > 0">
                                    <span v-for="tag in file.tags" :key="tag" class="bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] text-[#1565c0] text-[0.8em] font-medium rounded-xl py-1 px-2.5 border border-[rgba(25,118,210,0.1)] transition-all duration-200 lowercase hover:bg-gradient-to-br hover:from-[#bbdefb] hover:to-[#90caf9] hover:-translate-y-px">{{ tag }}</span>
                                </div>

                                <div class="text-[0.8em] text-[#666] font-medium mb-3 text-center" v-if="file.uploaded_at">
                                    {{ formatTime(file.uploaded_at) }}
                                </div>

                                <div class="flex gap-2 justify-center mb-3">
                                    <button
                                        class="py-2 px-3.5 border-none rounded-lg text-[0.85em] font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 min-w-[70px] bg-gradient-to-br from-[#ffebee] to-[#ffcdd2] text-[#d32f2f] border border-[rgba(211,47,47,0.1)] hover:bg-gradient-to-br hover:from-[#ffcdd2] hover:to-[#ef9a9a] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(211,47,47,0.2)]"
                                        @click="confirmDelete(file)"
                                        title="Delete file"
                                    >
                                        <i class="fas fa-trash"></i>
                                        Delete
                                    </button>
                                    <button
                                        class="py-2 px-3.5 border-none rounded-lg text-[0.85em] font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 min-w-[70px] bg-gradient-to-br from-[#f3e5f5] to-[#e1bee7] text-[#7b1fa2] border border-[rgba(123,31,162,0.1)] hover:bg-gradient-to-br hover:from-[#e1bee7] hover:to-[#ce93d8] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(123,31,162,0.2)]"
                                        @click="openTagsDialog(file)"
                                        title="Edit tags"
                                    >
                                        <i class="fas fa-tags"></i>
                                        Tags
                                    </button>
                                </div>

                                <div class="flex justify-center w-full mt-auto">
                                    <button
                                        class="flex items-center justify-center cursor-pointer text-[0.9em] text-[#555] py-2.5 px-[18px] rounded-[20px] transition-all duration-300 bg-white/90 border-2 border-[#e0e0e0] backdrop-blur-[5px] gap-2 font-medium min-w-[100px] hover:border-[#1976d2] hover:shadow-[0_6px_16px_rgba(25,118,210,0.15)]"
                                        :class="{
                                            'bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] !text-[#1976d2] font-semibold !border-[#1976d2] shadow-[0_4px_12px_rgba(25,118,210,0.3)]': !!mySelectedMap[file.url],
                                            'hover:bg-[rgba(25,118,210,0.05)] hover:text-[#1976d2]': !mySelectedMap[file.url]
                                        }"
                                        @click="toggleSelect(file)"
                                    >
                                        <i class="fas text-[1.1em] transition-all duration-200" :class="mySelectedMap[file.url] ? 'fa-check-circle text-[#1976d2]' : 'fa-circle text-[#bbb]'"></i>
                                        {{ mySelectedMap[file.url] ? 'Selected' : 'Select' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-show = "loading && files.length > 0" class="text-center text-[#666] my-12 text-[1.1em] font-medium">Loading more...</div>
                <div v-show = "noMore && files.length > 0" class="text-center text-[#666] my-12 text-[1.1em] font-medium">No more files.</div>
            </div>
        </div>

        <el-dialog v-model="fullImageDialogVisible" title="Full Image" width="80%" :close-on-click-modal="true">
            <img v-if="fullImageUrl" :src="fullImageUrl" alt="Full Image" style="width: 100%; height: auto;" />
        </el-dialog>


        <el-dialog v-model="tagsDialogVisible" title="Edit Tags" width="80%">
            <div style="margin-bottom: 16px;">
                <div style="font-weight: bold; margin-bottom: 4px;">Current Tags:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 36px;">
                <el-tag
                    v-for="(tag, idx) in originalTags"
                    :key="'ori-' + tag"
                    closable
                    @close="removeOriginalTag(idx)"
                    type="info"
                    effect="plain"
                >{{ tag }}</el-tag>
                </div>
            </div>
            <div style="margin-bottom: 16px;">
                <div style="font-weight: bold; margin-bottom: 4px;">To be submitted Tags:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 36px;">
                <el-tag
                    v-for="(tag, idx) in editingTags"
                    :key="'edit-' + tag"
                    closable
                    @close="removeEditingTag(idx)"
                    type="success"
                    effect="plain"
                >{{ tag }}</el-tag>
                </div>
            </div>
            <el-input
                v-model="newTag"
                placeholder="Add new tag"
                @keyup.enter="addTag"
                @keydown.tab.prevent="addTag"
                style="margin-bottom: 10px;"
            />
            <template #footer>
                <el-button @click="tagsDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="saveTags" :loading="savingTags">Save</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
meta: { requiresAuth: true }
import { useRoute } from 'vue-router';
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import axios from "axios";
import { parseJwt } from "../utils/auth";

const files = ref([]); // [{url, uploader, file_name, tags, uploaded_at}]
const loading = ref(false);
const error = ref(null);
const route = useRoute();
const keyword = ref(route.query.keyword || "");
const page = ref(1);
const pagesize = ref(20);
const noMore = ref(false);

const fullImageDialogVisible = ref(false);
const fullImageUrl = ref("");

const user = ref(null);
const mySelectedMap = ref({});

const imageInput = ref(null);

const tagsDialogVisible = ref(false);
const editingFile = ref(null);
const originalTags = ref([]);
const editingTags = ref([]);
const newTag = ref("");
const savingTags = ref(false);

function openTagsDialog(file) {
    editingFile.value = file;
    originalTags.value = file.tags ? [...file.tags] : [];
    editingTags.value = [];
    newTag.value = "";
    tagsDialogVisible.value = true;
}

function removeOriginalTag(idx) {
    originalTags.value.splice(idx, 1);
}

function removeEditingTag(idx) {
    editingTags.value.splice(idx, 1);
}

function addTag() {
    const tag = newTag.value.trim();
    if (!tag) return;
    if (!originalTags.value.includes(tag) && !editingTags.value.includes(tag)) {
        editingTags.value.push(tag);
    }
    newTag.value = "";
}

async function saveTags() {
    if (!editingFile.value) return;
    savingTags.value = true;
    try {
        const tagsToSave = [...originalTags.value, ...editingTags.value].map(tag => `${tag},1`);
        await axios.post(
            "https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/UpdateTags",
            {
                url: [editingFile.value.url],
                operation: 1,
                tags: editingTags.value.map(tag => `${tag},1`)
            },
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('id_token')}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        editingFile.value.tags = [...originalTags.value, ...editingTags.value];
        tagsDialogVisible.value = false;
        alert("Tags updated successfully");
    } catch (e) {
        alert("Failed to update tags: " + (e?.response?.data?.message || e.message || "Unknown error"));
    } finally {
        savingTags.value = false;
    }
}


function triggerImageInput() {
    imageInput.value && imageInput.value.click();
}

async function onSearchImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    loading.value = true;
    error.value = null;

    try {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await axios.post(
            "https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/SearchByUploadedFile",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
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

function formatTime(time) {
    if (!time) return "";
    const date = new Date(time);
    return isNaN(date.getTime()) ? "" : date.toLocaleString();
}

async function fetchFiles(isFirstPage = false) {
    if (loading.value) return; // Prevent duplicate loading
    loading.value = true;
    error.value = null;

    const tagCounts = parseTagCounts(keyword.value);
    let queryParams = buildQueryParamsFromTagCounts(tagCounts);
    const keywordStr = keyword.value.trim();

    // Search by tags simple without count.
    // Note: keywordStr can be empty. In this case, it will return all files.
    if (!keywordStr.includes(":")) {
        // Search by tags simple without count
        const tagsArr = keywordStr.split(',').map(tag => tag.trim()).filter(Boolean);
        try {
            const { data } = await axios.post(
                "https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/SearchByTagsSimple",
                {
                    tags: tagsArr
                },
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

    // Search by tags with count like crow:2,pigeon:1,duck:3
    else {
        // Search by tags with count like crow:2,pigeon:1,duck:3
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
    mySelectedMap.value = {};
    if (isResetAll) {
        keyword.value = "";
    }
    fetchFiles(true);
}

watch(
    () => route.query.keyword,
    (newVal) => {
        keyword.value = newVal || "";
        resetSearch();
    }
);

function isOwnFile(file) {
    return user.value && file.uploader && (
        file.uploader === user.value["cognito:username"] ||
        file.uploader === user.value.email
    );
}

const mySelectedFiles = computed(() =>
    files.value.filter(file => file && mySelectedMap.value[file.url])
);

function toggleSelect(file) {
    // if (!isOwnFile(file)) return;
    const key = file.url;
    mySelectedMap.value[key] = !mySelectedMap.value[key];
}

function deselectAll() {
    mySelectedMap.value = {};
}

function confirmDelete(file) {
    // if (!isOwnFile(file)) return;
    if (window.confirm(`Delete "${file.file_name}"? This cannot be undone.`)) {
        deleteFiles([file.url]);
    }
}

function confirmBulkDelete() {
    if (mySelectedFiles.value.length === 0) return;
    if (window.confirm(`Delete ${mySelectedFiles.value.length} files? This cannot be undone.`)) {
        const keys = mySelectedFiles.value.map(file => file.url.split('?')[0]);
        deleteFiles(keys);
    }
}

async function deleteFiles(keys) {
    try {
        loading.value = true;
        error.value = null;
        const res = await axios.post("https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/DeleteFiles",
            {urls: keys},
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('id_token')}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("DEBUG: deleteFiles got:", res.data);
        keys.forEach(url => delete mySelectedMap.value[url]);
        alert(res.data.message || "Delete success");
        await resetSearch();
    } catch (e) {
        alert("Delete failed: " + (e?.response?.data?.message || e.message || "Unknown error"));
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    const token = localStorage.getItem('id_token');
    if (token) {
        user.value = parseJwt(token);
    }
    resetSearch();
});

async function showFullImage(file) {
    try {
        // Strip presigned URL query params to get the raw S3 URL for DynamoDB matching
        const rawUrl = file.url.split('?')[0];
        const { data } = await axios.post(
            `https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/get_fullsize`,
            { thumbnail_url: rawUrl },
            {
                headers: {
                    // 'Authorization': `Bearer ${localStorage.getItem('id_token')}`
                }
            }
        );
        fullImageUrl.value = data.fileUrl;
        fullImageDialogVisible.value = true;
    } catch (e) {
        console.error("Failed to get presigned url:", e);
    }
}

function parseTagCounts(keywordStr){
    // Accept format: crow:2,pigeon:1,duck:3
    const tagCountPairs = keywordStr.split(',').map(s => s.trim()).filter(Boolean);
    const result = [];
    tagCountPairs.forEach((pair, index) => {
        let [tag, count] = pair.split(':').map(x => x.trim());
        if (tag) result.push({
            tag,
            count: Number(count) || 1
        });
    });
    return result;
}

function buildQueryParamsFromTagCounts(tagCounts){
    // tagCounts: [{tag: "crow", count: 2}, {tag: "pigeon", count: 1}, {tag: "duck", count: 3}]
    let params = [];
    tagCounts.forEach((pair, index) => {
        params.push(`tag${index+1}=${encodeURIComponent(pair.tag)}`);
        params.push(`count${index+1}=${pair.count}`);
    });
    return params.join("&");
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        // You could add a toast notification here if desired
        console.log('URL copied to clipboard');
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

</script>

<style scoped>
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-slideDown {
    animation: slideDown 0.3s ease-out;
}
.file-card.selected {
    background: linear-gradient(145deg, #e3f2fd, #f8f9fa);
    border: 2px solid #1976d2;
    box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1),
                0 12px 32px rgba(25, 118, 210, 0.2);
}
.bulk-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
}
.bulk-btn:hover::before {
    left: 100%;
}
</style>
