## Students:

Student: Costi - Iulian Asanache
## branch: feat/foundation-layer/test

Student: Jaimie Mathangi
## branch: feat/domain-layer

## Some thoughts and explaination ##

I'll start with the strange commits that happend, one after another in the first part.

It's because we already did a part first time but I deleted both branch cause they did not match eachtoher's
project and most of the code was wrong either way and rather than to stay to debbug and to go back to versions
I just set up the correct code such that it has conitnuity and i can merge without many conflicts.

The test scenerios are in the "test" branch but not merged into the main branch cuz like this it was eassier to see if I need
to debug. Fortunetly it was not the case. The test scenerios are in the index eitherway.

<!-- Scenario 1 -->

Basic enrollment with event emission
Tests: StudentEnrolled event

<!-- Scenario 2 -->

Tests 80% capacity threshold
Enrolls 4 students in course with capacity 5
Tests: CourseCapacityReached event

<!-- Scenario 3 -->

Tests full capacity (100%)
Enrolls 5 students, attempts 6th
Tests: CourseFull event + rejection

<!-- Scenario 5 -->

Tests 18-credit limit per semester
Enrolls in courses totaling 16 credits
Attempts to add 4 more (fails as expected)

<!-- Scenario 5 -->

Tests enrollment cancellation
Shows before/after status
Tests: EnrollmentCancelled event

## About the code and Architecture ##

┌─────────────────────────────────────────┐
│           CLI Interface                 │
│         (index.ts)                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Application Layer                 │
│   (EnrollmentService)                   │
│   - Orchestrates business logic         │
│   - Emits domain events                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Domain Layer                   │
│   Entities:                             │
│   - Student (credit management)         │
│   - Course (capacity management)        │
│   - Enrollment (status lifecycle)       │
│                                         │
│   Value Objects:                        │
│   - StudentId, CourseCode, Email        │
│   - Credits, Semester, EnrollmentId     │
│                                         │
│   Events:                               │
│   - StudentEnrolled                     │
│   - EnrollmentCancelled                 │
│   - CourseCapacityReached               │
│   - CourseFull                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Infrastructure Layer               │
│   - EventEmitter (Observer Pattern)     │
│   - Event handling and distribution     │
└─────────────────────────────────────────┘

## Implement Branded Types from scratch

    Understand nominal typing in TypeScript
    Apply the Brand<K, T> pattern
    Create smart constructors


## Apply Smart Constructors

    Learn "Parse, Don't Validate" principle
    Return Type | Error for validation
    Enforce invariants at creation time


## Design Value Objects and Entities

    Follow DDD entity patterns
    Implement immutable value objects
    Maintain entity identity


## Build Observer Pattern

    Create typed event system
    Implement subscribe/unsubscribe/emit
    Handle domain events


## Enforce Domain Invariants

    Validate at compile-time (types)
    Validate at runtime (constructors)
    Maintain business rules


## Create Working CLI

    Demonstrate all enrollment scenarios
    Show event-driven architecture
    Handle errors gracefully

## Domain Entities ##
Three entities following DDD principles:

    Student: Credit tracking, enrollment management
    Course: Capacity management, availability tracking
    Enrollment: Status lifecycle, cancellation handling

## Observer Pattern ##
Four domain events with typed handlers:

    StudentEnrolled: When enrollment succeeds
    CourseCapacityReached: At 80% capacity threshold
    CourseFull: At 100% capacity
    EnrollmentCancelled: When enrollment cancelled

## Business Rules ##
All invariants enforced:

    Course Capacity: 1-200 students
    Student Credit Limit: Maximum 18 credits per semester
    Valid Types: All values validated via smart constructors
    Uniqueness: No duplicate enrollments