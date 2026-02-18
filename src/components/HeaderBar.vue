<template>
    <header class="w-full h-[60px] bg-[rgba(40,101,201,0.93)] flex items-center justify-between px-8 relative z-[100] box-border">
        <div class="flex items-center">
            <img class="h-15 mr-1" src="/Logo-neat.svg" alt="Logo" style="cursor:pointer" @click="goToHomepage" />
            <div class="font-[Montserrat,Arial,sans-serif] font-bold text-2xl text-white mr-auto ml-4 tracking-[1.5px] cursor-pointer" @click="goToHomepage">Birdy Shot</div>
        </div>
        <div class="flex items-center gap-[18px]">
                <button class="bg-[#1976d2] text-white border-none rounded-[18px] py-[7px] px-5 text-base cursor-pointer ml-3 transition-colors duration-200 hover:bg-[#145ea8]" @click="goToImageSearch">
                    Reverse Search
                </button>
                <button class="bg-[#1976d2] text-white border-none rounded-[18px] py-[7px] px-5 text-base cursor-pointer ml-3 transition-colors duration-200 hover:bg-[#145ea8]" @click="goToTextSearch">
                    Text Search
                </button>
                <button class="bg-[#1976d2] text-white border-none rounded-[18px] py-[7px] px-5 text-base cursor-pointer ml-3 transition-colors duration-200 hover:bg-[#145ea8]" @click="goToAbout">
                    About
                </button>
                <button class="bg-[#1976d2] text-white border-none rounded-[18px] py-[7px] px-5 text-base cursor-pointer ml-3 transition-colors duration-200 hover:bg-[#145ea8]" @click="cognitoLogin" v-if="!user">
                    Login
                </button>
                <!-- <template v-else>
                    <button class="bg-[#1976d2] text-white border-none rounded-[18px] py-[7px] px-5 text-base cursor-pointer ml-3 transition-colors duration-200 hover:bg-[#145ea8]" @click="profile">
                        Subscribe
                    </button>
                    <button class="bg-[#1976d2] text-white border-none rounded-[18px] py-[7px] px-5 text-base cursor-pointer ml-3 transition-colors duration-200 hover:bg-[#145ea8]" @click="upload">
                        Upload
                    </button>
                    <button class="bg-[#1976d2] text-white border-none rounded-[18px] py-[7px] px-5 text-base cursor-pointer ml-3 transition-colors duration-200 hover:bg-[#145ea8]" @click="cognitoLogout">
                        Logout
                    </button>
                </template> -->
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { isAuthenticated, parseJwt, makeCognitoLoginUrl, makeCognitoLogoutUrl } from '../utils/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchKeyword = ref('');

const user = ref(null);

function cognitoLogin() {
    window.location.href =  makeCognitoLoginUrl()
}

async function cognitoLogout() {
    localStorage.clear();
    user.value = null;

    window.location.href = makeCognitoLogoutUrl()
}

async function profile() {
    router.push('/subscribe');
}

async function upload() {
    router.push('/upload');
}

function goToHomepage() {
    router.push('/');
}

function goToAbout() {
    router.push('/about');
}

function goToTextSearch() {
    router.push('/text-search');
}

function goToImageSearch() {
    router.push('/');
}

function updateUserFromToken() {
    if (isAuthenticated()) {
        user.value = parseJwt(localStorage.getItem('id_token'));
    }
}


onMounted(() => {
    updateUserFromToken()
    // Try again after 1 second. This is an ugly but simple workaround
    setTimeout(() => updateUserFromToken(), 1000)
});

function onSearch(e) {
    if (searchKeyword.value.trim() !== '') {
        router.push({ path: '/query', query: { keyword: searchKeyword.value.trim() } });
        searchKeyword.value = '';
    } else {
        router.push('/query');
    }
}

</script>
