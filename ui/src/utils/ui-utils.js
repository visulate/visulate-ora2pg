export const UIUtils = {
    // Display notifications (e.g 'Saved') at bottom of screen
    showMessage(messageText) {
        const notification = document.querySelector(".mdl-js-snackbar");
        notification.MaterialSnackbar.showSnackbar({
          message: messageText,
        });
      },
}