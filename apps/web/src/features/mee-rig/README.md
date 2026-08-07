# Mee Rive Web

This feature is intentionally scoped to LMS Web. The Expo/Play app does not import a Rive runtime.

## Production asset contract

Create `public/assets/mee/mee-rig-v1.riv` in the Rive Editor with:

- artboard: `Mee`
- state machine: `Mee Controller`
- number input `motion`: `0` idle, `1` inspect/look down, `2` celebrate
- trigger input `equip`: apply the selected outfit and play the equip reaction
- number input `category`: identifies the active wardrobe category

Build the character from separately rigged head, eyes, torso, upper/lower arms, hands, upper/lower legs, and feet. Outfit artwork should be nested under the matching body transform so it follows limb motion. The dress sequence is `idle → inspect → equip → idle`.

The current canvas deliberately uses a public Rive runtime sample. Replace `MEE_RIVE_SAMPLE` in `contract.ts` only after the production file and names above exist.

## Authoring handoff now included

- Import `public/assets/mee/mee-girl-rig-v1-source.svg` and `mee-boy-rig-v1-source.svg` into separate 360 × 720 artboards. Both use the same joint coordinates so timelines can be copied between them.
- Preserve the SVG group names; they are already split by body part and clothing slot.
- Use the pivots in `mee-rig-v1-manifest.json` when creating bones/constraints.
- Keep `rig-guides` hidden. Bind the separate arm and leg groups to their matching transforms.
- Create timelines `idle` (2.4 s loop), `inspect` (160 ms), `equip` (360 ms) and `celebrate` (900 ms).
- Create the `Mee Controller` state machine and inputs exactly as declared in the manifest.
- Export to `public/assets/mee/mee-rig-v1.riv`, then update `MEE_RIVE_SAMPLE.src`, `artboard` and `stateMachine` to the production values.

The Web controller is already wired defensively: when those three inputs exist it runs `inspect → equip → idle` for every wardrobe choice. Until then it keeps rendering the public runtime sample and reports that the production contract is not connected.
