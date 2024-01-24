class Node {

    // Using sets for performance on checking inclusion (O(1) lookups and inclusion checks).
    // Also keeps us from have duplicate nodes in children or parents.
    parents = new Set();
    children = new Set();
    #button;

    constructor(button_id, button=null) { // (button) {
        // Holds the id for the button this node should represent
        this.button_id = button_id;
        // We could optionally also pass in a reference to the actual button here...
        this.#button = button;
    }

    get button() {
        // This will somewhat simulate a lazy loading of button DOM elements
        // by only loading it right before we access it. This gives us the best of both worlds
        if (!this.#button) this.#button = document.querySelector(`#${this.button_id}`);
        return this.#button;
    }

    set button(b) {
        this.#button = b;
    }

    addChild(node) {
        // Here we will add the forward...
        this.children.add(node);
        // and reverse edges for the digraph
        // (which technically doesn't make it a digraph anymore, but it makes things easier later)
        node.parents.add(this);
    }

    addChildren(nodes) {
        for (let node of nodes) {
            this.addChild(node);
        }
    }

    removeChild(node) {
        // returns boolean on whether either delete was successful or not
        // I believe this should be good because we consider at least one delete
        // successful since it is cleaning up edges that we no longer want
        return this.children.delete(node) || node.parents.delete(this);
    }

}

// async function actionSearch(startNode, baseCaseHandler, nodeActionHandler, performHandlerOnBase=false) {
//     // Start the queue with the starting node
//     let queue = [startNode];
//     // Use shift (dequeue) for a breadth first search...
//     // and pop (simulates a stack data structure instead of a queue) for a depth first search
//     while (queue.length > 0) {
//         // remove a node from the queue/stack to process
//         currentNode = queue.shift();
//         // Test if we are at the base case of when to stop searching (basically any condition you want)
//         if (!baseCaseHandler(currentNode, startNode)) {
//             // If we are not at the base case, go ahead and apply whatever action we want with the node (like deselecting a button)
//             // UNCOMMENT FOR VISUALIZATION await new Promise(r => setTimeout(r, 350));
//             nodeActionHandler(currentNode);
//             // Now we should enqueue the current nodes children making sure to preserve whatever else was in the queue
//             queue.push(...currentNode.children);
//         } else if (performHandlerOnBase) {
//             // In case we wanted to also include the base case in the action but stop after that
//             nodeActionHandler(currentNode);
//         }
//     }
// }

async function actionSearch(startNode, baseCaseHandler, buttonNodeActionHandler, arrowNodeActionHandler, performHandlerOnBase=false) {
    // Start the queue with the starting node
    let queue = [startNode];
    
    // Use shift (dequeue) for a breadth-first search...
    // and pop (simulates a stack data structure instead of a queue) for a depth-first search
    while (queue.length > 0) {
        // Remove a node from the queue/stack to process
        const currentNode = queue.shift();
        
        // Test if we are at the base case of when to stop searching (any condition specified by baseCaseHandler)
        if (!baseCaseHandler(currentNode, startNode)) {
            // If we are not at the base case, apply the button node action
            buttonNodeActionHandler(currentNode);
            
            // Apply the arrow node action if there is a handler provided
            if (arrowNodeActionHandler) {
                arrowNodeActionHandler(currentNode);
            }
            
            // Enqueue the current node's children, preserving whatever else was in the queue
            queue.push(...currentNode.children);
        } else if (performHandlerOnBase) {
            // In case we wanted to also include the base case in the action but stop after that
            buttonNodeActionHandler(currentNode);
            
            // Apply the arrow node action if there is a handler provided
            if (arrowNodeActionHandler) {
                arrowNodeActionHandler(currentNode);
            }
        }
    }
}

function stillHasValidPath(currentNode, startNode) {
    // This should return true if we ever come across any buttons
    // that have multiple parents where at least one parent is
    // currently enabled. This way we know that we can stop searching down this path
    // because the currentNode still has a valid path.
    // There is also the case to consider where the user clicks on a node that passes the base case above.
    // In such a circumstance we should not consider it a base case and proceed with deactivating.
    return currentNode !== startNode && currentNode.parents.size >= 2 && [...currentNode.parents].some(parent => parent.button.classList.contains("selected"));
}

// Changes buttons to their none selected state of .3 opacity and disabled. startbuttons go to .7 and stay enabled
function deactivateButton(node, clickedId) {

    const isStartButton = node.button.id.startsWith('s');
    node.button.classList.remove("selected");
    node.button.classList.add('selectable');
    if(node.button.id !== clickedId){
    node.button.classList.remove('selectable');
    node.button.disabled = true;
    }
}

// Returns arrows to their default state of being gray when their corresponding button is unselected
function deactivateArrow(node) {
    const arrowIDs = arrowMap.get(node.button.id);
    if (arrowIDs) {
        // Deactivate arrows based on the IDs in arrowMap
        arrowIDs.forEach(arrowID => {
            const arrowElement = document.getElementById(arrowID);
            // Perform actions on arrow elements as needed
            arrowElement.setAttribute("stroke", "gray");
            if(arrowElement.hasAttribute("marker-start")){
                arrowElement.setAttribute("marker-start", "url(#arrow-right-white)");
            }
            if(arrowElement.hasAttribute("marker-end")){
                arrowElement.setAttribute("marker-end", "url(#arrow-right-white)");
            }
        });
    }
}
