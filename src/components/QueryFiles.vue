<template>
    <div class="query-files-page">
        <div class="search-container">
            <!-- Text Search Section -->
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
                        <button @click="resetSearch" v-if="keyword" class="btn-secondary">Reset</button>
                    </div>
                </div>
            </div>

            <!-- Image Upload Search Section -->
            <div class="search-section">
                <div class="search-header">
                    <i class="fas fa-image"></i>
                    <h3>Image Search</h3>
                </div>
                <div class="search-content">
                    <input 
                        type="file"
                        accept="image/*"
                        @change="onSearchImage"
                        style="display: none;"
                        ref="imageInput"
                    />
                    <button @click="triggerImageInput" class="btn-upload">
                        <i class="fas fa-upload"></i>
                        Upload & Search
                    </button>
                </div>
            </div>

            <!-- Thumbnail URL Search Section -->
            <div class="search-section">
                <div class="search-header">
                    <i class="fas fa-link"></i>
                    <h3>Thumbnail Search</h3>
                </div>
                <div class="search-content">
                    <input
                        v-model="thumbnailUrl"
                        placeholder="Enter thumbnail URL"
                        class="search-input"
                        :disabled="loadingFullImg"
                    />
                    <div class="search-buttons">
                        <button 
                            @click="showFullImageByUrl" 
                            class="btn-primary"
                            :disabled="!thumbnailUrl || loadingFullImg"
                        >
                            {{ loadingFullImg ? "Loading..." : "Search" }}
                        </button>
                    </div>
                </div>
                <div v-if="findFullImgError" class="error-msg">{{ findFullImgError }}</div>
            </div>
        </div>

        <div v-if="mySelectedFiles.length > 0" class="bulk-actions-bar">
            <div class="bulk-actions-content">
                <div class="selection-info">
                    <i class="fas fa-check-circle"></i>
                    <span class="selection-count">{{ mySelectedFiles.length }} file{{ mySelectedFiles.length !== 1 ? 's' : '' }} selected</span>
                </div>
                <div class="bulk-actions">
                    <button @click="deselectAll" class="bulk-btn bulk-btn-secondary">
                        <i class="fas fa-times-circle"></i>
                        Deselect All
                    </button>
                    <button @click="confirmBulkDelete" class="bulk-btn bulk-btn-danger">
                        <i class="fas fa-trash-alt"></i>
                        Delete Selected
                    </button>
                </div>
            </div>
        </div>

        <div class="file-list">
            <div v-if="loading && files.length === 0" class="status-msg">Loading...</div>
            <div v-else-if="error" class="status-msg error">{{ error }}</div>
            <div v-else-if="files.length === 0 && !loading" class="status-msg">No files found.</div>
            <div v-else>
                <div class="files-grid">
                    <!-- Show files with thumbnail -->
                    <div 
                        v-for="file in files" 
                        :key="file.url" 
                        class="file-card"
                        :class="{ 'selected': !!mySelectedMap[file.url] }"
                    >
                        <!-- Media Container -->
                        <div class="media-container">
                            <img 
                                v-if="file.url.match(/\.(jpg|jpeg|png|gif)$/i)" 
                                :src="file.url" 
                                @click="showFullImage(file)"
                                class="thumbnail"
                                alt="thumbnail"
                            />
                            <video 
                                v-else-if="file.url.match(/\.(mp4|mov|avi|webm)$/i)" 
                                :src="file.url" 
                                controls 
                            />
                        </div>

                        <!-- File Info Section -->
                        <div class="file-info">
                            <div class="file-name-container">
                                <div class="file-name">{{ file.file_name || file.url }}</div>
                                <button 
                                    @click="copyToClipboard(file.url)" 
                                    class="copy-btn"
                                    title="Copy URL"
                                >
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            
                            <div class="file-meta">
                                <div class="tags" v-if="file.tags && file.tags.length > 0">
                                    <span v-for="tag in file.tags" :key="tag" class="tag">{{ tag }}</span>
                                </div>
                                
                                <div class="upload-time" v-if="file.uploaded_at">
                                    {{ formatTime(file.uploaded_at) }}
                                </div>
                                
                                <div class="action-buttons">
                                    <button
                                        class="file-action-btn delete-btn"
                                        @click="confirmDelete(file)"
                                        title="Delete file"
                                    >
                                        <i class="fas fa-trash"></i>
                                        Delete
                                    </button>
                                    <button
                                        class="file-action-btn tags-btn"
                                        @click="openTagsDialog(file)"
                                        title="Edit tags"
                                    >
                                        <i class="fas fa-tags"></i>
                                        Tags
                                    </button>
                                </div>
                                
                                <div class="checkbox-container">
                                    <button 
                                        class="select-button" 
                                        :class="{ 'selected': !!mySelectedMap[file.url] }"
                                        @click="toggleSelect(file)"
                                    >
                                        <i class="fas" :class="mySelectedMap[file.url] ? 'fa-check-circle' : 'fa-circle'"></i>
                                        {{ mySelectedMap[file.url] ? 'Selected' : 'Select' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-show = "loading && files.length > 0" class="status-msg">Loading more...</div>
                <div v-show = "noMore && files.length > 0" class="status-msg">No more files.</div>
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

const thumbnailUrl = ref("");
const loadingFullImg = ref(false);
const findFullImgError = ref("");

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
                    // 'Authorization': `Bearer ${localStorage.getItem('id_token')}`,
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
                    // 'Authorization': `Bearer ${localStorage.getItem('id_token')}`
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
                        // 'Authorization': `Bearer ${localStorage.getItem('id_token')}`
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
                        // 'Authorization': `Bearer ${localStorage.getItem('id_token')}`
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
        const keys = mySelectedFiles.value.map(file => file.url);
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
                    // 'Authorization': `Bearer ${localStorage.getItem('id_token')}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("DEBUG: deleteFiles got:", res.data);
        files.value = files.value.filter(file => !keys.includes(file.url));
        keys.forEach(url => delete mySelectedMap.value[url]);
        alert(res.data.message || "Delete success");
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
        const { data } = await axios.post(
            `https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/get_fullsize`,
            { thumbnail_url: file.url },
            {
                headers: {
                    // 'Authorization': `Bearer ${localStorage.getItem('id_token')}`
                }
            }
        );
        fullImageUrl.value = data.url;
        fullImageDialogVisible.value = true;
    } catch (e) {
        console.error("Failed to get presigned url:", e);
    }
}

