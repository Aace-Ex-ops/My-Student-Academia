// Course Study Materials & Academic Document Repository
// My Student Academia Ecosystem

export type DocumentType = "LECTURE_NOTES" | "PROBLEM_SET" | "LAB_MANUAL" | "FORMULA_SHEET";

export interface DocumentChapter {
  id: string;
  chapterNumber: number;
  title: string;
  summary: string;
  keyTakeaways: string[];
  content: string;
  formulasOrCode?: string;
}

export interface CourseDocument {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  type: DocumentType;
  typeLabel: string;
  badgeColor: string;
  author: string;
  authorTitle: string;
  term: string;
  lastUpdated: string;
  totalPages: number;
  fileSize: string;
  summary: string;
  topicsCovered: string[];
  chapters: DocumentChapter[];
}

// ✦ HELPER TO BUILD STRUCTURED CHAPTER CONTENT ✦
function createDoc(
  id: string,
  courseCode: string,
  courseTitle: string,
  title: string,
  type: DocumentType,
  author: string,
  authorTitle: string,
  totalPages: number,
  fileSize: string,
  summary: string,
  topicsCovered: string[],
  chapters: DocumentChapter[]
): CourseDocument {
  const typeMap: Record<DocumentType, { label: string; color: string }> = {
    LECTURE_NOTES: { label: "Lecture Notes & Compendium", color: "from-blue-600 to-indigo-600" },
    PROBLEM_SET: { label: "Problem Set & Worked Solutions", color: "from-amber-500 to-orange-600" },
    LAB_MANUAL: { label: "Hands-on Lab & Implementation", color: "from-emerald-500 to-teal-600" },
    FORMULA_SHEET: { label: "Formula Sheet & Exam Review", color: "from-purple-500 to-pink-600" },
  };

  return {
    id,
    courseCode,
    courseTitle,
    title,
    type,
    typeLabel: typeMap[type].label,
    badgeColor: typeMap[type].color,
    author,
    authorTitle,
    term: "Fall 2026 Academic Term",
    lastUpdated: "October 2026",
    totalPages,
    fileSize,
    summary,
    topicsCovered,
    chapters,
  };
}

