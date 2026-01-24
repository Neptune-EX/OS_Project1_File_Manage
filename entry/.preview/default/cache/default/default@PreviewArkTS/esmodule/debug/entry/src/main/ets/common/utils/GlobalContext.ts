// common/utils/GlobalContext.ets
export class GlobalContext {
    private static instance: GlobalContext = new GlobalContext();
    private objects: Map<string, Object> = new Map();
    private constructor() { }
    public static getContext(): GlobalContext {
        return GlobalContext.instance;
    }
    // 设置全局对象
    public setObject(key: string, object: Object): void {
        this.objects.set(key, object);
    }
    // 获取全局对象
    public getObject(key: string): Object | undefined {
        return this.objects.get(key);
    }
    // 清除对象
    public removeObject(key: string): void {
        this.objects.delete(key);
    }
}
