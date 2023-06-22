export default abstract class Base {
    public static storage: any[];
    public static find: (id: string) => unknown;
    public static remove: (model: any) => unknown;
    public static save: (model: any) => unknown;

    public id!: string;

    public asJSON(): string {
        return JSON.stringify(
            this,
            (_key, value) => {
                if (value instanceof Set) {
                    return [...value];
                } else if (value instanceof Function) {
                    return undefined;
                }
                return value;
            }
        );
    }
}