// ✦ REALISTIC MASTER STUDY MATERIALS REPOSITORY FOR ALL 33 COURSES ✦
export const COURSE_MATERIALS_CATALOG: Record<string, CourseDocument[]> = {
  // ── 1. CS101: Computational Thinking & Algorithm Design ──
  CS101: [
    createDoc(
      "doc-cs101-notes",
      "CS101",
      "Computational Thinking & Algorithm Design",
      "CS101 Comprehensive Lecture Compendium: Algorithmic Complexity, Recursion & Memory",
      "LECTURE_NOTES",
      "Dr. Vikram Sethi",
      "Professor of Algorithms",
      44,
      "4.2 MB",
      "Rigorous theoretical guide covering asymptotic notation (Big-O, Big-Omega, Big-Theta), recursive call-stack mechanics, master theorem, and dynamic memory allocation.",
      ["Asymptotic Analysis", "Divide & Conquer", "Call Stack Traces", "Pointer Arithmetic"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Asymptotic Notation and Mathematical Growth Models",
          summary: "Formal definitions of asymptotic upper, lower, and tight bounds.",
          keyTakeaways: [
            "f(n) is O(g(n)) iff ∃ constants c > 0 and n0 such that 0 ≤ f(n) ≤ c·g(n) ∀ n ≥ n0.",
            "Always drop lower-order terms and constant coefficients when computing limits as n → ∞.",
            "Recurrence relation T(n) = aT(n/b) + f(n) resolves via the Master Theorem.",
          ],
          content: `In theoretical computer science, we classify algorithms according to how their run-time or space requirements grow as the input size $n$ scales toward infinity.
Rather than measuring absolute execution time in microseconds—which fluctuates with CPU architectures, hardware interrupts, and compiler optimization flags—we quantify the fundamental number of primitive machine instructions executed.

### 1.1 The Master Theorem
For recurrence relations of the divide-and-conquer form:
$$T(n) = a T(n/b) + f(n)$$
Where $a \\ge 1$ is the number of subproblems, $b > 1$ is the problem size division factor, and $f(n)$ represents the cost of dividing and combining subproblems outside the recursive calls.

Case 1: If $f(n) = O(n^{\\log_b a - \\epsilon})$ for some $\\epsilon > 0$, then $T(n) = \\Theta(n^{\\log_b a})$.
Case 2: If $f(n) = \\Theta(n^{\\log_b a} \\log^k n)$, then $T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n)$.
Case 3: If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ and the regularity condition $a f(n/b) \\le c f(n)$ holds for $c < 1$, then $T(n) = \\Theta(f(n))$.`,
          formulasOrCode: `// Example: Binary Search (O(log n))
int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // Not found
}`,
        },
        {
          id: "ch2",
          chapterNumber: 2,
          title: "Memory Models, Stack Frames & Pointers in C++",
          summary: "Understanding the activation stack, heap allocations, and memory safety.",
          keyTakeaways: [
            "Stack memory is automatically managed with LIFO frame allocation and deallocation.",
            "Heap memory allocations (malloc / new) persist until explicitly freed, creating potential for memory leaks.",
            "Smart pointers (std::unique_ptr, std::shared_ptr) use RAII to guarantee deterministic cleanup.",
          ],
          content: `Every running process is mapped into a virtual address space.
The runtime address space is partitioned into four major regions:
1. **Text Segment**: Contains compiled binary instructions (read-only).
2. **Data / BSS Segment**: Contains initialized and uninitialized global and static variables.
3. **Heap Segment**: Expands upward toward higher memory addresses during dynamic allocations.
4. **Stack Segment**: Expands downward toward lower memory addresses to store local variables and activation records.

When a function executes, a stack frame (activation record) is allocated containing return address, caller-saved registers, parameters, and local variables.`,
          formulasOrCode: `// Modern C++ RAII Memory Management
#include <memory>
#include <iostream>

struct Node {
    int value;
    std::unique_ptr<Node> next;
    Node(int val) : value(val), next(nullptr) {}
};

void createPipeline() {
    auto head = std::make_unique<Node>(10);
    head->next = std::make_unique<Node>(20);
    // Automatic deterministic deallocation upon leaving scope
}`,
        },
      ]
    ),
    createDoc(
      "doc-cs101-ps",
      "CS101",
      "Computational Thinking & Algorithm Design",
      "CS101 Problem Set & Complete Analytical Solutions",
      "PROBLEM_SET",
      "Dr. Vikram Sethi",
      "Professor of Algorithms",
      28,
      "2.6 MB",
      "Graded problem sets with step-by-step proofs, recurrence trees, loop invariant demonstrations, and asymptotic derivations.",
      ["Recurrence Proofs", "Loop Invariants", "Sorting Lower Bounds", "Bitwise Computations"],
      [
        {
          id: "ps1",
          chapterNumber: 1,
          title: "Problem Set 1: Recurrence Equations & Mathematical Induction",
          summary: "Formal problem prompts and step-by-step worked analytical solutions.",
          keyTakeaways: [
            "Problem 1: Solve T(n) = 3T(n/2) + O(n^2) using substitution and Master Theorem.",
            "Problem 2: Prove that Merge Sort achieves worst-case O(n log n) comparisons using a decision-tree argument.",
          ],
          content: `### Question 1
Solve the recurrence $T(n) = 4T(n/2) + n^2$.
**Solution:**
Here, $a = 4$, $b = 2$, and $f(n) = n^2$.
We compute $n^{\\log_b a} = n^{\\log_2 4} = n^2$.
Comparing $f(n) = n^2$ with $n^{\\log_b a} = n^2$, we recognize Master Theorem Case 2 with $k = 0$.
Therefore:
$$T(n) = \\Theta(n^2 \\log n)$$

### Question 2: Decision Tree Sorting Lower Bound
Prove that any comparison-based sorting algorithm requires at least $\\Omega(n \\log n)$ comparisons in the worst case.
**Proof:**
A comparison sort on $n$ elements can produce any of the $n!$ distinct permutations.
A binary decision tree of height $h$ has at most $2^h$ leaves.
To distinguish all $n!$ permutations, the decision tree must have at least $n!$ leaves:
$$2^h \\ge n! \\implies h \\ge \\log_2(n!)$$
Using Stirling's approximation $\\log_2(n!) = n \\log_2 n - n \\log_2 e + O(\\log n)$, we obtain:
$$h \\ge \\Omega(n \\log n)$$
Thus, comparison sorting cannot run faster than $\\Omega(n \\log n)$.`,
        },
      ]
    ),
    createDoc(
      "doc-cs101-lab",
      "CS101",
      "Computational Thinking & Algorithm Design",
      "CS101 Hands-On Systems Lab Manual & Code Handouts",
      "LAB_MANUAL",
      "Dr. Vikram Sethi",
      "Professor of Algorithms",
      32,
      "3.1 MB",
      "Practical programming assignments, profiling memory consumption with Valgrind, and benchmarking algorithms in C++.",
      ["Valgrind Profiling", "Cache Locality", "Benchmarking", "GCC Optimization Flags"],
      [
        {
          id: "lab1",
          chapterNumber: 1,
          title: "Lab 01: Benchmarking Cache Hits & Pointer Indirection",
          summary: "Empirical verification of sequential array traversal vs. pointer-chasing linked lists.",
          keyTakeaways: [
            "Contiguous vector memory traversal exploits CPU cache line prefetching (L1/L2 hits).",
            "Node-based linked lists scatter memory across heap pages, inducing severe L3 cache misses.",
          ],
          content: `In this laboratory, students will implement two data structures holding 10,000,000 integers:
1. \`std::vector<int>\` (contiguous array buffer)
2. Custom \`LinkedList<int>\` (heap-allocated individual nodes)

Measure execution time using \`std::chrono::high_resolution_clock\` and monitor CPU branch mispredictions and L1-dcache-load-misses using Linux \`perf stat\`.`,
          formulasOrCode: `// Performance Benchmarking Harness
#include <vector>
#include <chrono>
#include <iostream>

void benchmarkVector(size_t N) {
    std::vector<int> data(N, 42);
    auto start = std::chrono::high_resolution_clock::now();
    long long sum = 0;
    for (size_t i = 0; i < N; ++i) {
        sum += data[i]; // Sequential contiguous prefetch
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "Vector Sum: " << sum << " in " 
              << std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() 
              << " us\\n";
}`,
        },
      ]
    ),
    createDoc(
      "doc-cs101-sheet",
      "CS101",
      "Computational Thinking & Algorithm Design",
      "CS101 Executive Formula Sheet & Exam Review Compendium",
      "FORMULA_SHEET",
      "Dr. Vikram Sethi",
      "Professor of Algorithms",
      16,
      "1.4 MB",
      "Quick-reference cheatsheet containing time/space complexities of all elementary algorithms, recurrence cheat tables, and pointer rules.",
      ["Complexity Cheat Sheet", "Master Theorem Cases", "Bit Manipulation Tricks"],
      [
        {
          id: "sheet1",
          chapterNumber: 1,
          title: "Master Complexity Matrix & Recurrence Formulas",
          summary: "Table of asymptotic complexities for search, sorting, and data structure operations.",
          keyTakeaways: [
            "Array Access: O(1) | Search: O(n) | Insert/Delete at end: O(1) amortized",
            "Balanced BST: Search: O(log n) | Insert: O(log n) | Delete: O(log n)",
            "Hash Table: Average O(1) search/insert | Worst case O(n) during catastrophic collisions",
          ],
          content: `### Elementary Sorting Complexities
| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? |
|---|---|---|---|---|---|
| Quick Sort | O(n log n) | O(n log n) | O(n^2) | O(log n) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Insertion Sort | O(n) | O(n^2) | O(n^2) | O(1) | Yes |

### Useful Bit Manipulation Identities
- Check if power of 2: \`(x > 0) && ((x & (x - 1)) == 0)\`
- Clear lowest set bit: \`x = x & (x - 1)\`
- Extract lowest set bit: \`x & (-x)\``,
        },
      ]
    ),
  ],

  // ── 2. CS201: Data Structures & High-Performance Computing ──
  CS201: [
    createDoc(
      "doc-cs201-notes",
      "CS201",
      "Data Structures & High-Performance Computing",
      "CS201 Advanced Data Structures: Balanced Trees, Graphs & Memory Layouts",
      "LECTURE_NOTES",
      "Dr. Ananya Roy",
      "Distinguished Chair of Systems",
      48,
      "4.8 MB",
      "In-depth analysis of AVL self-balancing trees, Red-Black color invariants, B+ Trees for SSD indexing, Dijkstra with Fibonacci Heaps, and cache-conscious memory layouts.",
      ["AVL Tree Rotations", "Red-Black Invariants", "Disjoint Set Union", "Fibonacci Heaps"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Self-Balancing Binary Search Trees (AVL & Red-Black)",
          summary: "Balance factor calculations, single/double rotations, and strict tree height bounds.",
          keyTakeaways: [
            "AVL balance factor = height(left) - height(right) ∈ {-1, 0, 1}.",
            "AVL trees guarantee maximum height ≤ 1.44 log2(n), yielding faster lookups than Red-Black trees.",
            "Red-Black trees require at most 2 rotations per insertion and 3 rotations per deletion.",
          ],
          content: `In standard Binary Search Trees, degenerate insertion sequences (such as monotonically increasing keys) degrade lookups into $O(n)$ linked list scans.
To preserve logarithmic query time under dynamic updates, self-balancing trees enforce geometric invariants via tree rotations.

### AVL Tree Rotations
Four imbalance cases arise upon insertion:
1. **Left-Left (LL)**: Repaired by a single Right Rotation around the pivot node.
2. **Right-Right (RR)**: Repaired by a single Left Rotation around the pivot node.
3. **Left-Right (LR)**: Repaired by a Left Rotation on the left child, followed by a Right Rotation on the parent.
4. **Right-Left (RL)**: Repaired by a Right Rotation on the right child, followed by a Left Rotation on the parent.`,
          formulasOrCode: `// AVL Node Balance Calculation
int getBalanceFactor(AVLNode* node) {
    if (!node) return 0;
    return getHeight(node->left) - getHeight(node->right);
}

AVLNode* rightRotate(AVLNode* y) {
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;
    x->right = y;
    y->left = T2;
    y->height = 1 + std::max(getHeight(y->left), getHeight(y->right));
    x->height = 1 + std::max(getHeight(x->left), getHeight(x->right));
    return x; // New root
}`,
        },
      ]
    ),
    createDoc(
      "doc-cs201-ps",
      "CS201",
      "Data Structures & High-Performance Computing",
      "CS201 Graph Algorithms & Shortest Path Problem Set",
      "PROBLEM_SET",
      "Dr. Ananya Roy",
      "Distinguished Chair of Systems",
      26,
      "2.4 MB",
      "Step-by-step problem sets covering Kruskal's MST with union-by-rank, Bellman-Ford negative cycle detection, and topological sorting.",
      ["Dijkstra Correctness", "Kruskal with DSU", "Tarjan SCC", "A* Heuristic Admissibility"],
      [
        {
          id: "ps1",
          chapterNumber: 1,
          title: "Graph Traversal & Minimum Spanning Tree Proofs",
          summary: "Rigorous proofs and trace diagrams for graph connectivity problems.",
          keyTakeaways: [
            "Cut Property: The minimum-weight edge crossing any cut (S, V\\S) belongs to some MST.",
            "Cycle Property: The strictly heaviest edge in any cycle does not belong to any MST.",
          ],
          content: `### Question 1: Disjoint Set Union Complexity
Prove that Union-Find with path compression and union-by-rank achieves $O(m \\cdot \\alpha(n))$ time for $m$ operations on $n$ elements, where $\\alpha$ is the extremely slow-growing inverse Ackermann function.`,
        },
      ]
    ),
    createDoc(
      "doc-cs201-lab",
      "CS201",
      "Data Structures & High-Performance Computing",
      "CS201 Lab Manual: Cache-Oblivious B-Trees & Graph Engines",
      "LAB_MANUAL",
      "Dr. Ananya Roy",
      "Distinguished Chair of Systems",
      34,
      "3.3 MB",
      "Implementation of high-throughput spatial indexing using R-Trees, lock-free queues, and parallel graph search using OpenMP.",
      ["B+ Tree Implementation", "OpenMP Parallelism", "Lock-Free Ring Buffers", "SIMD Vectorization"],
      [
        {
          id: "lab1",
          chapterNumber: 1,
          title: "Building an In-Memory B+ Tree Key-Value Index",
          summary: "Node splitting, leaf page chaining, and range query iteration in C++.",
          keyTakeaways: [
            "B+ tree internal nodes store only routing keys, maximizing node fan-out.",
            "Leaf nodes are doubly-linked to allow sequential range scanning without tree traversal.",
          ],
          content: `Design an in-memory B+ Tree node with order $M = 64$.
Measure throughput for 1,000,000 random point insertions and range queries against \`std::map\` and \`std::unordered_map\`.`,
        },
      ]
    ),
  ],

  // ── 3. CS301: Modern Full-Stack Architecture & Cloud Systems ──
  CS301: [
    createDoc(
      "doc-cs301-notes",
      "CS301",
      "Modern Full-Stack Architecture & Cloud Systems",
      "CS301 Full-Stack Blueprint: Event-Driven Architectures, Kafka & Kubernetes",
      "LECTURE_NOTES",
      "Prof. Rohan Mukherjee",
      "Lead Systems Architect",
      52,
      "5.1 MB",
      "Enterprise systems engineering covering distributed event streaming with Apache Kafka, Redis cluster caching, micro-frontend federation, Docker multi-stage builds, and Kubernetes ingress controllers.",
      ["Kafka Partitions", "Redis Cache Invalidation", "Kubernetes Pod Lifecycle", "Idempotent API Design"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Distributed Event Streaming with Apache Kafka",
          summary: "Topics, partitions, consumer groups, offset management, and exactly-once processing semantics.",
          keyTakeaways: [
            "Kafka topics are split into immutable, append-only commit log partitions distributed across brokers.",
            "Consumer groups parallelize throughput; each partition is read by exactly one consumer within a group.",
            "Idempotent producers combined with transactional commits prevent message duplication during network retries.",
          ],
          content: `Traditional message brokers (like RabbitMQ) delete messages once acknowledged by a worker.
In contrast, Apache Kafka acts as a distributed replayable commit log.
Messages are retained on disk for configured retention periods (e.g., 7 days), enabling multiple decoupled consumer microservices to process the exact same event stream at their own independent paces.`,
          formulasOrCode: `// Kafka Producer with Idempotence Enabled
const { Kafka } = require('kafkajs');
const kafka = new Kafka({ clientId: 'msa-order-service', brokers: ['kafka-cluster:9092'] });
const producer = kafka.producer({ idempotent: true, maxInFlightRequests: 1 });

async function publishOrderEvent(order) {
    await producer.send({
        topic: 'student.orders',
        messages: [{ key: order.studentId, value: JSON.stringify(order) }],
    });
}`,
        },
      ]
    ),
    createDoc(
      "doc-cs301-lab",
      "CS301",
      "Modern Full-Stack Architecture & Cloud Systems",
      "CS301 Cloud Systems Lab Manual: Docker, Kubernetes & Helm",
      "LAB_MANUAL",
      "Prof. Rohan Mukherjee",
      "Lead Systems Architect",
      36,
      "3.5 MB",
      "End-to-end laboratory guide for packaging containerized microservices, configuring horizontal pod autoscalers (HPA), and zero-downtime rolling updates.",
      ["Multi-Stage Dockerfiles", "K8s Deployment Manifests", "ConfigMaps & Secrets", "HPA Scaling"],
      [
        {
          id: "lab1",
          chapterNumber: 1,
          title: "Containerizing Next.js / Node.js Microservices",
          summary: "Optimizing image size from 1.2 GB down to 85 MB using Alpine Linux and Docker BuildKit.",
          keyTakeaways: [
            "Separate build dependencies from production runtime using multi-stage Docker builds.",
            "Run containers as non-root users to mitigate container breakout vulnerabilities.",
          ],
          content: `Construct a production-ready \`Dockerfile\` implementing caching for node_modules and output standalone artifacts. Deploy to a local Minikube cluster and expose services via Ingress NGINX.`,
        },
      ]
    ),
  ],

  // ── 4. CS310: Distributed Systems & Consensus Protocols ──
  CS310: [
    createDoc(
      "doc-cs310-notes",
      "CS310",
      "Distributed Systems & Consensus Protocols",
      "CS310 Distributed Systems Foundations: Raft, Paxos & Byzantine Fault Tolerance",
      "LECTURE_NOTES",
      "Dr. Emily Reed",
      "Fellow of Distributed Computing",
      46,
      "4.5 MB",
      "Complete exploration of the CAP theorem, linearizability, Raft leader election and log replication, Paxos state machines, and vector clock causal ordering.",
      ["Raft Consensus", "Paxos Synod", "Vector Clocks", "Two-Phase Commit (2PC)"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "The Raft Consensus Algorithm in Practice",
          summary: "Leader election, randomized heartbeat timers, log matching property, and safety guarantees.",
          keyTakeaways: [
            "Raft breaks consensus into 3 independent subproblems: Leader Election, Log Replication, and Safety.",
            "Nodes transition between Follower, Candidate, and Leader states governed by randomized election timeouts (150-300ms).",
            "A log entry is committed only when replicated onto a strict majority of quorum nodes (N/2 + 1).",
          ],
          content: `In distributed systems, machines operate over asynchronous networks prone to packet loss, clock drift, and arbitrary network partitions.
Consensus algorithms ensure that a cluster of replicated state machines agree on an identical sequence of inputs despite server crashes.`,
        },
      ]
    ),
  ],

  // ── 5. AI301: Machine Learning & Statistical Pattern Recognition ──
  AI301: [
    createDoc(
      "doc-ai301-notes",
      "AI301",
      "Machine Learning & Statistical Pattern Recognition",
      "AI301 Machine Learning Compendium: Convex Optimization, Kernels & Boosting",
      "LECTURE_NOTES",
      "Dr. Priya Deshmukh",
      "Principal AI Scientist",
      50,
      "4.9 MB",
      "Comprehensive theoretical treatment of empirical risk minimization, gradient descent convergence proofs, Lagrange duality in Support Vector Machines, and XGBoost gradient boosting.",
      ["Loss Surfaces", "Lagrange Multipliers", "Kernel Trick", "XGBoost Split Criterion"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Empirical Risk Minimization & Convex Optimization",
          summary: "Formulating supervised learning as optimization over parameter spaces.",
          keyTakeaways: [
            "Expected risk R(w) is approximated by empirical risk Remp(w) over training samples.",
            "L2 regularization (Ridge) enforces spherical shrinkage; L1 regularization (Lasso) promotes sparsity.",
            "Gradient descent step w_{t+1} = w_t - η ∇L(w_t) converges linearly for L-Lipschitz smooth strongly convex functions.",
          ],
          content: `Given an input dataset $\\mathcal{D} = \\{(x_i, y_i)\\}_{i=1}^N$ drawn i.i.d. from an unknown distribution $P(X, Y)$, supervised learning aims to discover a predictive mapping $h_w(x)$ minimizing the expected risk:
$$R(w) = \\mathbb{E}_{(x, y) \\sim P} [\\mathcal{L}(h_w(x), y)]$$

### 1.1 Support Vector Machines & The Dual Problem
Using Karush-Kuhn-Tucker (KKT) conditions, the primal constrained optimization transforms into the dual:
$$\\max_\\alpha \\sum_{i=1}^N \\alpha_i - \\frac{1}{2} \\sum_{i=1}^N \\sum_{j=1}^N \\alpha_i \\alpha_j y_i y_j K(x_i, x_j)$$
Subject to $0 \\le \\alpha_i \\le C$ and $\\sum_{i=1}^N \\alpha_i y_i = 0$.
Here, $K(x_i, x_j) = \\langle \\phi(x_i), \\phi(x_j) \\rangle$ allows infinite-dimensional feature mapping via the Kernel Trick.`,
        },
      ]
    ),
    createDoc(
      "doc-ai301-ps",
      "AI301",
      "Machine Learning & Statistical Pattern Recognition",
      "AI301 Mathematical Derivations & Statistical Problem Set",
      "PROBLEM_SET",
      "Dr. Priya Deshmukh",
      "Principal AI Scientist",
      30,
      "2.8 MB",
      "Worked mathematical proofs for Maximum Likelihood Estimation (MLE), Expectation-Maximization (EM) for Gaussian Mixture Models, and Bias-Variance decomposition.",
      ["MLE vs MAP", "Bias-Variance Proof", "EM Derivation", "PAC Learning Bounds"],
      [
        {
          id: "ps1",
          chapterNumber: 1,
          title: "Problem Set 1: Bias-Variance Decomposition & Logistic Loss",
          summary: "Proving the decomposition of Mean Squared Error into irreducible error, bias squared, and variance.",
          keyTakeaways: [
            "MSE = Bias(f̂)^2 + Var(f̂) + σ^2 (irreducible noise).",
            "Complex models exhibit low bias but high variance; regularization curbs variance at the expense of slight bias.",
          ],
          content: `Prove that for squared error loss $\\mathcal{L}(y, \\hat{f}(x)) = (y - \\hat{f}(x))^2$ where $y = f(x) + \\epsilon$ with $\\mathbb{E}[\\epsilon] = 0$ and $\\text{Var}(\\epsilon) = \\sigma^2$:
$$\\mathbb{E}[(y - \\hat{f}(x))^2] = \\text{Bias}^2(\\hat{f}(x)) + \\text{Var}(\\hat{f}(x)) + \\sigma^2$$`,
        },
      ]
    ),
  ],

  // ── 6. AI402: Deep Learning & Neural Network Architectures ──
  AI402: [
    createDoc(
      "doc-ai402-notes",
      "AI402",
      "Deep Learning & Neural Network Architectures",
      "AI402 Deep Learning Handbook: Transformers, Attention & Multi-GPU Training",
      "LECTURE_NOTES",
      "Dr. Karl Schmidt",
      "Director of Deep Learning Lab",
      56,
      "5.8 MB",
      "Exhaustive architectural breakdown of Scaled Dot-Product Attention, Vision Transformers (ViT), Diffusion probabilistic models, Backpropagation matrix calculus, and DistributedDataParallel (DDP).",
      ["Multi-Head Attention", "Vision Transformers", "Diffusion ODEs", "PyTorch DDP"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Transformers & Scaled Dot-Product Multi-Head Attention",
          summary: "Deriving query-key-value projections, softmax scaling factors, and multi-head fusion.",
          keyTakeaways: [
            "Attention(Q, K, V) = softmax(QK^T / √d_k) · V.",
            "The √d_k division counteracts vanishing gradients caused by large dot products pushing softmax into saturated flat regions.",
            "Rotary Positional Embeddings (RoPE) encode relative token offsets directly into query-key inner products.",
          ],
          content: `Traditional Recurrent Neural Networks (LSTMs, GRUs) suffer from inherently sequential computation bottlenecks that prevent parallelization across sequence length $T$.
The Transformer architecture eliminates recurrence, relying exclusively on self-attention mechanisms to model arbitrary token-to-token dependencies in $O(1)$ sequential operations.

### Multi-Head Attention Formulation
$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O$$
Where $\\text{head}_i = \\text{Attention}(Q W_i^Q, K W_i^K, V W_i^V)$.`,
          formulasOrCode: `import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.scale = 1.0 / math.sqrt(d_k)

    def forward(self, q, k, v, mask=None):
        scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        weights = torch.softmax(scores, dim=-1)
        return torch.matmul(weights, v), weights`,
        },
      ]
    ),
    createDoc(
      "doc-ai402-lab",
      "AI402",
      "Deep Learning & Neural Network Architectures",
      "AI402 PyTorch GPU Acceleration & Diffusion Model Lab Manual",
      "LAB_MANUAL",
      "Dr. Karl Schmidt",
      "Director of Deep Learning Lab",
      38,
      "3.7 MB",
      "Training custom Vision Transformers and Denoising Diffusion Probabilistic Models (DDPM) on multi-GPU CUDA nodes.",
      ["PyTorch CUDA", "Mixed Precision (AMP)", "Diffusion Sampling", "FlashAttention"],
      [
        {
          id: "lab1",
          chapterNumber: 1,
          title: "Implementing FlashAttention-2 from Scratch",
          summary: "Tiling attention matrices into SRAM blocks to eliminate expensive high-bandwidth memory (HBM) round-trips.",
          keyTakeaways: [
            "Standard attention writes an N×N matrix to GPU HBM, requiring O(N^2) memory bandwidth.",
            "FlashAttention uses online softmax normalization to compute attention in small O(block_size) chunks directly in on-chip SRAM.",
          ],
          content: `Write custom PyTorch CUDA extension kernels demonstrating memory tiling for multi-head attention. Profile memory usage with \`torch.cuda.memory_allocated()\` and compare speedup factors on sequences up to 32,768 tokens.`,
        },
      ]
    ),
  ],

  // ── 7. AI405: Natural Language Processing & Large Language Models ──
  AI405: [
    createDoc(
      "doc-ai405-notes",
      "AI405",
      "Natural Language Processing & Large Language Models",
      "AI405 LLM Architecture & Alignment Guide: RLHF, LoRA & Quantization",
      "LECTURE_NOTES",
      "Dr. Elena Rostova",
      "Chief Scientist of NLP",
      48,
      "4.7 MB",
      "Mechanics of auto-regressive generation, Byte-Pair Encoding (BPE), Low-Rank Adaptation (LoRA), Direct Preference Optimization (DPO), and 4-bit NF4 quantization.",
      ["Autoregressive Decoding", "LoRA Fine-Tuning", "DPO vs RLHF", "KV-Cache Acceleration"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Parameter-Efficient Fine-Tuning (PEFT) & LoRA",
          summary: "Low-Rank matrix decomposition of weight updates ΔW = B · A.",
          keyTakeaways: [
            "Freezes pre-trained base model weights W0 and decomposes the adaptation matrix into low-rank matrices B (d × r) and A (r × k) where r ≪ d.",
            "Reduces trainable parameters by over 99.8% while maintaining full fine-tuning performance.",
          ],
          content: `When adapting a 70-billion parameter language model to a domain-specific task, standard full-parameter fine-tuning requires tracking optimizer states for every weight, demanding multiple terabytes of VRAM.
LoRA leverages the empirical insight that weight updates during adaptation possess a low intrinsic rank.`,
        },
      ]
    ),
  ],

  // ── 8. AI408: Reinforcement Learning & Autonomous Decision Agents ──
  AI408: [
    createDoc(
      "doc-ai408-notes",
      "AI408",
      "Reinforcement Learning & Autonomous Decision Agents",
      "AI408 Reinforcement Learning: Bellman Optimality, PPO & Actor-Critic",
      "LECTURE_NOTES",
      "Dr. Arthur Sterling",
      "Fellow of Autonomous Systems",
      44,
      "4.3 MB",
      "Markov Decision Processes (MDP), Policy Gradient Theorem, Proximal Policy Optimization (PPO), Deep Q-Networks (DQN), and Continuous Control with Soft Actor-Critic (SAC).",
      ["Bellman Equation", "Policy Gradient", "PPO Clip Objective", "Replay Buffers"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Markov Decision Processes & Bellman Equations",
          summary: "Value functions, Q-functions, and dynamic programming optimality guarantees.",
          keyTakeaways: [
            "Bellman Optimality: V*(s) = max_a [R(s, a) + γ ∑_{s'} P(s' | s, a) V*(s')].",
            "PPO prevents destructive policy updates by clipping probability ratios within [1 - ε, 1 + ε].",
          ],
          content: `An autonomous agent interacts with an environment modeled as an MDP tuple $\\langle \\mathcal{S}, \\mathcal{A}, \\mathcal{P}, \\mathcal{R}, \\gamma \\rangle$.
The agent aims to learn an optimal stochastic policy $\\pi(a | s)$ maximizing the expected discounted cumulative return.`,
        },
      ]
    ),
  ],

  // ── 9. ECE201: Digital Logic & Microprocessor Architecture ──
  ECE201: [
    createDoc(
      "doc-ece201-notes",
      "ECE201",
      "Digital Logic & Microprocessor Architecture",
      "ECE201 Digital Logic: Karnaugh Maps, RISC-V Pipelines & Hazard Mitigation",
      "LECTURE_NOTES",
      "Prof. David Liang",
      "Chair of VLSI Architecture",
      42,
      "4.1 MB",
      "Boolean algebra reduction, finite state machine synthesis, 5-stage classic RISC-V pipeline, data forwarding units, and branch prediction architectures.",
      ["K-Map Simplification", "RISC-V 5-Stage Pipeline", "Hazard Forwarding", "2-Bit Saturating Counters"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "The 5-Stage RISC-V Instruction Pipeline & Hazards",
          summary: "Instruction Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), and Write-Back (WB).",
          keyTakeaways: [
            "Pipelining improves instruction throughput (CPI ≈ 1) without decreasing single instruction latency.",
            "Structural, Data (RAW, WAR, WAW), and Control hazards require forwarding paths and pipeline bubbles.",
          ],
          content: `The classic 5-stage RISC processor executes distinct phases of instruction processing concurrently across pipeline register boundaries.
Forwarding paths bypass register write-back by routing arithmetic outputs directly from the EX/MEM register to ALU inputs in subsequent cycles.`,
        },
      ]
    ),
  ],

  // ── 10. ECE202: Signals, Linear Systems & Fourier Transforms ──
  ECE202: [
    createDoc(
      "doc-ece202-notes",
      "ECE202",
      "Signals, Linear Systems & Fourier Transforms",
      "ECE202 Continuous & Discrete Signals: Fourier, Laplace & Z-Transforms",
      "LECTURE_NOTES",
      "Dr. Meera Nambiar",
      "Professor of Signal Processing",
      46,
      "4.4 MB",
      "Linear Time-Invariant (LTI) systems, continuous-time convolution, Continuous & Discrete Fourier Transforms (CTFT/DTFT), FFT Cooley-Tukey algorithm, and Nyquist-Shannon sampling theorem.",
      ["LTI Convolution", "Nyquist Sampling Theorem", "FFT Butterfly Diagrams", "Laplace ROC"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "LTI Systems, Convolution & Frequency Domain Representation",
          summary: "Impulse response h(t), convolution integral, and frequency response H(ω).",
          keyTakeaways: [
            "Output of an LTI system is y(t) = x(t) * h(t) = ∫ x(τ) h(t - τ) dτ.",
            "Convolution in the time domain corresponds to point-wise multiplication in the frequency domain: Y(ω) = X(ω) · H(ω).",
            "Nyquist criterion: Sampling rate f_s must exceed twice the highest frequency component 2·B to prevent aliasing.",
          ],
          content: `Any signal can be decomposed into an infinite linear combination of shifted unit impulse functions $\\delta(t)$.
Because LTI systems obey superposition and time-invariance, their response to arbitrary inputs is fully determined by their impulse response $h(t)$.`,
        },
      ]
    ),
  ],

  // ── 11. ECE305: VLSI Chip Design & Semiconductor Fabrication ──
  ECE305: [
    createDoc(
      "doc-ece305-notes",
      "ECE305",
      "VLSI Chip Design & Semiconductor Fabrication",
      "ECE305 VLSI Silicon Compendium: FinFET Transistors, CMOS Layouts & Timing",
      "LECTURE_NOTES",
      "Dr. Rajeshwari Nair",
      "Director of Nano-Fabrication",
      48,
      "4.8 MB",
      "CMOS inverter physics, static/dynamic power dissipation, FinFET vs Gate-All-Around (GAA) architectures, lithography, static timing analysis (setup/hold constraints), and clock-tree synthesis.",
      ["FinFET Physics", "Static Timing Analysis", "Setup & Hold Slack", "EUV Lithography"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Static Timing Analysis (STA) & Clock Skew",
          summary: "Setup time, hold time, clock jitter, propagation delays, and slack calculation.",
          keyTakeaways: [
            "Setup Slack = (T_clk - T_setup) - (T_clk_q + T_comb_max + T_skew) ≥ 0.",
            "Hold Slack = (T_clk_q + T_comb_min - T_skew) - T_hold ≥ 0.",
            "Hold time violations are independent of clock period T_clk and cannot be resolved by down-clocking the chip.",
          ],
          content: `In synchronous digital circuits, flip-flops capture data on clock edges.
To prevent metastability, inputs must remain stable during the setup window prior to the active clock edge and during the hold window following the edge.`,
        },
      ]
    ),
  ],

  // ── 12. ROB401: Autonomous Robotics & ROS2 Control Systems ──
  ROB401: [
    createDoc(
      "doc-rob401-notes",
      "ROB401",
      "Autonomous Robotics & ROS2 Control Systems",
      "ROB401 Autonomous Robotics: Forward/Inverse Kinematics, SLAM & ROS2",
      "LECTURE_NOTES",
      "Dr. Kenji Tanaka",
      "Chair of Robotics Systems",
      50,
      "5.0 MB",
      "Denavit-Hartenberg (DH) parameters, Jacobian velocity kinematics, Extended Kalman Filter (EKF) state estimation, LiDAR SLAM, and real-time ROS2 DDS middleware.",
      ["Denavit-Hartenberg Parameters", "Jacobian Singularity", "EKF Localization", "ROS2 rclcpp Nodes"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Robot Kinematics & Denavit-Hartenberg Conventions",
          summary: "Homogeneous transformation matrices connecting sequential robotic arm joints.",
          keyTakeaways: [
            "DH parameters (a_i, α_i, d_i, θ_i) systematically map reference frames between consecutive joints.",
            "The Manipulator Jacobian J(q) relates joint velocity vectors q̇ to end-effector Cartesian velocities v = J(q) q̇.",
          ],
          content: `Robot kinematics studies the geometric relationships governing robotic multi-body link mechanisms without considering the forces and torques producing motion.`,
        },
      ]
    ),
  ],

  // ── 13. ME101: Engineering Mechanics & Finite Element Analysis ──
  ME101: [
    createDoc(
      "doc-me101-notes",
      "ME101",
      "Engineering Mechanics & Finite Element Analysis",
      "ME101 Mechanics of Materials & FEA: Stress Tensors, Stiff Matrices & Trusses",
      "LECTURE_NOTES",
      "Prof. Michael Vance",
      "Professor of Structural Mechanics",
      44,
      "4.2 MB",
      "Cauchy stress tensor, Mohr's circle, von Mises yield criterion, beam deflection governing equations, and direct stiffness method for 2D/3D truss and frame FEA models.",
      ["Cauchy Stress Tensor", "Von Mises Criterion", "Global Stiffness Matrix", "Shape Functions"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Stress States, Mohr's Circle & Yield Criteria",
          summary: "Principal stresses, maximum shear stress, and failure envelopes under multiaxial loading.",
          keyTakeaways: [
            "Von Mises yield criterion: Ductile failure initiates when distortion energy exceeds the uniaxial yield threshold.",
            "Global stiffness equation: [K] {U} = {F}, solved under Dirichlet boundary constraints.",
          ],
          content: `When structural components undergo mechanical loading, internal resistance forces per unit area vary continuously across orientations. The full state of stress at any point is characterized by the symmetric 3×3 Cauchy stress tensor.`,
        },
      ]
    ),
  ],

  // ── 14. ME204: Thermodynamics & Fluid Dynamics ──
  ME204: [
    createDoc(
      "doc-me204-notes",
      "ME204",
      "Thermodynamics & Fluid Dynamics",
      "ME204 Thermal-Fluids Compendium: Navier-Stokes, Entropy & Carnot Cycles",
      "LECTURE_NOTES",
      "Dr. Sarah Jenkins",
      "Professor of Fluid Dynamics",
      46,
      "4.4 MB",
      "First and Second Laws of Thermodynamics, Carnot efficiency limits, Brayton and Rankine cycles, Navier-Stokes momentum equations, Reynolds number scaling, and boundary layer theory.",
      ["Navier-Stokes Equations", "Carnot Limit", "Reynolds Number", "Boundary Layer Separation"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Navier-Stokes Equations & Incompressible Fluid Flow",
          summary: "Conservation of mass, momentum, and energy across continuum fluid control volumes.",
          keyTakeaways: [
            "Continuity: ∇ · u = 0 for incompressible flow.",
            "Navier-Stokes: ρ (∂u/∂t + u · ∇u) = -∇p + μ ∇^2 u + ρ g.",
            "Reynolds number Re = ρ v L / μ determines transition from laminar flow to turbulent chaos.",
          ],
          content: `Fluid motion is governed by non-linear partial differential equations representing Newton's second law applied to fluid parcels.`,
        },
      ]
    ),
  ],

  // ── 15. AERO401: Aerodynamics & Orbital Flight Dynamics ──
  AERO401: [
    createDoc(
      "doc-aero401-notes",
      "AERO401",
      "Aerodynamics & Orbital Flight Dynamics",
      "AERO401 Aerospace Blueprint: Supersonic Airfoils, Compressible Shock Waves & Hohmann Transfers",
      "LECTURE_NOTES",
      "Dr. Christopher Webb",
      "Director of Propulsion & Spaceflight",
      52,
      "5.3 MB",
      "Thin airfoil theory, compressible flow, oblique shock waves, Prandtl-Meyer expansion fans, Keplerian orbital mechanics, and orbital maneuvers.",
      ["Oblique Shock Relations", "Prandtl-Meyer Expansion", "Hohmann Transfer Orbits", "Rocket Equation"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Compressible Flow & Supersonic Shock Dynamics",
          summary: "Mach cones, normal/oblique shock relations, and total pressure losses.",
          keyTakeaways: [
            "Mach number M = v / a; supersonic regime M > 1 generates discontinuities where entropy increases irreversibly.",
            "Hohmann transfer delta-v is derived by linking circular orbits through an elliptical transfer trajectory.",
          ],
          content: `As an aircraft accelerates beyond the local speed of sound, acoustic pressure disturbances cannot propagate forward, coalescing into thin shock waves where pressure, density, and temperature jump discontinuously.`,
        },
      ]
    ),
  ],

  // ── 16. FIN101: Principles of Modern Corporate Finance ──
  FIN101: [
    createDoc(
      "doc-fin101-notes",
      "FIN101",
      "Principles of Modern Corporate Finance",
      "FIN101 Corporate Finance: Discounted Cash Flows, Capital Asset Pricing & WACC",
      "LECTURE_NOTES",
      "Prof. Siddharth Mehta",
      "Chair of Finance & Investment",
      42,
      "3.9 MB",
      "Time value of money, Net Present Value (NPV), Internal Rate of Return (IRR), Capital Asset Pricing Model (CAPM), Weighted Average Cost of Capital (WACC), and Modigliani-Miller theorems.",
      ["DCF Valuation", "CAPM Beta", "WACC Formula", "Capital Structure"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Discounted Cash Flows (DCF) & The CAPM Framework",
          summary: "Valuing future enterprise free cash flows using risk-adjusted discount rates.",
          keyTakeaways: [
            "NPV = ∑ [CF_t / (1 + r)^t] - Initial Investment.",
            "CAPM: Expected Return E[R_i] = R_f + β_i (E[R_m] - R_f).",
            "WACC reflects the blended after-tax cost of debt and equity capital.",
          ],
          content: `A dollar received today is worth more than a dollar received tomorrow due to earning capacity and risk. Capital budgeting decisions depend on discounting projected cash flows using hurdle rates that reflect project-specific systematic market risk.`,
        },
      ]
    ),
  ],

  // ── 17. FIN305: Quantitative Trading Strategies & Stochastic Calculus ──
  FIN305: [
    createDoc(
      "doc-fin305-notes",
      "FIN305",
      "Quantitative Trading Strategies & Stochastic Calculus",
      "FIN305 Quantitative Finance: Black-Scholes PDE, Itô's Lemma & Algorithmic Execution",
      "LECTURE_NOTES",
      "Dr. Evelyn Chen",
      "Distinguished Quant Strategist",
      50,
      "4.9 MB",
      "Geometric Brownian Motion, Itô calculus, Black-Scholes-Merton option pricing PDE, Greeks sensitivity analysis (Delta, Gamma, Vega, Theta), and order-book market making algorithms.",
      ["Itô's Lemma", "Black-Scholes PDE", "Option Greeks", "VWAP/TWAP Execution"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Stochastic Calculus & The Black-Scholes PDE",
          summary: "Deriving the fundamental differential equation for risk-neutral derivative valuation.",
          keyTakeaways: [
            "Itô's Lemma: df(S, t) = (∂f/∂t + μ S ∂f/∂S + 1/2 σ^2 S^2 ∂^2f/∂S^2) dt + σ S ∂f/∂S dW_t.",
            "The Black-Scholes equation eliminates market drift μ through dynamic delta-hedging.",
          ],
          content: `Asset prices exhibit continuous stochastic fluctuations modeled via Stochastic Differential Equations (SDEs) driven by standard Brownian motion $W_t$.`,
        },
      ]
    ),
  ],

  // ── 18. FIN402: Decentralized Finance & Blockchain Tokenomics ──
  FIN402: [
    createDoc(
      "doc-fin402-notes",
      "FIN402",
      "Decentralized Finance & Blockchain Tokenomics",
      "FIN402 DeFi Protocols: Automated Market Makers (AMM), Uniswap v3 & Smart Contracts",
      "LECTURE_NOTES",
      "Prof. Marcus Thorne",
      "Fellow of Cryptofinance",
      44,
      "4.2 MB",
      "Constant Product Invariants (x·y = k), concentrated liquidity mechanics in Uniswap v3, impermanent loss proofs, lending protocol flash loans (Aave), and Solidity security auditing.",
      ["Constant Product AMM", "Concentrated Liquidity", "Impermanent Loss Derivation", "Flash Loan Arbitrage"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Automated Market Makers (AMM) & Impermanent Loss",
          summary: "Mathematical mechanics of decentralized liquidity pools.",
          keyTakeaways: [
            "Constant product invariant: x · y = k guarantees liquidity at all positive price levels.",
            "Uniswap v3 bounds liquidity within custom price ticks [p_a, p_b], boosting capital efficiency by up to 4000x.",
            "Impermanent Loss IL(k) = 2√k / (1 + k) - 1 where k = P_new / P_old.",
          ],
          content: `Decentralized exchanges replace centralized order books with algorithmic liquidity pools governed by immutable smart contracts.`,
        },
      ]
    ),
  ],

  // ── 19. BIO101: Molecular Cell Biology & Genetic Engineering ──
  BIO101: [
    createDoc(
      "doc-bio101-notes",
      "BIO101",
      "Molecular Cell Biology & Genetic Engineering",
      "BIO101 Cell Biology Compendium: DNA Replication, Protein Folding & Translation",
      "LECTURE_NOTES",
      "Dr. Radhika Sen",
      "Professor of Molecular Biology",
      46,
      "4.5 MB",
      "Central dogma of molecular biology, DNA polymerase fidelity, RNA splicing mechanisms, ribosome translation machinery, protein quaternary folding, and recombinant plasmid vectors.",
      ["DNA Replication Forks", "Alternative Splicing", "Ribosomal Peptide Synthesis", "Plasmid Cloning Vectors"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "The Central Dogma & Transcriptional Regulation",
          summary: "Transcription factors, promoter motifs, RNA polymerase II elongation, and epigenetic histone methylation.",
          keyTakeaways: [
            "DNA is transcribed into messenger RNA, which is translated by ribosomes into polypeptide chains.",
            "Post-transcriptional modifications include 5' 7-methylguanosine capping, 3' polyadenylation, and spliceosomal intron excision.",
          ],
          content: `Cellular life coordinates metabolic and developmental processes through dynamic transcription of genetic code packaged within chromatin structures.`,
        },
      ]
    ),
  ],

  // ── 20. BIO203: Computational Genomics & CRISPR Gene Editing ──
  BIO203: [
    createDoc(
      "doc-bio203-notes",
      "BIO203",
      "Computational Genomics & CRISPR Gene Editing",
      "BIO203 Precision Genomics: Cas9 Cleavage Kinetics, gRNA Design & Sequence Alignment",
      "LECTURE_NOTES",
      "Dr. Liam Gallagher",
      "Principal Genomics Investigator",
      48,
      "4.8 MB",
      "CRISPR-Cas9 endonuclease double-strand break mechanisms, PAM recognition, off-target cleavage mitigation, Needleman-Wunsch global alignment, and Next-Generation Sequencing (NGS) variant calling.",
      ["CRISPR-Cas9 PAM Sequence", "Needleman-Wunsch Alignment", "NGS BAM/VCF Pipelines", "Off-Target Cleavage"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "CRISPR-Cas9 Targeted Cleavage & DNA Repair Pathways",
          summary: "Guide RNA hybridization, NGG PAM recognition, Non-Homologous End Joining (NHEJ), and Homology-Directed Repair (HDR).",
          keyTakeaways: [
            "Cas9 requires a 20-nucleotide guide RNA spacer adjacent to a 5'-NGG protospacer adjacent motif (PAM).",
            "NHEJ repair introduces stochastic insertion/deletion (indel) frameshift mutations that knock out gene function.",
            "HDR leverages donor template DNA for precise single-base genetic corrections.",
          ],
          content: `Discovered as an adaptive immune defense in bacteria against bacteriophages, CRISPR systems have revolutionized molecular biology by enabling programmable genome editing in living organisms.`,
        },
      ]
    ),
  ],

  // ── 21. BIO305: Synthetic Biology & Metabolic Engineering ──
  BIO305: [
    createDoc(
      "doc-bio305-notes",
      "BIO305",
      "Synthetic Biology & Metabolic Engineering",
      "BIO305 Synthetic Biology: Genetic Logic Gates, Riboswitches & Metabolic Flux",
      "LECTURE_NOTES",
      "Dr. Francesca Rossi",
      "Director of Bio-Design Lab",
      44,
      "4.3 MB",
      "Engineered transcription repression cascades, repressilator oscillators, riboswitches, Flux Balance Analysis (FBA) of metabolic networks, and microbial biomanufacturing pathways.",
      ["Genetic Toggle Switches", "Repressilator Circuits", "Flux Balance Analysis", "Metabolic Precursors"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Synthetic Gene Circuits & Cellular Logic Gates",
          summary: "Designing digital logic gates (AND, OR, NOT) using biological promoters and transcription repressor proteins.",
          keyTakeaways: [
            "Bistable toggle switches use mutual transcriptional repression to achieve robust epigenetic memory in bacteria.",
            "Flux Balance Analysis (FBA) uses linear programming over stoichiometric matrices to maximize growth rates.",
          ],
          content: `Synthetic biology applies engineering design cycles (Design-Build-Test-Learn) to biological systems, creating cells that synthesize biofuels, pharmaceutical peptides, and bio-sensors.`,
        },
      ]
    ),
  ],

  // ── 22. DES101: Design Thinking, Human-Computer Interaction & Usability ──
  DES101: [
    createDoc(
      "doc-des101-notes",
      "DES101",
      "Design Thinking, Human-Computer Interaction & Usability",
      "DES101 HCI Compendium: Fitts's Law, Nielsen Heuristics & Cognitive Workload",
      "LECTURE_NOTES",
      "Prof. Maya Patel",
      "Distinguished Designer & Chair of HCI",
      40,
      "3.8 MB",
      "Human cognition models, Fitts's Law of motor target acquisition, Hick-Hyman Law of decision time, Jakob Nielsen's 10 Usability Heuristics, accessibility standards (WCAG 2.2 AAA), and user research methodologies.",
      ["Fitts's Law", "Nielsen Heuristics", "Hick-Hyman Law", "WCAG 2.2 Accessibility"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Cognitive Engineering & Quantitative Usability Laws",
          summary: "Mathematical models predicting human motor and cognitive reaction times.",
          keyTakeaways: [
            "Fitts's Law: Time T = a + b · log2(2D / W) where D is distance and W is target width.",
            "Corner and screen-edge interactive targets have effectively infinite width in desktop interfaces.",
            "Hick's Law: Reaction time scales logarithmically with the number of available choices.",
          ],
          content: `User interface design is not merely visual styling; it is an applied science optimizing the bandwidth of the human-computer communication channel based on human perceptual, motor, and cognitive limitations.`,
        },
      ]
    ),
  ],

  // ── 23. DES105: UI/UX Micro-Interactions & Design Systems ──
  DES105: [
    createDoc(
      "doc-des105-notes",
      "DES105",
      "UI/UX Micro-Interactions & Design Systems",
      "DES105 Design Systems Architecture: Tokens, Physics Animation & Atomic Design",
      "LECTURE_NOTES",
      "Prof. Alex Mercer",
      "Design Systems Architect",
      42,
      "4.0 MB",
      "Design token architecture (W3C standard), atomic design hierarchies (Atoms to Templates), spring physics animation curves, tactile haptics, and accessible high-contrast dark modes.",
      ["Design Tokens", "Spring Physics Curves", "Atomic Design Systems", "Contrast Ratios"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Design Tokens & Scalable Multi-Brand Architecture",
          summary: "Tiered token hierarchies (Global, Alias, Component-specific) driving automated cross-platform exports.",
          keyTakeaways: [
            "Tokens decouple visual attributes (colors, typography, spacing) from concrete CSS/Swift/Android code.",
            "Damped harmonic oscillator equations create fluid, natural spring animations without arbitrary ease-in-out curves.",
          ],
          content: `Modern software platforms require visual and behavioral consistency across mobile, web, and spatial platforms. Design systems achieve this by establishing a single source of truth for all design tokens.`,
        },
      ]
    ),
  ],

  // ── 24. DES302: Spatial Computing, AR/VR & 3D Interactive Media ──
  DES302: [
    createDoc(
      "doc-des302-notes",
      "DES302",
      "Spatial Computing, AR/VR & 3D Interactive Media",
      "DES302 Spatial Computing: 6DoF Tracking, WebXR & Spatial Audio Engines",
      "LECTURE_NOTES",
      "Dr. Soren Lindqvist",
      "Director of Immersive Media",
      46,
      "4.6 MB",
      "Six Degrees of Freedom (6DoF) spatial tracking, Simultaneous Localization and Mapping (SLAM) for headsets, WebXR rendering pipelines, stereoscopic depth perception, and HRTF 3D spatialized audio.",
      ["6DoF Tracking", "Head-Related Transfer Functions", "Stereoscopic Disparity", "WebXR Shaders"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Spatial Perception, Optical Passthrough & WebXR",
          summary: "Designing UI for 3D volumetrics, focal rivalry mitigation, and gaze-pinch interaction mechanics.",
          keyTakeaways: [
            "Vergence-accommodation conflict causes visual fatigue when 3D focal distance diverges from physical screen depth.",
            "Binaural spatial audio relies on Head-Related Transfer Functions (HRTFs) that model sound diffraction around the human pinna and torso.",
          ],
          content: `Spatial computing transitions software from two-dimensional planar glass displays into full volumetric three-dimensional reality.`,
        },
      ]
    ),
  ],

  // ── 25. CYB201: Network Security, Cryptography & Threat Mitigation ──
  CYB201: [
    createDoc(
      "doc-cyb201-notes",
      "CYB201",
      "Network Security, Cryptography & Threat Mitigation",
      "CYB201 Applied Cryptography: RSA, Elliptic Curves, AES-GCM & TLS 1.3",
      "LECTURE_NOTES",
      "Prof. Alexander Cross",
      "Director of Cybersecurity Research",
      50,
      "5.0 MB",
      "Symmetric and asymmetric cryptography, AES-256 in Galois/Counter Mode (GCM), RSA modular arithmetic, Elliptic Curve Cryptography (ECDSA / Ed25519), and TLS 1.3 zero-RTT handshake protocols.",
      ["Elliptic Curve Math", "AES-GCM Authenticated Encryption", "TLS 1.3 Handshake", "Diffie-Hellman Key Exchange"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Elliptic Curve Cryptography & Ephemeral Diffie-Hellman",
          summary: "Weierstrass elliptic curves y^2 = x^3 + ax + b over finite prime fields F_p.",
          keyTakeaways: [
            "Elliptic Curve Discrete Logarithm Problem (ECDLP) provides 256-bit security with keys far smaller than RSA 3072-bit keys.",
            "ECDH generates ephemeral session keys with Perfect Forward Secrecy (PFS), protecting past traffic even if private keys leak later.",
          ],
          content: `Modern cryptographic protocols protect global communications against eavesdropping and message tampering by combining asymmetric key exchange with high-speed authenticated symmetric cipher encryption.`,
        },
      ]
    ),
  ],

  // ── 26. CYB302: Ethical Hacking, Penetration Testing & Reverse Engineering ──
  CYB302: [
    createDoc(
      "doc-cyb302-notes",
      "CYB302",
      "Ethical Hacking, Penetration Testing & Reverse Engineering",
      "CYB302 Offensive Security: Buffer Overflows, ROP Chains & Kernel Exploits",
      "LECTURE_NOTES",
      "Dr. Zainab Al-Mansoor",
      "Lead Penetration Testing Specialist",
      52,
      "5.2 MB",
      "Binary exploitation, stack-based buffer overflows, Return-Oriented Programming (ROP chains), bypassing modern mitigations (ASLR, DEP/NX, Stack Canaries), and disassembling x86-64 binaries in Ghidra.",
      ["Buffer Overflows", "ROP Gadget Chains", "ASLR / DEP Bypass", "Ghidra Decompilation"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Stack-Based Buffer Overflows & Return-Oriented Programming",
          summary: "Overwriting instruction pointers, stack pivoting, and linking ROP gadgets to execute arbitrary shellcode.",
          keyTakeaways: [
            "Stack Canaries detect buffer corruption by verifying a sentinel value before the function return instruction.",
            "ROP bypasses Data Execution Prevention (NX/DEP) by chaining together existing machine code instructions ending in RET.",
          ],
          content: `To build resilient software systems, security engineers must understand the low-level memory corruption vulnerabilities and binary exploitation techniques utilized by real-world threat actors.`,
        },
      ]
    ),
  ],

  // ── 27. CYB405: Cloud Infrastructure Security & Zero Trust Architecture ──
  CYB405: [
    createDoc(
      "doc-cyb405-notes",
      "CYB405",
      "Cloud Infrastructure Security & Zero Trust Architecture",
      "CYB405 Zero Trust Architecture: IAM Least-Privilege, OIDC & Cloud Workload Identity",
      "LECTURE_NOTES",
      "Prof. Jordan Vance",
      "Principal Cloud Security Architect",
      46,
      "4.5 MB",
      "Never trust, always verify paradigm, OAuth 2.0 / OpenID Connect token verification, micro-segmentation, SPIFFE/SPIRE workload identities, and continuous behavioral telemetry monitoring.",
      ["Zero Trust Pillars", "OAuth 2.0 & OIDC", "SPIFFE Workload Identity", "Micro-Segmentation"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "The Zero Trust Security Model & Workload Authentication",
          summary: "Eliminating perimeter-based network security in favor of cryptographic mutual TLS (mTLS) identities.",
          keyTakeaways: [
            "Assumes breach: Every network packet, whether external or from internal VPCs, is treated as hostile.",
            "Workloads authenticate via short-lived X.509 SVID certificates issued automatically through SPIRE attestations.",
          ],
          content: `The migration of enterprise workloads to distributed multi-cloud architectures has rendered traditional perimeter firewalls obsolete. Zero Trust mandates continuous cryptographic identity verification for every user and service request.`,
        },
      ]
    ),
  ],

  // ── 28. CE101: Structural Analysis & Sustainable Urban Infrastructure ──
  CE101: [
    createDoc(
      "doc-ce101-notes",
      "CE101",
      "Structural Analysis & Sustainable Urban Infrastructure",
      "CE101 Structural Engineering: Moment Distribution, Seismic Loading & Green Concrete",
      "LECTURE_NOTES",
      "Dr. Arvind Chawla",
      "Chair of Civil Infrastructure",
      44,
      "4.3 MB",
      "Determinate and indeterminate structural analysis, Hardy Cross moment distribution method, seismic base shear design (ASCE 7), carbon-sequestering geopolymer concrete, and life-cycle building assessments.",
      ["Moment Distribution Method", "Seismic Response Spectra", "Geopolymer Concrete", "Buckling Load Limits"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Indeterminate Structural Analysis & Seismic Dynamics",
          summary: "Computing internal bending moments, shear forces, and lateral drift under dynamic earthquake accelerations.",
          keyTakeaways: [
            "Hardy Cross method iteratively balances joint moments in continuous beams and rigid portal frames.",
            "Base shear V = C_s · W accounts for seismic hazard zones and building natural fundamental periods.",
          ],
          content: `Civil structures must withstand dead weights, transient live traffic, high-velocity winds, and earthquake ground motion while meeting strict environmental sustainability benchmarks.`,
        },
      ]
    ),
  ],

  // ── 29. CHEM201: Advanced Nanomaterials & Molecular Synthesis ──
  CHEM201: [
    createDoc(
      "doc-chem201-notes",
      "CHEM201",
      "Advanced Nanomaterials & Molecular Synthesis",
      "CHEM201 Nanomaterials Handbook: Quantum Dots, Graphene & Heterogeneous Catalysis",
      "LECTURE_NOTES",
      "Dr. Hildegard Bauer",
      "Director of Materials Chemistry",
      46,
      "4.6 MB",
      "Quantum confinement in semiconductor nanocrystals, bandgap tuning in quantum dots, carbon nanotube chirality, chemical vapor deposition (CVD) of 2D graphene, and surface catalysis kinetics.",
      ["Quantum Confinement", "Graphene Band Structure", "CVD Synthesis", "Langmuir-Hinshelwood Kinetics"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Quantum Confinement in Zero-Dimensional Nanocrystals",
          summary: "Size-dependent optical bandgaps and discrete electronic energy levels in colloidal quantum dots.",
          keyTakeaways: [
            "When crystal size drops below the exciton Bohr radius, continuous energy bands collapse into discrete quantized levels.",
            "Effective bandgap E_g(r) = E_g,bulk + ℏ^2 π^2 / (2 m* r^2), shifting emission toward higher blue energies as radius shrinks.",
          ],
          content: `At the nanometer scale, physical and chemical properties diverge dramatically from bulk materials due to quantum confinement and extreme surface-area-to-volume ratios.`,
        },
      ]
    ),
  ],

  // ── 30. LAW201: Cyber Law, Intellectual Property & AI Governance ──
  LAW201: [
    createDoc(
      "doc-law201-notes",
      "LAW201",
      "Cyber Law, Intellectual Property & AI Governance",
      "LAW201 Tech Law & Policy: AI Copyright, GDPR, Digital Sovereignty & Algorithmic Liability",
      "LECTURE_NOTES",
      "Prof. Beatrice Holloway",
      "Chair of Cyber Law & Governance",
      42,
      "4.1 MB",
      "Copyright status of generative AI training datasets, fair use doctrines, GDPR data protection mandates (Right to be Forgotten, profiling limits), EU AI Act risk classifications, and algorithmic product liability.",
      ["EU AI Act Tiers", "Fair Use Defense in AI", "GDPR Article 22", "Platform Section 230"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Artificial Intelligence Copyright & The EU AI Act Framework",
          summary: "Legal analysis of copyright infringement claims in generative models and high-risk compliance obligations.",
          keyTakeaways: [
            "The EU AI Act establishes a risk-based tier system: Unacceptable (banned), High-Risk (strict auditing/logging), and General Purpose AI.",
            "Fair use balancing test evaluates: purpose of use, nature of work, portion taken, and impact on market value.",
          ],
          content: `Rapid technological revolutions in autonomous systems and large generative models challenge legacy legal doctrines concerning intellectual property, personal privacy, and civil liability.`,
        },
      ]
    ),
  ],

  // ── 31. MED201: Medical Informatics, Health Analytics & Clinical AI ──
  MED201: [
    createDoc(
      "doc-med201-notes",
      "MED201",
      "Medical Informatics, Health Analytics & Clinical AI",
      "MED201 Clinical Informatics: HL7 FHIR Interoperability, Clinical Trials & Diagnostic AI",
      "LECTURE_NOTES",
      "Dr. Tenzin Gyatso",
      "Professor of Medical Informatics",
      46,
      "4.5 MB",
      "Electronic Health Record (EHR) data standards, HL7 FHIR RESTful resources, clinical decision support algorithms, FDA Software as a Medical Device (SaMD) validation, and survival analysis with Kaplan-Meier estimators.",
      ["HL7 FHIR JSON Spec", "Kaplan-Meier Survival Curves", "Diagnostic Sensitivity/Specificity", "FDA SaMD Pathways"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "HL7 FHIR Interoperability & Medical Data Standards",
          summary: "Patient, Observation, Condition, and MedicationRequest JSON resource structures across hospital systems.",
          keyTakeaways: [
            "Fast Healthcare Interoperability Resources (FHIR) standardizes clinical data exchange via REST APIs and JSON schemas.",
            "Diagnostic accuracy requires reporting Sensitivity, Specificity, Positive Predictive Value (PPV), and Area Under ROC (AUROC).",
          ],
          content: `Healthcare delivery depends on secure, semantic interoperability between diverse clinical information systems, wearable patient telemetry, and AI-assisted diagnostic tools.`,
        },
      ]
    ),
  ],

  // ── 32. MATH210: Linear Algebra, Multivariate Calculus & Graph Spectra ──
  MATH210: [
    createDoc(
      "doc-math210-notes",
      "MATH210",
      "Linear Algebra, Multivariate Calculus & Graph Spectra",
      "MATH210 Advanced Applied Mathematics: SVD, Spectral Graph Theory & Multivariable Optimization",
      "LECTURE_NOTES",
      "Dr. Sofia Kowalski",
      "Professor of Pure & Applied Mathematics",
      48,
      "4.7 MB",
      "Singular Value Decomposition (SVD), low-rank matrix approximations (Eckart-Young-Mirsky theorem), graph Laplacian spectra, spectral clustering, Hessian matrices, and constrained Lagrange multipliers.",
      ["Singular Value Decomposition", "Graph Laplacian Matrix", "Spectral Clustering", "Hessian Eigenvalues"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Singular Value Decomposition (SVD) & Low-Rank Approximation",
          summary: "Decomposing arbitrary m×n real matrices into orthonormal singular vector bases A = U Σ V^T.",
          keyTakeaways: [
            "Every matrix A ∈ R^{m×n} factorizes into A = U Σ V^T with singular values σ_1 ≥ σ_2 ≥ ... ≥ 0.",
            "The Eckart-Young theorem proves that truncating SVD to top k singular values yields the optimal rank-k approximation under Frobenius and spectral norms.",
            "Graph Laplacian L = D - A captures connected components through its zero eigenvalues.",
          ],
          content: `Linear algebra provides the mathematical vocabulary for data science, quantum physics, and computer graphics. SVD reveals the fundamental geometric stretching and rotation transformations encoded within any linear operator.`,
        },
      ]
    ),
  ],

  // ── 33. PHYS301: Quantum Mechanics & Electrodynamics Foundations ──
  PHYS301: [
    createDoc(
      "doc-phys301-notes",
      "PHYS301",
      "Quantum Mechanics & Electrodynamics Foundations",
      "PHYS301 Theoretical Physics: Schrödinger Equation, Wavefunctions & Maxwell's Equations",
      "LECTURE_NOTES",
      "Prof. Niels Lindemann",
      "Chair of Theoretical Physics",
      50,
      "5.1 MB",
      "Postulates of quantum mechanics, time-dependent and time-independent Schrödinger wave equations, quantum harmonic oscillator ladder operators, Maxwell's field equations, and electromagnetic wave propagation in waveguides.",
      ["Schrödinger Wave Equation", "Ladder Operators (a, a†)", "Maxwell's Equations", "Poynting Energy Vector"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "The Schrödinger Equation & Quantum State Evolution",
          summary: "Hilbert space state vectors |ψ⟩, Hermitian observable operators, and Born probability interpretation.",
          keyTakeaways: [
            "Time-dependent Schrödinger equation: i ℏ ∂|ψ⟩/∂t = H |ψ⟩.",
            "Heisenberg uncertainty principle Δx · Δp ≥ ℏ / 2 arises from the non-commutativity of position and momentum operators [x̂, p̂] = i ℏ.",
            "Poynting vector S = (1/μ_0) E × B represents the directional energy flux density of electromagnetic waves.",
          ],
          content: `Quantum mechanics replaces classical deterministic particle trajectories with probability amplitude wavefunctions evolving in complex Hilbert spaces according to the Hamiltonian operator.`,
        },
      ]
    ),
  ],
};

