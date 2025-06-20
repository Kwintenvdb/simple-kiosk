interface HTMLElement {
    connectedCallback(): void;
    disconnectedCallback(): void;
}

interface HomeAssistantElement extends Element {
    hass?: {
        user?: User;
    };
}

interface User {
    id: string;
    name: string;
    is_admin: boolean;
    is_owner: boolean;
}

interface LovelaceConfig {
    kiosk_config?: {
        enabled: boolean;
        users?: string[];
    };
}
