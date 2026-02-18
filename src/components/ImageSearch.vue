<template>
    <div class="min-h-screen bg-[url('/images/Background.png')] bg-center bg-cover bg-no-repeat bg-fixed py-12">
        <div class="text-center max-w-[700px] mx-auto mb-8 px-5">
            <h1 class="text-[2.8em] font-black text-[#1a1a1a] m-0 mb-3 -tracking-[0.5px]">Reverse Image Search</h1>
            <p class="text-[1.15em] text-[#555] m-0 leading-relaxed">Upload a photo to find visually similar bird images in the database.</p>
        </div>

        <div class="max-w-[700px] mx-auto mb-10 px-5">
            <div
                class="bg-white/95 border-[2.5px] border-dashed border-[#a8d4e6] rounded-2xl py-12 px-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer hover:border-[#1976d2] hover:bg-white hover:shadow-[0_4px_20px_rgba(25,118,210,0.1)]"
                :class="{ '!border-[#1976d2] !bg-[rgba(227,242,253,0.9)] !shadow-[0_4px_24px_rgba(25,118,210,0.2)]': isDragOver }"
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
                <div class="flex items-center gap-2.5 text-[1.1em] text-[#444]">
                    <i class="fas fa-cloud-upload-alt text-[1.5em] text-[#1976d2]"></i>
                    <span>Drag, paste, or <a class="text-[#1976d2] font-semibold cursor-pointer no-underline hover:underline" @click="triggerImageInput">upload an image</a> here</span>
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
