/**
 * Prompt templates for scene image generation via Gemini 2.5 Flash.
 * Each location gets a tailored prompt that produces a consistent illustration style.
 */

export interface ScenePromptContext {
  locationId: string;
  locationName: string;       // e.g., "kitchen"
  moduleName: string;         // e.g., "home"
  objectNames: string[];      // e.g., ["refrigerator", "stove", "table"]
}

// Color palettes by building type
const PALETTES: Record<string, string> = {
  home: 'Warm yellows, soft oranges, cozy earth tones. Morning light streaming in.',
  restaurant: 'Rich warm reds, dark wood browns, candlelight amber. Elegant but casual.',
  market: 'Vibrant greens, fresh produce colors, rustic wood tones. Busy market atmosphere.',
  gym: 'Cool grays, energetic orange accents, rubber black floors. Modern fitness facility.',
  park: 'Natural greens, sky blues, dappled sunlight. Peaceful outdoor setting.',
  clinic: 'Clean whites, soft blues, sterile but reassuring. Modern medical facility.',
  bank: 'Navy blue, gold accents, marble gray. Professional financial setting.',
};

// Per-location scene descriptions for richer context
const SCENE_DESCRIPTIONS: Record<string, string> = {
  // Home
  bedroom: 'A cozy bedroom with morning light filtering through curtains. Bed with rumpled sheets, nightstand with alarm clock, a wardrobe, and a desk lamp.',
  bathroom: 'A small but clean bathroom with white tiles. Shower stall with glass door, toilet, sink with mirror above it, toothbrush in a cup, towel rack.',
  kitchen: 'A warm kitchen with wooden cabinets. Refrigerator, gas stove, small dining table with chair, coffee maker on the counter, various food items visible.',
  living_room: 'A comfortable living room with a sofa facing a TV. Coffee table with remote, bookshelf along one wall, pet food bowl on the floor.',
  street: 'A quiet residential street with a streetlamp and a bench. Buildings in the background, trees lining the sidewalk.',

  // Restaurant
  restaurant_entrance: 'A restaurant entrance with a wooden host stand/podium, a waiting bench along the wall, a framed menu display, and a coat rack by the door.',
  restaurant_table: 'A restaurant table set for dining. White tablecloth, plates, silverware, wine and water glasses, napkin, bread basket. Menu on the table.',
  restaurant_kitchen: 'A busy restaurant kitchen viewed from a pass-through window. Commercial stove, prep counter with vegetables, order tickets hanging on a wire.',
  restaurant_cashier: 'A restaurant cashier area near the exit. Cash register, card reader, tip jar on the counter.',
  restaurant_bathroom: 'A clean restaurant bathroom. Toilet, sink with mirror, soap dispenser, paper towel holder, hand dryer on the wall.',

  // Market
  market_entrance: 'The entrance to an open-air market. A wooden sign, shopping baskets stacked up, shopping carts, and a directory board showing sections.',
  fruit_stand: 'A colorful fruit stand with wooden crates. Apples, oranges, bananas, strawberries, grapes, lemons, watermelon, pineapple. A hanging scale, price signs.',
  vegetable_stand: 'A vegetable stand with fresh produce. Tomatoes, onions, potatoes, carrots, lettuce, peppers, avocados, garlic in wooden bins. Scale and price signs.',
  meat_counter: 'A butcher counter behind glass. Chicken, beef cuts, pork, ground beef, chorizo sausage, ham. Display case, scale, price sign, ticket dispenser.',
  market_checkout: 'A market checkout counter. Cash register, conveyor belt for items, shopping bags, card reader, receipt printer.',

  // Gym
  gym_entrance: 'A gym entrance with a reception desk, card scanner, rules poster on the wall, water fountain, and a spot for gym bags.',
  stretching_area: 'A stretching area with yoga mats rolled out, foam rollers, resistance bands, a full-length mirror, and stability balls.',
  training_floor: 'A functional training floor with a flat bench, pull-up bar, kettlebells of various sizes, jump rope, and a timer clock on the wall.',
  weight_room: 'A weight room with a dumbbell rack, barbell on a rack, bench press station, squat rack, leg press machine, and cable machine.',
  cardio_zone: 'A cardio zone with treadmills, stationary bikes, elliptical machines, rowing machine, a mounted TV screen, and a fan.',
  locker_room: 'A gym locker room with metal lockers, shower stalls, a changing bench, towels, water bottles, a scale, and a mirror.',

  // Park
  park_entrance: 'A park entrance with an iron gate, a wooden welcome sign, a map display board, a bench, and a trash can.',
  main_path: 'A tree-lined park path with a large oak tree, pine trees, a park bench, a squirrel on the ground, fallen leaves, and a lamp post.',
  fountain_area: 'A park area centered around an ornate stone fountain. Benches around it, pigeons, a bird feeder, coins glinting in the water, a small statue.',
  garden: 'A flower garden with rose bushes, tulips, sunflowers. Butterflies and bees hovering. A garden bench, flower bed, and a watering can.',
  playground: 'A colorful playground with swings, a slide, sandbox, seesaw, monkey bars. Kids playing in the background, a ball on the ground.',
  kiosk: 'A park kiosk/ice cream cart with a striped umbrella. An ice cream menu board, various flavors displayed, water bottles, a bench nearby.',

  // Clinic
  clinic_reception: 'A medical clinic reception area. A reception desk with a computer, registration forms, brochure stand, appointment sign, and a pen holder.',
  waiting_room: 'A clinic waiting room with rows of chairs, a magazine rack, water cooler, wall-mounted TV, digital number display, and health awareness posters.',
  exam_room: 'A medical examination room. An exam table with paper cover, blood pressure monitor, stethoscope, scale, thermometer, medical chart, anatomy poster.',
  pharmacy: 'A pharmacy counter with a pharmacist window. Medicine shelves behind with bottles, boxes of pain reliever, antibiotics, cough syrup, bandages, vitamins.',

  // Bank
  bank_entrance: 'A bank entrance with glass doors, a sign showing business hours, an ATM machine to the side, and a security camera above.',
  bank_waiting_area: 'A bank waiting area with a number dispenser, rows of chairs, a digital queue display, brochure racks, water cooler, and forms on a counter.',
  bank_teller_window: 'A bank teller window behind bulletproof glass. Counter with receipt printer, cash drawer visible, ID scanner, and a customer-facing screen.',
  bank_manager_office: 'A bank manager office with a wooden desk, visitor chairs, stacked account documents, loan applications, business cards, and a potted plant.',
};

