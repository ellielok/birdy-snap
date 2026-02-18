<template>
    <div class="min-h-screen w-screen bg-[url('/images/Background.png')] bg-center bg-cover bg-no-repeat bg-fixed flex items-center justify-center p-5">
        <div class="mx-auto my-8 p-12 max-w-[600px] w-full rounded-[20px] bg-white/95 backdrop-blur-[10px] shadow-[0_20px_40px_rgba(25,118,210,0.15)] text-center max-md:p-8 max-md:px-6 max-md:m-4">
            <div class="mb-10">
                <i class="fas fa-cloud-upload-alt text-[3rem] text-[#1976d2] mb-4 block"></i>
                <h3 class="text-[1.8rem] m-0 mb-2 font-bold text-[#263238]">Upload Bird Images or Videos</h3>
                <p class="text-[#78909c] text-base m-0">Share your amazing bird footage with the community</p>
            </div>

            <div
                class="border-3 border-dashed border-[#cfd8dc] rounded-[15px] py-10 px-8 mb-8 transition-all duration-300 cursor-pointer bg-[#fafafa] hover:border-[#1976d2] hover:bg-[#e3f2fd]"
                :class="{ '!border-[#4caf50] !bg-[#e8f5e9]': selectedFile }"
                @click="!selectedFile && triggerInput()"
            >
                <div v-if="!selectedFile" class="flex flex-col items-center">
                    <i class="fas fa-plus-circle text-[2.5rem] text-[#90a4ae] mb-4"></i>
                    <p class="text-[1.3rem] font-semibold text-[#455a64] m-0 mb-2">Choose your bird media</p>
                    <p class="text-base text-[#78909c] m-0">Images and videos accepted</p>
                </div>

                <div v-else class="flex justify-center">
                    <div class="flex items-center gap-4 bg-white py-4 px-6 rounded-xl shadow-[0_2px_8px_rgba(38,50,56,0.1)] max-w-full max-md:flex-col max-md:text-center max-md:gap-3">
                        <i :class="getFileIcon()" class="text-[2rem] text-[#1976d2] shrink-0"></i>
                        <div class="flex-1 text-left min-w-0 max-md:text-center">
                            <p class="font-semibold text-[#263238] m-0 mb-1 break-all text-[0.95rem]">{{ fileName }}</p>
                            <p class="text-[#78909c] m-0 text-[0.85rem]">{{ getFileSize() }}</p>
                        </div>
                        <button @click="removeFile" class="bg-transparent border-none text-[#f44336] text-[1.2rem] cursor-pointer p-2 rounded-full transition-all duration-200 shrink-0 hover:bg-[#ffebee] hover:text-[#d32f2f]">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <input
                    ref="fileInput"
                    type="file"
                    @change="onFileChange"
                    accept="image/*,video/*"
                    class="hidden"
                />
            </div>

            <div v-if="selectedFile" class="mb-8 text-left">
                <div class="flex items-center gap-2 mb-3 text-[#263238] font-semibold">
                    <i class="fas fa-tags text-[#1976d2]"></i>
                    <label>Add Tags</label>
                </div>
                <el-input
                    type="text"
                    v-model="tags"
                    placeholder="e.g., robin, backyard, morning"
                    class="w-full"
                />
            </div>

            <div class="flex gap-4 justify-center mb-6 flex-wrap max-md:flex-col max-md:items-center">
                <el-button
                    class="choose-btn"
                    @click="triggerInput"
                    size="large"
                >
                    <i class="fas fa-folder-open"></i>
                    Choose File
                </el-button>

                <el-button
                    type="primary"
                    @click="uploadFile"
                    :disabled="!selectedFile || uploading"
                    class="upload-btn"
                    size="large"
                >
                    <i :class="uploading ? 'fas fa-spinner fa-spin' : 'fas fa-upload'"></i>
                    {{ uploading ? "Uploading..." : "Upload" }}
                </el-button>
            </div>

            <div v-if="uploadSuccess" class="flex items-center justify-center gap-2 p-4 rounded-xl font-semibold text-base bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                <i class="fas fa-check-circle"></i>
                <span>Upload successful!</span>
            </div>

            <div v-if="error" class="flex items-center justify-center gap-2 p-4 rounded-xl font-semibold text-base bg-[#ffebee] text-[#d32f2f] border border-[#ffcdd2]">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ error }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
meta: { requiresAuth: true }
import { ref } from "vue";
import axios from "axios";

const fileInput = ref(null);
const selectedFile = ref(null);
const fileName = ref("No file chosen");
const uploading = ref(false);
const uploadSuccess = ref(false);
const error = ref(null);
const tags = ref("");

function triggerInput() {
    fileInput.value && fileInput.value.click();
}

function removeFile() {
    selectedFile.value = null;
    fileName.value = "No file chosen";
    tags.value = "";
    uploadSuccess.value = false;
    error.value = null;
}

function getFileIcon() {
    if (!selectedFile.value) return 'fas fa-file';

    if (selectedFile.value.type.startsWith('image/')) {
        return 'fas fa-image';
    } else if (selectedFile.value.type.startsWith('video/')) {
        return 'fas fa-video';
    }
    return 'fas fa-file';
}

function getFileSize() {
    if (!selectedFile.value) return '';

    const bytes = selectedFile.value.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function onFileChange(e) {
    uploadSuccess.value = false;
    error.value = null;
    const files = e.target.files;
    if (files.length > 0) {
        // Check if the file is an image or video
        if (!files[0].type.startsWith('image/') && !files[0].type.startsWith('video/')) {
            error.value = 'Please upload an image or video file';
            fileName.value = 'Invalid file type';
            selectedFile.value = null;
            return;
        }
        selectedFile.value = files[0];
        fileName.value = files[0].name;
        tags.value = "";
    } else {
        fileName.value = "No file chosen";
        selectedFile.value = null;
        tags.value = "";
    }
}

async function uploadFile() {
    if (!selectedFile.value) return;
    uploading.value = true;
    error.value = null;
    uploadSuccess.value = false;
    try {
        // request presigned url
        const filename = encodeURIComponent(selectedFile.value.name);
        const presignRes= await axios.post(
            `https://92o9sezu00.execute-api.ap-southeast-2.amazonaws.com/GeneratePresignURL` ,
            {
                fileName: selectedFile.value.name,
                fileType: selectedFile.value.type,
            },
            {
                headers: {
                    // 'Authorization': `Bearer ${localStorage.getItem('id_token')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        const data = presignRes.data
        // upload file to s3
        await axios.put(data.presigned_url, selectedFile.value, {
            headers: { "Content-Type": selectedFile.value.type },
        });
        uploadSuccess.value = true;
        selectedFile.value = null;
        fileName.value = "No file chosen";
        tags.value = "";
    } catch (e) {
        error.value =
            "Upload failed: " +
            (e?.response?.data?.message || e.message || "Unknown error");
        uploadSuccess.value = false;
    } finally {
        uploading.value = false;
    }
}
</script>

<style scoped>
.choose-btn {
    background: #607d8b;
    border-color: #607d8b;
    color: white;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
}
.choose-btn:hover {
    background: #546e7a;
    border-color: #546e7a;
    color: white;
    transform: translateY(-2px);
}
.upload-btn {
    background: #1976d2;
    border-color: #1976d2;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
}
.upload-btn:hover:not(:disabled) {
    background: #1565c0;
    border-color: #1565c0;
    transform: translateY(-2px);
}
.upload-btn:disabled {
    opacity: 0.6;
}
</style>
