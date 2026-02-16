<template>
    <div class="upload-bg">
        <div class="upload-file-container">
            <div class="upload-header">
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <h3>Upload Bird Images or Videos</h3>
                <p class="subtitle">Share your amazing bird footage with the community</p>
            </div>

            <div class="upload-zone" :class="{ 'has-file': selectedFile }" @click="!selectedFile && triggerInput()">
                <div v-if="!selectedFile" class="drop-area">
                    <i class="fas fa-plus-circle add-icon"></i>
                    <p class="drop-text">Choose your bird media</p>
                    <p class="drop-subtext">Images and videos accepted</p>
                </div>
                
                <div v-else class="file-preview">
                    <div class="file-info">
                        <i :class="getFileIcon()" class="file-type-icon"></i>
                        <div class="file-details">
                            <p class="file-name">{{ fileName }}</p>
                            <p class="file-size">{{ getFileSize() }}</p>
                        </div>
                        <button @click="removeFile" class="remove-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <input
                    ref="fileInput"
                    type="file"
                    @change="onFileChange"
                    accept="image/*,video/*"
                    class="hidden-input"
                />
            </div>

            <div v-if="selectedFile" class="tag-section">
                <div class="tag-header">
                    <i class="fas fa-tags"></i>
                    <label>Add Tags</label>
                </div>
                <el-input
                    type="text"
                    v-model="tags"
                    placeholder="e.g., robin, backyard, morning"
                    class="tag-input"
                />
            </div>

            <div class="action-buttons">
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

            <div v-if="uploadSuccess" class="message success-message">
                <i class="fas fa-check-circle"></i>
                <span>Upload successful!</span>
            </div>
            
            <div v-if="error" class="message error-message">
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
        // upload metadata
        //await axios.post('/api/upload-metadata', {
            //request_id: data.request_id,
            //upload_key: data.upload_key,
            //file_name: selectedFile.value.name,
            //tags: tags.value.split(',').map(tag => tag.trim()).filter(Boolean)
        //});
        // tags.value
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
.upload-bg {
    min-height: 100vh;
    width: 100vw;
    background: url('/images/Background.png') center center/cover no-repeat fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.upload-file-container {
    margin: 2rem auto;
    padding: 3rem;
    max-width: 600px;
    width: 100%;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 20px 40px rgba(25, 118, 210, 0.15);
    text-align: center;
}

.upload-header {
    margin-bottom: 2.5rem;
}

.upload-icon {
    font-size: 3rem;
    color: #1976d2;
    margin-bottom: 1rem;
    display: block;
}

.upload-header h3 {
    font-size: 1.8rem;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
    color: #263238;
}

.subtitle {
    color: #78909c;
    font-size: 1rem;
    margin: 0;
}

.upload-zone {
    border: 3px dashed #cfd8dc;
    border-radius: 15px;
    padding: 2.5rem 2rem;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
    cursor: pointer;
    background: #fafafa;
}

.upload-zone:hover {
    border-color: #1976d2;
    background: #e3f2fd;
}

.upload-zone.has-file {
    border-color: #4caf50;
    background: #e8f5e9;
}

.drop-area {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.add-icon {
    font-size: 2.5rem;
    color: #90a4ae;
    margin-bottom: 1rem;
}

.drop-text {
    font-size: 1.3rem;
    font-weight: 600;
    color: #455a64;
    margin: 0 0 0.5rem 0;
}

.drop-subtext {
    font-size: 1rem;
    color: #78909c;
    margin: 0;
}

.file-preview {
    display: flex;
    justify-content: center;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #ffffff;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(38, 50, 56, 0.1);
    max-width: 100%;
}

.file-type-icon {
    font-size: 2rem;
    color: #1976d2;
    flex-shrink: 0;
}

.file-details {
    flex: 1;
    text-align: left;
    min-width: 0;
}

.file-name {
    font-weight: 600;
    color: #263238;
    margin: 0 0 0.25rem 0;
    word-break: break-all;
    font-size: 0.95rem;
}

.file-size {
    color: #78909c;
    margin: 0;
    font-size: 0.85rem;
}

.remove-btn {
    background: none;
    border: none;
    color: #f44336;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.remove-btn:hover {
    background: #ffebee;
    color: #d32f2f;
}

.tag-section {
    margin-bottom: 2rem;
    text-align: left;
}

.tag-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: #263238;
    font-weight: 600;
}

.tag-header i {
    color: #1976d2;
}

.tag-input {
    width: 100%;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

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

.el-button {
    font-size: 1rem;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.el-button i {
    margin-right: 0.5rem;
}

.message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
}

.success-message {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
}

.error-message {
    background: #ffebee;
    color: #d32f2f;
    border: 1px solid #ffcdd2;
}

.hidden-input {
    display: none;
}

@media (max-width: 768px) {
    .upload-file-container {
        padding: 2rem 1.5rem;
        margin: 1rem;
    }
    
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .el-button {
        width: 100%;
        max-width: 250px;
    }
    
    .file-info {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }
    
    .file-details {
        text-align: center;
    }
}
</style>
  