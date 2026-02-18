<template>
    <section class="bg-[url('/images/Background.png')] min-h-screen bg-cover bg-center bg-no-repeat w-full relative flex flex-col justify-center">
        <div class="w-full min-h-[80vh] flex flex-col justify-center items-center">
            <div class="bg-white/88 shadow-[0_8px_32px_0_rgba(31,38,135,0.18)] rounded-3xl px-10 pt-10 pb-8 max-w-[800px] backdrop-blur-[6px] mt-[60px] max-[600px]:px-[0.6rem] max-[600px]:pt-[1.2rem] max-[600px]:pb-4 max-[600px]:max-w-[96vw]">
            <h1 class="text-[2.4rem] font-bold mb-4 text-[#212121] text-center tracking-[1px] max-[600px]:text-[1.3rem]">Birdy Snap</h1>
            <p class="my-[1.2rem] text-[1.1rem] leading-[1.75] text-[#333] text-left">
                Birdy Snap is a cloud-based platform designed for bird enthusiasts, researchers, and nature photographers. Users can upload bird images and videos, which are automatically tagged with detected bird species using a pretrained deep learning model. Files can then be searched and retrieved based on these tags.
            </p>

            <h2 class="text-[1.3rem] font-semibold mt-6 mb-3 text-[#1976d2]">Currently Available</h2>
            <ul class="my-[0.8rem] text-[1.05rem] leading-[1.75] text-[#333] text-left pl-5 list-disc">
                <li><strong>Reverse Image Search</strong>: Upload a bird photo to find visually similar images in the database.</li>
                <li><strong>Text Search</strong>: Search for files by bird species tags, with support for tag-with-count queries.</li>
            </ul>

            <h2 class="text-[1.3rem] font-semibold mt-6 mb-3 text-[#1976d2]">Coming Soon</h2>
            <ul class="my-[0.8rem] text-[1.05rem] leading-[1.75] text-[#333] text-left pl-5 list-disc">
                <li><strong>File Upload</strong>: Upload bird images and videos to S3 with automatic species detection.</li>
                <li><strong>Tag Subscription & Notifications</strong>: Subscribe to bird tags and receive email notifications when new matching files are added.</li>
                <li><strong>Manual Tag Management</strong>:Add or remove tags from files with bulk tagging support.</li>
                <li><strong>File Deletion</strong>:Remove files and their thumbnails from S3 and the database.</li>
            </ul>

            <div class="my-[1.2rem] py-3 px-4 bg-[#e8f0fe] border-l-4 border-[#1976d2] rounded-r-lg text-[0.95rem] leading-[1.6] text-[#333]">
                <strong>Note:</strong> Some features (tag subscription, file upload, etc.) are temporarily paused due to AWS credit limitations. They will be re-enabled once additional resources are available.
            </div>
            </div>
            <div class="flex justify-center items-end h-[120px] max-[600px]:h-[80px]">
                <button @click="goToSearch" class="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-4 px-8 text-[1.2rem] font-semibold rounded-[50px] cursor-pointer transition-all duration-300 shadow-[0_4px_15px_0_rgba(102,126,234,0.4)] tracking-[0.5px] uppercase hover:-translate-y-0.5 hover:shadow-[0_6px_20px_0_rgba(102,126,234,0.6)] active:translate-y-0">
                    Start Exploring
                </button>
            </div>
        </div>
    </section>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
    name: 'Homepage',
    setup() {
        const router = useRouter()

        const goToSearch = () => {
            router.push({ path: "/reverse-search" })
        }

        return {
            goToSearch
        }
    }
}
</script>
