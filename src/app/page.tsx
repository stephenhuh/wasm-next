'use client'

import { useRouter } from 'next/router'
import { useState } from 'react';
import { Metadata} from 'next';
import Link from 'next/link'
import WasmAddTwo from '../components/WasmAddTwo'
import WasmVectorMult from '../components/WasmVectorMult'
import WasmBindGenCalc from '../components/WasmBindGen'
import WasmBindGenCalc2 from '../components/WasmBindGen2'
import Control from '../components/control'
import styles from '@/styles/styles.module.css';

export default function Home() {
    const [Number1, setNumber1] = useState(10);
    const [Number2, setNumber2] = useState(10);
    const handleNumber1Change = (value: string) => {
        setNumber1(Number(value));
    }
    const handleNumber2Change = (value: string) => {
        setNumber2(Number(value));
    }

    // Initialize vectors for calling mult_two fn. These need to be react states
    // to ensure they are only generated one time.
    const [Vector1, setVector1] = useState(Float64Array.from({ length: 5 }, () => Math.random()));
    const [Vector2, setVector2] = useState(Float64Array.from({ length: 5 }, () => Math.random()));

    const filename1 = "/data/dat1.json";
    const filename2 = "/data/dat2.json";
    const varnames = ["bike_index", "social_index"];
    const nentries = 5;

    return (
        <>
        <div>
            {/* Camera Demo Link */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 100,
                background: '#0070f3',
                padding: '10px 20px',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <Link href="/camera" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                    Try Camera Demo →
                </Link>
            </div>

            <Control
                number1={Number1}
                number2={Number2}
                handleNumber1Change={setNumber1}
                handleNumber2Change={setNumber2}
            />
            <WasmAddTwo number1={Number1} number2={Number2} />
            <WasmVectorMult vector1={Vector1} vector2={Vector2} />

            <WasmBindGenCalc
                filename1={filename1}
                filename2={filename2}
                varnames={varnames}
                nentries={nentries}
            />
            <WasmBindGenCalc2
                filename1={filename1}
                filename2={filename2}
                varnames={varnames}
                nentries={nentries}
            />
        </div>
        </>
    )
}
