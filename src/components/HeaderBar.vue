<template>
    <header class="w-full h-15 bg-[rgba(40,101,201,0.93)] flex items-center justify-between px-8 max-lg:px-4 relative z-[100] box-border">
        <div class="flex items-center">
            <img class="h-15 mr-1" src="/Logo-neat.svg" alt="Logo" style="cursor:pointer" @click="goToHomepage" />
            <div class="font-[Montserrat,Arial,sans-serif] font-bold text-2xl text-white mr-auto ml-4 tracking-[1.5px] cursor-pointer" @click="goToHomepage">Birdy Shot</div>
        </div>

        <!-- Desktop nav -->
        <div class="hidden lg:flex items-center gap-[18px]">
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

        <!-- Hamburger button (sm/md) -->
        <button class="lg:hidden flex flex-col justify-center items-center gap-[5px] bg-transparent border-none cursor-pointer p-2" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
            <span class="block w-6 h-[3px] bg-white rounded transition-all duration-300" :class="{ 'rotate-45 translate-y-2': menuOpen }"></span>
            <span class="block w-6 h-[3px] bg-white rounded transition-all duration-300" :class="{ 'opacity-0': menuOpen }"></span>
            <span class="block w-6 h-[3px] bg-white rounded transition-all duration-300" :class="{ '-rotate-45 -translate-y-2': menuOpen }"></span>
        </button>

        <!-- Mobile dropdown menu -->
        <div v-show="menuOpen" class="lg:hidden absolute top-[60px] left-0 w-full bg-[rgba(40,101,201,0.97)] backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.2)] z-[99] flex flex-col py-2 transition-all duration-250 ease-out origin-top" :class="menuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'">
            <button class="w-full text-left text-white bg-transparent border-none py-3 px-8 text-base cursor-pointer transition-colors duration-200 hover:bg-white/15" @click="navTo(goToImageSearch)">
                Reverse Search
            </button>
            <button class="w-full text-left text-white bg-transparent border-none py-3 px-8 text-base cursor-pointer transition-colors duration-200 hover:bg-white/15" @click="navTo(goToTextSearch)">
                Text Search
            </button>
            <button class="w-full text-left text-white bg-transparent border-none py-3 px-8 text-base cursor-pointer transition-colors duration-200 hover:bg-white/15" @click="navTo(goToAbout)">
                About
            </button>
            <button v-if="!user" class="w-full text-left text-white bg-transparent border-none py-3 px-8 text-base cursor-pointer transition-colors duration-200 hover:bg-white/15" @click="navTo(cognitoLogin)">
                Login
            </button>
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
const menuOpen = ref(false);

function navTo(fn) {
    menuOpen.value = false;
    fn();
}

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
