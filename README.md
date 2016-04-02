# merkle-paths

WIP Hierarchical pathing scheme to traverse in and across merkle trees - merkle dags. (eventually IPLD)

## Pathing examples

### Without hash/merkle links

```
_hash_
{
  "name": "Nicola",
  "friends": [{
    name: "Adam"
  }]
}


/_hash_/name
"Nicola"

/_hash_/friends
[{
  name: "Adam"
}]

/_hash_/friends/0
{
  name: "Adam"
}

/_hash_/friends/0/name
"Adam"

```

### With hash links

```
_hash1_
{
  "name": "Nicola",
  "surname": Link({@link: _hash3_})
  "friends": [Link({
    @link: _hash3_
  })]
}

_hash2_
{
  name: "Adam"
}

_hash3_
"Greco"

/_hash1_/surname
"Greco"

/_hash1_/friends
[Link({
  @link: _hash2_
})]

/_hash1_/friends/0
{
  name: "Adam"
}

/_hash1_/friends/0/name
"Adam"
```

### With data about the link

```
_hash1_
{
  "name": "Nicola",
  "friends": [Link({
    @link: _hash_2,
    nickname: "yala"
  })]
}

_hash2_
{
  name: "Adam"
}

/_hash1_/friends
[Link({
  @link: _hash_2,
  nickname: "yala"
})]

/_hash1_/friends/0
{
  name: "Adam"
}

/_hash1_/friends/0/name
"Adam"

/_hash1_/friends/0/nickname
undefined

/_hash1_/friends/0#nickname
"yala"
```

### With merkle links

```
_hash1_
{
  name: /_hash3_/name
  friends: [
    Link({
      @link: /_hash2_/name
    })
  ]
}

_hash2_
{
  name: {
    first: /_hash3_/name,
    family: "Greco"
  }
}

_hash3_
{
  name: "Nicola"
}

/_hash1_/name
"Nicola"

/_hash1_/friends/0
{
  first: "Nicola",
  family: "Greco"
}

/_hash1_/friends/0/first
"Nicola"

```

## Relative graphs (cycle)

Cyclic graphs can be created using relative paths

```
_hash1_
{
  name: "Nicola",
  surname: Link(@link: "./passport/officialSurname")
  passport: {
    officialName: Link(@link: "../name"),
    officialSurname: "Greco"
  }
}

/_hash1_/name
"Nicola"

/_hash1_/surname
"Greco"

/_hash1_/passport
{
  officialName: Link(@link: "../name"),
  officialSurname: "Greco"
}

/_hash1_/passport/officialName
"Nicola"
```

### Cycles in merkle graphs

```
_hash1_
{
  nicola: {
    name: "Nicola"
    sister: Link({@link: "../nicola"})
  },
  lucia: {
    name: "Lucia"
    brother: Link({@link: "../lucia"})
  }
}

_hash2_
{
  nicola: _hash3_,
  lucia: _hash4_
}

_hash3_
{
  name: "Lucia"
  brother: Link({@link: "../lucia"})
}

_hash4_
{
  name: "Nicola"
  sister: Link({@link: "../nicola"})
}

/_hash1_/nicola/sister/name
{
  name: "Lucia"
}

/_hash1_/nicola/sister/brother/name
{
  name: "Nicola"
}

/_hash2_/nicola/sister/name
{
  name: "Lucia"
}

/_hash2_/nicola/sister/brother/name
{
  name: "Nicola"
}
```

## Mutable paths!

## Implementation note

`Link` in the example describe the fact that that branch of the object should be treated differently

Example implementations:
- In CBOR, it can just be a tag
- In JavaScript, one could just check if the property is an object and contains `@link` inside

