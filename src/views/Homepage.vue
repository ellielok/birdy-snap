<template>
    <section class="homepage-bg">
        <div class="homepage-overlay">
            <div class="intro-card">
            <h1 class="homepage-title">Monash Birdy Buddies</h1>
            <p>
                Monash Birdy Buddies (MBB) is a group of researchers, students, and staff who love everything about birds at Monash University.
                We explore the amazing world of birds—from tiny wrens to majestic raptors. Over the years, MBB has expanded to multiple Monash campuses worldwide.
            </p>
            <p>
                MBB captures stunning bird photos, unique calls, and fascinating videos for research. To make this data accessible, we are building an AWS-based online system where users can store, organise, and retrieve media files with auto-generated and manual tags.
            </p>
            <p>
                This ensures that valuable observations are safe, organised, and easy to share, supporting robust research and bird conservation efforts.
            </p>
            </div>
            <div class="homepage-btn">
                <button @click="goToQuery" class="start-btn">
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
  
<style scoped>
.homepage-bg {
    background-image: url('/images/Background.png');
    min-height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
  
.homepage-overlay {
    width: 100%;
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
  
.intro-card {
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
    border-radius: 24px;
    padding: 2.5rem 2.5rem 2rem 2.5rem;
    max-width: 600px;
    backdrop-filter: blur(6px);
    margin-top: 60px;
}
  
.homepage-title {
    font-size: 2.4rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #212121;
    text-align: center;
    letter-spacing: 1px;
}
  
.intro-card p {
    margin: 1.2rem 0;
    font-size: 1.1rem;
    line-height: 1.75;
    color: #333;
    text-align: left;
}
  
.homepage-btn {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 120px;
}
  
@media (max-width: 600px) {
.intro-card {
    padding: 1.2rem 0.6rem 1rem 0.6rem;
    max-width: 96vw;
}
.homepage-title {
    font-size: 1.3rem;
}
.homepage-btn {
    height: 80px;
}
}

.start-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px 0 rgba(102, 126, 234, 0.4);
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.6);
}

.start-btn:active {
    transform: translateY(0);
}
</style>
  