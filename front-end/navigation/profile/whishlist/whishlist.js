// Page-specific behavior for whishlist.html
if (!document.querySelector('script[data-shared-script]')) {
  const sharedScript = document.createElement('script');
  sharedScript.src = '../../index.js';
  sharedScript.dataset.sharedScript = 'true';
  document.head.appendChild(sharedScript);
}
document.body.dataset.page = 'whishlist';
