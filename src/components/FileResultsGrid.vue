<template>
    <div>
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
            <div v-else-if="files.length === 0 && !loading" class="text-center text-[#666] my-12 text-[1.1em] font-medium">{{ emptyMessage }}</div>
            <div v-else>
                <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 px-5 max-md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] max-md:gap-4">
                    <div
                        v-for="file in files"
                        :key="file.url"
                        class="file-card bg-gradient-to-br from-white to-[#f8f9fa] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08),0_4px_16px_rgba(25,118,210,0.05)] p-5 flex flex-col relative transition-all duration-300 border border-white/80 backdrop-blur-[10px] overflow-hidden min-h-[340px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15),0_8px_24px_rgba(25,118,210,0.1)] max-md:min-h-[320px] max-md:p-4"
                        :class="{ 'selected': !!mySelectedMap[file.url] }"
                    >
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
                                <div class="tags flex flex-wrap gap-1.5 justify-center mb-2" v-if="file.tags && file.tags.length > 0">
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
                <div v-show="loading && files.length > 0" class="text-center text-[#666] my-12 text-[1.1em] font-medium">Loading more...</div>
                <div v-show="noMore && files.length > 0" class="text-center text-[#666] my-12 text-[1.1em] font-medium">No more files.</div>
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
import { ref, computed } from "vue";
import axios from "axios";

const props = defineProps({
    files: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    error: { type: String, default: null },
    noMore: { type: Boolean, default: false },
    emptyMessage: { type: String, default: "No files found." },
});

const emit = defineEmits(['update:files', 'deleted']);

const mySelectedMap = ref({});

const fullImageDialogVisible = ref(false);
const fullImageUrl = ref("");

const tagsDialogVisible = ref(false);
const editingFile = ref(null);
const originalTags = ref([]);
const editingTags = ref([]);
const newTag = ref("");
const savingTags = ref(false);

const mySelectedFiles = computed(() =>
    props.files.filter(file => file && mySelectedMap.value[file.url])
);

function toggleSelect(file) {
    const key = file.url;
    mySelectedMap.value[key] = !mySelectedMap.value[key];
}

function deselectAll() {
    mySelectedMap.value = {};
}

function confirmDelete(file) {
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
        const res = await axios.post("https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/DeleteFiles",
            { urls: keys },
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
        const filtered = props.files.filter(f => !keys.includes(f.url.split('?')[0]));
        emit('update:files', filtered);
        emit('deleted', keys);
    } catch (e) {
        alert("Delete failed: " + (e?.response?.data?.message || e.message || "Unknown error"));
    }
}

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

function formatTime(time) {
    if (!time) return "";
    const date = new Date(time);
    return isNaN(date.getTime()) ? "" : date.toLocaleString();
}

async function showFullImage(file) {
    try {
        const rawUrl = file.url.split('?')[0];
        const { data } = await axios.post(
            `https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/get_fullsize`,
            { thumbnail_url: rawUrl },
            { headers: {} }
        );
        fullImageUrl.value = data.fileUrl;
        fullImageDialogVisible.value = true;
    } catch (e) {
        console.error("Failed to get presigned url:", e);
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('URL copied to clipboard');
    } catch (err) {
        console.error('Failed to copy: ', err);
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
