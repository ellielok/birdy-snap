<template>
    <section class="bg-[url('/images/Background.png')] min-h-screen bg-cover bg-center bg-no-repeat w-full relative flex flex-col justify-center">
        <div class="w-full min-h-[80vh] flex flex-col justify-center items-center">
            <div class="bg-white/88 shadow-[0_8px_32px_0_rgba(31,38,135,0.18)] rounded-3xl px-10 pt-10 pb-8 max-w-[600px] backdrop-blur-[6px] mt-[60px] max-[600px]:px-[0.6rem] max-[600px]:pt-[1.2rem] max-[600px]:pb-4 max-[600px]:max-w-[96vw]">
            <h1 class="text-[2.4rem] font-bold mb-4 text-[#212121] text-center tracking-[1px] max-[600px]:text-[1.3rem]">Birdy Shot</h1>
            <p class="my-[1.2rem] text-[1.1rem] leading-[1.75] text-[#333] text-left">
                Birdy Shot is a group of researchers, students, and staff who love everything about birds at Monash University.
                We explore the amazing world of birds—from tiny wrens to majestic raptors. Over the years, MBB has expanded to multiple Monash campuses worldwide.
            </p>
            <p class="my-[1.2rem] text-[1.1rem] leading-[1.75] text-[#333] text-left">
                MBB captures stunning bird photos, unique calls, and fascinating videos for research. To make this data accessible, we are building an AWS-based online system where users can store, organise, and retrieve media files with auto-generated and manual tags.
            </p>
            <p class="my-[1.2rem] text-[1.1rem] leading-[1.75] text-[#333] text-left">
                This ensures that valuable observations are safe, organised, and easy to share, supporting robust research and bird conservation efforts.
            </p>
            </div>
            <div class="flex justify-center items-end h-[120px] max-[600px]:h-[80px]">
                <button @click="goToQuery" class="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-4 px-8 text-[1.2rem] font-semibold rounded-[50px] cursor-pointer transition-all duration-300 shadow-[0_4px_15px_0_rgba(102,126,234,0.4)] tracking-[0.5px] uppercase hover:-translate-y-0.5 hover:shadow-[0_6px_20px_0_rgba(102,126,234,0.6)] active:translate-y-0">
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

        const goToQuery = () => {
            router.push({ path: "/query" })
        }

        return {
            goToQuery
        }
    }
}
</script>
