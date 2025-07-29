/**
 * Interval interface definition
 */
interface IInterval {
  start: number
  end: number
  data: IntervalData
}

interface IntervalData {
  type: 'grid' | 'object'
  id: string
}

/**
 * Interval class
 */
class Interval implements IInterval {
  public readonly start: number
  public readonly end: number
  public readonly data: IntervalData

  constructor(start: number, end: number, data: IntervalData) {
    if (start > end) {
      throw new Error(
        `Invalid interval: start (${start}) must be <= end (${end})`,
      )
    }
    this.start = start
    this.end = end
    this.data = data
  }

  /**
   * Check if the interval contains the specified point
   */
  contains(point: number): boolean {
    return this.start <= point && point <= this.end
  }

  /**
   * Check if it overlaps with another interval
   */
  overlaps(other: IInterval): boolean {
    return this.start <= other.end && other.start <= this.end
  }

  /**
   * Get interval length
   */
  get length(): number {
    return this.end - this.start
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `[${this.start}, ${this.end}] (${this.data})`
  }

  /**
   * Convert to JSON object
   */
  toJSON(): IInterval {
    return {
      start: this.start,
      end: this.end,
      data: this.data,
    }
  }
}

/**
 * AVL tree node class
 */
class AVLNode {
  public interval: Interval
  public left: AVLNode | null = null
  public right: AVLNode | null = null
  public height: number = 1
  public maxEnd: number

  constructor(interval: Interval) {
    this.interval = interval
    this.maxEnd = interval.end
  }
}

/**
 * Query result type
 */
interface QueryResult {
  intervals: Interval[]
  searchTime: number
  nodesVisited: number
}

/**
 * Tree statistics information type
 */
interface TreeStats {
  size: number
  height: number
  minInterval: Interval | null
  maxInterval: Interval | null
  totalLength: number
  averageLength: number
}

/**
 * Batch operation result type
 */
interface BatchResult<T> {
  results: T[]
  totalTime: number
  averageTime: number
  successCount: number
  errorCount: number
}

/**
 * AVL interval tree class
 */
export class IntervalTree {
  private root: AVLNode | null = null
  private _size: number = 0

  /**
   * Get node height
   */
  private getHeight(node: AVLNode | null): number {
    return node ? node.height : 0
  }

  /**
   * Get balance factor
   */
  private getBalance(node: AVLNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0
  }

  /**
   * Update node height
   */
  private updateHeight(node: AVLNode): void {
    node.height =
      1 + Math.max(this.getHeight(node.left), this.getHeight(node.right))
  }

  /**
   * Update node's maximum end value
   */
  private updateMaxEnd(node: AVLNode): void {
    node.maxEnd = node.interval.end
    if (node.left) {
      node.maxEnd = Math.max(node.maxEnd, node.left.maxEnd)
    }
    if (node.right) {
      node.maxEnd = Math.max(node.maxEnd, node.right.maxEnd)
    }
  }

  /**
   * Left rotation
   */
  private rotateLeft(z: AVLNode): AVLNode {
    const y = z.right!
    z.right = y.left
    y.left = z

    this.updateHeight(z)
    this.updateMaxEnd(z)
    this.updateHeight(y)
    this.updateMaxEnd(y)

    return y
  }

  /**
   * Right rotation
   */
  private rotateRight(z: AVLNode): AVLNode {
    const y = z.left!
    z.left = y.right
    y.right = z

    this.updateHeight(z)
    this.updateMaxEnd(z)
    this.updateHeight(y)
    this.updateMaxEnd(y)

    return y
  }

