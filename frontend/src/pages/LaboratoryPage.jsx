import { useEffect, useMemo, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchAlgorithms, aiSocraticAnchor } from '../api'
import { realmConfig } from '../appConfig'
import PageHeader from '../components/PageHeader'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { motion, AnimatePresence } from 'framer-motion'

const graphNodes = {
  A: { x: 80, y: 70 },
  B: { x: 240, y: 40 },
  C: { x: 390, y: 90 },
  D: { x: 150, y: 220 },
  E: { x: 320, y: 240 },
  F: { x: 470, y: 200 },
}

const graphEdges = [
  ['A', 'B', 4],
  ['A', 'D', 2],
  ['B', 'C', 3],
  ['B', 'E', 6],
  ['D', 'E', 3],
  ['D', 'B', 1],
  ['E', 'C', 2],
  ['E', 'F', 4],
  ['C', 'F', 2],
]

const algorithmVisualizers = {
  'binary-search': {
    title: 'Binary Search',
    mode: 'array',
    codeLines: [
      'low, high = 0, len(values) - 1',
      'while low <= high:',
      '    mid = (low + high) // 2',
      '    if values[mid] == target: return mid',
      '    if values[mid] < target: low = mid + 1',
      '    else: high = mid - 1',
    ],
    complexity: { time: 'O(log N)', space: 'O(1)' },
    getStructureState(snapshot) {
      return {
        'Index Range': `${snapshot.low} → ${snapshot.high}`,
        'Midpoint': snapshot.mid !== null ? snapshot.mid : 'none',
        'Target': 36
      }
    },
    buildSnapshots() {
      const values = [3, 7, 12, 18, 21, 24, 31, 36, 42, 49, 56]
      const target = 36
      const snapshots = [
        {
          line: 1,
          message: `Search starts across ${values.length} sorted values looking for ${target}.`,
          anchorLabel: 'Start',
          values,
          low: 0,
          high: values.length - 1,
          mid: null,
          foundIndex: null,
        },
      ]

      let low = 0
      let high = values.length - 1

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)

        snapshots.push({
          line: 3,
          message: `Probe the midpoint at index ${mid}.`,
          anchorLabel: `mid ${mid}`,
          values,
          low,
          high,
          mid,
          foundIndex: null,
        })

        if (values[mid] === target) {
          snapshots.push({
            line: 4,
            message: `Target found at index ${mid}.`,
            anchorLabel: 'Found',
            values,
            low,
            high,
            mid,
            foundIndex: mid,
          })
          break
        }

        if (values[mid] < target) {
          low = mid + 1
          snapshots.push({
            line: 5,
            message: `Discard the lower half and move low to ${low}.`,
            values,
            low,
            high,
            mid,
            foundIndex: null,
          })
        } else {
          high = mid - 1
          snapshots.push({
            line: 6,
            message: `Discard the upper half and move high to ${high}.`,
            values,
            low,
            high,
            mid,
            foundIndex: null,
          })
        }
      }

      return snapshots
    },
  },
  'bubble-sort': {
    title: 'Bubble Sort',
    mode: 'bars',
    codeLines: [
      'def bubble_sort(values):',
      '    n = len(values)',
      '    for i in range(n):',
      '        for j in range(0, n - i - 1):',
      '            if values[j] > values[j + 1]:',
      '                values[j], values[j + 1] = values[j + 1], values[j]',
      '    return values',
    ],
    complexity: { time: 'O(N^2)', space: 'O(1)' },
    getStructureState(snapshot) {
      return {
        'Comparing': snapshot.comparing ? `${snapshot.comparing[0]} & ${snapshot.comparing[1]}` : 'none',
        'Sorted Items': snapshot.sortedCount,
      }
    },
    buildSnapshots() {
      const values = [54, 26, 93, 17, 77, 31, 44, 55, 20]
      const n = values.length
      const snapshots = [
        {
          line: 1,
          message: 'Initialize array for bubble sort.',
          anchorLabel: 'Start',
          values: [...values],
          comparing: null,
          sortedCount: 0,
        },
      ]

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          snapshots.push({
            line: 4,
            message: `Compare elements at index ${j} and ${j + 1}.`,
            values: [...values],
            comparing: [j, j + 1],
            sortedCount: i,
          })
          if (values[j] > values[j + 1]) {
            let temp = values[j]
            values[j] = values[j + 1]
            values[j + 1] = temp
            snapshots.push({
              line: 6,
              message: `Swap elements at index ${j} and ${j + 1}.`,
              anchorLabel: `Swap ${values[j + 1]} & ${values[j]}`,
              values: [...values],
              comparing: [j, j + 1],
              sortedCount: i,
            })
          }
        }
        snapshots.push({
          line: 3,
          message: `Largest element bubbled to the end.`,
          values: [...values],
          comparing: null,
          sortedCount: i + 1,
        })
      }

      snapshots.push({
        line: 7,
        message: 'Array is completely sorted.',
        anchorLabel: 'Done',
        values: [...values],
        comparing: null,
        sortedCount: n,
      })

      return snapshots
    },
  },
  'insertion-sort': {
    title: 'Insertion Sort',
    mode: 'bars',
    codeLines: [
      'def insertion_sort(values):',
      '    for i in range(1, len(values)):',
      '        key = values[i]',
      '        j = i - 1',
      '        while j >= 0 and values[j] > key:',
      '            values[j + 1] = values[j]; j -= 1',
      '        values[j + 1] = key',
    ],
    complexity: { time: 'O(N^2)', space: 'O(1)' },
    getStructureState(snapshot) {
      return {
        'Sorted Prefix': snapshot.sortedCount,
        'Key Value': snapshot.keyValue ?? 'none',
        'Insertion Slot': snapshot.insertionIndex ?? 'pending',
      }
    },
    buildSnapshots() {
      const values = [29, 10, 14, 37, 13, 5]
      const snapshots = [
        {
          line: 1,
          message: 'Start with the first value treated as a sorted prefix.',
          anchorLabel: 'Start',
          values: [...values],
          activeRange: [0, 0],
          mergedIndices: [0],
          sortedCount: 1,
          keyValue: null,
          insertionIndex: null,
        },
      ]

      for (let i = 1; i < values.length; i += 1) {
        const key = values[i]
        let j = i - 1

        snapshots.push({
          line: 3,
          message: `Lift ${key} out and compare it against the sorted prefix.`,
          anchorLabel: `key ${key}`,
          values: [...values],
          activeRange: [0, i],
          mergedIndices: Array.from({ length: i }, (_, index) => index),
          sortedCount: i,
          keyValue: key,
          insertionIndex: i,
        })

        while (j >= 0 && values[j] > key) {
          snapshots.push({
            line: 5,
            message: `${values[j]} is larger than ${key}, so shift it right.`,
            values: [...values],
            activeRange: [0, i],
            mid: j,
            mergedIndices: Array.from({ length: i }, (_, index) => index),
            sortedCount: i,
            keyValue: key,
            insertionIndex: j,
          })

          values[j + 1] = values[j]
          j -= 1

          snapshots.push({
            line: 6,
            message: 'The gap moves left until the correct slot opens.',
            values: [...values],
            activeRange: [0, i],
            mergedIndices: Array.from({ length: i }, (_, index) => index),
            sortedCount: i,
            keyValue: key,
            insertionIndex: j + 1,
          })
        }

        values[j + 1] = key
        snapshots.push({
          line: 7,
          message: `${key} slides into index ${j + 1}, extending the sorted prefix.`,
          anchorLabel: `insert ${key}`,
          values: [...values],
          activeRange: [0, i],
          mergedIndices: Array.from({ length: i + 1 }, (_, index) => index),
          sortedCount: i + 1,
          keyValue: key,
          insertionIndex: j + 1,
        })
      }

      snapshots.push({
        line: 7,
        message: 'Every value has been inserted and the array is sorted.',
        anchorLabel: 'Done',
        values: [...values],
        activeRange: [0, values.length - 1],
        mergedIndices: Array.from({ length: values.length }, (_, index) => index),
        sortedCount: values.length,
        keyValue: null,
        insertionIndex: null,
      })

      return snapshots
    },
  },
  'selection-sort': {
    title: 'Selection Sort',
    mode: 'bars',
    codeLines: [
      'def selection_sort(values):',
      '    for i in range(len(values)):',
      '        min_index = i',
      '        for j in range(i + 1, len(values)):',
      '            if values[j] < values[min_index]:',
      '                min_index = j',
      '        values[i], values[min_index] = values[min_index], values[i]',
    ],
    complexity: { time: 'O(N^2)', space: 'O(1)' },
    getStructureState(snapshot) {
      return {
        'Locked Prefix': snapshot.sortedCount ?? 0,
        'Current Minimum': snapshot.minValue ?? 'none',
        'Scan Window': snapshot.activeRange ? `${snapshot.activeRange[0]}–${snapshot.activeRange[1]}` : 'none',
      }
    },
    buildSnapshots() {
      const values = [64, 25, 12, 22, 11, 45]
      const snapshots = [
        {
          line: 1,
          message: 'Selection sort starts by treating the entire array as unsorted.',
          anchorLabel: 'Start',
          values: [...values],
          activeRange: [0, values.length - 1],
          comparing: null,
          mergedIndices: [],
          sortedCount: 0,
          minValue: null,
          mid: null,
        },
      ]

      for (let i = 0; i < values.length; i += 1) {
        let minIndex = i

        snapshots.push({
          line: 3,
          message: `Assume index ${i} is the minimum, then scan the remaining tail.`,
          anchorLabel: `slot ${i}`,
          values: [...values],
          activeRange: [i, values.length - 1],
          comparing: [i],
          mergedIndices: Array.from({ length: i }, (_, index) => index),
          sortedCount: i,
          minValue: values[minIndex],
          mid: minIndex,
        })

        for (let j = i + 1; j < values.length; j += 1) {
          snapshots.push({
            line: 4,
            message: `Compare candidate ${values[j]} against current minimum ${values[minIndex]}.`,
            values: [...values],
            activeRange: [i, values.length - 1],
            comparing: [minIndex, j],
            mergedIndices: Array.from({ length: i }, (_, index) => index),
            sortedCount: i,
            minValue: values[minIndex],
            mid: j,
          })

          if (values[j] < values[minIndex]) {
            minIndex = j
            snapshots.push({
              line: 6,
              message: `${values[minIndex]} becomes the new minimum for slot ${i}.`,
              anchorLabel: `min ${values[minIndex]}`,
              values: [...values],
              activeRange: [i, values.length - 1],
              comparing: [i, minIndex],
              mergedIndices: Array.from({ length: i }, (_, index) => index),
              sortedCount: i,
              minValue: values[minIndex],
              mid: minIndex,
            })
          }
        }

        ;[values[i], values[minIndex]] = [values[minIndex], values[i]]
        snapshots.push({
          line: 7,
          message: `Swap the minimum into slot ${i} and extend the locked prefix.`,
          anchorLabel: `lock ${values[i]}`,
          values: [...values],
          activeRange: [i, values.length - 1],
          comparing: [i, minIndex],
          mergedIndices: Array.from({ length: i + 1 }, (_, index) => index),
          sortedCount: i + 1,
          minValue: values[i],
          mid: i,
        })
      }

      snapshots.push({
        line: 7,
        message: 'Every slot has claimed its minimum value and the array is sorted.',
        anchorLabel: 'Done',
        values: [...values],
        activeRange: [0, values.length - 1],
        comparing: null,
        mergedIndices: Array.from({ length: values.length }, (_, index) => index),
        sortedCount: values.length,
        minValue: null,
        mid: null,
      })

      return snapshots
    },
  },
  'merge-sort': {
    title: 'Merge Sort',
    mode: 'bars',
    codeLines: [
      'def merge_sort(values):',
      '    if len(values) <= 1: return values',
      '    mid = len(values) // 2',
      '    left = merge_sort(values[:mid])',
      '    right = merge_sort(values[mid:])',
      '    return merge(left, right)',
    ],
    complexity: { time: 'O(N log N)', space: 'O(N)' },
    getStructureState(snapshot) {
      return {
        'Active Range': snapshot.activeRange ? `${snapshot.activeRange[0]}–${snapshot.activeRange[1]}` : 'none',
        'Merged Status': snapshot.mergedIndices?.length > 0 ? 'Partial Merge' : 'Splitting'
      }
    },
    buildSnapshots() {
      const initial = [38, 27, 43, 3, 9, 82, 10]
      const working = initial.slice()
      const snapshots = [
        {
          line: 1,
          message: 'Start with an unsorted array and divide it recursively.',
          anchorLabel: 'Start',
          values: working.slice(),
          activeRange: [0, working.length - 1],
          mergedIndices: [],
        },
      ]

      function mergeSort(start, end) {
        if (start === end) {
          return [working[start]]
        }

        const mid = Math.floor((start + end) / 2)
        snapshots.push({
          line: 3,
          message: `Split the range ${start}-${end} at ${mid}.`,
          anchorLabel: end - start > 2 ? `split ${start}-${end}` : null,
          values: working.slice(),
          activeRange: [start, end],
          mergedIndices: [],
        })

        const left = mergeSort(start, mid)
        const right = mergeSort(mid + 1, end)
        const merged = []
        let leftIndex = 0
        let rightIndex = 0

        while (leftIndex < left.length && rightIndex < right.length) {
          if (left[leftIndex] <= right[rightIndex]) {
            merged.push(left[leftIndex])
            leftIndex += 1
          } else {
            merged.push(right[rightIndex])
            rightIndex += 1
          }
        }

        while (leftIndex < left.length) {
          merged.push(left[leftIndex])
          leftIndex += 1
        }

        while (rightIndex < right.length) {
          merged.push(right[rightIndex])
          rightIndex += 1
        }

        merged.forEach((value, offset) => {
          working[start + offset] = value
        })

        snapshots.push({
          line: 6,
          message: `Merge produces a sorted block for ${start}-${end}.`,
          anchorLabel: end - start > 1 ? `merge ${start}-${end}` : null,
          values: working.slice(),
          activeRange: [start, end],
          mergedIndices: Array.from({ length: end - start + 1 }, (_, index) => start + index),
        })

        return merged
      }

      mergeSort(0, working.length - 1)

      snapshots.push({
        line: 6,
        message: 'All partial merges are complete and the array is now sorted.',
        anchorLabel: 'Sorted',
        values: working.slice(),
        activeRange: [0, working.length - 1],
        mergedIndices: Array.from({ length: working.length }, (_, index) => index),
      })

      return snapshots
    },
  },
  'quick-sort': {
    title: 'Quick Sort',
    mode: 'bars',
    codeLines: [
      'def quick_sort(values, low, high):',
      '    if low >= high: return',
      '    pivot = values[high]',
      '    split = partition(values, low, high, pivot)',
      '    quick_sort(values, low, split - 1)',
      '    quick_sort(values, split + 1, high)',
    ],
    complexity: { time: 'O(N log N) avg', space: 'O(log N)' },
    getStructureState(snapshot) {
      return {
        'Active Partition': snapshot.activeRange ? `${snapshot.activeRange[0]}–${snapshot.activeRange[1]}` : 'none',
        'Pivot': snapshot.pivotValue ?? 'none',
        'Finalized Pivots': snapshot.sortedCount ?? 0,
      }
    },
    buildSnapshots() {
      const values = [33, 10, 55, 71, 29, 3, 18]
      const finalized = new Set()
      const snapshots = [
        {
          line: 1,
          message: 'Start with a full partition and choose pivots to split the work.',
          anchorLabel: 'Start',
          values: [...values],
          activeRange: [0, values.length - 1],
          mergedIndices: [],
          sortedCount: 0,
          pivotValue: null,
          mid: null,
        },
      ]

      function finalizedIndices() {
        return [...finalized].sort((left, right) => left - right)
      }

      function quickSort(low, high) {
        if (low >= high) {
          if (low === high) {
            finalized.add(low)
          }
          return
        }

        const pivotValue = values[high]
        let storeIndex = low

        snapshots.push({
          line: 3,
          message: `Choose ${pivotValue} as the pivot for ${low}-${high}.`,
          anchorLabel: `pivot ${pivotValue}`,
          values: [...values],
          activeRange: [low, high],
          mergedIndices: finalizedIndices(),
          sortedCount: finalized.size,
          pivotValue,
          mid: high,
        })

        for (let scan = low; scan < high; scan += 1) {
          snapshots.push({
            line: 4,
            message: `Compare ${values[scan]} with pivot ${pivotValue}.`,
            values: [...values],
            activeRange: [low, high],
            mergedIndices: finalizedIndices(),
            sortedCount: finalized.size,
            pivotValue,
            mid: scan,
          })

          if (values[scan] <= pivotValue) {
            ;[values[storeIndex], values[scan]] = [values[scan], values[storeIndex]]
            snapshots.push({
              line: 4,
              message: `${values[storeIndex]} belongs on the left side, so it moves into the partition.`,
              values: [...values],
              activeRange: [low, high],
              mergedIndices: finalizedIndices(),
              sortedCount: finalized.size,
              pivotValue,
              mid: storeIndex,
            })
            storeIndex += 1
          }
        }

        ;[values[storeIndex], values[high]] = [values[high], values[storeIndex]]
        finalized.add(storeIndex)
        snapshots.push({
          line: 4,
          message: `Pivot ${pivotValue} lands at index ${storeIndex}, locking one position.`,
          anchorLabel: `split ${storeIndex}`,
          values: [...values],
          activeRange: [low, high],
          mergedIndices: finalizedIndices(),
          sortedCount: finalized.size,
          pivotValue,
          mid: storeIndex,
        })

        quickSort(low, storeIndex - 1)
        quickSort(storeIndex + 1, high)
      }

      quickSort(0, values.length - 1)

      snapshots.push({
        line: 6,
        message: 'All partitions have collapsed and the array is sorted.',
        anchorLabel: 'Done',
        values: [...values],
        activeRange: [0, values.length - 1],
        mergedIndices: Array.from({ length: values.length }, (_, index) => index),
        sortedCount: values.length,
        pivotValue: null,
        mid: null,
      })

      return snapshots
    },
  },
  dijkstra: {
    title: 'Dijkstra',
    mode: 'graph',
    codeLines: [
      'dist[start] = 0',
      'while unvisited nodes remain:',
      '    current = cheapest unvisited node',
      '    for each neighbor: relax edge',
      '    mark current as visited',
      'return distances',
    ],
    complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
    getStructureState(snapshot) {
      return {
        'Current Node': snapshot.currentNode || 'none',
        'Visited': `${snapshot.visited.length} / 6`,
        'Frontier Size': snapshot.frontier.length
      }
    },
    buildSnapshots() {
      const distances = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity }
      const visited = new Set()
      const nodes = Object.keys(graphNodes)
      const snapshots = [
        {
          line: 1,
          message: 'Initialize the source node A with distance 0.',
          anchorLabel: 'Start',
          distances: { ...distances },
          currentNode: 'A',
          visited: [],
          frontier: ['A'],
          activeEdge: null,
        },
      ]

      while (visited.size < nodes.length) {
        const currentNode = nodes
          .filter((node) => !visited.has(node))
          .sort((left, right) => distances[left] - distances[right])[0]

        if (!currentNode || distances[currentNode] === Infinity) {
          break
        }

        snapshots.push({
          line: 3,
          message: `Choose ${currentNode} because it has the cheapest known distance.`,
          anchorLabel: `visit ${currentNode}`,
          distances: { ...distances },
          currentNode,
          visited: [...visited],
          frontier: nodes.filter((node) => !visited.has(node) && distances[node] < Infinity),
          activeEdge: null,
        })

        graphEdges
          .filter(([from]) => from === currentNode)
          .forEach(([from, to, weight]) => {
            const candidate = distances[from] + weight

            if (candidate < distances[to]) {
              distances[to] = candidate
              snapshots.push({
                line: 4,
                message: `Relax ${from} -> ${to} and improve ${to} to ${candidate}.`,
                anchorLabel: `${from}->${to}`,
                distances: { ...distances },
                currentNode,
                visited: [...visited],
                frontier: nodes.filter((node) => !visited.has(node) && distances[node] < Infinity),
                activeEdge: [from, to],
              })
            }
          })

        visited.add(currentNode)
        snapshots.push({
          line: 5,
          message: `Mark ${currentNode} as finalized and move on.`,
          distances: { ...distances },
          currentNode,
          visited: [...visited],
          frontier: nodes.filter((node) => !visited.has(node) && distances[node] < Infinity),
          activeEdge: null,
        })
      }

      snapshots.push({
        line: 6,
        message: 'Shortest paths from A are resolved across the graph.',
        anchorLabel: 'Done',
        distances: { ...distances },
        currentNode: null,
        visited: [...visited],
        frontier: [],
        activeEdge: null,
      })

      return snapshots
    },
  },
  'breadth-first-search': {
    title: 'Breadth-First Search',
    mode: 'graph',
    codeLines: [
      'queue = [start]',
      'visited = {start}',
      'while queue:',
      '    node = queue.pop(0)',
      '    for neighbor in graph[node]:',
      '        if neighbor not in visited: queue.append(neighbor)',
    ],
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    getStructureState(snapshot) {
      return {
        'Current Node': snapshot.currentNode || 'none',
        'Visited': `${snapshot.visited.length} / 6`,
        'Queue': snapshot.frontier.length > 0 ? snapshot.frontier.join(' -> ') : 'empty',
      }
    },
    buildSnapshots() {
      const adjacency = {
        A: ['B', 'D'],
        B: ['C', 'E'],
        C: ['F'],
        D: ['E'],
        E: ['C', 'F'],
        F: [],
      }
      const queue = ['A']
      const visited = new Set(['A'])
      const snapshots = [
        {
          line: 1,
          message: 'Seed the queue with the start node A.',
          anchorLabel: 'Start',
          distances: {},
          currentNode: 'A',
          visited: ['A'],
          frontier: [...queue],
          activeEdge: null,
        },
      ]

      while (queue.length > 0) {
        const currentNode = queue.shift()

        snapshots.push({
          line: 4,
          message: `Pop ${currentNode} from the queue and expand its neighbors.`,
          anchorLabel: `visit ${currentNode}`,
          distances: {},
          currentNode,
          visited: [...visited],
          frontier: [...queue],
          activeEdge: null,
        })

        adjacency[currentNode].forEach((neighbor) => {
          snapshots.push({
            line: 5,
            message: `Inspect edge ${currentNode} -> ${neighbor}.`,
            distances: {},
            currentNode,
            visited: [...visited],
            frontier: [...queue],
            activeEdge: [currentNode, neighbor],
          })

          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
            snapshots.push({
              line: 6,
              message: `${neighbor} is new, so add it to the queue for the next layer.`,
              anchorLabel: `enqueue ${neighbor}`,
              distances: {},
              currentNode,
              visited: [...visited],
              frontier: [...queue],
              activeEdge: [currentNode, neighbor],
            })
          }
        })
      }

      snapshots.push({
        line: 6,
        message: 'The queue is empty, so breadth-first search has visited every reachable node.',
        anchorLabel: 'Done',
        distances: {},
        currentNode: null,
        visited: [...visited],
        frontier: [],
        activeEdge: null,
      })

      return snapshots
    },
  },
}