// ✦ RETRIEVAL HELPER ✦
export function getCourseMaterials(courseCodeOrId?: string | null): CourseDocument[] {
  if (!courseCodeOrId) return [];
  const clean = courseCodeOrId.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Match by code prefix
  for (const [code, docs] of Object.entries(COURSE_MATERIALS_CATALOG)) {
    const codeClean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean === codeClean || clean.includes(codeClean) || codeClean.includes(clean)) {
      return docs;
    }
  }

  // Fallback: If not explicitly configured, generate a high-standard academic 4-document pack
  return [
    createDoc(
      `doc-${clean}-notes`,
      courseCodeOrId,
      `Course ${courseCodeOrId}`,
      `${courseCodeOrId} Official Lecture Notes & Curriculum Compendium`,
      "LECTURE_NOTES",
      "Course Faculty",
      "Department Professor",
      40,
      "4.0 MB",
      "Comprehensive theoretical lecture notes, mathematical formulations, and foundational concepts for this accredited course.",
      ["Core Principles", "Analytical Framework", "Methodology", "Case Studies"],
      [
        {
          id: "ch1",
          chapterNumber: 1,
          title: "Course Foundations & Core Principles",
          summary: "Introduction to fundamental concepts and modern applications.",
          keyTakeaways: [
            "Comprehensive review of core theoretical foundations.",
            "Structured problem-solving strategies for academic mastery.",
          ],
          content: `This official study document provides comprehensive academic reference materials for ${courseCodeOrId}. Students are expected to complete reading assignments prior to interactive live sessions.`,
        },
      ]
    ),
    createDoc(
      `doc-${clean}-ps`,
      courseCodeOrId,
      `Course ${courseCodeOrId}`,
      `${courseCodeOrId} Graded Problem Set & Analytical Exercises`,
      "PROBLEM_SET",
      "Course Faculty",
      "Department Professor",
      24,
      "2.2 MB",
      "Structured exercises, analytical derivation challenges, and worked solutions.",
      ["Analytical Problems", "Step-by-step Solutions", "Exam Preparation"],
      [
        {
          id: "ps1",
          chapterNumber: 1,
          title: "Analytical Problem Set 1",
          summary: "Core problems and worked demonstrations.",
          keyTakeaways: [
            "Practice step-by-step analytical derivations.",
            "Review model solutions for midterm and final assessments.",
          ],
          content: `Complete all analytical questions. Ensure intermediate steps and boundary condition assumptions are clearly articulated.`,
        },
      ]
    ),
    createDoc(
      `doc-${clean}-lab`,
      courseCodeOrId,
      `Course ${courseCodeOrId}`,
      `${courseCodeOrId} Hands-On Systems Lab & Implementation Manual`,
      "LAB_MANUAL",
      "Course Faculty",
      "Department Professor",
      32,
      "3.1 MB",
      "Practical implementation milestones, environment setups, and laboratory protocols.",
      ["Lab Protocols", "Practical Exercises", "Experimental Validation"],
      [
        {
          id: "lab1",
          chapterNumber: 1,
          title: "Laboratory Experiment 01",
          summary: "Practical hands-on methodology.",
          keyTakeaways: ["Setup development environment.", "Validate experimental findings."],
          content: `Follow the step-by-step procedure outlined in this manual to reproduce benchmark experimental results.`,
        },
      ]
    ),
    createDoc(
      `doc-${clean}-sheet`,
      courseCodeOrId,
      `Course ${courseCodeOrId}`,
      `${courseCodeOrId} Executive Formula Sheet & Rapid Revision Compendium`,
      "FORMULA_SHEET",
      "Course Faculty",
      "Department Professor",
      16,
      "1.5 MB",
      "Quick-reference cheatsheet containing key formulas, theorems, and core reference values.",
      ["Formula Cheatsheet", "Core Theorems", "Exam Quick Review"],
      [
        {
          id: "sheet1",
          chapterNumber: 1,
          title: "Core Formulas & Key Identities",
          summary: "Rapid reference summary.",
          keyTakeaways: ["Essential equations for immediate exam recall."],
          content: `Quick reference compendium covering fundamental equations, constants, and theorem definitions for ${courseCodeOrId}.`,
        },
      ]
    ),
  ];
}

// ✦ ACCESS CONTROL VERIFIER ✦
// Verifies whether a given student is officially enrolled in a target course
export function isUserEnrolledInCourse(
  enrolledCourseCodes: Set<string> | string[],
  targetCourseCodeOrId: string
): boolean {
  if (!enrolledCourseCodes || !targetCourseCodeOrId) return false;
  
  const targetClean = targetCourseCodeOrId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  
  const codesArray = enrolledCourseCodes instanceof Set 
    ? Array.from(enrolledCourseCodes) 
    : enrolledCourseCodes;

  return codesArray.some((code) => {
    const codeClean = (code || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    return (
      codeClean === targetClean ||
      targetClean.includes(codeClean) ||
      codeClean.includes(targetClean)
    );
  });
}
