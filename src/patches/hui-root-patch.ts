import { BehaviorSubject } from '../utils/behavior-subject';

const huiRootStyle = `
.header {
    display: none !important;
}

hui-view-container {
    padding-top: 0px !important;
}
`;

/**
 * The hui-root element contains a shadowRoot in which we will find the header
 * and the hui-view-container element below it. We wait for the elements to exist,
 * then hide the header and remove the extra top padding of the hui-view-container.
 *
 * @param constructor the constructor of the hui-root custom element, at define time
 * @param userPromise the user information which we are retrieving asynchronously
 * @param lovelaceConfig the dashboard config; so we know if this plugin is enabled, and for which users
 * @returns the patched hui-root constructor
 */
export function patchHuiRootConstructor(
    constructor: CustomElementConstructor,
    userPromise: Promise<User>,
    lovelaceConfig: BehaviorSubject<LovelaceConfig>,
): CustomElementConstructor {
    console.debug('Patching hui-root constructor...')
    class PatchedElement extends constructor {
        private _unsubscribeToLovelaceConfig?: () => void;
        private _observer!: MutationObserver;

        constructor(...params: any[]) {
            super(...params);
            // Start observing this element at construction time.
            // Ensures we get notified about the shadowRoot creation
            // as quickly as possible.
            this.observeThenApplyStyles(this);
        }

        // Wait for user and config to be loaded, then wait for shadowRoot
        // to be created and add a new style element to it.
        private observeThenApplyStyles = async (element: Element) => {
            const user = await userPromise;
            this._unsubscribeToLovelaceConfig = lovelaceConfig.subscribe(config => {
                console.info('got config', config);

                if (config.kiosk_config?.enabled) {
                    const enabledForUser =
                        // Either no users config, or users contains the current user's name
                        !config.kiosk_config?.users ||
                        config.kiosk_config.users.length === 0 ||
                        config.kiosk_config.users.includes(user.name);

                    if (enabledForUser) {
                        this._observer = new MutationObserver(async () => {
                            if (element.shadowRoot) {
                                console.debug('Found hui-root shadowRoot, adding custom style', element);
                                const shadowRoot = element.shadowRoot;
                                const style = document.createElement('style');
                                style.id = 'simple-kiosk-style';
                                style.textContent = huiRootStyle;
                                shadowRoot.appendChild(style);
                            }
                        });
                        this._observer.observe(element, {
                            childList: true,
                            subtree: true,
                            characterData: true,
                            attributes: true,
                        });
                    }
                }
            });
        }

        disconnectedCallback() {
            super.disconnectedCallback && super.disconnectedCallback();
            if (this._unsubscribeToLovelaceConfig) {
                console.debug('hui-root disconnected, unsubscribing...');
                this._unsubscribeToLovelaceConfig();
                this._unsubscribeToLovelaceConfig = undefined;
            }

            if (this._observer) {
                console.debug('hui-root disconnected, disconnecting MutationObserver...');
                this._observer.disconnect();
            }
        }
    }
    return PatchedElement;
}