async function showFullImageByUrl() {
    if (!thumbnailUrl.value) {
        findFullImgError.value = "Please enter a thumbnail URL";
        return;
    }

    loadingFullImg.value = true;
    findFullImgError.value = "";
    try {
        await showFullImage({url: thumbnailUrl.value});
    } catch (e) {
        findFullImgError.value = "Failed to get full image: " + (e?.response?.data?.message || e.message || "Unknown error");
    } finally {
        loadingFullImg.value = false;
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

.btn-upload {
    padding: 12px 20px;
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95em;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
}

.btn-upload:hover {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-upload i {
    font-size: 1em;
}

.error-msg {
    color: #d32f2f;
    font-size: 0.9em;
    text-align: center;
    padding: 8px;
    background: rgba(211, 47, 47, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(211, 47, 47, 0.2);
}

.bulk-actions-bar {
    max-width: 1000px;
    margin: 0 auto 1.5rem auto;
    padding: 0 20px;
    position: sticky;
    top: 20px;
    z-index: 100;
}

.bulk-actions-content {
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    border: 1px solid rgba(25, 118, 210, 0.2);
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 
                0 2px 8px rgba(25, 118, 210, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    backdrop-filter: blur(10px);
    animation: slideDown 0.3s ease-out;
}

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

.selection-info {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1976d2;
    font-weight: 600;
}

.selection-info i {
    font-size: 1.2em;
    color: #4caf50;
}

.selection-count {
    font-size: 1rem;
    color: #333;
}

.bulk-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
}

.bulk-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.9em;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 120px;
    justify-content: center;
    position: relative;
    overflow: hidden;
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

.bulk-btn i {
    font-size: 0.9em;
}

.bulk-btn-secondary {
    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
    color: #555;
    border: 1px solid #ddd;
}

.bulk-btn-secondary:hover {
    background: linear-gradient(135deg, #e8e8e8, #d0d0d0);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bulk-btn-danger {
    background: linear-gradient(135deg, #f44336, #d32f2f);
    color: white;
    border: 1px solid #d32f2f;
}

.bulk-btn-danger:hover {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
}

.bulk-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Responsive design for bulk actions */
@media (max-width: 768px) {
    .bulk-actions-content {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }
    
    .bulk-actions {
        justify-content: center;
    }
    
    .bulk-btn {
        flex: 1;
        min-width: auto;
    }
}
.file-list {
    max-width: 1000px;
    margin: 0 auto;
}
.files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 0 20px;
}

.file-card {
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
                0 4px 16px rgba(25, 118, 210, 0.05);
    padding: 20px;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    overflow: hidden;
    min-height: 340px;
}



.file-card:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15),
                0 8px 24px rgba(25, 118, 210, 0.1);
}

.file-card.selected {
    background: linear-gradient(145deg, #e3f2fd, #f8f9fa);
    border: 2px solid #1976d2;
    box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1),
                0 12px 32px rgba(25, 118, 210, 0.2);
}



/* Media Container */
.media-container {
    width: 100%;
    height: 160px;
    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-card img, .file-card video {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    object-fit: cover;
    cursor: pointer;
}

/* File Info Section */
.file-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.file-name-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.file-name {
    font-weight: 500;
    font-size: 0.8em;
    color: #555;
    line-height: 1.2;
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
    text-align: left;
    opacity: 0.8;
}

.copy-btn {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    color: #1976d2;
    border: none;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    flex-shrink: 0;
}

.copy-btn:hover {
    background: linear-gradient(135deg, #bbdefb, #90caf9);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.copy-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(25, 118, 210, 0.3);
}

.copy-btn i {
    font-size: 0.9em;
}

.file-meta {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    margin-bottom: 8px;
}

.tag {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    color: #1565c0;
    font-size: 0.8em;
    font-weight: 500;
    border-radius: 12px;
    padding: 4px 10px;
    border: 1px solid rgba(25, 118, 210, 0.1);
    transition: all 0.2s ease;
    text-transform: lowercase;
}

.tag:hover {
    background: linear-gradient(135deg, #bbdefb, #90caf9);
    transform: translateY(-1px);
}

.upload-time {
    font-size: 0.8em;
    color: #666;
    font-weight: 500;
    margin-bottom: 12px;
    text-align: center;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 12px;
}

.file-action-btn {
    padding: 8px 14px;
    border: none;
    border-radius: 8px;
    font-size: 0.85em;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 70px;
}

.delete-btn {
    background: linear-gradient(135deg, #ffebee, #ffcdd2);
    color: #d32f2f;
    border: 1px solid rgba(211, 47, 47, 0.1);
}

.delete-btn:hover {
    background: linear-gradient(135deg, #ffcdd2, #ef9a9a);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(211, 47, 47, 0.2);
}

.tags-btn {
    background: linear-gradient(135deg, #f3e5f5, #e1bee7);
    color: #7b1fa2;
    border: 1px solid rgba(123, 31, 162, 0.1);
}

.tags-btn:hover {
    background: linear-gradient(135deg, #e1bee7, #ce93d8);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(123, 31, 162, 0.2);
}

/* Select Button Section */
.checkbox-container {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: auto;
}

.select-button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9em;
    color: #555;
    padding: 10px 18px;
    border-radius: 20px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #e0e0e0;
    backdrop-filter: blur(5px);
    gap: 8px;
    font-weight: 500;
    min-width: 100px;
}

.select-button i {
    font-size: 1.1em;
    transition: all 0.2s ease;
}

.select-button.selected {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    color: #1976d2;
    font-weight: 600;
    border-color: #1976d2;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.select-button.selected i {
    color: #1976d2;
}

.select-button:not(.selected) i {
    color: #bbb;
}

.select-button:hover {
    border-color: #1976d2;
    box-shadow: 0 6px 16px rgba(25, 118, 210, 0.15);
}

.select-button:not(.selected):hover {
    background: rgba(25, 118, 210, 0.05);
    color: #1976d2;
}

.select-button:not(.selected):hover i {
    color: #1976d2;
}

/* Positioning for absolute elements */
.select-checkbox {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 22px;
    height: 22px;
    accent-color: #1976d2;
    z-index: 3;
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.file-card:hover .select-checkbox {
    opacity: 1;
}

/* Status messages */
.status-msg {
    text-align: center;
    color: #666;
    margin: 3em 0;
    font-size: 1.1em;
    font-weight: 500;
}

.status-msg.error {
    color: #d32f2f;
    background: rgba(211, 47, 47, 0.1);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid rgba(211, 47, 47, 0.2);
    margin: 2em auto;
    max-width: 500px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .files-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
    }
    
    .file-card {
        min-height: 320px;
        padding: 16px;
    }
    
    .media-container {
        height: 140px;
    }
}
</style>
  