function formatDistance(value) {
  return Number.isFinite(value) ? value : 'inf'
}

function buildVisualizer(slug) {
  const config = algorithmVisualizers[slug] ?? algorithmVisualizers['binary-search']
  const snapshots = config.buildSnapshots()

  return {
    ...config,
    snapshots,
    anchors: snapshots
      .map((snapshot, index) => ({ ...snapshot, index }))
      .filter((snapshot) => Boolean(snapshot.anchorLabel)),
  }
}

function buildCanvasSignals(visualizer, currentSnapshot, structureState, stepIndex) {
  const structureEntries = Object.entries(structureState)
  const progressPercent = visualizer.snapshots.length > 1
    ? Math.round((stepIndex / (visualizer.snapshots.length - 1)) * 100)
    : 100

  return {
    progressPercent,
    headline: currentSnapshot.anchorLabel ?? 'Live phase',
    stats: [
      {
        label: 'Playback',
        value: `${stepIndex + 1}/${visualizer.snapshots.length}`,
      },
      {
        label: 'Anchors',
        value: String(visualizer.anchors.length),
      },
      {
        label: 'Progress',
        value: `${progressPercent}%`,
      },
    ],
    detailCards: structureEntries.slice(0, 4).map(([label, value]) => ({
      label,
      value: String(value),
    })),
    legend:
      visualizer.mode === 'graph'
        ? [
            { tone: 'cyan', label: 'Current node' },
            { tone: 'emerald', label: 'Visited node' },
            { tone: 'purple', label: 'Frontier node' },
          ]
        : [
            { tone: 'cyan', label: 'Active focus' },
            { tone: 'emerald', label: 'Locked result' },
            { tone: 'slate', label: 'Idle values' },
          ],
  }
}

