import { BehaviorSubject } from '../utils/behavior-subject';

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
            this.observeThenApplyStyles(this);
        }

        // Wait for user and config to be loaded, then wait for shadowRoot
        // to be created and add a new style element to it.
        private observeThenApplyStyles = async (element: Element) => {
            console.info('observing element...', element);

            const user = await userPromise;
            console.info('got user', user);
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
                                console.info('element has shadowRoot', element);
                                const shadowRoot = element.shadowRoot;
                                const style = document.createElement('style');
                                style.id = 'custom-kiosk-style';
                                style.textContent = `
                                            .header {
                                                display: none !important;
                                            }
                                            hui-view-container {
                                                padding-top: 0px !important;
                                            }
                                        `;
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
