(function () {
  // https://dashboard.emailjs.com/admin/integration
  emailjs.init("UrrGx9fZvxHzoGU3B");
})();

window.onload = function () {
  document
    .getElementById("contact-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const submitBtn = this.querySelector("button[type='submit']");
      const btnWrap = submitBtn.querySelector(".btn-wrap");
      const textOne = btnWrap.querySelector(".text-one");
      const textTwo = btnWrap.querySelector(".text-two");
      const originalBtnText = textOne.innerHTML;

      // Disable button and show loader
      submitBtn.disabled = true;
      textOne.innerHTML = "Sending...";
      textTwo.innerHTML = "Sending...";

      // these IDs from the previous steps
      emailjs.sendForm("service_t25vz3p", "template_w0q310t", this).then(
        function () {
          console.log("SUCCESS!");
          Swal.fire({
            title: 'Success!',
            text: 'Thank you for contacting us. We have received your message and will get back to you as soon as possible. Our team will reach you shortly.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6421FF'
          }).then(() => {
            // Re-enable button and restore text
            submitBtn.disabled = false;
            textOne.innerHTML = originalBtnText;
            textTwo.innerHTML = originalBtnText;
          });
        },
        function (error) {
          console.log("FAILED...", error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to send message. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6421FF'
          }).then(() => {
            //Re-enable button and restore text
            submitBtn.disabled = false;
            textOne.innerHTML = originalBtnText;
            textTwo.innerHTML = originalBtnText;
          });
        }
      );
    });
};
