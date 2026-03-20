export abstract class BaseEntity<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  equals(other: BaseEntity<T>): boolean {
    if (!other) {
      return false;
    }

    if (!(other instanceof BaseEntity)) {
      return false;
    }

    return this._id === other._id;
  }

  protected clone(updates: Partial<this>): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this, updates);
  }
}

export function isEntity(value: unknown): value is BaseEntity<unknown> {
  return value instanceof BaseEntity;
}
