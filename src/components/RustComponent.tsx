import type { InitOutput } from '@/../pkg/testcrate';
import { initSync } from '@/../pkg/testcrate.js';
import dynamic from 'next/dynamic'

import styles from '../styles/vector.module.css';

interface RustComponentProps {
  vector1: Float64Array
  vector2: Float64Array
}

interface MultTwoExports {
  mult_two: (a: Float64Array, b: Float64Array) => Float64Array
}

function allocateSpaceForVector(vector: Float64Array, memory: WebAssembly.Memory): number {
  const ptr = memory.buffer.byteLength;
  const requiredSpace = vector.length * vector.BYTES_PER_ELEMENT;
  memory.grow(Math.ceil(requiredSpace / 65536)); // Grow memory by necessary number of pages
  const view = new Float64Array(memory.buffer, ptr, vector.length);
  view.set(vector);
  return ptr;
}

const RustComponent = dynamic({
  loader: async () => {
    // @ts-ignore
    const { mult_two: multTwo } = (await import('@/../pkg/testcrate_bg.wasm')) as MultTwoExports

    const { mult_two, get_result_len, memory } = await import('@/../pkg/testcrate_bg.wasm');

    const Component = ({ vector1, vector2 }: RustComponentProps) => {

        // Allocate space in the Wasm memory for the input vectors and copy the vectors into it
        const ptr1 = allocateSpaceForVector(vector1, memory);
        const ptr2 = allocateSpaceForVector(vector2, memory);

        // Call mult_two and get pointer to result vector:
        const resultPtr = mult_two(ptr1, vector1.length, ptr2, vector2.length);

        // get length of result vector:
        const resultLen = get_result_len();

        // Create a new Float64Array view on the Wasm memory
        const resultVector = new Float64Array(memory.buffer, resultPtr, resultLen);

        console.log(resultVector);

        return (
            <div className={styles.vector}>
              <h1>Vector Result</h1>
              {Array.from(resultVector).map((value: number, index: number) => (
                <div key={index}>{value}</div>
              ))}
            </div>
        )
    }

    return Component
    },
    // Ensure only client-side execution:
    ssr: false
})

export default RustComponent