/**
 * Generate the image generation prompt for a scene.
 */
export function getImagePrompt(ctx: ScenePromptContext): string {
  const palette = PALETTES[ctx.moduleName] || PALETTES.home;
  const sceneDesc = SCENE_DESCRIPTIONS[ctx.locationId] || `A ${ctx.locationName} scene.`;

  return `Generate a warm, stylized editorial illustration of a ${ctx.locationName}, seen from a gentle overhead 3/4 angle (bird's eye view tilted about 30 degrees).

SCENE: ${sceneDesc}

OBJECTS THAT MUST BE CLEARLY VISIBLE AND IDENTIFIABLE:
${ctx.objectNames.map(name => `- ${name}`).join('\n')}

STYLE:
- Editorial illustration style, like a New Yorker or Monocle magazine illustration
- ${palette}
- Clean lines, slightly stylized but recognizable objects
- Each object should be distinct and clearly identifiable at a glance
- Consistent 3/4 overhead viewing angle
- No people in the scene (characters are handled separately)
- DO NOT include any text, labels, or writing in the image
- 1024x1024 square format`;
}

/**
 * Generate the coordinate extraction prompt for identifying objects in a generated scene.
 */
export function getCoordinateExtractionPrompt(objectIds: string[], objectNames: string[]): string {
  const objectList = objectIds.map((id, i) => `- "${id}" (${objectNames[i]})`).join('\n');

  return `Look at this scene image carefully. I need you to identify the location of specific objects in the image and return their coordinates as percentages of the image dimensions.

For each object, provide:
- x: horizontal position of the object's CENTER as a percentage (0 = left edge, 100 = right edge)
- y: vertical position of the object's CENTER as a percentage (0 = top edge, 100 = bottom edge)
- w: approximate width of the object as a percentage of image width
- h: approximate height of the object as a percentage of image height

Objects to find:
${objectList}

RESPOND WITH ONLY VALID JSON:
{
  "objects": {
${objectIds.map(id => `    "${id}": { "x": 0, "y": 0, "w": 0, "h": 0 }`).join(',\n')}
  }
}

Be as accurate as possible. If an object is partially obscured or hard to identify, provide your best estimate. Use the center of the visible portion of the object.`;
}