  /**
   * Recursively insert node
   */
  private insertRecursive(root: AVLNode | null, interval: Interval): AVLNode {
    // 1. Standard BST insertion
    if (!root) {
      this._size++
      return new AVLNode(interval)
    }

    if (interval.start <= root.interval.start) {
      root.left = this.insertRecursive(root.left, interval)
    } else {
      root.right = this.insertRecursive(root.right, interval)
    }

    // 2. Update height and maxEnd
    this.updateHeight(root)
    this.updateMaxEnd(root)

    // 3. Get balance factor and perform rotations
    const balance = this.getBalance(root)

    // Left Left case
    if (balance > 1 && interval.start <= root.left!.interval.start) {
      return this.rotateRight(root)
    }

    // Right Right case
    if (balance < -1 && interval.start > root.right!.interval.start) {
      return this.rotateLeft(root)
    }

    // Left Right case
    if (balance > 1 && interval.start > root.left!.interval.start) {
      root.left = this.rotateLeft(root.left!)
      return this.rotateRight(root)
    }

    // Right Left case
    if (balance < -1 && interval.start <= root.right!.interval.start) {
      root.right = this.rotateRight(root.right!)
      return this.rotateLeft(root)
    }

    return root
  }

  /**
   * Recursively search for overlapping intervals
   */
  private searchOverlappingRecursive(
    root: AVLNode | null,
    point: number,
    result: Interval[],
    stats?: { nodesVisited: number },
  ): void {
    if (!root) return

    if (stats) stats.nodesVisited++

    // Check if current interval contains the point
    if (root.interval.contains(point)) {
      result.push(root.interval)
    }

    // Check left subtree
    if (root.left && root.left.maxEnd >= point) {
      this.searchOverlappingRecursive(root.left, point, result, stats)
    }

    // Check right subtree
    if (root.interval.start <= point) {
      this.searchOverlappingRecursive(root.right, point, result, stats)
    }
  }

  /**
   * Recursively search for intervals overlapping with an interval
   */
  private searchIntervalOverlappingRecursive(
    root: AVLNode | null,
    queryInterval: IInterval,
    result: Interval[],
  ): void {
    if (!root) return

    // Check if current interval overlaps with query interval
    if (root.interval.overlaps(queryInterval)) {
      result.push(root.interval)
    }

    // Check left subtree
    if (root.left && root.left.maxEnd >= queryInterval.start) {
      this.searchIntervalOverlappingRecursive(root.left, queryInterval, result)
    }

    // Check right subtree
    if (root.interval.start <= queryInterval.end) {
      this.searchIntervalOverlappingRecursive(root.right, queryInterval, result)
    }
  }

  /**
   * In-order traversal
   */
  private inorderRecursive(root: AVLNode | null, result: Interval[]): void {
    if (!root) return
    this.inorderRecursive(root.left, result)
    result.push(root.interval)
    this.inorderRecursive(root.right, result)
  }

  /**
   * Insert interval
   */
  insert(start: number, end: number, data: IntervalData): void {
    const interval = new Interval(start, end, data)
    this.root = this.insertRecursive(this.root, interval)
  }

  /**
   * Batch insert intervals
   */
  insertBatch(
    intervals: Array<{ start: number; end: number; data: IntervalData }>,
  ): BatchResult<void> {
    const startTime = performance.now()
    const results: void[] = []
    let successCount = 0
    let errorCount = 0

    for (const intervalData of intervals) {
      try {
        this.insert(intervalData.start, intervalData.end, intervalData.data)
        results.push(undefined)
        successCount++
      } catch (error) {
        results.push(undefined)
        errorCount++
        console.error(error)
      }
    }

    const endTime = performance.now()
    const totalTime = endTime - startTime

    return {
      results,
      totalTime,
      averageTime: totalTime / intervals.length,
      successCount,
      errorCount,
    }
  }

  /**
   * Find all intervals overlapping with the specified point
   */
  findOverlapping(point: number): Interval[] {
    const result: Interval[] = []
    this.searchOverlappingRecursive(this.root, point, result)
    return result
  }

  /**
   * Find all intervals overlapping with the specified point (with statistics)
   */
  findOverlappingWithStats(point: number): QueryResult {
    const startTime = performance.now()
    const result: Interval[] = []
    const stats = { nodesVisited: 0 }

    this.searchOverlappingRecursive(this.root, point, result, stats)

    const endTime = performance.now()

    return {
      intervals: result,
      searchTime: endTime - startTime,
      nodesVisited: stats.nodesVisited,
    }
  }

