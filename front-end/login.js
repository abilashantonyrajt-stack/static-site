<<<<<<< HEAD
﻿const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});
=======
﻿// Page-specific behavior for login.html
if (!document.querySelector('script[data-shared-script]')) {
  const sharedScript = document.createElement('script');
  sharedScript.src = './index.js';
  sharedScript.dataset.sharedScript = 'true';
  document.head.appendChild(sharedScript);
}
document.body.dataset.page = 'login';
>>>>>>> e44cc65c0961c7288c65660d4fe77a04f4c178d7
