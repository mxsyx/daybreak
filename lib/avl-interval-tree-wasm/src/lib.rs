use wasm_bindgen::prelude::*;
use std::cmp::Ordering;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[cfg(feature = "console_error_panic_hook")]
use console_error_panic_hook;

#[wasm_bindgen(start)]
pub fn main() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
    
    console_log!("Rust WebAssembly AVL Interval Tree (Float) loaded!");
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Interval {
    start: f64,
    end: f64,
    data: String,
}

#[wasm_bindgen]
impl Interval {
    #[wasm_bindgen(constructor)]
    pub fn new(start: f64, end: f64, data: String) -> Interval {
        Interval { start, end, data }
    }

    #[wasm_bindgen(getter)]
    pub fn start(&self) -> f64 {
        self.start
    }

    #[wasm_bindgen(getter)]
    pub fn end(&self) -> f64 {
        self.end
    }

    #[wasm_bindgen(getter)]
    pub fn data(&self) -> String {
        self.data.clone()
    }

    #[wasm_bindgen]
    pub fn to_string(&self) -> String {
        format!("[{}, {}] ({})", self.start, self.end, self.data)
    }
}

#[wasm_bindgen]
#[derive(Clone)]
struct AVLNode {
    interval: Interval,
    left: Option<Box<AVLNode>>,
    right: Option<Box<AVLNode>>,
    height: i32,
    max_end: f64,
}

#[wasm_bindgen]
impl AVLNode {
    fn new(interval: Interval) -> Self {
        let max_end = interval.end;
        AVLNode {
            interval,
            left: None,
            right: None,
            height: 1,
            max_end,
        }
    }
}

// Helper function to get maximum of two f64 values
fn max_f64(a: f64, b: f64) -> f64 {
    if a > b { a } else { b }
}

#[wasm_bindgen]
pub struct IntervalTree {
    root: Option<Box<AVLNode>>,
}

#[wasm_bindgen]
impl IntervalTree {
    #[wasm_bindgen(constructor)]
    pub fn new() -> IntervalTree {
        IntervalTree { root: None }
    }

    fn get_height(node: &Option<Box<AVLNode>>) -> i32 {
        match node {
            Some(n) => n.height,
            None => 0,
        }
    }

    fn get_balance(node: &Option<&Box<AVLNode>>) -> i32 {
        match node {
            Some(n) => Self::get_height(&n.left) - Self::get_height(&n.right),
            None => 0,
        }
    }

    fn update_height(node: &mut Box<AVLNode>) {
        node.height = 1 + std::cmp::max(Self::get_height(&node.left), Self::get_height(&node.right));
    }

    fn update_max_end(node: &mut Box<AVLNode>) {
        node.max_end = node.interval.end;
        if let Some(ref left) = node.left {
            node.max_end = max_f64(node.max_end, left.max_end);
        }
        if let Some(ref right) = node.right {
            node.max_end = max_f64(node.max_end, right.max_end);
        }
    }

    fn rotate_left(mut z: Box<AVLNode>) -> Box<AVLNode> {
        let mut y = z.right.take().unwrap();
        z.right = y.left.take();

        Self::update_height(&mut z);
        Self::update_max_end(&mut z);
        Self::update_height(&mut y);
        Self::update_max_end(&mut y);

        y.left = Some(z);
        y
    }

    fn rotate_right(mut z: Box<AVLNode>) -> Box<AVLNode> {
        let mut y = z.left.take().unwrap();
        z.left = y.right.take();

        Self::update_height(&mut z);
        Self::update_max_end(&mut z);
        Self::update_height(&mut y);
        Self::update_max_end(&mut y);

        y.right = Some(z);
        y
    }

    fn insert_recursive(
        root: Option<Box<AVLNode>>,
        interval: Interval,
    ) -> Option<Box<AVLNode>> {
        // Save interval.start for later balance checks
        let interval_start = interval.start;
        
        // 1. Perform standard BST insertion
        let mut root = match root {
            Some(mut node) => {
                if interval_start <= node.interval.start {
                    node.left = Self::insert_recursive(node.left.take(), interval);
                } else {
                    node.right = Self::insert_recursive(node.right.take(), interval);
                }
                node
            }
            None => return Some(Box::new(AVLNode::new(interval))),
        };

        // 2. Update height and max_end
        Self::update_height(&mut root);
        Self::update_max_end(&mut root);

        // 3. Get balance factor
        let balance = Self::get_balance(&Some(&root));

        // 4. If unbalanced, perform rotations
        
        // Left Left case
        if balance > 1 {
            if let Some(ref left) = root.left {
                if interval_start <= left.interval.start {
                    return Some(Self::rotate_right(root));
                }
            }
        }

        // Right Right case
        if balance < -1 {
            if let Some(ref right) = root.right {
                if interval_start > right.interval.start {
                    return Some(Self::rotate_left(root));
                }
            }
        }

        // Left Right case
        if balance > 1 {
            if let Some(ref left) = root.left {
                if interval_start > left.interval.start {
                    root.left = Some(Self::rotate_left(root.left.take().unwrap()));
                    return Some(Self::rotate_right(root));
                }
            }
        }

        // Right Left case
        if balance < -1 {
            if let Some(ref right) = root.right {
                if interval_start <= right.interval.start {
                    root.right = Some(Self::rotate_right(root.right.take().unwrap()));
                    return Some(Self::rotate_left(root));
                }
            }
        }

        Some(root)
    }

