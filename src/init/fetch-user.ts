// Asynchronously initialize the user object stored on home-assistant element.
// Sadly uses a not-so-reliable polling approach, as a MutationObserver
// approach did not seem to work here.
export function getUserAsync(): Promise<User> {
    return new Promise((resolve, reject) => {
        const homeAssistant = document.querySelector('home-assistant') as any;
        if (!homeAssistant) return reject('home-assistant element not found');

        if (homeAssistant.hass?.user) {
            resolve(homeAssistant.hass.user);
            return;
        }

        const maxAttempts = 500;
        let attempts = 0;

        const interval = setInterval(() => {
            if (homeAssistant.hass?.user) {
                console.debug('Got user info', homeAssistant.hass.user);
                clearInterval(interval);
                resolve(homeAssistant.hass.user);
            } else if (++attempts >= maxAttempts) {
                clearInterval(interval);
                reject('User not available after 5 seconds');
            }
        }, 10);
    });
}