function ArraySnapshotView({ snapshot, mode, onAnchorClick }) {
  const maxValue = Math.max(...snapshot.values)

  return (
    <div className={mode === 'bars' ? 'bar-visualizer' : 'array-visualizer'}>
      {snapshot.values.map((value, index) => {
        const inRange =
          Array.isArray(snapshot.activeRange) &&
          index >= snapshot.activeRange[0] &&
          index <= snapshot.activeRange[1]
        const isMid = snapshot.mid === index
        const isFound = snapshot.foundIndex === index
        const isMerged = snapshot.mergedIndices?.includes(index)
        const isComparing = snapshot.comparing?.includes(index)

        return (
          <div
            key={`${mode}-${index}-${value}`}
            className={`array-node${inRange ? ' is-in-range' : ''}${isMid ? ' is-mid' : ''}${isFound ? ' is-found' : ''}${isMerged ? ' is-merged' : ''}${isComparing ? ' is-comparing' : ''}`}
            onClick={() => onAnchorClick?.(`index ${index}`)}
            style={mode === 'bars' ? { height: `${Math.max(18, (value / maxValue) * 180)}px`, cursor: 'help' } : { cursor: 'help' }}
          >
            <span>{value}</span>
            <small>{index}</small>
          </div>
        )
      })}
    </div>
  )
}