    fn search_overlapping_recursive(
        root: &Option<Box<AVLNode>>,
        point: f64,
        result: &mut Vec<Interval>,
    ) {
        if let Some(node) = root {
            // If current interval contains the point, add to result
            if node.interval.start <= point && point <= node.interval.end {
                result.push(node.interval.clone());
            }

            // If left subtree's max_end >= point, left subtree may contain overlapping intervals
            if let Some(ref left) = node.left {
                if left.max_end >= point {
                    Self::search_overlapping_recursive(&node.left, point, result);
                }
            }

            // If right subtree may contain overlapping intervals
            if node.interval.start <= point {
                Self::search_overlapping_recursive(&node.right, point, result);
            }
        }
    }

    fn inorder_recursive(root: &Option<Box<AVLNode>>, result: &mut Vec<Interval>) {
        if let Some(node) = root {
            Self::inorder_recursive(&node.left, result);
            result.push(node.interval.clone());
            Self::inorder_recursive(&node.right, result);
        }
    }

    #[wasm_bindgen]
    pub fn insert(&mut self, start: f64, end: f64, data: String) {
        let interval = Interval::new(start, end, data);
        self.root = Self::insert_recursive(self.root.take(), interval);
    }

    #[wasm_bindgen]
    pub fn find_overlapping(&self, point: f64) -> Vec<JsValue> {
        let mut result = Vec::new();
        Self::search_overlapping_recursive(&self.root, point, &mut result);
        
        result
            .into_iter()
            .map(|interval| JsValue::from(interval.to_string()))
            .collect()
    }

    #[wasm_bindgen]
    pub fn get_all_intervals(&self) -> Vec<JsValue> {
        let mut result = Vec::new();
        Self::inorder_recursive(&self.root, &mut result);
        
        result
            .into_iter()
            .map(|interval| JsValue::from(interval.to_string()))
            .collect()
    }

    fn print_tree_recursive(root: &Option<Box<AVLNode>>, level: usize, prefix: &str) -> String {
        match root {
            Some(node) => {
                let mut result = format!(
                    "{}{}{} (max_end: {})\n",
                    " ".repeat(level * 4),
                    prefix,
                    node.interval.to_string(),
                    node.max_end
                );

                if node.left.is_some() || node.right.is_some() {
                    if let Some(ref _left) = node.left {
                        result += &Self::print_tree_recursive(&node.left, level + 1, "L--- ");
                    } else {
                        result += &format!("{}L--- None\n", " ".repeat((level + 1) * 4));
                    }

                    if let Some(ref _right) = node.right {
                        result += &Self::print_tree_recursive(&node.right, level + 1, "R--- ");
                    } else {
                        result += &format!("{}R--- None\n", " ".repeat((level + 1) * 4));
                    }
                }

                result
            }
            None => String::new(),
        }
    }

    #[wasm_bindgen]
    pub fn print_tree(&self) -> String {
        if self.root.is_none() {
            "Empty tree".to_string()
        } else {
            Self::print_tree_recursive(&self.root, 0, "Root: ")
        }
    }

    #[wasm_bindgen]
    pub fn is_empty(&self) -> bool {
        self.root.is_none()
    }

    #[wasm_bindgen]
    pub fn size(&self) -> i32 {
        self.get_all_intervals().len() as i32
    }
}

// Test function with floating point values
#[wasm_bindgen]
pub fn run_test() {
    console_log!("Starting AVL Interval Tree (Float) test...");

    let mut tree = IntervalTree::new();

    // Insert some intervals with floating point values
    let intervals = vec![
        (1.5, 3.2, "A"),
        (2.1, 5.7, "B"),
        (4.3, 7.8, "C"),
        (6.5, 8.9, "D"),
        (8.1, 10.4, "E"),
        (9.3, 12.6, "F"),
        (0.5, 2.3, "G"),
    ];

    console_log!("Inserting intervals:");
    for (start, end, data) in intervals {
        tree.insert(start, end, data.to_string());
        console_log!("Inserted interval [{}, {}] (data: {})", start, end, data);
    }

    console_log!("\nTree structure:");
    console_log!("{}", tree.print_tree());

    console_log!("\nAll intervals (inorder traversal):");
    let all_intervals = tree.get_all_intervals();
    for interval_str in all_intervals {
        console_log!("{}", interval_str.as_string().unwrap());
    }

    // Test finding intervals overlapping with specific points (floating point)
    let test_points = vec![1.0, 3.5, 5.2, 7.1, 9.8, 11.5, 15.0];
    console_log!("\nFinding intervals overlapping with specific points:");
    for point in test_points {
        let overlapping = tree.find_overlapping(point);
        let overlapping_strs: Vec<String> = overlapping
            .into_iter()
            .map(|js_val| js_val.as_string().unwrap())
            .collect();
        console_log!("Point {}: {:?}", point, overlapping_strs);
    }

    console_log!("Test completed!");
}