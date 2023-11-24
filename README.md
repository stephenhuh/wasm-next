# nextjs and WebAssembly

This is a modified version of the nextjs example at
https://github.com/vercel/next.js/tree/canary/examples/with-webassembly. That
repository illustrates a finished example. This simply details the steps needed
to integrate WebAssembly within an existing nextjs project. This project uses
the directory root, `/`.

1. Define your rust function. The one used here is in a [`/src`
   directory](https://github.com/mpadge/wasm-next/tree/main/src):

    ``` rust
    #[no_mangle]
    pub extern "C" fn add_two(x: i32, y:i32) -> i32 {
        x + y
    }
    ```
    where the "no_mangle" tells the compiler to keep the function name so it
    can be called in JavaScript, and the `extern "C"` tells the compiler to use
    the C Applicaiton Binary Interface (ABI), so the compiled binary can be
    called from JavaScript.
2. Add a typescript rust component, like [`components/RustComponent2.tsx`
   here](https://github.com/mpadge/wasm-next/blob/main/components/RustComponent2.tsx).
   That component should import the rust binary (see Step 4), export the
   function defined there, and wrap the whole thing in a JavaScript function.
3. In the target page where the rust function is to be called, import the
   component defined in the previous step, and then simply add that component.
   That page in this case is
   [`pages/index.tsx`](https://github.com/mpadge/wasm-next/blob/main/pages/index.tsx).
4. Modify `package.json` to add a command (under "scripts") to compile the rust binary, for example,
    ```
    "build-rust": "rustc --target wasm32-unknown-unknown -O --crate-type=cdylib src/add.rs -o add.wasm",
    ```
    and then run `npm run build-rust`

The just `npm run dev` to serve the site.

## Adding additional rust functions

Each additional function can be defined within the same `src/add.rs` file (or
elsewhere), but should be exported within separate components. Those exports
can then be imported on whatever page or component they'll be used, and called
directly from there.

### Adding crates

Entire crates can also be bundled and compiled to WebAssembly. Compilation then
requires the [wasm-pack](https://github.com/rustwasm/wasm-pack) tool, which can
be called from `npm` by adding the following line (as a "script") to
`package.json`:
```
"build-crate": "cd src && wasm-pack build --target web --out-dir ../pkg",
```
The final `--out-dir` flag specifies the directory where the wasm binary will
be created. Generation of WASM binaries also requires modifying `Cargo.toml`
files by adding the following lines:
```
[lib]
crate-type = ["cdylib"]
```
or possibly:
```
[lib]
crate-type = ["cdylib", "rlib"]
```