  /**
   * Find all intervals overlapping with the specified interval
   */
  findIntervalOverlapping(start: number, end: number): Interval[] {
    const queryInterval: IInterval = {
      start,
      end,
      data: { type: 'grid', id: '' },
    }
    const result: Interval[] = []
    this.searchIntervalOverlappingRecursive(this.root, queryInterval, result)
    return result
  }

  /**
   * Batch query
   */
  findOverlappingBatch(points: number[]): BatchResult<Interval[]> {
    const startTime = performance.now()
    const results: Interval[][] = []
    let successCount = 0
    let errorCount = 0

    for (const point of points) {
      try {
        const overlapping = this.findOverlapping(point)
        results.push(overlapping)
        successCount++
      } catch (error) {
        results.push([])
        errorCount++
        console.error(error)
      }
    }

    const endTime = performance.now()
    const totalTime = endTime - startTime

    return {
      results,
      totalTime,
      averageTime: totalTime / points.length,
      successCount,
      errorCount,
    }
  }

  /**
   * Get all intervals (sorted by start time)
   */
  getAllIntervals(): Interval[] {
    const result: Interval[] = []
    this.inorderRecursive(this.root, result)
    return result
  }

  /**
   * Get all intervals within the specified range
   */
  getIntervalsInRange(start: number, end: number): Interval[] {
    return this.getAllIntervals().filter(
      (interval) => interval.start >= start && interval.end <= end,
    )
  }

  /**
   * Find minimum interval
   */
  findMinInterval(): Interval | null {
    const intervals = this.getAllIntervals()
    return intervals.length > 0 ? intervals[0] : null
  }

  /**
   * Find maximum interval
   */
  findMaxInterval(): Interval | null {
    const intervals = this.getAllIntervals()
    return intervals.length > 0 ? intervals[intervals.length - 1] : null
  }

  /**
   * Get tree size
   */
  get size(): number {
    return this._size
  }

  /**
   * Check if tree is empty
   */
  isEmpty(): boolean {
    return this.root === null
  }

  /**
   * Get tree height
   */
  getRootHeight(): number {
    return this.getHeight(this.root)
  }

  /**
   * Get tree statistics
   */
  getStats(): TreeStats {
    const intervals = this.getAllIntervals()
    const totalLength = intervals.reduce(
      (sum, interval) => sum + interval.length,
      0,
    )

    return {
      size: this.size,
      height: this.getRootHeight(),
      minInterval: this.findMinInterval(),
      maxInterval: this.findMaxInterval(),
      totalLength,
      averageLength: intervals.length > 0 ? totalLength / intervals.length : 0,
    }
  }

  /**
   * Clear tree
   */
  clear(): void {
    this.root = null
    this._size = 0
  }

  /**
   * Convert to JSON
   */
  toJSON(): IInterval[] {
    return this.getAllIntervals().map((interval) => interval.toJSON())
  }

  /**
   * Create tree from JSON data
   */
  static fromJSON(data: IInterval[]): IntervalTree {
    const tree = new IntervalTree()
    for (const item of data) {
      tree.insert(item.start, item.end, item.data)
    }
    return tree
  }

  /**
   * Print tree structure (for debugging)
   */
  printTree(): string {
    if (!this.root) {
      return 'Empty tree'
    }
    return this.printTreeRecursive(this.root, 0, 'Root: ')
  }

  private printTreeRecursive(
    root: AVLNode | null,
    level: number,
    prefix: string,
  ): string {
    if (!root) return ''

    let result = `${'    '.repeat(level)}${prefix}${root.interval.toString()} (max_end: ${root.maxEnd})\n`

    if (root.left || root.right) {
      if (root.left) {
        result += this.printTreeRecursive(root.left, level + 1, 'L--- ')
      } else {
        result += `${'    '.repeat(level + 1)}L--- None\n`
      }

      if (root.right) {
        result += this.printTreeRecursive(root.right, level + 1, 'R--- ')
      } else {
        result += `${'    '.repeat(level + 1)}R--- None\n`
      }
    }

    return result
  }
}
