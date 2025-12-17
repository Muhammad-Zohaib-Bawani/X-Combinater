(function () {
  // https://dashboard.emailjs.com/admin/integration
  emailjs.init("3dpw3MyafCpWF6vYj");
})();

window.onload = function () {
  document
    .getElementById("contact-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      
      const submitBtn = this.querySelector("button[type='submit']");
      const originalBtnText = submitBtn.innerHTML;

      // Disable button and show loader
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending...";

      emailjs.sendForm("service_zxe3f0t", "template_gil3jip", this).then(
        function () {
          console.log("SUCCESS!");
         Swal.fire({
            title: 'Success!',
            text: 'Thank you for contacting us. We have received your message and will get back to you as soon as possible. Our team will reach you shortly.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff9800'
          }).then(() => {
            // Re-enable button and restore text
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            document.getElementById("contact-form").reset();
          });
        },
        function (error) {
          console.log("FAILED...", error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to send message. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff9800'
          }).then(() => {
                // Re-enable button and restore text
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
          });
        }
      );
    });
};