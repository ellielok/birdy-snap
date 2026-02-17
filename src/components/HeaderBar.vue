<template>
    <header class="header-bar">
        <div class="header-left">
            <img class="logo" src="/images/Monash_University_logo.png" alt="Monash Logo" style="cursor:pointer" @click="goToHomepage" />
            <div class="title" @click="goToHomepage">Monash Birdy Buddies</div>
        </div>
        <div class="header-right">
                <button class="auth-btn" @click="goToAbout">
                    About
                </button>
                <button class="auth-btn" @click="cognitoLogin" v-if="!user">
                    Login
                </button>
                <template v-else>
                    <!-- <p class="current-user"><span class="secondary-text">Logged in as</span> <span class="username">{{ user["cognito:username"] }}</span></p> -->
                    <button class="auth-btn" @click="profile">
                        Subscribe
                    </button>
                    <button class="auth-btn" @click="upload">
                        Upload
                    </button>
                    <button class="auth-btn" @click="cognitoLogout">
                        Logout
                    </button>
                </template>         
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

<style scoped>
.header-bar {
    width: 100%;
    height: 60px;
    background: rgba(40, 101, 201, 0.93);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: relative;
    z-index: 100;
    box-sizing: border-box;
}

.header-left {
    display: flex;
    align-items: center;
}

.logo {
    height: 40px;
    margin-right: 20px;
}
  
.title {
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    color: #fff;
    margin-right: auto;
    margin-left: 16px;
    letter-spacing: 1.5px;
    cursor: pointer;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 18px;
}

.search-wrapper {
    margin-left: auto;
    margin-right: 24px;
}
  
.search-input {
    padding: 6px 14px;
    border-radius: 7px;
    border: none;
    font-size: 1rem;
    color: #fff;
    padding-left: 10px;
}
  
.auth-btn {
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 18px;
    padding: 7px 20px;
    font-size: 1rem;
    cursor: pointer;
    margin-left: 12px;
    transition: background 0.2s;
}
.auth-btn:hover {
    background: #145ea8;
}

.current-user {
    color: #fff;
    font-size: 1rem;
    margin-right: 12px;
}

.secondary-text {
   opacity: 0.8;
}

.username {
    font-weight: 700;
}
</style>
  