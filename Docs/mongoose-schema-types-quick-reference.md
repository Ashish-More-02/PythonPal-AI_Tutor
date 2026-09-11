# Mongoose Schema Types — Quick Reference

A quick checklist for defining field types in Mongoose models.

---

## Core Schema Types — Memorize These

- [ ] `String` — text
- [ ] `Number` — numeric values
- [ ] `Boolean` — `true` / `false`
- [ ] `Date` — dates and timestamps
- [ ] `ObjectId` — MongoDB document identifiers / references
- [ ] `Array` — lists of values
- [ ] `Map` — key-value collections
- [ ] `Mixed` — flexible/unstructured values

---
## The full set of Schema Types.
| Type       | Stores        | Notes                                                 |
| ---------- | ------------- | ----------------------------------------------------- |
| String     | text          | trim, lowercase, match, enum, minlength               |
| Number     | int/float     | min, max. No separate int type                        |
| Boolean    | true/false    | casts "true", 1, "yes"                                |
| Date       | timestamp     | what {timestamps: true} uses                          |
| ObjectId   | 12-byte id    | references, pairs with ref                            |
| Buffer     | binary        | small files, image blobs                              |
| Mixed      | anything      | no schema, no validation                              |
| Array      | list          | [String], [ObjectId], or [{...}]                      |
| Map        | dynamic keys  | when keys are data, e.g. { "en": "...", "hi": "..." } |
| Decimal128 | exact decimal | money. Number is a float and will betray you          |
| UUID       | RFC-4122      | alternative to ObjectId                               |
| BigInt     | 64-bit int    | beyond Number.MAX_SAFE_INTEGER                        |

---

## 1. String

```js
name: String;
```

Explicit form:

```js
name: {
  type: String,
  required: true
}
```

Use for text.

---

## 2. Number

```js
age: Number;
```

Use for normal numeric values.

---

## 3. Boolean

```js
isActive: Boolean;
```

Use for `true` / `false`.

---

## 4. Date

```js
createdAt: Date;
```

Common with timestamps:

```js
const userSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true },
);
```

---

## 5. ObjectId ⭐

```js
userId: mongoose.Schema.Types.ObjectId;
```

Common reference form:

```js
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

### Mental model

```text
mongoose
   ↓
Schema
   ↓
Types
   ↓
ObjectId
```

`ObjectId` is a MongoDB/Mongoose-specific identifier type.

Use it when a field stores the ID of another MongoDB document.

---

## 6. Array

Simple:

```js
tags: [String];
```

Other examples:

```js
scores: [Number];

isVerified: [Boolean];

userIds: [mongoose.Schema.Types.ObjectId];
```

Mental model:

```text
Array
  ↓
type of each element
```

---

## 7. Map

```js
settings: {
  type: Map,
  of: String
}
```

Useful for dynamic key-value data.

Example value:

```js
{
  theme: "dark",
  language: "english"
}
```

---

## 8. Mixed

```js
metadata: {
  type: mongoose.Schema.Types.Mixed;
}
```

Allows flexible/unstructured data where Mongoose does not enforce a specific schema type.

---

# Specialized / Less Common Types

These exist, but don't prioritize memorizing them for normal MERN development.

- [ ] `Buffer` — binary data
- [ ] `Decimal128` — high-precision decimal numbers
- [ ] `BigInt` — very large integers
- [ ] `UUID` — UUID values
- [ ] `Double` — BSON double values
- [ ] `Int32` — BSON 32-bit integer values

Examples:

```js
data: Buffer;

price: mongoose.Schema.Types.Decimal128;

largeCount: BigInt;

externalId: mongoose.Schema.Types.UUID;

value: mongoose.Schema.Types.Double;

count: mongoose.Schema.Types.Int32;
```

---

# The Big Picture

All of these answer the same fundamental question:

> **"What kind of value can this field contain?"**

```text
Mongoose Schema
│
├── Primitive / common
│   ├── String
│   ├── Number
│   ├── Boolean
│   └── Date
│
├── MongoDB-specific
│   └── ObjectId
│
├── Collection / flexible
│   ├── Array
│   ├── Map
│   └── Mixed
│
└── Specialized
    ├── Buffer
    ├── Decimal128
    ├── BigInt
    ├── UUID
    ├── Double
    └── Int32
```

---

# Common Schema Patterns

## Simple fields

```js
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  isActive: Boolean,
  birthDate: Date,
});
```

## Field with options

```js
name: {
  type: String,
  required: true,
  trim: true,
  maxlength: 100
}
```

## Reference to another document

```js
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

## Array of references

```js
friends: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
];
```

## Array of objects

```js
addresses: [
  {
    city: String,
    country: String,
  },
];
```

## Map

```js
settings: {
  type: Map,
  of: String
}
```

---

# What to Memorize vs Look Up

### Memorize

```text
String
Number
Boolean
Date
ObjectId
Array
Map
Mixed
```

### Know conceptually

```text
Schema
  ↓
fields
  ↓
each field has a SchemaType
```

### Look up when needed

```text
Buffer
Decimal128
BigInt
UUID
Double
Int32
```

> **Rule:** You don't need to memorize the entire Mongoose API. Build the conceptual map first, then look up uncommon syntax when you encounter a real use case.
