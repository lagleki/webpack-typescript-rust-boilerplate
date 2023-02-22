mod utils;
use wasm_bindgen::prelude::*;
use web_sys::console;
use serde_derive::{Deserialize, Serialize};
use serde_json::json;
// use wasm_bindgen::prelude::*;


// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();


    let msg = json!({
        "event": "WASM Rust response",
        "message": "Hello, world!"
    });

    // Your code goes here!
    console::log_1(&JsValue::from_serde(&msg).unwrap());

    Ok(())
}

pub struct Counter {
    value: i64,
}

impl Counter {
    pub fn new(initial_value: i64) -> Self {
        Self {
            value: initial_value,
        }
    }

    pub fn increment(&mut self, delta: i64) {
        self.value = self.value.checked_add(delta).unwrap();
    }

    pub fn get_value(&self) -> i64 {
        self.value
    }
}

#[wasm_bindgen]
pub struct CounterWrapper {
    internal: Counter,
}

#[wasm_bindgen]
impl CounterWrapper {
    #[wasm_bindgen(constructor)]
    pub fn new(initial_value: i64) -> Self {
        let counter = Counter::new(initial_value);
        Self { internal: counter }
    }

    pub fn increment(&mut self, delta: i64) {
        self.internal.increment(delta);
    }

    pub fn get_value(&self) -> i64 {
        self.internal.get_value()
    }
}

#[derive(Deserialize)]
pub struct GetIncrementResultInput {
    pub initial_value: String,
}

#[derive(Serialize)]
pub struct GetIncrementResultOutput {
    pub result: String,
}

#[wasm_bindgen]
pub fn get_increment_result(_input: String) -> JsValue {
    let result = GetIncrementResultOutput {
        result: String::from("1"),
    };
    JsValue::from_serde(&result).unwrap()
}

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Machine {
    value_a: f64,
    value_b: f64
}

#[wasm_bindgen]
impl Machine {
    pub fn new(value_a: f64, value_b: f64) -> Machine {
        return Machine {
            value_a,
            value_b
        };
    }

    pub fn add(&self) -> f64 {
        return self.value_a + self.value_b;
    }
}
