    (function () {
        // https://dashboard.emailjs.com/admin/integration
        emailjs.init('3dpw3MyafCpWF6vYj');
    })();

    window.onload = function () {
        document.getElementById('contact-form').addEventListener('submit', function (event) {
            event.preventDefault();
            // these IDs from the previous steps
            emailjs.sendForm('service_zxe3f0t', 'template_gil3jip', this)
                .then(function () {
                    console.log('SUCCESS!');
                    document.getElementById('contact-form').reset();
                    document.getElementById('success-modal').style.display = 'block';
                }, function (error) {
                    console.log('FAILED...', error);
                    alert('Failed to send message. Please try again later.');
                });
        });

        // Close the modal
        document.querySelector('.close').addEventListener('click', function() {
            document.getElementById('success-modal').style.display = 'none';
        });

        // Close the modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target == document.getElementById('success-modal')) {
                document.getElementById('success-modal').style.display = 'none';
            }
        });
    }