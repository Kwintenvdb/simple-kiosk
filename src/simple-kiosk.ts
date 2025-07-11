import { BehaviorSubject } from './utils/behavior-subject';
import { patchHuiRootConstructor } from './patches/hui-root-patch';
import { getUserAsync } from './init/fetch-user';
import { version } from '../package.json';


async function main() {
    console.info(
        `%c Simple Kiosk \n%c Version ${version} `,
        'color: white; font-weight: bold; background: dodgerblue',
        'color: white; font-weight: bold; background: dimgray'
    );

    // Use query param 'disable_kiosk' to temporarily disable simple kiosk on current page.
    const queryParams = new URLSearchParams(document.location.search);
    const disabled = queryParams.get('disable_kiosk');
    if (!disabled) {
        const userPromise: Promise<User> = getUserAsync();
        const lovelaceConfig = new BehaviorSubject<LovelaceConfig>({});
        patchStyles(userPromise, lovelaceConfig);
    }
}

function patchStyles(
    userPromise: Promise<User>,
    lovelaceConfig: BehaviorSubject<LovelaceConfig>,
) {
    const define = window.CustomElementRegistry.prototype.define;
    window.CustomElementRegistry.prototype.define = function (
        name: string,
        constructor: CustomElementConstructor,
        options: ElementDefinitionOptions,
    ) {
        // TODO clean up code
        if (name == 'hui-root') {
            constructor = patchHuiRootConstructor(constructor, userPromise, lovelaceConfig);
        }

        if (name == 'ha-panel-lovelace') {
            console.debug('Intercepting ha-panel-lovelace at define-time');

            const proto = constructor.prototype;
            const origSetConfig = proto._setLovelaceConfig;
            proto._setLovelaceConfig = function (config: any, rawConfig: any, mode: any) {
                origSetConfig.call(this, config, rawConfig, mode);
                console.debug('Intercepted Lovelace config', config);
                lovelaceConfig.set(config);
            };

            // Sometimes, it appears define() was already called before the monkey patch could be installed.
            // We try to patch it immediately... 
            const HaPanelLovelace = customElements.get('ha-panel-lovelace');
            if (HaPanelLovelace) {
                console.debug('ha-panel-lovelace already defined, patching...')
                const proto = HaPanelLovelace.prototype;
                if (!proto._setLovelaceConfig.__patched) {
                    const original = proto._setLovelaceConfig;
                    proto._setLovelaceConfig = function (config: any, raw: any, mode: any) {
                        original.call(this, config, raw, mode);
                        console.debug('Intercepted Lovelace config', config);
                        lovelaceConfig.set(config);
                    };
                    proto._setLovelaceConfig.__patched = true;
                }
            }
        }

        return define.call(this, name, constructor, options);
    };
}

main();
