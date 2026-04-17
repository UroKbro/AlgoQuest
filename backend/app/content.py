REALMS = [
    {
        "slug": "nexus",
        "name": "Nexus",
        "accent": "cyan",
        "eyebrow": "Central Hub",
        "description": "Quest continuity, weekly pulse, and realm launch control.",
    },
    {
        "slug": "dojo",
        "name": "Dojo",
        "accent": "amber",
        "eyebrow": "Foundations",
        "description": "Foundational Python and logic mastery.",
    },
    {
        "slug": "laboratory",
        "name": "Laboratory",
        "accent": "cyan",
        "eyebrow": "Visualization",
        "description": "Deep algorithm analysis with visual time travel.",
    },
    {
        "slug": "sandbox",
        "name": "Sandbox",
        "accent": "purple",
        "eyebrow": "Exploration",
        "description": "Experimental systems and large-scale simulation.",
    },
    {
        "slug": "world",
        "name": "World",
        "accent": "emerald",
        "eyebrow": "Application",
        "description": "Project implementation and architecture review.",
    },
    {
        "slug": "forge",
        "name": "Forge",
        "accent": "amber",
        "eyebrow": "Creative Output",
        "description": "Poster gallery and challenge launchpad.",
    },
    {
        "slug": "path",
        "name": "Path",
        "accent": "purple",
        "eyebrow": "Analytics",
        "description": "Mastery tracking, weekly breakdowns, and friction points.",
    },
    {
        "slug": "terminal",
        "name": "Terminal",
        "accent": "emerald",
        "eyebrow": "Control Center",
        "description": "Settings, personalization, cache, and sync controls.",
    },
]

LESSONS = [
    {
        "slug": "memory-boxes",
        "title": "Memory Boxes",
        "tier": "Core",
        "summary": "Trace variable state through assignments and updates.",
        "content": "Variables are like memory boxes where we can store information. Let's start by creating a score variable and updating it.",
        "quiz": {
            "question": "If x = 5 and we do x = x + 2, what is the new value of x?",
            "options": ["5", "2", "7", "10"],
            "answer": "7",
        },
    },
    {
        "slug": "loop-mastery",
        "title": "Loop Mastery",
        "tier": "Core",
        "summary": "Understand iteration, counters, and loop control flow.",
        "content": "Loops allow us to run the same code multiple times. Using a loop, we can perform repetitive tasks efficiently. Let's see how a loop updates a total counter.",
        "quiz": {
            "question": "How many times will a loop with range(0, 3) execute?",
            "options": ["2", "3", "4", "0"],
            "answer": "3",
        },
    },
    {
        "slug": "pointer-drones",
        "title": "Pointer Drones",
        "tier": "Libraries",
        "summary": "Learn how references move through linked structures.",
        "content": "When we assign a list to a new variable, we are creating a pointer to the original list, not a copy. Modifying the new variable modifies the original list.",
        "quiz": {
            "question": "If a = [1, 2] and b = a, what happens to 'a' if we do b.append(3)?",
            "options": [
                "a remains [1, 2]",
                "a becomes [1, 2, 3]",
                "a becomes empty",
                "Error",
            ],
            "answer": "a becomes [1, 2, 3]",
        },
    },
    {
        "slug": "function-foundations",
        "title": "Function Foundations",
        "tier": "Core",
        "summary": "Learn to group code blocks, pass arguments, and return results.",
        "content": "Functions are reusable blocks of code. They can take inputs (arguments) and return outputs. Let's define a simple function to calculate an area.",
        "quiz": {
            "question": "What keyword is used to define a function in Python?",
            "options": ["func", "define", "def", "function"],
            "answer": "def",
        },
    },
    {
        "slug": "dictionary-dives",
        "title": "Dictionary Dives",
        "tier": "Data Structures",
        "summary": "Explore key-value pairs, hash map lookups, and fast data retrieval.",
        "content": "Dictionaries store data in key-value pairs. They allow for very fast lookups based on the key.",
        "quiz": {
            "question": "How do you access the value for key 'name' in a dictionary 'd'?",
            "options": ["d.name", "d['name']", "d(name)", "d{'name'}"],
            "answer": "d['name']",
        },
    },
    {
        "slug": "recursion-basics",
        "title": "Recursion Basics",
        "tier": "Advanced Logic",
        "summary": "Understand functions calling themselves, base cases, and call stacks.",
        "content": "Recursion is when a function calls itself. It needs a base case to stop calling itself and prevent an infinite loop.",
        "quiz": {
            "question": "What is essential for a recursive function to stop?",
            "options": [
                "A loop",
                "A base case",
                "A return statement",
                "A global variable",
            ],
            "answer": "A base case",
        },
    },
    {
        "slug": "list-comprehensions",
        "title": "List Comprehensions",
        "tier": "Advanced Logic",
        "summary": "Create new lists based on existing lists in a single readable line.",
        "content": "List comprehensions provide a concise way to create lists. It consists of brackets containing an expression followed by a for clause.",
        "quiz": {
            "question": "What does [x*2 for x in [1, 2, 3]] produce?",
            "options": ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "Error"],
            "answer": "[2, 4, 6]",
        },
    },
    {
        "slug": "error-handling",
        "title": "Error Handling",
        "tier": "Core",
        "summary": "Manage exceptions gracefully using try and except blocks.",
        "content": "Instead of crashing, programs can catch errors using try...except. This allows the program to handle the issue and continue running.",
        "quiz": {
            "question": "Which block is executed if an exception occurs in the try block?",
            "options": ["else", "finally", "except", "catch"],
            "answer": "except",
        },
    },
]

