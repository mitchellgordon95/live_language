# Home Module - Asset Completeness Report

## Summary

The home module is **largely complete** with scene images, coordinate JSONs, and portraits all present for every location. A few minor gaps exist around container items, pet rendering in the web UI, and one zero-coordinate object.

**Overall status: PASS with minor issues**

---

## 1. Locations

### Module Definition (`src/languages/spanish/modules/home.ts`)

| Location ID   | Display Name     | Objects | Exits |
|---------------|------------------|---------|-------|
| bedroom       | el dormitorio    | 5       | 3     |
| bathroom      | el ba~no         | 7       | 3     |
| kitchen       | la cocina        | 14      | 3     |
| living_room   | la sala          | 6       | 3     |
| street        | la calle         | 2       | 7     |

`homeModule.locationIds` = `['bedroom', 'bathroom', 'kitchen', 'living_room']` (street excluded via filter, handled as separate pseudo-module in registry).

### LOCATION_TO_MODULE Mapping (`web/lib/game-bridge.ts:335`)

All 5 location IDs correctly mapped to `'home'`:
- bedroom: home -- OK
- bathroom: home -- OK
- kitchen: home -- OK
- living_room: home -- OK
- street: home -- OK

**Status: PASS**

---

## 2. Scene Images

| Location    | PNG exists? | JSON exists? |
|-------------|-------------|--------------|
| bedroom     | YES         | YES          |
| bathroom    | YES         | YES          |
| kitchen     | YES         | YES          |
| living_room | YES         | YES          |
| street      | YES         | YES          |

**Status: PASS** -- All 5 locations have both scene image and coordinate JSON.

---

## 3. Coordinate JSONs - Object Coverage

Cross-referencing objects defined in the module against coordinate entries in each JSON manifest.

### Bedroom (5 objects)

| Object ID    | In module? | In JSON? | Coords valid? |
|--------------|-----------|----------|---------------|
| bed          | YES       | YES      | YES           |
| alarm_clock  | YES       | YES      | YES           |
| window       | YES       | YES      | YES           |
| lamp         | YES       | YES      | YES           |
| closet       | YES       | YES      | YES           |

**Status: PASS** -- All 5/5 objects have coordinates.

### Bathroom (7 objects)

| Object ID    | In module? | In JSON? | Coords valid? |
|--------------|-----------|----------|---------------|
| sink         | YES       | YES      | YES           |
| mirror       | YES       | YES      | YES           |
| toilet       | YES       | YES      | YES           |
| shower       | YES       | YES      | YES           |
| toothbrush   | YES       | YES      | YES           |
| towel        | YES       | YES      | YES           |
| soap         | YES       | YES      | YES           |

**Status: PASS** -- All 7/7 objects have coordinates.

### Kitchen (14 objects, including fridge contents)

| Object ID    | In module? | In JSON? | Coords valid? | Notes                           |
|--------------|-----------|----------|---------------|---------------------------------|
| refrigerator | YES       | YES      | YES           |                                 |
| stove        | YES       | YES      | YES           |                                 |
| table        | YES       | YES      | YES           |                                 |
| chair        | YES       | YES      | YES           |                                 |
| coffee_maker | YES       | YES      | YES           |                                 |
| cup          | YES       | YES      | YES           |                                 |
| plate        | YES       | YES      | YES           |                                 |
| pan          | YES       | YES      | YES           |                                 |
| milk         | YES       | YES      | YES           | inFridge (container item)       |
| eggs         | YES       | YES      | YES           | inFridge (container item)       |
| bread        | YES       | YES      | YES           |                                 |
| butter       | YES       | YES      | YES           | inFridge (container item)       |
| coffee       | YES       | YES      | YES           |                                 |
| water        | YES       | YES      | YES           |                                 |
| juice        | YES       | YES      | **x=0,y=0,w=0,h=0** | ISSUE: Zero coordinates |

**Status: MINOR ISSUE** -- 13/14 valid. `juice` has zero coordinates (x:0, y:0, w:0, h:0). Since juice has `inFridge: true`, it is rendered as a dot on the fridge portrait (via `containerId`), so the zero coords are not critical -- it won't appear as a labeled overlay. However, this may cause it to render in the "Also here" text list when the fridge is open, since the ScenePanel filters by `coords.w > 0 || coords.h > 0` AND `!containerId`. Since juice has `containerId: 'refrigerator'`, it is actually excluded from the unlabeled list too, so this is a non-issue for display.

### Living Room (6 objects)

| Object ID    | In module? | In JSON? | Coords valid? |
|--------------|-----------|----------|---------------|
| couch        | YES       | YES      | YES           |
| tv           | YES       | YES      | YES           |
| coffee_table | YES       | YES      | YES           |
| bookshelf    | YES       | YES      | YES           |
| remote       | YES       | YES      | YES           |
| pet_food     | YES       | YES      | YES           |

**Status: PASS** -- All 6/6 objects have coordinates.

### Street (2 objects)

| Object ID   | In module? | In JSON? | Coords valid? |
|-------------|-----------|----------|---------------|
| streetlamp  | YES       | YES      | YES (x=37.5)  |
| bench       | YES       | YES      | YES           |

**Status: PASS** -- All 2/2 objects have coordinates. Note: streetlamp has fractional x (37.5) which is valid for percentage-based rendering.

---

## 4. Portrait Manifest (`portraits/manifest.json`)

### Player Portraits

| Variant          | Match condition          | PNG exists? |
|------------------|--------------------------|-------------|
| default          | (standing)               | YES         |
| in-bed           | playerPosition: "in_bed" | YES         |
| standing         | playerPosition: "standing"| YES        |
| brushing-teeth   | lastAction: "brush_teeth"| YES         |
| showering        | lastAction: "shower"     | YES         |
| cooking          | lastAction: "cook"       | YES         |
| eating           | lastAction: "eat"        | YES         |

