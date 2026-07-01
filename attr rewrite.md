## Phase 1: Update AttrConfig Type
Add mandatory "id: string" field to the AttrConfig type definition.

## Phase 2: Add IDs to Existing Configs
Add the id field to each use of AttrConfig. The id value should match the key used in the config object.
Example: `{date: {...}}` → the config should have `id: 'date'`

## Phase 3: Extract Attributes to Variables
Extract all AttrConfig objects from:
- survey.attrs
- survey.smp.attrs  
- survey.occ.attrs
- survey.smp.occ.attrs

Rules:
- Extract to const variables above the survey config in the same file
- Naming convention: append "Attr" to the name (e.g. location → locationAttr, date → dateAttr)
- Do NOT use "config" in variable names
- Process all survey config files in the project

## Phase 4: Use Computed Property Syntax
Update survey configs to use the new variables with computed property syntax:
Example: `[dateAttr.id]: dateAttr` instead of `date: dateAttr`

## Phase 5: Add TypeScript Assertions
Add "as const" TypeScript assertion to each extracted config variable.

**Important caveats:**
- Skip "as const" for configs with self-referencing functions (e.g., functions that reference the parent attr object)
- Skip "as const" for configs with spread operators in nested arrays (readonly incompatibility)
- Skip "as const" for configs with complex pageProps.attrProps arrays containing get/set/parse functions
- When compilation errors occur due to readonly type conflicts, remove "as const" from that specific config
- Test compilation after adding "as const" to complex configs to catch readonly issues early

## Phase 6: Extract Common Configs
Identify attribute configs that are identical or reused across multiple survey files.
Extract these to `Survey/common/config.ts` and import from there.

Examples of common attributes:
- dateAttr, commentAttr, recorderAttr
- locationAttr, taxonAttr
- identifiersAttr, groupIdAttr

## Verification
After each phase:
1. Check TypeScript compilation for errors
2. Verify all surveys use the [attr.id] computed property syntax
3. Ensure no duplicate attribute definitions exist across files
4. Run build to confirm no runtime issues

## Phase 7: Rewrite AttrConfig attributes to Block attributes
 - These are defined in @flumens/tailwind/dist/Survey, e.g. ChoiceInputConf, NumberInputConf

for example:
```
export const siteNameAttr = {
  id: 'name',
  type: 'textInput',
  title: 'Site name',
  container: 'inline',
} as const satisfies TextInputConf;

export const siteAreaAttr = {
  id: 'locAttr:376',
  type: 'choiceInput',
  title: 'Site area',
  appearance: 'button',
  choices: [
    { title: '5 x 10 m', dataName: '23729' },
    { title: '20 x 25 m', dataName: '23730' },
  ],
} as const satisfies ChoiceInputConf;

export const grainsNumberAttr = {
  id: 'locAttr:341',
  type: 'numberInput',
  title: 'Arable field grains (wheat, barley, rye)',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;
```

- use Block component with these new attributes.

