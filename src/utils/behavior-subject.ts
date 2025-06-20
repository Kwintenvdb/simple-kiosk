type Listener<T> = (value: T) => void;

/**
 * A dead simple RxJS-like BehaviorSubject.
 * Emits its current value on subscription, and emits every time a new value is set.
 */
export class BehaviorSubject<T> {
    private _value: T;
    private listeners = new Set<Listener<T>>();

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    get value(): T {
        return this._value;
    }

    set(value: T) {
        this._value = value;
        this.listeners.forEach((listener) => listener(value));
    }

    subscribe(listener: Listener<T>): () => void {
        // Immediately emit current value to new subscriber
        listener(this._value);

        this.listeners.add(listener);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }
}