function GraphSnapshotView({ snapshot, onAnchorClick }) {
  return (
    <div className="graph-visualizer">
      <svg viewBox="0 0 560 300" className="graph-surface" role="img" aria-label="Dijkstra graph">
        {graphEdges.map(([from, to, weight]) => {
          const fromNode = graphNodes[from]
          const toNode = graphNodes[to]
          const isActive =
            snapshot.activeEdge && snapshot.activeEdge[0] === from && snapshot.activeEdge[1] === to

          return (
            <g key={`${from}-${to}`}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className={`graph-edge${isActive ? ' is-active' : ''}`}
              />
              <text x={(fromNode.x + toNode.x) / 2} y={(fromNode.y + toNode.y) / 2 - 8} className="graph-weight">
                {weight}
              </text>
            </g>
          )
        })}

        {Object.entries(graphNodes).map(([node, position]) => {
          const isCurrent = snapshot.currentNode === node
          const isVisited = snapshot.visited.includes(node)
          const isFrontier = snapshot.frontier.includes(node)

          return (
            <g key={node} transform={`translate(${position.x}, ${position.y})`}>
              <circle
                r="28"
                className={`graph-node${isCurrent ? ' is-current' : ''}${isVisited ? ' is-visited' : ''}${isFrontier ? ' is-frontier' : ''}`}
                onClick={() => onAnchorClick?.(`node ${node}`)}
                style={{ cursor: 'help' }}
              />
              {isCurrent && (
                  <circle r="35" className="discovery-anchor-glow" />
              )}
              <text y="6" textAnchor="middle" className="graph-label">
                {node}
              </text>
              <text y="46" textAnchor="middle" className="graph-distance">
                {formatDistance(snapshot.distances[node])}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function SandboxPanel({ code, onCodeChange, activeLine, isModified }) {
  return (
    <div className={`sandbox-editor${isModified ? ' is-modified' : ''}`}>
      {isModified && (
        <div className="logic-delta-badge" title="User logic differs from canonical study material.">
          Logic Delta Detected
        </div>
      )}
      <Editor
        value={code}
        onValueChange={onCodeChange}
        highlight={(value) => Prism.highlight(value, Prism.languages.python, 'python')}
        padding={18}
        textareaClassName="code-editor-textarea"
        preClassName="code-editor-pre"
        className="code-editor"
      />
      <div className="editor-overlay-hints">
        {activeLine !== null && <div className="active-line-indicator" style={{ top: `${(activeLine - 1) * 1.7 + 1.1}rem` }} />}
      </div>
    </div>
  )
}

export default function LaboratoryPage() {
  const realm = realmConfig.laboratory
  const [state, setState] = useState({ status: 'loading', items: [], message: '' })
  const [selectedSlug, setSelectedSlug] = useState('binary-search')
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [customCodes, setCustomCodes] = useState({})
  const [aiHint, setAiHint] = useState({ status: 'idle', hint: '', anchor: null })
  const [playbackSpeed, setPlaybackSpeed] = useState(1100)
  const [isLooping, setIsLooping] = useState(false)
  const [isTraceCollapsed, setIsTraceCollapsed] = useState(false)
  const [exploredAlgorithms, setExploredAlgorithms] = useState(new Set())
  const traceListRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (location.state?.challenge?.algoSlug) {
      setSelectedSlug(location.state.challenge.algoSlug)
    }
  }, [location.state])

  async function handleGetHint(anchorName) {
    setAiHint({ status: 'requesting', hint: '', anchor: anchorName })
    try {
      const context = `Algorithm: ${activeSlug}, Visual Phase: ${currentSnapshot?.message ?? 'General'}`
      const res = await aiSocraticAnchor(activeCode, context, `Tell me about the ${anchorName} here.`)
      setAiHint({ status: 'ready', hint: res.hint, anchor: anchorName })
    } catch (error) {
      setAiHint({ status: 'error', hint: 'Sensei is silent. Try again.', anchor: anchorName })
    }
  }

  useEffect(() => {
    let cancelled = false

    fetchAlgorithms()
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'ready', items: data.items ?? [], message: '' })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', items: [], message: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const supportedItems = useMemo(
    () => state.items.filter((item) => Boolean(algorithmVisualizers[item.slug])),
    [state.items],
  )

  const activeSlug = useMemo(() => {
    if (supportedItems.some((item) => item.slug === selectedSlug)) {
      return selectedSlug
    }

    return supportedItems[0]?.slug ?? 'binary-search'
  }, [selectedSlug, supportedItems])

  const visualizer = useMemo(() => buildVisualizer(activeSlug), [activeSlug])
  const currentSnapshot = visualizer.snapshots[Math.min(stepIndex, visualizer.snapshots.length - 1)]
  const selectedAlgorithm =
    supportedItems.find((item) => item.slug === activeSlug) ?? state.items.find((item) => item.slug === activeSlug)

  useEffect(() => {
    setStepIndex(0)
    setIsPlaying(false)
    setExploredAlgorithms(prev => new Set([...prev, activeSlug]))
  }, [activeSlug])

  // Auto-scroll trace feed
  useEffect(() => {
    if (traceListRef.current) {
      const activeItem = traceListRef.current.querySelector('.trace-item.is-active')
      activeItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [stepIndex])

  const canonicalCode = useMemo(() => visualizer.codeLines.join('\n'), [visualizer.codeLines])
  const activeCode = customCodes[activeSlug] ?? canonicalCode
  const isLogicModified = activeCode !== canonicalCode

  const structureState = useMemo(() => {
    return visualizer.getStructureState?.(currentSnapshot) ?? {}
  }, [visualizer, currentSnapshot])
  const canvasSignals = useMemo(
    () => buildCanvasSignals(visualizer, currentSnapshot, structureState, stepIndex),
    [visualizer, currentSnapshot, structureState, stepIndex],
  )

  useEffect(() => {
    if (!isPlaying) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= visualizer.snapshots.length - 1) {
          if (isLooping) {
            return 0
          }
          window.clearInterval(intervalId)
          setIsPlaying(false)
          return current
        }

        return current + 1
      })
    }, playbackSpeed)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isPlaying, visualizer.snapshots.length, playbackSpeed, isLooping])

  return (
    <>
      <PageHeader
        eyebrow={realm.eyebrow}
        title={realm.name}
        description="Deep diagnostic analysis of foundation algorithms. 60FPS visualization with time-travel scrubbing, discovery anchors, and live pseudocode sync."
        accent={realm.accent}
      />

      {state.status === 'loading' ? (
        <section className="glass-panel status-card">
          <p className="status-label">Loading algorithms...</p>
        </section>
      ) : null}

      {state.status === 'error' ? (
        <section className="glass-panel status-card error-card">
          <p className="status-label">Unable to load algorithm metadata.</p>
          <p className="status-copy">{state.message}</p>
        </section>
      ) : null}

      {state.status === 'ready' ? (
        <>
          <motion.section 
            className="glass-panel lab-picker-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="panel-heading">
              <div>
                <p className="card-tag text-cyan">Algorithm Set</p>
                <h3>Choose a study track</h3>
              </div>
              <span className="mini-pill">{exploredAlgorithms.size}/{supportedItems.length} explored</span>
            </div>
            <div className="algorithm-picker">
              {supportedItems.map((algorithm) => {
                const viz = algorithmVisualizers[algorithm.slug]
                const isExplored = exploredAlgorithms.has(algorithm.slug)
                return (
                  <motion.button
                    key={algorithm.slug}
                    type="button"
                    className={`picker-button${algorithm.slug === activeSlug ? ' is-active' : ''}`}
                    onClick={() => setSelectedSlug(algorithm.slug)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <strong>{algorithm.name}</strong>
                      {isExplored && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', flexShrink: 0, marginTop: '6px' }} />}
                    </div>
                    <span>{algorithm.summary}</span>
                    {viz?.complexity && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0,242,255,0.1)', color: 'var(--cyan)' }}>
                          T: {viz.complexity.time}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(168,85,247,0.1)', color: 'var(--purple)' }}>
                          S: {viz.complexity.space}
                        </span>
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.section>

          <section className="laboratory-layout">
            <article className="glass-panel visualizer-panel">
              <div className="panel-heading">
                <div>
                  <p className="card-tag text-cyan">Visual Canvas</p>
                  <h3>{selectedAlgorithm?.name ?? visualizer.title}</h3>
                </div>
                <span className="mini-pill">Step {stepIndex + 1} / {visualizer.snapshots.length}</span>
              </div>

              <p className="status-copy">{currentSnapshot.message}</p>

              <div className="visualizer-frame laboratory-canvas-shell">
                <div className="laboratory-canvas-backdrop" />
                <div className="laboratory-canvas-header">
                  <div>
                    <p className="card-tag text-cyan">Canvas Phase</p>
                    <h4>{canvasSignals.headline}</h4>
                    <p className="status-copy">{currentSnapshot.message}</p>
                  </div>
                  <div className="laboratory-progress-dial" aria-hidden="true">
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--cyan)"
                        strokeWidth="2.5"
                        strokeDasharray={`${canvasSignals.progressPercent}, 100`}
                      />
                    </svg>
                    <strong>{canvasSignals.progressPercent}%</strong>
                  </div>
                </div>

                <div className="laboratory-canvas-stats">
                  {canvasSignals.stats.map((stat) => (
                    <div key={stat.label} className="laboratory-canvas-stat-card">
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="laboratory-canvas-main">
                  <div className="laboratory-canvas-stage">
                    {visualizer.mode === 'graph' ? (
                      <GraphSnapshotView snapshot={currentSnapshot} onAnchorClick={handleGetHint} />
                    ) : (
                      <ArraySnapshotView snapshot={currentSnapshot} mode={visualizer.mode} onAnchorClick={handleGetHint} />
                    )}
                  </div>

                  <aside className="laboratory-canvas-sidebar">
                    <section className="laboratory-canvas-card">
                      <div className="panel-heading">
                        <div>
                          <p className="card-tag text-purple">Live Variables</p>
                          <h4>Signal Rack</h4>
                        </div>
                      </div>
                      <div className="laboratory-canvas-detail-grid">
                        {canvasSignals.detailCards.map((card) => (
                          <div key={card.label} className="laboratory-canvas-detail-card">
                            <span>{card.label}</span>
                            <strong>{card.value}</strong>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="laboratory-canvas-card">
                      <div className="panel-heading">
                        <div>
                          <p className="card-tag text-cyan">Legend</p>
                          <h4>Visual Key</h4>
                        </div>
                      </div>
                      <div className="laboratory-canvas-legend">
                        {canvasSignals.legend.map((item) => (
                          <div key={item.label} className="laboratory-canvas-legend-item">
                            <span className={`laboratory-canvas-legend-swatch is-${item.tone}`} />
                            <strong>{item.label}</strong>
                          </div>
                        ))}
                      </div>
                    </section>
                  </aside>
                </div>
              </div>

              <div className="transport-row">
                <button type="button" className="action-button" onClick={() => setStepIndex(0)}>
                  Reset
                </button>
                <button
                  type="button"
                  className="action-button action-button-primary"
                  onClick={() => setIsPlaying((current) => !current)}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  className="action-button"
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="action-button"
                  onClick={() =>
                    setStepIndex((current) => Math.min(visualizer.snapshots.length - 1, current + 1))
                  }
                >
                  Forward
                </button>
              </div>

              <label className="scrubber-block">
                <span className="setting-header">
                  <strong>Time-Travel Scrubber</strong>
                  <small>{currentSnapshot.message}</small>
                </span>
                <input
                  type="range"
                  min="0"
                  max={visualizer.snapshots.length - 1}
                  value={stepIndex}
                  onChange={(event) => {
                    setIsPlaying(false)
                    setStepIndex(Number(event.target.value))
                  }}
                />
              </label>

              <label className="scrubber-block">
                <span className="setting-header">
                  <strong>Playback Velocity</strong>
                  <small>{(2000 - playbackSpeed) / 100}x</small>
                </span>
                <input
                  type="range"
                  min="200"
                  max="1800"
                  step="100"
                  value={2000 - playbackSpeed}
                  onChange={(event) => setPlaybackSpeed(2000 - Number(event.target.value))}
                />
              </label>

              <div className="anchor-row" aria-label="Discovery anchors">
                {visualizer.anchors.map((anchor) => (
                  <button
                    key={`${activeSlug}-${anchor.index}`}
                    type="button"
                    className={`anchor-dot${anchor.index === stepIndex ? ' is-active' : ''}`}
                    onClick={() => {
                      setIsPlaying(false)
                      setStepIndex(anchor.index)
                    }}
                    title={anchor.anchorLabel}
                    aria-label={anchor.anchorLabel}
                  />
                ))}
              </div>
            </article>

            <aside className="lab-side-column">
              <article className="glass-panel content-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-purple">Trace Feed</p>
                    <h3>Operational Log</h3>
                  </div>
                </div>
                <div className="trace-list">
                  {visualizer.snapshots.map((snap, i) => (
                    <div
                      key={i}
                      className={`trace-item${i === stepIndex ? ' is-active' : ''}`}
                      onClick={() => setStepIndex(i)}
                    >
                      <span className="trace-step">{String(i).padStart(2, '0')}</span>
                      <p>{snap.message}</p>
                    </div>
                  ))}
                </div>

                {aiHint.status !== 'idle' && (
                  <div className="glass-panel ai-hint-bubble accent-cyan" style={{ marginTop: '20px' }}>
                    <div className="panel-heading">
                      <p className="card-tag text-cyan">Sensei Hint: {aiHint.anchor}</p>
                    </div>
                    <p className="status-copy">
                      {aiHint.status === 'requesting' ? 'Whispering into the logic void...' : aiHint.hint}
                    </p>
                    {aiHint.status === 'ready' && (
                      <button className="inline-link" onClick={() => setAiHint({ status: 'idle', hint: '', anchor: null })}>Dismiss</button>
                    )}
                  </div>
                )}
              </article>

              <article className="glass-panel content-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-cyan">Logic Snapshot</p>
                    <h3>Telemetry Dock</h3>
                  </div>
                </div>
                <dl className="telemetry-list">
                  <div>
                    <dt>Algorithm</dt>
                    <dd>{selectedAlgorithm?.name ?? visualizer.title}</dd>
                  </div>
                  <div>
                    <dt>Family</dt>
                    <dd>{selectedAlgorithm?.family ?? 'Study'}</dd>
                  </div>
                  <div>
                    <dt>Current Step</dt>
                    <dd>{stepIndex + 1}</dd>
                  </div>
                  <div>
                    <dt>Anchor Count</dt>
                    <dd>{visualizer.anchors.length}</dd>
                  </div>
                  {visualizer.complexity && (
                    <>
                      <div>
                        <dt>Time Complexity</dt>
                        <dd className="text-cyan">{visualizer.complexity.time}</dd>
                      </div>
                      <div>
                        <dt>Space Complexity</dt>
                        <dd className="text-cyan">{visualizer.complexity.space}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </article>

              <article className="glass-panel content-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-purple">Structure State</p>
                    <h3>Active Variables</h3>
                  </div>
                </div>
                <dl className="telemetry-list">
                  {Object.entries(structureState).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>

              <article className="glass-panel content-card">
                <div className="panel-heading">
                  <div>
                    <p className="card-tag text-cyan">Live-Logic Sandbox</p>
                    <h3>Pseudocode Sync</h3>
                  </div>
                  <button
                    type="button"
                    className="mini-pill"
                    onClick={() => setCustomCodes((prev) => ({ ...prev, [activeSlug]: canonicalCode }))}
                    disabled={!isLogicModified}
                  >
                    Reset Logic
                  </button>
                </div>
                <SandboxPanel
                  code={activeCode}
                  onCodeChange={(newCode) => setCustomCodes((prev) => ({ ...prev, [activeSlug]: newCode }))}
                  activeLine={currentSnapshot.line}
                  isModified={isLogicModified}
                />
              </article>
            </aside>
          </section>
        </>
      ) : null}
    </>
  )
}
