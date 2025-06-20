// Asynchronously initialize the user object stored on home-assistant element.
// function getUserAsync(): Promise<User> {
//     const homeAssistant = document.querySelector('home-assistant') as HomeAssistantElement;
//     // TODO maximum interval and error handling
//     return new Promise((resolve, _) => {
//         const t = setInterval(() => {
//             if (homeAssistant.hass?.user) {
//                 clearInterval(t);
//                 resolve(homeAssistant.hass?.user);
//             }
//         }, 10);
//     });
// }

function getUserAsync(): Promise<User> {
    const homeAssistant = document.querySelector('home-assistant') as HomeAssistantElement;
    // TODO maximum interval and error handling
    return new Promise((resolve, _) => {
        if (homeAssistant.hass?.user) {
            resolve(homeAssistant.hass.user);
            return;
        }

        const observer = new MutationObserver(() => {
            if (homeAssistant.hass?.user) {
                console.debug('User found on hass object', homeAssistant.hass?.user);
                observer.disconnect();
                resolve(homeAssistant.hass?.user);
            }
        });
        observer.observe(homeAssistant, {
            attributes: true,
            childList: true,
            subtree: true,
        });
        // const t = setInterval(() => {
        //     if (homeAssistant.hass?.user) {
        //         clearInterval(t);
        //         resolve(homeAssistant.hass?.user);
        //     }
        // }, 10);
    });
}