ALGORITHMS = [
    {
        "slug": "binary-search",
        "name": "Binary Search",
        "family": "Searching",
        "summary": "Halve the search space while preserving sorted bounds.",
    },
    {
        "slug": "bubble-sort",
        "name": "Bubble Sort",
        "family": "Sorting",
        "summary": "Compare adjacent values and bubble larger elements to the end.",
    },
    {
        "slug": "insertion-sort",
        "name": "Insertion Sort",
        "family": "Sorting",
        "summary": "Grow a sorted prefix by inserting each new value into place.",
    },
    {
        "slug": "merge-sort",
        "name": "Merge Sort",
        "family": "Sorting",
        "summary": "Split, merge, and visualize stable divide-and-conquer flow.",
    },
    {
        "slug": "quick-sort",
        "name": "Quick Sort",
        "family": "Sorting",
        "summary": "Partition around a pivot and recursively tighten both sides.",
    },
    {
        "slug": "dijkstra",
        "name": "Dijkstra",
        "family": "Graphs",
        "summary": "Explore shortest paths with frontier relaxation.",
    },
]

SIMULATIONS = [
    {
        "slug": "boids-swarm",
        "name": "Boids Swarm",
        "scale": "100k-ready",
        "summary": "Emergent flocking under live cohesion and repulsion tuning.",
    },
    {
        "slug": "raft-failover",
        "name": "Raft Failover",
        "scale": "cluster",
        "summary": "Stress consensus timing with injected leader failures.",
    },
    {
        "slug": "vortex-ring",
        "name": "Vortex Ring",
        "scale": "orbital",
        "summary": "Drive the field into rotational flow around a glowing central core.",
    },
    {
        "slug": "pulse-lattice",
        "name": "Pulse Lattice",
        "scale": "grid",
        "summary": "Snap particles toward a living grid that breathes in synchronized waves.",
    },
    {
        "slug": "attractor-map",
        "name": "Dual Attractor Map",
        "scale": "field",
        "summary": "Split the swarm between two moving attractors and watch the paths interfere.",
    },
]

PROJECT_BLUEPRINTS = [
    {
        "slug": "mini-search-engine",
        "name": "Mini Search Engine",
        "difficulty": "Intermediate",
        "summary": "Index, query, and inspect ranking flow across services.",
    },
    {
        "slug": "event-queue-observer",
        "name": "Event Queue Observer",
        "difficulty": "Advanced",
        "summary": "Build a streaming dashboard around queue throughput and retries.",
    },
]

PROGRESS_SUMMARY = {
    "continuity": {
        "realm": "dojo",
        "title": "Loop Mastery",
        "summary": "Resume a counter-trace lesson and carry the result into the Laboratory.",
        "ctaLabel": "Resume Quest",
        "href": "/dojo",
        "visual": {
            "kind": "memory-trace",
            "primaryLabel": "counter",
            "primaryValue": "10",
            "secondaryLabel": "next visual",
            "secondaryValue": "pointer drone",
        },
    },
    "weeklyStats": [
        {"day": "Mon", "activeMinutes": 18, "logicProblemsSolved": 4},
        {"day": "Tue", "activeMinutes": 24, "logicProblemsSolved": 6},
        {"day": "Wed", "activeMinutes": 31, "logicProblemsSolved": 7},
        {"day": "Thu", "activeMinutes": 22, "logicProblemsSolved": 5},
        {"day": "Fri", "activeMinutes": 38, "logicProblemsSolved": 9},
        {"day": "Sat", "activeMinutes": 27, "logicProblemsSolved": 6},
        {"day": "Sun", "activeMinutes": 16, "logicProblemsSolved": 3},
    ],
    "focus": {
        "label": "Recursive Depth",
        "summary": "You recover quickly after split-and-merge steps, but nested state tracking still slows later passes.",
        "recommendedRealm": "path",
    },
}

PATH_ANALYTICS = {
    "weeklyFocus": "Recursive Depth",
    "strengths": ["Loop consistency", "Array scanning"],
    "frictionPoints": ["Nested recursion", "Snapshot comparison"],
}
