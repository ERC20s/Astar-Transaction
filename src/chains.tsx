import { engine, GltfContainer, Transform, pointerEventsSystem, InputAction, UiText} from '@dcl/sdk/ecs'
import {acala} from './parachains/acala'


export function parachainz() {
  let items: { [key: string]: any } = {};

    // Custom hover texts for each item
    const hoverTexts: string[] = [
        "Acala",
        "Moonbeam",
        "Astar",
        // ... add texts for all 30 items
    ];
    
    // Custom functions for each item's pointer down event
    const pointerDownFunctions: Array<() => void> = [
        () => { acala() },
        () => { console.log("Action for Item 2"); },
        () => { console.log("Action for Item 3"); },
        // ... add functions for all 30 items
    ];
    
    for (let i = 1; i <= 30; i++) {
        console.log(`Creating ITEM ${i}`);
      
        // Store each entity in the items object with a dynamic key
        items[`item${i}`] = engine.addEntity();
      
        GltfContainer.create(items[`item${i}`], {
            src: `models/item${i}.gltf`,
        });
    
        pointerEventsSystem.onPointerDown({
                entity: items[`item${i}`],
                opts: { 
                    button: InputAction.IA_POINTER, 
                    hoverText: hoverTexts[i - 1],  // Retrieve the custom hoverText using the current index
                    maxDistance:100,
                    showFeedback: true 
                },
            },
            pointerDownFunctions[i - 1]  // Retrieve the custom function using the current index
        );
    
        // Calculate x and y positions for a 6x5 grid with doubled spacing
        let x = ((i - 1) % 6) * 2.5;   // Modulo operation gives column position, then multiply by 2 for spacing
        let y = (Math.floor((i - 1) / 6)) * 3;  // Division gives row position, then multiply by 2 for spacing
    
        // Using the correct entity reference for Transform.create
        Transform.create(items[`item${i}`], {
            position: { x: x + 2, y: y+1, z: 10 }  // Place items on the x-y plane
        });
    }
    
}

