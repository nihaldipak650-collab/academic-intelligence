# Release Eligibility Truth Table

| Core identity | Adopted identities | Owner scoped review | ORCID classification | Result |
| --- | --- | --- | --- | --- |
| verified | verified | approved | verified identifier | eligible |
| verified | verified | approved | not found | eligible |
| verified | verified | approved | one optional unresolved candidate, omitted publicly | eligible with open risk |
| verified | verified | approved | conflicting optional candidates, none selected/exposed | eligible with open risk |
| verified | any unresolved/conflict | approved | any | blocked |
| name/institution/profile unresolved | any | approved | any | blocked |
| verified | verified | missing/incomplete | any | blocked |
| verified | verified | approved | inconsistent classification or public unresolved-ID exposure | blocked |

`release_authorized=false` means this local review does not authorize remote push/deploy. It is separate from deterministic package eligibility.
