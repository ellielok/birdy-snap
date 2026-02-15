<template>
    <footer id="footer" class="footer">
      <div class="footer-content">
        <div class="footer-info">
            <section>
                <h3>Address</h3>
                <p>Monash University, Clayton VIC 3168</p>
            </section>
            <section>
                <h3>Phone</h3>
                <p><a href="#">(+61) 03-9902-6000</a></p>
            </section>  
            <section>
                <h3>Email</h3>
                <p><a href="#">MMB_Info@monash.edu</a></p>
            </section>       
        </div>
        <div class="footer-social">
            
            <section>
                <h3>Social</h3>
                <ul class="icons alt">
                    <li><a href="#" class="icon brands alt fa-twitter"><span class="label">Twitter</span></a></li>
                    <li><a href="#" class="icon brands alt fa-facebook-f"><span class="label">Facebook</span></a></li>
                    <li><a href="#" class="icon brands alt fa-instagram"><span class="label">Instagram</span></a></li>
                    <li><a href="#" class="icon brands alt fa-github"><span class="label">GitHub</span></a></li>
                </ul>
            </section>
        </div>
      </div>
      <!-- Copyright -->
      <div id="copyright" style="color: #666; padding: 10px; text-align: center;">
        <ul><li>&copy; 2025 Monash Birdy Buddies. All rights reserved.</li></ul>
      </div>
    </footer>
</template>
  

<style>
    .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 20px 0 20px;
    }

    .footer-info {
    flex: 2;
    min-width: 280px;
    }

    .footer-info section {
    margin-bottom: 20px;
    }

    .footer-social {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    }

    .footer-social h3 {
    margin-bottom: 10px;
    }

    .footer-social .icons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 0;
    }

    .footer-social .icons li {
    list-style: none;
    }
</style>