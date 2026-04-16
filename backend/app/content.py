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
    },
    {
        "slug": "loop-mastery",
        "title": "Loop Mastery",
        "tier": "Core",
        "summary": "Understand iteration, counters, and loop control flow.",
    },
    {
        "slug": "pointer-drones",
        "title": "Pointer Drones",
        "tier": "Libraries",
        "summary": "Learn how references move through linked structures.",
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
        "slug": "merge-sort",
        "name": "Merge Sort",
        "family": "Sorting",
        "summary": "Split, merge, and visualize stable divide-and-conquer flow.",
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
