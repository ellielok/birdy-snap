<template>
    <div class="query-files-page">
        <div class="hero-section">
            <h1 class="hero-title">Reverse Image Search</h1>
            <p class="hero-subtitle">Upload a photo to find visually similar bird images in the database.</p>
        </div>

        <div class="upload-container">
            <div
                class="upload-box"
                :class="{ 'drag-over': isDragOver }"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="onDrop"
            >
                <input
                    type="file"
                    accept="image/*"
                    @change="onSearchImage"
                    style="display: none;"
                    ref="imageInput"
                />
                <div class="upload-prompt">
                    <i class="fas fa-cloud-upload-alt upload-icon"></i>
                    <span>Drag, paste, or <a class="upload-link" @click="triggerImageInput">upload an image</a> here</span>
                </div>
            </div>
        </div>

        <FileResultsGrid
            :files="files"
            :loading="loading"
            :error="error"
            :noMore="noMore"
            emptyMessage="Upload an image to search for similar files."
            @update:files="files = $event"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { parseJwt } from "../utils/auth";
import FileResultsGrid from "./FileResultsGrid.vue";

const files = ref([]);
const loading = ref(false);
const error = ref(null);
const noMore = ref(false);
const isDragOver = ref(false);

const user = ref(null);
const imageInput = ref(null);

function triggerImageInput() {
    imageInput.value && imageInput.value.click();
}

async function searchByFile(file) {
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

async function onSearchImage(event) {
    searchByFile(event.target.files[0]);
}

function onDrop(event) {
    isDragOver.value = false;
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        searchByFile(file);
    }
}

function onPaste(event) {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) searchByFile(file);
            return;
        }
    }
}

onMounted(() => {
    const token = localStorage.getItem('id_token');
    if (token) {
        user.value = parseJwt(token);
    }
    document.addEventListener('paste', onPaste);
});

onUnmounted(() => {
    document.removeEventListener('paste', onPaste);
});
</script>

<style scoped>
.query-files-page {
    min-height: 100vh;
    background: url('/images/Background.png') center center/cover no-repeat fixed;
    padding: 3rem 0;
}

.hero-section {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 2rem auto;
    padding: 0 20px;
}

.hero-title {
    font-size: 2.8em;
    font-weight: 900;
    color: #1a1a1a;
    margin: 0 0 12px 0;
    letter-spacing: -0.5px;
}

.hero-subtitle {
    font-size: 1.15em;
    color: #555;
    margin: 0;
    line-height: 1.6;
}

.upload-container {
    max-width: 700px;
    margin: 0 auto 2.5rem auto;
    padding: 0 20px;
}

.upload-box {
    background: rgba(255, 255, 255, 0.95);
    border: 2.5px dashed #a8d4e6;
    border-radius: 16px;
    padding: 48px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.upload-box:hover {
    border-color: #1976d2;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 20px rgba(25, 118, 210, 0.1);
}

.upload-box.drag-over {
    border-color: #1976d2;
    background: rgba(227, 242, 253, 0.9);
    box-shadow: 0 4px 24px rgba(25, 118, 210, 0.2);
}

.upload-prompt {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1em;
    color: #444;
}

.upload-icon {
    font-size: 1.5em;
    color: #1976d2;
}

.upload-link {
    color: #1976d2;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
}

.upload-link:hover {
    text-decoration: underline;
}
</style>