**Status: PASS** -- 7 player portrait variants, all PNGs present.

### NPC Portraits

| NPC ID    | Default PNG exists? | Notes                      |
|-----------|--------------------|-----------------------------|
| roommate  | YES                | npc-roommate-default.png    |

**Status: PASS** -- The only NPC (Carlos/roommate) has a portrait.

### Pet Portraits

| Pet ID | Default PNG exists? | Notes                    |
|--------|--------------------|-----------------------------|
| cat    | YES                | pet-cat-default.png         |
| dog    | YES                | pet-dog-default.png         |

**Status: PASS** -- Both pets have default portraits.

### Object State Portraits

| Object ID     | State match         | PNG exists? | Notes                        |
|---------------|---------------------|-------------|------------------------------|
| alarm_clock   | ringing: true       | YES         | object-alarm_clock-ringing.png |
| alarm_clock   | ringing: false      | YES         | object-alarm_clock-off.png   |
| refrigerator  | open: true          | YES         | object-refrigerator-open.png |
| stove         | on: true            | YES         | object-stove-on.png          |
| coffee_maker  | on: true            | YES         | object-coffee_maker-on.png   |

**Status: PASS** -- All 5 object state portraits present.

### Missing Object State Portraits (not critical)

These objects have state changes but NO portrait variants in the manifest:
- **tv** (state: `on: false`, actions: TURN_ON/TURN_OFF) -- no portrait for on/off
- **lamp** (state: `on: false`, actions: TURN_ON/TURN_OFF) -- no portrait for on/off
- **window** (state: `open: false`, actions: OPEN/CLOSE) -- no portrait for open/closed
- **closet** (state: `open: false`, actions: OPEN/CLOSE) -- no portrait for open/closed
- **shower** (state: `on: false`, actions: USE) -- no portrait for on/off

These are **LOW priority** -- the game functions fine without these portraits; objects just won't show a visual state change in the tray.

---

## 5. Web UI - Pet Rendering Gap

**MEDIUM issue**: The web UI's `buildGameView()` in `game-bridge.ts:408` calls `engine.getNPCsInLocation(locationId)` which returns only NPCs (from `module-registry.ts:109-111`). Pets are NOT included in this call.

However, pet portraits ARE present in the manifest under `manifest.pets`, and the portrait lookup at line 414 falls back to `manifest.pets[npc.id]?.default`. This fallback would only work if pets were somehow included in the NPC array, which they are not.

The engine side (`unified.ts:195`) does call `getPetsInLocation()` separately for the AI prompt, but the web UI bridge never does. This means:

- Pets (Luna the cat, Max the dog) **do NOT appear** as portrait avatars in the scene tray on the web UI
- Pets are still in the AI prompt, so the AI will reference them, but they have no visual presence
- The pet portrait PNGs (pet-cat-default.png, pet-dog-default.png) are generated but **unused** in the web UI

**Recommendation**: Add pets to the NPCView array in `buildGameView()` by also calling `getPetsInLocation()` and merging them in.

---

## 6. Container Items (Fridge Contents)

The fridge contains 4 items: milk, eggs, butter, juice (all have `inFridge: true`).

- `buildGameView()` correctly filters fridge items based on `fridgeState.open` (line 362-368)
- Items with `inFridge` get `containerId: 'refrigerator'` (line 379)
- `ScenePanel` renders contained items as dots on the container portrait via `PortraitWithItems` component
- When fridge is closed, items are hidden; when open, they appear as dots on the `object-refrigerator-open.png` portrait

**Status: PASS** -- Container item flow is correctly wired.

---

## 7. Goals

12 goals defined in the module, forming a linear chain:

1. wake_up -> 2. turn_off_alarm -> 3. go_to_bathroom -> 4. brush_teeth -> 5. take_shower -> 6. go_to_kitchen -> 7. make_breakfast -> 8. go_to_living_room -> 9. greet_roommate -> 10. ask_roommate_breakfast -> 11. feed_pets -> 12. morning_complete

All goals have `checkComplete` functions and are properly chained via `nextGoalId`.

**Status: PASS**

---

## 8. Vocabulary

- 55 vocabulary words defined covering: rooms (3), bedroom objects (5), bathroom objects (6), kitchen objects (7), food (7), verbs (15), living room (6), pets (4), conversation verbs (5), greetings (3), other (6 functional words)
- All object names in locations have matching vocabulary entries

**Status: PASS**

---

## Findings Summary

| Category                    | Status      | Details                                          |
|-----------------------------|-------------|--------------------------------------------------|
| Scene images (5 locations)  | PASS        | All PNGs present                                 |
| Coordinate JSONs            | PASS        | All objects mapped                               |
| juice coordinates           | LOW         | Zero coords (x:0,y:0,w:0,h:0) -- benign since it's a fridge item |
| LOCATION_TO_MODULE mapping  | PASS        | All 5 locations mapped correctly                 |
| Player portraits (7)        | PASS        | All variants present                             |
| NPC portraits (1)           | PASS        | Carlos/roommate present                          |
| Pet portraits (2)           | PASS        | Cat + dog PNGs present                           |
| Object state portraits (5)  | PASS        | All state-change portraits present               |
| Missing object portraits    | LOW         | TV, lamp, window, closet, shower have no state portraits |
| Pet rendering in web UI     | MEDIUM      | Pets not included in NPC view array; portraits exist but unused |
| Container items (fridge)    | PASS        | Properly wired through containerId system        |
| Goals (12)                  | PASS        | Complete linear chain                            |
| Vocabulary (55 words)       | PASS        | Full coverage                                    |
| Portrait manifest           | PASS        | All referenced PNGs exist on disk                |
