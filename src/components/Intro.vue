<template>
  <section id="intro">
    <div class="content">
      <h1>THIS IS<br>MONASH BIRDY BUDDIES</h1>
      <p>A CLOUD-BASED BIRD IMAGE TAGGING APP</p>
      <ul class="actions">
        <li>
          <a href="#main-content" class="button scrolly">
            <i class="fas fa-arrow-down"></i>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
#intro {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  background: url('/images/bg.jpg') center center/cover no-repeat fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  position: relative;
}
#intro .content {
  color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.7);
}
#intro h1 {
  font-size: 3rem;
  font-weight: bold;
  letter-spacing: 0.06em;
  margin-bottom: 1.5rem;
  font-family: 'Montserrat', Arial, sans-serif;
}
#intro p {
  font-size: 1.25rem;
  font-style: italic;
  margin-bottom: 2rem;
}
.actions .button {
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  border: 2px solid #fff;
  margin: 0 auto;
  transition: background 0.2s;
  text-decoration: none;
}
.actions .button:hover {
  background: rgba(255,255,255,0.3);
}
.actions {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
}
.actions li {
  display: inline-block;
}

</style>
