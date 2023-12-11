import { useEffect, useState} from 'react';

import * as wasm_js from '@/../pkg/testcrate.js';
import styles from '@/styles/styles.module.css';

interface BindGenProps {
    filename1: string
    filename2: string
    varnames: string[]
    nentries: number
    bindgenResult: Object | null
    handleResultChange: (Object: any) => void
}

const Component = (props: BindGenProps) => {
    const [data1, setData1] = useState(null);
    const [data2, setData2] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const response1 = await fetch(props.filename1);
            const json1 = await response1.json();
            setData1(json1);

            const response2 = await fetch(props.filename2);
            const json2 = await response2.json();
            setData2(json2);
        };

        loadData();
        }, [props.filename1, props.filename2]);

    useEffect(() => {
        fetch('@/../pkg/testcrate_bg.wasm')
        .then(response => {
            return response.arrayBuffer();
            })
        .then(bytes => {
            if (data1 && data2) {
                const wasm_binary = wasm_js.initSync(bytes);
                const varname = props.varnames.join(",");
                const data1js = JSON.stringify(data1);
                const data2js = JSON.stringify(data2);
                const resultJson = wasm_js.parse_json_mult(data1js, data2js, varname, props.nentries);
                const resultObj = JSON.parse(resultJson);
                props.handleResultChange(resultObj);
            }
            })
        .catch(error => {
            console.error('Error fetching wasm module:', error);
            });
        }, [data1, data2, props.varnames, props.nentries, props.handleResultChange]);

    return (
        <div className={styles.json2}>
            <h1>BindGen2</h1>
                {props.bindgenResult && <pre>{JSON.stringify(props.bindgenResult, null, 2)}</pre>}
        </div>
    )
}

export default Component;
