
import { BaseEntity } from "./base_entity";
import { CourseCode, Credits } from "./branded_types";

export class Course extends BaseEntity<CourseCode> {
  private readonly _name: string;
  private readonly _credits: Credits;
  private readonly _capacity: number;
  private _enrolledCount: number;

  constructor(
    code: CourseCode,
    name: string,
    credits: Credits,
    capacity: number,
    enrolledCount: number = 0
  ) {
    super(code);

    // Validate capacity
    if (capacity < 1 || capacity > 200) {
      throw new Error(
        `Invalid capacity: ${capacity}. Course capacity must be between 1 and 200`
      );
    }

    // Validate enrolled count
    if (enrolledCount < 0 || enrolledCount > capacity) {
      throw new Error(
        `Invalid enrolled count: ${enrolledCount}. Must be between 0 and ${capacity}`
      );
    }

    this._name = name;
    this._credits = credits;
    this._capacity = capacity;
    this._enrolledCount = enrolledCount;
  }

  get code(): CourseCode {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get credits(): Credits {
    return this._credits;
  }

  get capacity(): number {
    return this._capacity;
  }

  get enrolledCount(): number {
    return this._enrolledCount;
  }

  isFull(): boolean {
    return this._enrolledCount >= this._capacity;
  }

  hasAvailableSpots(): boolean {
    return this._enrolledCount < this._capacity;
  }

  getAvailableSpots(): number {
    return this._capacity - this._enrolledCount;
  }

  getCapacityPercentage(): number {
    return Math.round((this._enrolledCount / this._capacity) * 100);
  }

  hasReached80PercentCapacity(): boolean {
    const percentage = this.getCapacityPercentage();
    return percentage >= 80 && percentage < 100;
  }

  isAtExactly80PercentThreshold(): boolean {
    // Check if the current enrollment count puts us at or just over 80%
    const previousPercentage = Math.round(
      ((this._enrolledCount - 1) / this._capacity) * 100
    );
    const currentPercentage = this.getCapacityPercentage();

    return previousPercentage < 80 && currentPercentage >= 80;
  }

  incrementEnrolledCount(): Course | Error {
    if (this.isFull()) {
      return new Error(
        `Cannot enroll: Course ${this.code} (${this.name}) is at full capacity (${this.capacity})`
      );
    }

    return new Course(
      this._id,
      this._name,
      this._credits,
      this._capacity,
      this._enrolledCount + 1
    );
  }

  decrementEnrolledCount(): Course | Error {
    if (this._enrolledCount === 0) {
      return new Error(
        `Cannot decrement: Course ${this.code} has no enrollments`
      );
    }

    return new Course(
      this._id,
      this._name,
      this._credits,
      this._capacity,
      this._enrolledCount - 1
    );
  }

  getSummary(): string {
    const percentage = this.getCapacityPercentage();
    const available = this.getAvailableSpots();
    const status = this.isFull()
      ? "FULL"
      : this.hasReached80PercentCapacity()
      ? "ALMOST FULL"
      : "AVAILABLE";

    return `${this.code} - ${this.name}\n  Credits: ${this.credits} | Capacity: ${this.enrolledCount}/${this.capacity} (${percentage}%) | Status: ${status} | Available: ${available}`;
  }
}

